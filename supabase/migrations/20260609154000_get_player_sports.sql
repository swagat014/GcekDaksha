-- Migration to create get_player_sports RPC function to query registered sports for players under a college.
CREATE OR REPLACE FUNCTION public.get_player_sports(
  p_college_name text,
  p_player_names text[]
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  WITH player_list AS (
    SELECT unnest(p_player_names) AS search_name
  ),
  matched_regs AS (
    SELECT 
      pl.search_name,
      r.sport,
      r.team_name
    FROM player_list pl
    CROSS JOIN public.registrations r
    WHERE regexp_replace(lower(trim(r.college_name)), '\s+', ' ', 'g') = regexp_replace(lower(trim(p_college_name)), '\s+', ' ', 'g')
      AND (
        regexp_replace(lower(trim(r.captain_name)), '\s+', ' ', 'g') = regexp_replace(lower(trim(pl.search_name)), '\s+', ' ', 'g')
        OR
        EXISTS (
          SELECT 1 
          FROM jsonb_array_elements(r.players::jsonb) AS p
          WHERE regexp_replace(lower(trim(coalesce(p->>'name', p->>0))), '\s+', ' ', 'g') = regexp_replace(lower(trim(pl.search_name)), '\s+', ' ', 'g')
        )
      )
  ),
  grouped AS (
    SELECT 
      search_name,
      json_agg(json_build_object('sport', sport, 'team_name', team_name)) AS registrations
    FROM matched_regs
    GROUP BY search_name
  )
  SELECT json_object_agg(search_name, registrations)
  INTO v_result
  FROM grouped;

  RETURN coalesce(v_result, '{}'::json);
END;
$$;
