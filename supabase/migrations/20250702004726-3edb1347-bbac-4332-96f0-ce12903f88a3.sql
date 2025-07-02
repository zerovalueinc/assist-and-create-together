
-- Create pipeline_states table to track pipeline execution
CREATE TABLE public.pipeline_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('idle', 'running', 'paused', 'completed', 'failed')),
  current_phase TEXT NOT NULL CHECK (current_phase IN ('icp_generation', 'company_discovery', 'contact_discovery', 'email_personalization', 'campaign_upload')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  companies_processed INTEGER NOT NULL DEFAULT 0,
  contacts_found INTEGER NOT NULL DEFAULT 0,
  emails_generated INTEGER NOT NULL DEFAULT 0,
  config JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pipeline_results table to store pipeline outputs
CREATE TABLE public.pipeline_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID REFERENCES public.pipeline_states(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  results_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pipeline_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pipeline_states
CREATE POLICY "Users can view their own pipeline states" 
  ON public.pipeline_states 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pipeline states" 
  ON public.pipeline_states 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pipeline states" 
  ON public.pipeline_states 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pipeline states" 
  ON public.pipeline_states 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for pipeline_results
CREATE POLICY "Users can view their own pipeline results" 
  ON public.pipeline_results 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pipeline results" 
  ON public.pipeline_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pipeline results" 
  ON public.pipeline_results 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_pipeline_states_user_id ON public.pipeline_states(user_id);
CREATE INDEX idx_pipeline_states_status ON public.pipeline_states(status);
CREATE INDEX idx_pipeline_results_pipeline_id ON public.pipeline_results(pipeline_id);
CREATE INDEX idx_pipeline_results_user_id ON public.pipeline_results(user_id);
