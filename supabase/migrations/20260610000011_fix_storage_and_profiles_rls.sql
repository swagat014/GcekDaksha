-- Create or recreate is_any_admin function first to ensure it exists
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


-- 1. Fix public.profiles select policy infinite recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

CREATE POLICY "Admins can read all profiles"
ON public.profiles
FOR SELECT
USING (public.is_any_admin(auth.uid()));


-- 2. Drop deprecated profiles-based storage policies
DROP POLICY IF EXISTS "admin_manage_captain_docs hxeptw_0" ON storage.objects;
DROP POLICY IF EXISTS "admin_manage_captain_docs hxeptw_1" ON storage.objects;
DROP POLICY IF EXISTS "admin_manage_captain_docs hxeptw_2" ON storage.objects;
DROP POLICY IF EXISTS "admin_manage_captain_docs hxeptw_3" ON storage.objects;

DROP POLICY IF EXISTS "admin_manage_player_docs 8fxcpz_0" ON storage.objects;
DROP POLICY IF EXISTS "admin_manage_player_docs 8fxcpz_1" ON storage.objects;
DROP POLICY IF EXISTS "admin_manage_player_docs 8fxcpz_2" ON storage.objects;
DROP POLICY IF EXISTS "admin_manage_player_docs 8fxcpz_3" ON storage.objects;

DROP POLICY IF EXISTS "admin_read_captain_docs hxeptw_0" ON storage.objects;
DROP POLICY IF EXISTS "admin_read_payments iwdjyg_0" ON storage.objects;
DROP POLICY IF EXISTS "admin_read_player_docs 8fxcpz_0" ON storage.objects;


-- 3. Create updated, admins-based storage policies
-- Policies for captain-docs bucket
CREATE POLICY "admin_select_captain_docs" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'captain-docs' AND public.is_any_admin(auth.uid()));

CREATE POLICY "admin_insert_captain_docs" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'captain-docs' AND public.is_any_admin(auth.uid()));

CREATE POLICY "admin_update_captain_docs" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'captain-docs' AND public.is_any_admin(auth.uid()));

CREATE POLICY "admin_delete_captain_docs" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'captain-docs' AND public.is_any_admin(auth.uid()));

-- Policies for player-docs bucket
CREATE POLICY "admin_select_player_docs" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'player-docs' AND public.is_any_admin(auth.uid()));

CREATE POLICY "admin_insert_player_docs" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'player-docs' AND public.is_any_admin(auth.uid()));

CREATE POLICY "admin_update_player_docs" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'player-docs' AND public.is_any_admin(auth.uid()));

CREATE POLICY "admin_delete_player_docs" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'player-docs' AND public.is_any_admin(auth.uid()));

-- Policies for accommodation-payments bucket
CREATE POLICY "admin_select_accommodation_payments" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'accommodation-payments' AND public.is_any_admin(auth.uid()));

CREATE POLICY "admin_insert_accommodation_payments" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'accommodation-payments' AND public.is_any_admin(auth.uid()));

CREATE POLICY "admin_update_accommodation_payments" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'accommodation-payments' AND public.is_any_admin(auth.uid()));

CREATE POLICY "admin_delete_accommodation_payments" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'accommodation-payments' AND public.is_any_admin(auth.uid()));
