-- Optimize all RLS policies for better performance
-- Replace auth.uid() with (select auth.uid()) to prevent re-evaluation per row

-- Fix company_analyzer_outputs RLS
DROP POLICY IF EXISTS "enable_all_for_authenticated_users" ON public.company_analyzer_outputs;
CREATE POLICY "enable_all_for_authenticated_users" ON public.company_analyzer_outputs
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix gtm_playbooks RLS
DROP POLICY IF EXISTS "owner_access" ON public.gtm_playbooks;
CREATE POLICY "owner_access" ON public.gtm_playbooks
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix leads RLS
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

CREATE POLICY "Users can view their own leads" ON public.leads
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own leads" ON public.leads
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own leads" ON public.leads
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own leads" ON public.leads
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Fix enriched_leads RLS
DROP POLICY IF EXISTS "Users can view their own enriched leads" ON public.enriched_leads;
DROP POLICY IF EXISTS "Users can create their own enriched leads" ON public.enriched_leads;
DROP POLICY IF EXISTS "Users can update their own enriched leads" ON public.enriched_leads;
DROP POLICY IF EXISTS "Users can delete their own enriched leads" ON public.enriched_leads;

CREATE POLICY "Users can view their own enriched leads" ON public.enriched_leads
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own enriched leads" ON public.enriched_leads
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own enriched leads" ON public.enriched_leads
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own enriched leads" ON public.enriched_leads
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Fix email_campaigns RLS
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.email_campaigns;

CREATE POLICY "Users can view their own campaigns" ON public.email_campaigns
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own campaigns" ON public.email_campaigns
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own campaigns" ON public.email_campaigns
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own campaigns" ON public.email_campaigns
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Fix icps RLS
DROP POLICY IF EXISTS "Users can view their own icps" ON public.icps;
DROP POLICY IF EXISTS "Users can create their own icps" ON public.icps;
DROP POLICY IF EXISTS "Users can update their own icps" ON public.icps;
DROP POLICY IF EXISTS "Users can delete their own icps" ON public.icps;

CREATE POLICY "Users can view their own icps" ON public.icps
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own icps" ON public.icps
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own icps" ON public.icps
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own icps" ON public.icps
  FOR DELETE
  USING ((select auth.uid()) = user_id); 