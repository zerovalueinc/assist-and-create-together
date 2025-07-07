-- Create integrations table for workspace integrations (HubSpot, etc.)
create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  provider text not null, -- e.g., 'hubspot'
  access_token text, -- store securely or use Vault in production
  refresh_token text,
  status text default 'pending',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_integrations_workspace on integrations(workspace_id);
create index if not exists idx_integrations_provider on integrations(provider); 