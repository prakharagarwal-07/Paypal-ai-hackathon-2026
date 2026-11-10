-- ==============================================================================
-- MilestoneOS — Supabase Database Schema
-- Paste this into your Supabase Dashboard -> SQL Editor and click "Run".
-- ==============================================================================

-- 1. Create Profiles Table (Linked to Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  milestone_os_id text unique not null,
  full_name text not null,
  email text not null,
  role text not null check (role in ('client', 'freelancer')),
  avatar text,
  company text,
  title text,
  rating numeric default 5.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies:
-- Allow viewing profiles (needed to look up users by MilestoneOS ID)
create policy "Allow public profile viewing"
  on public.profiles for select
  using (true);

-- Users can insert/update their own profile
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Automatically create profile on future Supabase signups
create or replace function public.handle_new_user()
returns trigger as $$
declare
  generated_mso_id text;
  user_role text;
  user_name text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'client');
  user_name := coalesce(new.raw_user_meta_data->>'name', 'New Member');
  generated_mso_id := coalesce(new.raw_user_meta_data->>'milestoneOSId', 'MSO-' || upper(substring(md5(random()::text) from 1 for 6)));

  insert into public.profiles (id, milestone_os_id, full_name, email, role, avatar, company, title)
  values (
    new.id,
    generated_mso_id,
    user_name,
    new.email,
    user_role,
    upper(substring(user_name from 1 for 2)),
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'title'
  )
  on conflict (id) do update set
    milestone_os_id = excluded.milestone_os_id,
    full_name = excluded.full_name,
    email = excluded.email,
    role = excluded.role,
    avatar = excluded.avatar,
    company = excluded.company,
    title = excluded.title;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on every new signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Backfill all existing users in auth.users into public.profiles
insert into public.profiles (id, milestone_os_id, full_name, email, role, avatar, company, title)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'milestoneOSId', 'MSO-' || upper(substring(md5(u.id::text) from 1 for 6))),
  coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.email,
  coalesce(u.raw_user_meta_data->>'role', 'client'),
  upper(substring(coalesce(u.raw_user_meta_data->>'name', 'US') from 1 for 2)),
  u.raw_user_meta_data->>'company',
  u.raw_user_meta_data->>'title'
from auth.users u
on conflict (id) do update set
  milestone_os_id = excluded.milestone_os_id,
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  avatar = excluded.avatar,
  company = excluded.company,
  title = excluded.title;
