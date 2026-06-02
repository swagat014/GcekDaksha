-- Migration to enable Row Level Security (RLS) on public tables that have policies defined but RLS disabled.
-- This resolves the Supabase security warnings.

-- 1. Enable RLS on public.accommodation_requests
ALTER TABLE public.accommodation_requests ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Enable RLS on public.registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
