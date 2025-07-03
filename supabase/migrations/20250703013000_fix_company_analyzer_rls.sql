-- Fix RLS policies for company_analyzer_outputs table
-- The current policies are too restrictive and causing insert failures

-- Drop existing policies
DROP POLICY IF EXISTS "owner_access" ON public.company_analyzer_outputs;

-- Create new, more permissive policies
CREATE POLICY "Users can view their own company analyses" ON public.company_analyzer_outputs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own company analyses" ON public.company_analyzer_outputs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company analyses" ON public.company_analyzer_outputs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company analyses" ON public.company_analyzer_outputs
  FOR DELETE
  USING (auth.uid() = user_id); 