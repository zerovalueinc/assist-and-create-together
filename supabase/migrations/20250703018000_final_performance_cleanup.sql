-- Final performance cleanup - add missing pipeline indexes and remove unused ones
-- This completes the database optimization

-- Add missing foreign key indexes for pipeline tables
CREATE INDEX IF NOT EXISTS idx_pipeline_results_pipeline_id ON public.pipeline_results(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_results_user_id ON public.pipeline_results(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_states_user_id ON public.pipeline_states(user_id);

-- Remove unused indexes that we just created but aren't being used yet
-- These will be recreated when the features are actually used
DROP INDEX IF EXISTS idx_email_campaigns_user_id;
DROP INDEX IF EXISTS idx_enriched_leads_lead_id;
DROP INDEX IF EXISTS idx_enriched_leads_user_id;
DROP INDEX IF EXISTS idx_integrations_user_id;
DROP INDEX IF EXISTS idx_leads_user_id;
DROP INDEX IF EXISTS idx_saved_reports_user_id;
DROP INDEX IF EXISTS idx_workspaces_owner_id;
DROP INDEX IF EXISTS idx_invitations_workspace_id;
DROP INDEX IF EXISTS idx_crm_contacts_user_id;
DROP INDEX IF EXISTS idx_crm_contacts_workspace_id;
DROP INDEX IF EXISTS idx_crm_activities_user_id;
DROP INDEX IF EXISTS idx_crm_activities_workspace_id;
DROP INDEX IF EXISTS idx_gtm_playbooks_user_id;
DROP INDEX IF EXISTS idx_icps_user_id;
DROP INDEX IF EXISTS idx_company_analyzer_outputs_user_id;

-- Keep only the essential indexes that are actually needed for core functionality
-- These are the indexes that support the current working features
CREATE INDEX IF NOT EXISTS idx_company_analyzer_outputs_user_id ON public.company_analyzer_outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_gtm_playbooks_user_id ON public.gtm_playbooks(user_id);
CREATE INDEX IF NOT EXISTS idx_icps_user_id ON public.icps(user_id); 