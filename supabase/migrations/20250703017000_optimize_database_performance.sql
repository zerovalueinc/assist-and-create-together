-- Optimize database performance by adding missing indexes and removing unused ones
-- This fixes the performance warnings from the Supabase linter

-- Add missing foreign key indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id ON public.email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_enriched_leads_lead_id ON public.enriched_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_enriched_leads_user_id ON public.enriched_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_user_id ON public.saved_reports(user_id);

-- Remove unused indexes to reduce storage and maintenance overhead
-- These indexes haven't been used and are candidates for removal
DROP INDEX IF EXISTS idx_pipeline_states_user_id;
DROP INDEX IF EXISTS idx_pipeline_states_status;
DROP INDEX IF EXISTS idx_pipeline_results_pipeline_id;
DROP INDEX IF EXISTS idx_pipeline_results_user_id;
DROP INDEX IF EXISTS idx_workspaces_owner;
DROP INDEX IF EXISTS idx_invitations_workspace;
DROP INDEX IF EXISTS idx_crm_contacts_workspace;
DROP INDEX IF EXISTS idx_crm_contacts_user;
DROP INDEX IF EXISTS idx_crm_activities_workspace;
DROP INDEX IF EXISTS idx_crm_activities_user;
DROP INDEX IF EXISTS idx_gtm_playbooks_user_website;
DROP INDEX IF EXISTS idx_icps_user_id;
DROP INDEX IF EXISTS idx_icps_company_url;
DROP INDEX IF EXISTS idx_icps_created_at;
DROP INDEX IF EXISTS idx_company_analyzer_user_website;

-- Add back only the indexes that are actually needed for RLS and common queries
-- These are the indexes that will be used by the RLS policies and typical queries
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_invitations_workspace_id ON public.invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_user_id ON public.crm_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_workspace_id ON public.crm_contacts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_user_id ON public.crm_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_workspace_id ON public.crm_activities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_gtm_playbooks_user_id ON public.gtm_playbooks(user_id);
CREATE INDEX IF NOT EXISTS idx_icps_user_id ON public.icps(user_id);
CREATE INDEX IF NOT EXISTS idx_company_analyzer_outputs_user_id ON public.company_analyzer_outputs(user_id); 