-- Create table for step-by-step agent traceability
CREATE TABLE IF NOT EXISTS company_research_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_url text NOT NULL,
  step_name text NOT NULL,
  step_output jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Index for fast lookup by user and company
CREATE INDEX IF NOT EXISTS idx_company_research_steps_user_company ON company_research_steps (user_id, company_url);

-- Enable RLS
ALTER TABLE company_research_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_research_steps
CREATE POLICY "Users can view their own research steps" ON company_research_steps
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own research steps" ON company_research_steps
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own research steps" ON company_research_steps
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own research steps" ON company_research_steps
  FOR DELETE
  USING ((select auth.uid()) = user_id);
