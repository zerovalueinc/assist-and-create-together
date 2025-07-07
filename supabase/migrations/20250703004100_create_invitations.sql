-- Create invitations table for team invites
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'pending',
  workspace_id uuid references workspaces(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_invitations_workspace on invitations(workspace_id);
create index if not exists idx_invitations_email on invitations(email); 