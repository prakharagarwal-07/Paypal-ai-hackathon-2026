-- ==============================================================================
-- MilestoneOS — Migration 003: Shared 6-Character Base Code Architecture
-- ==============================================================================
-- Enables one unique 6-character base code per user that generates both role IDs:
-- Client ID:     CL-XXXXXX
-- Freelancer ID: FL-XXXXXX
-- Both belong to the same Supabase Auth account and single profile.
-- ==============================================================================

-- 1. Add base_code column to profiles
alter table public.profiles
  add column if not exists base_code text;

-- 2. Backfill base_code from existing milestone_os_id values
-- Extracts the 6-character code (e.g., MSO-Q7EWTG -> Q7EWTG, CL-Q7EWTG -> Q7EWTG)
update public.profiles
set base_code = upper(substring(milestone_os_id from '([A-Za-z0-9]{6})$'))
where base_code is null and milestone_os_id is not null;

-- Fallback for any profile with non-standard ID
update public.profiles
set base_code = upper(substring(md5(random()::text) from 1 for 6))
where base_code is null;

-- Normalize milestone_os_id for all profiles
update public.profiles
set milestone_os_id = 'CL-' || base_code
where milestone_os_id is null or milestone_os_id = '' or milestone_os_id like 'MSO-%';

-- 3. Ensure base_code is not null and add UNIQUE constraint
alter table public.profiles
  alter column base_code set not null;

create unique index if not exists profiles_base_code_key
  on public.profiles(base_code);

-- 4. Update the automatic user trigger to assign and persist shared base_code
create or replace function public.handle_new_user()
returns trigger as $$
declare
  generated_base_code text;
  user_role text;
  user_roles text[];
  user_name text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'client');
  if user_role not in ('client', 'freelancer') then
    user_role := 'client';
  end if;

  user_roles := array['client', 'freelancer'];
  user_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  
  -- Extract or generate unique 6-character alphanumeric base code
  generated_base_code := coalesce(
    new.raw_user_meta_data->>'baseCode',
    upper(substring(md5(random()::text) from 1 for 6))
  );

  insert into public.profiles (
    id,
    base_code,
    milestone_os_id,
    full_name,
    email,
    role,
    avatar,
    company,
    title
  )
  values (
    new.id,
    generated_base_code,
    'CL-' || generated_base_code,
    user_name,
    new.email,
    user_role,
    upper(substring(user_name from 1 for 2)),
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'title'
  )
  on conflict (id) do update set
    base_code = coalesce(public.profiles.base_code, excluded.base_code),
    milestone_os_id = coalesce(public.profiles.milestone_os_id, excluded.milestone_os_id),
    full_name = excluded.full_name,
    email = excluded.email,
    avatar = excluded.avatar,
    company = coalesce(excluded.company, public.profiles.company),
    title = coalesce(excluded.title, public.profiles.title),
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$ language plpgsql security definer;

-- Reattach trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
