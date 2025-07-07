-- Migration: Add icp_id to company_analyzer_outputs for robust Intel/ICP linking
ALTER TABLE public.company_analyzer_outputs
  ADD COLUMN IF NOT EXISTS icp_id UUID REFERENCES public.icps(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_company_analyzer_outputs_icp_id ON public.company_analyzer_outputs(icp_id); 