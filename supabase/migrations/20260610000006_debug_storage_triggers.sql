CREATE OR REPLACE FUNCTION public.get_storage_triggers()
RETURNS TABLE (
  trigger_name name,
  trigger_def text,
  action_timing text,
  action_orientation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = storage, public, pg_catalog
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tgname::name,
    pg_get_triggerdef(t.oid)::text,
    CASE (t.tgtype::int & 2) WHEN 2 THEN 'BEFORE' ELSE 'AFTER' END::text,
    CASE (t.tgtype::int & 1) WHEN 1 THEN 'ROW' ELSE 'STATEMENT' END::text
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'storage' AND c.relname = 'objects';
END;
$$;
