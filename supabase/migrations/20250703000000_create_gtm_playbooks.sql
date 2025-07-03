-- Create GTM Playbooks table for PersonaOps
create table if not exists gtm_playbooks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  company_name text not null,
  website_url text not null,
  playbook_data jsonb not null,
  confidence numeric,
  research_summary text,
  sources jsonb,
  status text default 'complete',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_gtm_playbooks_workspace on gtm_playbooks(workspace_id);
create index if not exists idx_gtm_playbooks_user on gtm_playbooks(user_id);
create index if not exists idx_gtm_playbooks_company on gtm_playbooks(company_name); 