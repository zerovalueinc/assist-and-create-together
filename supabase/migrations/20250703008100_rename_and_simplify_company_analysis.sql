-- Rename company_analyzer_outputs to company_analysis_reports and update schema
ALTER TABLE IF EXISTS public.company_analyzer_outputs RENAME TO company_analysis_reports;

-- Rename columns for clarity and industry standard
ALTER TABLE public.company_analysis_reports RENAME COLUMN companyName TO company_name;
ALTER TABLE public.company_analysis_reports RENAME COLUMN companyProfile TO company_profile;
ALTER TABLE public.company_analysis_reports RENAME COLUMN decisionMakers TO decision_makers;
ALTER TABLE public.company_analysis_reports RENAME COLUMN painPoints TO pain_points;
ALTER TABLE public.company_analysis_reports RENAME COLUMN technologies TO technologies;
ALTER TABLE public.company_analysis_reports RENAME COLUMN location TO location;
ALTER TABLE public.company_analysis_reports RENAME COLUMN marketTrends TO market_trends;
ALTER TABLE public.company_analysis_reports RENAME COLUMN competitiveLandscape TO competitive_landscape;
ALTER TABLE public.company_analysis_reports RENAME COLUMN goToMarketStrategy TO go_to_market_strategy;
ALTER TABLE public.company_analysis_reports RENAME COLUMN researchSummary TO research_summary;
ALTER TABLE public.company_analysis_reports RENAME COLUMN website TO company_url;

-- Add icp_profile field if not exists
ALTER TABLE public.company_analysis_reports ADD COLUMN IF NOT EXISTS icp_profile JSONB;

-- Remove icps table if it exists and not needed
DROP TABLE IF EXISTS public.icps CASCADE;

-- Update indexes if needed
DROP INDEX IF EXISTS idx_company_analyzer_user_id;
DROP INDEX IF EXISTS idx_company_analyzer_website;
DROP INDEX IF EXISTS idx_company_analyzer_created_at;
CREATE INDEX IF NOT EXISTS idx_company_analysis_user_id ON public.company_analysis_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_company_analysis_company_url ON public.company_analysis_reports(company_url);
CREATE INDEX IF NOT EXISTS idx_company_analysis_created_at ON public.company_analysis_reports(created_at); 