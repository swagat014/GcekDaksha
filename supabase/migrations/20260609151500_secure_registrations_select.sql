-- Migration to secure the public.registrations table SELECT policy and introduce server-side team member check-in verification.

-- 1. Create a secure RPC function to check team details server-side under SECURITY DEFINER context
CREATE OR REPLACE FUNCTION public.get_team_players(
  p_team_name text,
  p_college_name text,
  p_sport text,
  p_captain_name text,
  p_captain_mobile text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'captain_name', captain_name,
    'players', players
  )
  INTO v_result
  FROM public.registrations
  WHERE regexp_replace(lower(trim(team_name)), '\s+', ' ', 'g') = regexp_replace(lower(trim(p_team_name)), '\s+', ' ', 'g')
    AND regexp_replace(lower(trim(college_name)), '\s+', ' ', 'g') = regexp_replace(lower(trim(p_college_name)), '\s+', ' ', 'g')
    AND regexp_replace(lower(trim(sport)), '\s+', ' ', 'g') = regexp_replace(lower(trim(p_sport)), '\s+', ' ', 'g')
    AND regexp_replace(lower(trim(captain_name)), '\s+', ' ', 'g') = regexp_replace(lower(trim(p_captain_name)), '\s+', ' ', 'g')
    AND regexp_replace(trim(captain_mobile), '\s+', '', 'g') = regexp_replace(trim(p_captain_mobile), '\s+', '', 'g');

  RETURN v_result;
END;
$$;

-- 2. Drop the insecure public select policy
DROP POLICY IF EXISTS "Allow public select on registrations" ON public.registrations;

-- 3. Restrict select access on registrations to authenticated admins only
DROP POLICY IF EXISTS "Allow select on registrations for admins" ON public.registrations;

CREATE POLICY "Allow select on registrations for admins"
ON public.registrations
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
