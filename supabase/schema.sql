-- ==============================================================================
-- MilestoneOS — Complete Supabase PostgreSQL Database Schema & RLS Architecture
-- ==============================================================================

-- 1. Profiles Table (Linked to Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  milestone_os_id text unique not null,
  full_name text not null,
  email text not null,
  role text not null default 'client' check (role in ('client', 'freelancer', 'both')),
  roles text[] not null default array['client'],
  avatar text,
  company text,
  title text,
  rating numeric default 5.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Projects Table
create table if not exists public.projects (
  id text primary key,
  title text not null,
  description text,
  category text,
  currency text not null default 'USD',
  total_budget numeric not null default 0,
  target_deadline text,
  status text not null default 'active',
  proposal_status text default 'accepted',
  terms_agreed boolean default true,
  client_id uuid references public.profiles(id) on delete set null,
  freelancer_id uuid references public.profiles(id) on delete set null,
  client_name text not null,
  client_email text not null,
  client_company text,
  client_mso_id text,
  freelancer_name text not null,
  freelancer_email text not null,
  freelancer_title text,
  freelancer_mso_id text,
  initiated_by text not null default 'client' check (initiated_by in ('client', 'freelancer')),
  initiator_mso_id text,
  invitation_token text unique,
  invitation_status text default 'active',
  invitation_expires_at timestamp with time zone,
  accepted_at timestamp with time zone,
  accepted_by_mso_id text,
  is_demo boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Project Members Table
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id text references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  project_role text not null check (project_role in ('client', 'freelancer')),
  membership_status text not null default 'accepted' check (membership_status in ('owner', 'accepted', 'invited')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, user_id, project_role)
);

-- 4. Milestones Table
create table if not exists public.milestones (
  id text primary key,
  project_id text references public.projects(id) on delete cascade not null,
  stage_number integer not null default 1,
  title text not null,
  description text,
  amount numeric not null default 0,
  currency text not null default 'USD',
  due_date text,
  status text not null default 'not_started',
  paid_at timestamp with time zone,
  paypal_transaction_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Acceptance Criteria Table
create table if not exists public.acceptance_criteria (
  id text primary key,
  milestone_id text references public.milestones(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Work Submissions Table
create table if not exists public.submissions (
  id text primary key,
  milestone_id text references public.milestones(id) on delete cascade not null,
  submitted_by uuid references public.profiles(id) on delete set null,
  notes text not null,
  github_repo text,
  demo_url text,
  loom_video text,
  deliverable_links jsonb default '[]'::jsonb,
  attachments jsonb default '[]'::jsonb,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. AI Assessments Table
create table if not exists public.ai_assessments (
  id text primary key,
  milestone_id text references public.milestones(id) on delete cascade not null,
  score numeric not null default 0,
  summary text,
  strengths jsonb default '[]'::jsonb,
  concerns jsonb default '[]'::jsonb,
  recommendation text,
  criteria_evaluations jsonb default '[]'::jsonb,
  actionable_steps jsonb default '[]'::jsonb,
  assessed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Transactions Table
create table if not exists public.transactions (
  id text primary key,
  project_id text references public.projects(id) on delete cascade not null,
  milestone_id text references public.milestones(id) on delete cascade not null,
  payer_id uuid references public.profiles(id) on delete set null,
  payee_id uuid references public.profiles(id) on delete set null,
  amount numeric not null,
  currency text not null default 'USD',
  status text not null default 'completed',
  paypal_transaction_id text not null,
  paid_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_simulated boolean default false
);

-- 9. Notifications Table
create table if not exists public.notifications (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  project_id text references public.projects(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'general',
  unread boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Project Activities Table
create table if not exists public.project_activities (
  id text primary key,
  project_id text references public.projects(id) on delete cascade not null,
  actor_name text not null,
  actor_role text not null,
  action text not null,
  details text,
  milestone_title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.milestones enable row level security;
alter table public.acceptance_criteria enable row level security;
alter table public.submissions enable row level security;
alter table public.ai_assessments enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.project_activities enable row level security;

-- Profiles Policies
create policy "Allow profile viewing" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Helper Security Functions
create or replace function public.is_project_participant(p_id text, u_id uuid)
returns boolean security definer language sql stable as $$
  select exists (
    select 1 from public.projects
    where id = p_id and (client_id = u_id or freelancer_id = u_id or is_demo = true)
    union
    select 1 from public.project_members
    where project_id = p_id and user_id = u_id
  );
$$;

-- Projects Policies
create policy "Projects access policy" on public.projects for all
  using (
    client_id = auth.uid()
    or freelancer_id = auth.uid()
    or is_demo = true
    or (invitation_token is not null and invitation_status = 'active')
    or public.is_project_participant(id, auth.uid())
  )
  with check (
    client_id = auth.uid()
    or freelancer_id = auth.uid()
    or public.is_project_participant(id, auth.uid())
  );

-- Project Members Policies
create policy "Project members access policy" on public.project_members for all
  using (user_id = auth.uid() or public.is_project_participant(project_id, auth.uid()));

-- Milestones Policies
create policy "Milestones access policy" on public.milestones for all
  using (public.is_project_participant(project_id, auth.uid()));

-- Criteria Policies
create policy "Criteria access policy" on public.acceptance_criteria for all
  using (exists (select 1 from public.milestones m where m.id = milestone_id and public.is_project_participant(m.project_id, auth.uid())));

-- Submissions Policies
create policy "Submissions access policy" on public.submissions for all
  using (exists (select 1 from public.milestones m where m.id = milestone_id and public.is_project_participant(m.project_id, auth.uid())));

-- AI Assessments Policies
create policy "AI assessments access policy" on public.ai_assessments for all
  using (exists (select 1 from public.milestones m where m.id = milestone_id and public.is_project_participant(m.project_id, auth.uid())));

-- Transactions Policies
create policy "Transactions access policy" on public.transactions for all
  using (payer_id = auth.uid() or payee_id = auth.uid() or public.is_project_participant(project_id, auth.uid()));

-- Notifications Policies
create policy "Notifications access policy" on public.notifications for all
  using (user_id = auth.uid());

-- Activities Policies
create policy "Activities access policy" on public.project_activities for all
  using (public.is_project_participant(project_id, auth.uid()));

-- Trigger for new auth.users
create or replace function public.handle_new_user()
returns trigger as $$
declare
  generated_mso_id text;
  user_role text;
  user_roles text[];
  user_name text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'both');
  if user_role not in ('client', 'freelancer', 'both') then
    user_role := 'both';
  end if;

  if user_role = 'both' then
    user_roles := array['client', 'freelancer'];
  else
    user_roles := array[user_role];
  end if;

  user_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  generated_mso_id := coalesce(new.raw_user_meta_data->>'milestoneOSId', 'MSO-' || upper(substring(md5(random()::text) from 1 for 6)));

  insert into public.profiles (id, milestone_os_id, full_name, email, role, roles, avatar, company, title)
  values (
    new.id,
    generated_mso_id,
    user_name,
    new.email,
    user_role,
    user_roles,
    upper(substring(user_name from 1 for 2)),
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'title'
  )
  on conflict (id) do update set
    milestone_os_id = excluded.milestone_os_id,
    full_name = excluded.full_name,
    email = excluded.email,
    role = excluded.role,
    roles = excluded.roles,
    avatar = excluded.avatar,
    company = coalesce(excluded.company, public.profiles.company),
    title = coalesce(excluded.title, public.profiles.title),
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
