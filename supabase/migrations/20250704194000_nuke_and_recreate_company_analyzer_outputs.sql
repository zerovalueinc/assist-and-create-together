-- Nuke and recreate company_analyzer_outputs for minimal backend
DROP TABLE IF EXISTS public.company_analyzer_outputs CASCADE;

CREATE TABLE public.company_analyzer_outputs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- No foreign key constraint to profiles
  website TEXT,
  llm_output JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.company_analyzer_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_access" ON public.company_analyzer_outputs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_company_analyzer_user_website ON public.company_analyzer_outputs(user_id, website); 