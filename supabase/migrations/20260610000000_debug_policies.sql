CREATE OR REPLACE FUNCTION public.get_table_policies(p_table text)
RETURNS TABLE (
  policyname name,
  cmd text,
  roles name[],
  qual text,
  with_check text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.policyname,
    p.cmd,
    p.roles,
    p.qual,
    p.with_check
  FROM pg_policies p
  WHERE p.tablename = p_table;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_table_triggers(p_table text)
RETURNS TABLE (
  trigger_name name,
  action_statement text,
  action_timing text,
  action_orientation text,
  action_event_manipulation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, information_schema
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.trigger_name::name,
    t.action_statement::text,
    t.action_timing::text,
    t.action_orientation::text,
    t.event_manipulation::text
  FROM information_schema.triggers t
  WHERE t.event_object_table = p_table;
END;
$$;
