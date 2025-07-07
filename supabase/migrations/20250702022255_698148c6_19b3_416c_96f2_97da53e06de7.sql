
-- Optimize RLS policy for profiles table to improve performance
-- Replace auth.uid() with (select auth.uid()) to avoid per-row re-evaluation

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING ((select auth.uid())::text = id::text);
  
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING ((select auth.uid())::text = id::text);
