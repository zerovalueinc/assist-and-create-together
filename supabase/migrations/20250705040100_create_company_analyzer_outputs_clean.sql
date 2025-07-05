-- Create a clean company_analyzer_outputs table without foreign key constraints
-- This replaces the problematic table that had foreign key constraints to profiles

-- Drop the existing table if it exists
DROP TABLE IF EXISTS public.company_analyzer_outputs CASCADE;

-- Create a new clean table without foreign key constraints
CREATE TABLE public.company_analyzer_outputs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- No foreign key constraint
  website TEXT NOT NULL,
  llm_output JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.company_analyzer_outputs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own company analyzer outputs" ON public.company_analyzer_outputs
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own company analyzer outputs" ON public.company_analyzer_outputs
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own company analyzer outputs" ON public.company_analyzer_outputs
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own company analyzer outputs" ON public.company_analyzer_outputs
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create indexes for performance
CREATE INDEX idx_company_analyzer_outputs_user_id ON public.company_analyzer_outputs(user_id);
CREATE INDEX idx_company_analyzer_outputs_created_at ON public.company_analyzer_outputs(created_at);
CREATE INDEX idx_company_analyzer_outputs_website ON public.company_analyzer_outputs(website); 