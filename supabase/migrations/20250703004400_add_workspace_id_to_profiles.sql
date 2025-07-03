-- Add workspace_id to profiles for teammate lookup
alter table profiles add column if not exists workspace_id uuid references workspaces(id) on delete set null;

-- Backfill workspace_id for existing users
update profiles set workspace_id = w.id
from workspaces w
where profiles.id = w.owner_id and profiles.workspace_id is null;

create index if not exists idx_profiles_workspace on profiles(workspace_id); 