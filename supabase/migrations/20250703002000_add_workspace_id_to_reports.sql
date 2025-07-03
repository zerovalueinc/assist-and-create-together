-- Add workspace_id to all major report/intel tables
-- Note: company_analyzer_outputs table is created in a later migration with workspace_id already included

alter table saved_reports add column if not exists workspace_id uuid references workspaces(id) on delete cascade;
create index if not exists idx_saved_reports_workspace on saved_reports(workspace_id);

alter table icps add column if not exists workspace_id uuid references workspaces(id) on delete cascade;
create index if not exists idx_icps_workspace on icps(workspace_id); 