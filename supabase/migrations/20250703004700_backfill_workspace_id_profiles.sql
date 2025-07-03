-- Backfill workspace_id for all profiles where missing (owners)
update profiles set workspace_id = w.id
from workspaces w
where profiles.id = w.owner_id and profiles.workspace_id is null; 