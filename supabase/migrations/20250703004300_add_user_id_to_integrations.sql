-- Add user_id to integrations for per-user CRM auth
alter table integrations add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Drop old unique index if exists
DROP INDEX IF EXISTS idx_integrations_workspace;
DROP INDEX IF EXISTS idx_integrations_provider;

-- Add composite unique index for workspace_id, user_id, provider
create unique index if not exists idx_integrations_workspace_user_provider on integrations(workspace_id, user_id, provider); 