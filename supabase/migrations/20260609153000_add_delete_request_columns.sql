-- Migration to add delete request columns to registrations and accommodation_requests
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS delete_requested boolean DEFAULT false;
ALTER TABLE public.accommodation_requests ADD COLUMN IF NOT EXISTS delete_requested boolean DEFAULT false;
