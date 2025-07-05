-- Create company_analyzer_outputs_unrestricted table
CREATE TABLE public.company_analyzer_outputs_unrestricted (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- No foreign key constraint to profiles
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

-- Enable Row Level Security
ALTER TABLE public.company_analyzer_outputs_unrestricted ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own company analyses" ON public.company_analyzer_outputs_unrestricted
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own company analyses" ON public.company_analyzer_outputs_unrestricted
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own company analyses" ON public.company_analyzer_outputs_unrestricted
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own company analyses" ON public.company_analyzer_outputs_unrestricted
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_company_analyzer_user_id ON public.company_analyzer_outputs_unrestricted(user_id);
CREATE INDEX idx_company_analyzer_website ON public.company_analyzer_outputs_unrestricted(website);
CREATE INDEX idx_company_analyzer_created_at ON public.company_analyzer_outputs_unrestricted(created_at); 