-- Migration to add 'name' column to admins and use the existing 'password_plain' column.
-- Also recreates the RPC functions with the correct columns.

-- 1. Add name column to public.admins
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS name text DEFAULT '';

-- 2. Clean up duplicate plain_password column if it exists
ALTER TABLE public.admins DROP COLUMN IF EXISTS plain_password;

-- 3. Recreate the RPC: Create a new Admin user
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email text,
  admin_password text,
  admin_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
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
  INSERT INTO public.admins (user_id, email, name, role, password_plain)
  VALUES (new_user_id, admin_email, admin_name, 'admin', admin_password);

  RETURN new_user_id;
END;
$$;


-- 4. Recreate the RPC: Change an Admin's password
CREATE OR REPLACE FUNCTION public.change_admin_password(
  target_user_id uuid,
  new_password text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
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
  WHERE id = target_user_id;

  -- Update password_plain in public.admins
  UPDATE public.admins
  SET password_plain = new_password
  WHERE user_id = target_user_id;
END;
$$;
