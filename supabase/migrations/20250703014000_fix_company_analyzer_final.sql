-- Final fix for company_analyzer_outputs table
-- Ensure RLS policies work correctly and table is accessible

-- Drop existing policies
DROP POLICY IF EXISTS "owner_access" ON public.company_analyzer_outputs;
DROP POLICY IF EXISTS "Users can view their own company analyses" ON public.company_analyzer_outputs;
DROP POLICY IF EXISTS "Users can create their own company analyses" ON public.company_analyzer_outputs;
DROP POLICY IF EXISTS "Users can update their own company analyses" ON public.company_analyzer_outputs;
DROP POLICY IF EXISTS "Users can delete their own company analyses" ON public.company_analyzer_outputs;

-- Ensure table exists with correct structure
DROP TABLE IF EXISTS public.company_analyzer_outputs CASCADE;

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

-- Create simple, working RLS policies
CREATE POLICY "enable_all_for_authenticated_users" ON public.company_analyzer_outputs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_company_analyzer_user_website ON public.company_analyzer_outputs(user_id, website); 