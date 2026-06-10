-- Migration to remove plain-text password storage and secure administrator accounts.

-- 1. Drop the password_plain column from public.admins table
ALTER TABLE public.admins DROP COLUMN IF EXISTS password_plain;
ALTER TABLE public.admins DROP COLUMN IF EXISTS plain_password; -- safety check

-- 2. Recreate the create_admin_user RPC function without password_plain
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
  IF NOT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  ) THEN
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

  -- Create administrative profile in public.admins (WITHOUT storing password_plain)
  INSERT INTO public.admins (user_id, email, name, role)
  VALUES (new_user_id, admin_email, admin_name, 'admin');

  RETURN new_user_id;
END;
$$;


-- 3. Recreate the update_admin_password_force RPC function without password_plain
CREATE OR REPLACE FUNCTION public.update_admin_password_force(
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
  IF NOT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only super admins can change admin passwords.';
  END IF;

  -- Update auth.users password
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = target_user_id::uuid;

  -- Note: We no longer update public.admins table with plaintext password.
END;
$$;
