
-- Optimize RLS policies to avoid performance warnings
-- Replace auth.uid() with (select auth.uid()) for better performance

-- Drop existing policies and recreate with optimized versions

-- Profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING ((select auth.uid()) = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING ((select auth.uid()) = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- Pipeline states table policies
DROP POLICY IF EXISTS "Users can view their own pipeline states" ON public.pipeline_states;
DROP POLICY IF EXISTS "Users can create their own pipeline states" ON public.pipeline_states;
DROP POLICY IF EXISTS "Users can update their own pipeline states" ON public.pipeline_states;
DROP POLICY IF EXISTS "Users can delete their own pipeline states" ON public.pipeline_states;

CREATE POLICY "Users can view their own pipeline states" ON public.pipeline_states
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create their own pipeline states" ON public.pipeline_states
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own pipeline states" ON public.pipeline_states
  FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own pipeline states" ON public.pipeline_states
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Pipeline results table policies
DROP POLICY IF EXISTS "Users can view their own pipeline results" ON public.pipeline_results;
DROP POLICY IF EXISTS "Users can create their own pipeline results" ON public.pipeline_results;
DROP POLICY IF EXISTS "Users can delete their own pipeline results" ON public.pipeline_results;

CREATE POLICY "Users can view their own pipeline results" ON public.pipeline_results
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create their own pipeline results" ON public.pipeline_results
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own pipeline results" ON public.pipeline_results
  FOR DELETE USING ((select auth.uid()) = user_id);
