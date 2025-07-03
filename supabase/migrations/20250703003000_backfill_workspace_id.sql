-- Backfill workspace_id for all existing records based on user_id -> workspace.owner_id
update company_analyzer_outputs_unrestricted set workspace_id = w.id
from workspaces w
where company_analyzer_outputs_unrestricted.user_id = w.owner_id and company_analyzer_outputs_unrestricted.workspace_id is null;

update saved_reports set workspace_id = w.id
from workspaces w
where saved_reports.user_id = w.owner_id and saved_reports.workspace_id is null;

-- Drop foreign key constraint on icps.user_id
ALTER TABLE icps DROP CONSTRAINT IF EXISTS icps_user_id_fkey;

-- Drop RLS policies on icps that reference user_id
DROP POLICY IF EXISTS "Users can view their own icps" ON public.icps;
DROP POLICY IF EXISTS "Users can create their own icps" ON public.icps;
DROP POLICY IF EXISTS "Users can update their own icps" ON public.icps;
DROP POLICY IF EXISTS "Users can delete their own icps" ON public.icps;

-- Change user_id to uuid
ALTER TABLE icps ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;

-- Re-add foreign key constraint to profiles(id)
ALTER TABLE icps ADD CONSTRAINT icps_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

update icps set workspace_id = w.id
from workspaces w
where icps.user_id = w.owner_id and icps.workspace_id is null;

-- Recreate RLS policies
CREATE POLICY "Users can view their own icps" ON public.icps
  FOR SELECT USING ((select auth.uid())::text = user_id::text);
CREATE POLICY "Users can create their own icps" ON public.icps
  FOR INSERT WITH CHECK ((select auth.uid())::text = user_id::text);
CREATE POLICY "Users can update their own icps" ON public.icps
  FOR UPDATE USING ((select auth.uid())::text = user_id::text);
CREATE POLICY "Users can delete their own icps" ON public.icps
  FOR DELETE USING ((select auth.uid())::text = user_id::text); 