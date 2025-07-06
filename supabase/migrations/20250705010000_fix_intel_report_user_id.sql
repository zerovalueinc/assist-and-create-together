-- Migration: Fix Intel report user_id for visibility in Leads tab
-- Replace 'YOUR_USER_UUID' with the correct UUID for your user

UPDATE public.company_analyzer_outputs
SET user_id = 'YOUR_USER_UUID'; 