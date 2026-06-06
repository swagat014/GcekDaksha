-- Migration to fix the infinite recursion (42P17) in RLS policies for registrations and accommodation_requests.
-- This script drops any existing recursive policies and defines clean, non-recursive policies.

-- 1. Drop existing policies dynamically on registrations, accommodation_requests, and admins to prevent conflicts
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public' 
          AND tablename IN ('registrations', 'accommodation_requests', 'admins')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 2. Ensure RLS is enabled on all tables
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 3. Define policies for the 'admins' table
-- Allow any authenticated user to check their own admin status (needed for login)
CREATE POLICY "Allow authenticated read of admins" 
ON public.admins
FOR SELECT 
TO authenticated 
USING (true);

-- 4. Define policies for the 'registrations' table
-- Allow anyone (anonymous or authenticated) to submit a registration
CREATE POLICY "Allow public insert on registrations" 
ON public.registrations
FOR INSERT 
WITH CHECK (true);

-- Allow anyone (anonymous or authenticated) to read registrations
-- Needed to fetch player names in the accommodation booking page
CREATE POLICY "Allow public select on registrations" 
ON public.registrations
FOR SELECT 
USING (true);

-- Allow authenticated admins to update registrations (approving/rejecting payments)
CREATE POLICY "Allow admins to update registrations" 
ON public.registrations
FOR UPDATE
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- Allow authenticated admins to delete registrations
CREATE POLICY "Allow admins to delete registrations" 
ON public.registrations
FOR DELETE
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.admins));


-- 5. Define policies for the 'accommodation_requests' table
-- Allow anyone to insert accommodation requests
CREATE POLICY "Allow public insert on accommodation_requests" 
ON public.accommodation_requests
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated admins to perform all actions (select, update, delete) on accommodation requests
CREATE POLICY "Allow admins all access on accommodation_requests" 
ON public.accommodation_requests
FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.admins))
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admins));
