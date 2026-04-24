-- =============================================
-- Athernex Dashboard — Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Organizations
create table if not exists organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now()
);

-- Memberships (user ↔ org)
create table if not exists memberships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, org_id)
);

-- Conflicts (activity data from VS Code extension)
create table if not exists conflicts (
  id uuid default gen_random_uuid() primary key,
  author text not null,
  commit_hash text not null,
  file text not null,
  org_id uuid not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- =============================================
-- Row Level Security
-- =============================================

alter table organizations enable row level security;
alter table memberships enable row level security;
alter table conflicts enable row level security;

-- Organizations: anyone authenticated can read; members can see theirs
create policy "Authenticated users can read organizations"
  on organizations for select
  to authenticated
  using (true);

create policy "Authenticated users can create organizations"
  on organizations for insert
  to authenticated
  with check (true);

-- Memberships: users can read and manage their own
create policy "Users can read own memberships"
  on memberships for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create own memberships"
  on memberships for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Conflicts: users can read conflicts for their org
create policy "Users can read conflicts for their org"
  on conflicts for select
  to authenticated
  using (
    org_id in (
      select org_id from memberships where user_id = auth.uid()
    )
  );

create policy "Authenticated users can insert conflicts"
  on conflicts for insert
  to authenticated
  with check (true);

-- =============================================
-- Enable Realtime on conflicts table
-- Go to: Supabase Dashboard > Database > Replication
-- and enable the conflicts table for INSERT events
-- OR run:
-- =============================================
-- alter publication supabase_realtime add table conflicts;
