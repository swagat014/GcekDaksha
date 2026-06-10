CREATE OR REPLACE FUNCTION public.check_invalid_views()
RETURNS TABLE (
  view_schema text,
  view_name text,
  error_msg text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
  err text;
BEGIN
  FOR r IN 
    SELECT table_schema, table_name 
    FROM information_schema.views 
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
  LOOP
    BEGIN
      EXECUTE format('SELECT 1 FROM %I.%I LIMIT 0', r.table_schema, r.table_name);
    EXCEPTION WHEN OTHERS THEN
      err := SQLERRM;
      RETURN QUERY SELECT r.table_schema::text, r.table_name::text, err;
    END;
  END LOOP;
END;
$$;
