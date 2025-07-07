-- Ensure company_research_steps table exists with proper RLS
-- This migration will create the table if it doesn't exist and add RLS policies

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS company_research_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_url text NOT NULL,
  step_name text NOT NULL,
  step_output jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_company_research_steps_user_company ON company_research_steps (user_id, company_url);

-- Enable RLS
ALTER TABLE company_research_steps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own research steps" ON company_research_steps;
DROP POLICY IF EXISTS "Users can create their own research steps" ON company_research_steps;
DROP POLICY IF EXISTS "Users can update their own research steps" ON company_research_steps;
DROP POLICY IF EXISTS "Users can delete their own research steps" ON company_research_steps;

-- Create RLS policies
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

-- Add some test data to verify the table works
INSERT INTO company_research_steps (user_id, company_url, step_name, step_output) 
VALUES (
  '9ceb63f6-d071-4140-b310-7e4bd3a3596a',
  'https://test.com',
  'test_step',
  '{"test": "data"}'
) ON CONFLICT DO NOTHING; 