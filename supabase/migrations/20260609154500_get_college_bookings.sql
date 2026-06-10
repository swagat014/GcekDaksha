-- Migration to create get_college_bookings RPC function to safely query checked-in players under a college (whitespace-insensitive).
DROP FUNCTION IF EXISTS public.get_college_bookings(text);

CREATE OR REPLACE FUNCTION public.get_college_bookings(p_college_name text)
RETURNS TABLE (selected_players jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ar.selected_players::jsonb
  FROM public.accommodation_requests ar
  WHERE regexp_replace(lower(trim(ar.college_name)), '\s+', ' ', 'g') = regexp_replace(lower(trim(p_college_name)), '\s+', ' ', 'g')
    AND ar.status != 'rejected';
END;
$$;
