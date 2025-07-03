-- Fix company_analyzer_outputs RLS policy to use optimized pattern
-- This should resolve the save issues

-- Drop the old policy
DROP POLICY IF EXISTS "enable_all_for_authenticated_users" ON public.company_analyzer_outputs;

-- Create the optimized policy
CREATE POLICY "enable_all_for_authenticated_users" ON public.company_analyzer_outputs
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id); 