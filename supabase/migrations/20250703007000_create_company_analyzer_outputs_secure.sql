-- Drop the old unrestricted table if it exists
DROP TABLE IF EXISTS public.company_analyzer_outputs_unrestricted CASCADE;

-- Create a new secure table for company analyze results
CREATE TABLE public.company_analyzer_outputs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  schemaVersion INTEGER DEFAULT 1,
  companyName TEXT NOT NULL,
  companyProfile JSONB,
  decisionMakers TEXT[],
  painPoints TEXT[],
  technologies TEXT[],
  location TEXT,
  marketTrends TEXT[],
  competitiveLandscape TEXT[],
  goToMarketStrategy TEXT,
  researchSummary TEXT,
  website TEXT NOT NULL,
  llm_output JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.company_analyzer_outputs ENABLE ROW LEVEL SECURITY;

-- SELECT: Only the owner can read
CREATE POLICY "Users can view their own company analyses"
  ON public.company_analyzer_outputs
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Only the owner can insert
CREATE POLICY "Users can create their own company analyses"
  ON public.company_analyzer_outputs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Only the owner can update
CREATE POLICY "Users can update their own company analyses"
  ON public.company_analyzer_outputs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: Only the owner can delete
CREATE POLICY "Users can delete their own company analyses"
  ON public.company_analyzer_outputs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_company_analyzer_user_id ON public.company_analyzer_outputs(user_id);
CREATE INDEX idx_company_analyzer_website ON public.company_analyzer_outputs(website);
CREATE INDEX idx_company_analyzer_created_at ON public.company_analyzer_outputs(created_at); 