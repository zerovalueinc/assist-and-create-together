-- CRM Activities warehouse table
create table if not exists crm_activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null, -- e.g., 'hubspot'
  crm_id text not null, -- CRM's activity ID
  data jsonb not null, -- Raw CRM activity data
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, crm_id, workspace_id)
);
create index if not exists idx_crm_activities_workspace on crm_activities(workspace_id);
create index if not exists idx_crm_activities_user on crm_activities(user_id); 