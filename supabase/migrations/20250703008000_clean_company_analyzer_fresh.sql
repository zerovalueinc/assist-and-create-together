-- Nuke all the problematic tables and start fresh
DROP TABLE IF EXISTS public.company_analyzer_outputs_unrestricted CASCADE;
DROP TABLE IF EXISTS public.company_analyzer_outputs CASCADE;

-- Create a simple, clean table for company analysis results
CREATE TABLE public.company_analyzer_outputs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.company_analyzer_outputs ENABLE ROW LEVEL SECURITY;

-- Simple, secure policies - only owner can access their own data
CREATE POLICY "owner_access" ON public.company_analyzer_outputs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_company_analyzer_user_website ON public.company_analyzer_outputs(user_id, website); 