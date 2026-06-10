CREATE OR REPLACE FUNCTION public.find_function(p_name text)
RETURNS TABLE (
  schema_name text,
  func_name text,
  arg_types text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.nspname::text,
    p.proname::text,
    pg_get_function_identity_arguments(p.oid)::text
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE p.proname = p_name;
END;
$$;
