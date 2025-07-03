-- Enable RLS on all tables that currently don't have it
-- This fixes the security errors from the Supabase linter

-- Enable RLS on workspaces table (uses owner_id)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own workspaces" ON public.workspaces
  FOR SELECT
  USING ((select auth.uid()) = owner_id);
CREATE POLICY "Users can create their own workspaces" ON public.workspaces
  FOR INSERT
  WITH CHECK ((select auth.uid()) = owner_id);
CREATE POLICY "Users can update their own workspaces" ON public.workspaces
  FOR UPDATE
  USING ((select auth.uid()) = owner_id);
CREATE POLICY "Users can delete their own workspaces" ON public.workspaces
  FOR DELETE
  USING ((select auth.uid()) = owner_id);

-- Enable RLS on invitations table (uses workspace_id, no direct user ownership)
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view invitations for their workspaces" ON public.invitations
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.workspaces 
    WHERE workspaces.id = invitations.workspace_id 
    AND workspaces.owner_id = (select auth.uid())
  ));
CREATE POLICY "Users can create invitations for their workspaces" ON public.invitations
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.workspaces 
    WHERE workspaces.id = invitations.workspace_id 
    AND workspaces.owner_id = (select auth.uid())
  ));
CREATE POLICY "Users can update invitations for their workspaces" ON public.invitations
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.workspaces 
    WHERE workspaces.id = invitations.workspace_id 
    AND workspaces.owner_id = (select auth.uid())
  ));
CREATE POLICY "Users can delete invitations for their workspaces" ON public.invitations
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.workspaces 
    WHERE workspaces.id = invitations.workspace_id 
    AND workspaces.owner_id = (select auth.uid())
  ));

-- Enable RLS on crm_contacts table (uses user_id and workspace_id)
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own CRM contacts" ON public.crm_contacts
  FOR SELECT
  USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create their own CRM contacts" ON public.crm_contacts
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own CRM contacts" ON public.crm_contacts
  FOR UPDATE
  USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own CRM contacts" ON public.crm_contacts
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Enable RLS on integrations table (uses user_id)
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own integrations" ON public.integrations
  FOR SELECT
  USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create their own integrations" ON public.integrations
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own integrations" ON public.integrations
  FOR UPDATE
  USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own integrations" ON public.integrations
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Enable RLS on crm_activities table (uses user_id and workspace_id)
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own CRM activities" ON public.crm_activities
  FOR SELECT
  USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create their own CRM activities" ON public.crm_activities
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own CRM activities" ON public.crm_activities
  FOR UPDATE
  USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own CRM activities" ON public.crm_activities
  FOR DELETE
  USING ((select auth.uid()) = user_id); 