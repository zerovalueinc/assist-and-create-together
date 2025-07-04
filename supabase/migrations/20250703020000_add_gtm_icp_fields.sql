-- Add new columns for GTM/ICP schema
ALTER TABLE company_analyzer_outputs_unrestricted
  ADD COLUMN IF NOT EXISTS ibp jsonb,
  ADD COLUMN IF NOT EXISTS icp jsonb,
  ADD COLUMN IF NOT EXISTS go_to_market_insights text,
  ADD COLUMN IF NOT EXISTS market_trends text[],
  ADD COLUMN IF NOT EXISTS competitive_landscape text[],
  ADD COLUMN IF NOT EXISTS decision_makers jsonb,
  ADD COLUMN IF NOT EXISTS research_summary text; 