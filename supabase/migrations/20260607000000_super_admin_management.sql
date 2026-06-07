-- Migration to set up Super Admin role and admin management functions.
-- This script enables the creation of a 'super_admin' who can create, update, delete, and view regular admins.
-- It also restricts DELETE operations on registrations and accommodations to 'super_admin' users only.

-- 1. Add columns to public.admins if they don't exist
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS role text DEFAULT 'admin';
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS plain_password text DEFAULT '';

-- 2. Create security definer function to check super admin status (avoids RLS infinite recursion)
CREATE OR REPLACE FUNCTION public.is_super_admin(uid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = uid AND role = 'super_admin'
  );
END;
$$;

-- 3. Create security definer function to check if a user is any admin (avoids RLS infinite recursion)
CREATE OR REPLACE FUNCTION public.is_any_admin(uid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = uid
  );
END;
$$;

-- 4. Re-define policies for 'admins' table
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read of admins" ON public.admins;
    DROP POLICY IF EXISTS "Allow super admins to manage admins" ON public.admins;
END $$;

-- Allow admins to read their own record OR a super_admin to read all records
CREATE POLICY "Allow SELECT on admins table"
ON public.admins
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));

-- Only super admins can update or delete records in admins table
CREATE POLICY "Allow ALL on admins table for super admins"
ON public.admins
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));


-- 5. Restrict Delete Operations on Registrations
DROP POLICY IF EXISTS "Allow admins to delete registrations" ON public.registrations;

CREATE POLICY "Allow super admins to delete registrations"
ON public.registrations
FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Update write/select policies for registrations (allows all admins to update/read)
DROP POLICY IF EXISTS "Allow admins to update registrations" ON public.registrations;
CREATE POLICY "Allow admins to update registrations"
ON public.registrations
FOR UPDATE
TO authenticated
USING (public.is_any_admin(auth.uid()))
WITH CHECK (public.is_any_admin(auth.uid()));


-- 6. Restrict Delete Operations on Accommodation Requests
DROP POLICY IF EXISTS "Allow admins all access on accommodation_requests" ON public.accommodation_requests;
DROP POLICY IF EXISTS "Allow admins to select accommodation_requests" ON public.accommodation_requests;
DROP POLICY IF EXISTS "Allow admins to update accommodation_requests" ON public.accommodation_requests;
DROP POLICY IF EXISTS "Allow super admins to delete accommodation_requests" ON public.accommodation_requests;

-- Allow all admins to select accommodation requests
CREATE POLICY "Allow admins to select accommodation_requests"
ON public.accommodation_requests
FOR SELECT
TO authenticated
USING (public.is_any_admin(auth.uid()));

-- Allow all admins to update accommodation requests
CREATE POLICY "Allow admins to update accommodation_requests"
ON public.accommodation_requests
FOR UPDATE
TO authenticated
USING (public.is_any_admin(auth.uid()))
WITH CHECK (public.is_any_admin(auth.uid()));

-- Only super admins can delete accommodation requests
CREATE POLICY "Allow super admins to delete accommodation_requests"
ON public.accommodation_requests
FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()));


-- 7. RPC: Create a new Admin user
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email text,
  admin_password text,
  admin_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if caller is super admin
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access Denied: Only super admins can create admin users.';
  END IF;

  -- Create user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    NULL,
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create administrative profile in public.admins
  INSERT INTO public.admins (user_id, email, name, role, plain_password)
  VALUES (new_user_id, admin_email, admin_name, 'admin', admin_password);

  RETURN new_user_id;
END;
$$;


-- 8. RPC: Change an Admin's password
CREATE OR REPLACE FUNCTION public.change_admin_password(
  target_user_id text,
  new_password text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  -- Check if caller is super admin
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access Denied: Only super admins can change admin passwords.';
  END IF;

  -- Update auth.users password
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = target_user_id::uuid;

  -- Update plain_password in public.admins
  UPDATE public.admins
  SET plain_password = new_password
  WHERE user_id = target_user_id::uuid;
END;
$$;


-- 9. RPC: Delete an Admin user
CREATE OR REPLACE FUNCTION public.delete_admin_user(
  target_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Check if caller is super admin
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access Denied: Only super admins can delete admin users.';
  END IF;

  -- Cannot delete yourself
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Access Denied: A super admin cannot delete themselves.';
  END IF;

  -- Delete from public.admins
  DELETE FROM public.admins WHERE user_id = target_user_id;

  -- Delete from auth.users
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
