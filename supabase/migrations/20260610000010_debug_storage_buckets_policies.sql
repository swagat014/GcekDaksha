CREATE OR REPLACE FUNCTION public.get_storage_buckets_policies()
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
  WHERE p.schemaname = 'storage' AND p.tablename = 'buckets';
END;
$$;
