-- Create Workspaces table for multi-tenant B2B SaaS
create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id) on delete set null,
  brand_color text default '#2563eb',
  logo_url text,
  settings jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workspaces_owner on workspaces(owner_id);
create unique index if not exists idx_workspaces_name on workspaces(name); 