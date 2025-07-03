-- Backfill workspace_id for all existing records based on user_id -> workspace.owner_id
update company_analyzer_outputs_unrestricted set workspace_id = w.id
from workspaces w
where company_analyzer_outputs_unrestricted.user_id = w.owner_id and company_analyzer_outputs_unrestricted.workspace_id is null;

update saved_reports set workspace_id = w.id
from workspaces w
where saved_reports.user_id = w.owner_id and saved_reports.workspace_id is null;

update icps set workspace_id = w.id
from workspaces w
where icps.user_id = w.owner_id and icps.workspace_id is null; 