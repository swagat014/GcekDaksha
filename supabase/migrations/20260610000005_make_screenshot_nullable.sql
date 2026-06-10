-- Migration to make payment_screenshot_url nullable in accommodation_requests table
ALTER TABLE public.accommodation_requests ALTER COLUMN payment_screenshot_url DROP NOT NULL;
