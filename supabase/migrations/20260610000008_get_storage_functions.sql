CREATE OR REPLACE FUNCTION public.get_storage_functions()
RETURNS TABLE (
  routine_name text,
  data_type text,
  routine_definition text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = storage, public, pg_catalog
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.routine_name::text,
    r.data_type::text,
    r.routine_definition::text
  FROM information_schema.routines r
  WHERE r.routine_schema = 'storage';
END;
$$;
