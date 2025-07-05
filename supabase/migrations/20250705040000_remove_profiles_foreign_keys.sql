-- Remove all foreign key constraints that reference the profiles table
-- This migration fixes the immediate foreign key constraint errors

-- Remove foreign key constraints that reference profiles table
ALTER TABLE IF EXISTS public.company_analyzer_outputs DROP CONSTRAINT IF EXISTS company_analyzer_outputs_user_id_fkey;
ALTER TABLE IF EXISTS public.icps DROP CONSTRAINT IF EXISTS icps_user_id_fkey;
ALTER TABLE IF EXISTS public.leads DROP CONSTRAINT IF EXISTS leads_user_id_fkey;
ALTER TABLE IF EXISTS public.enriched_leads DROP CONSTRAINT IF EXISTS enriched_leads_user_id_fkey;
ALTER TABLE IF EXISTS public.email_campaigns DROP CONSTRAINT IF EXISTS email_campaigns_user_id_fkey;
ALTER TABLE IF EXISTS public.saved_reports DROP CONSTRAINT IF EXISTS saved_reports_user_id_fkey;
ALTER TABLE IF EXISTS public.gtm_playbooks DROP CONSTRAINT IF EXISTS gtm_playbooks_user_id_fkey;

-- Also remove any workspace_id foreign keys that might reference profiles
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_workspace_id_fkey;

-- Drop the profiles table if it still exists
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop any triggers or functions that reference profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE; 