CREATE OR REPLACE FUNCTION public.get_storage_policies()
RETURNS TABLE (
  name text,
  bucket_id text,
  op text,
  definition text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name::text,
    p.bucket_id::text,
    p.op::text,
    p.definition::text
  FROM storage.policies p;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_storage_buckets()
RETURNS TABLE (
  id text,
  name text,
  public boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id::text,
    b.name::text,
    b.public::boolean
  FROM storage.buckets b;
END;
$$;
