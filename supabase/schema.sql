-- ==============================================================================
-- MilestoneOS — Supabase Database Schema
-- Paste this into your Supabase Dashboard -> SQL Editor and click "Run".
-- ==============================================================================

-- 1. Profiles Table (Linked to Supabase auth.users)
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
-- Anyone authenticated can view profiles (to find users by MilestoneOS ID)
create policy "Allow public profile viewing"
  on public.profiles for select
  using (true);

-- Users can only insert/update their own profile
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Automatically create profile on Supabase auth.users signup
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

  insert into public.profiles (id, milestone_os_id, full_name, email, role, avatar)
  values (
    new.id,
    generated_mso_id,
    user_name,
    new.email,
    user_role,
    upper(substring(user_name from 1 for 2))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on every new signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
