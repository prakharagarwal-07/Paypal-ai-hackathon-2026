-- ==============================================================================
-- MilestoneOS — Strict Participant RLS & Zero Cross-Account Leakage
-- Migration: 004_strict_participant_rls.sql
-- ==============================================================================

-- Drop all existing projects policies to avoid permissive OR-combining
drop policy if exists "Projects access policy" on public.projects;
drop policy if exists "Projects select policy" on public.projects;
drop policy if exists "Projects insert policy" on public.projects;
drop policy if exists "Projects update policy" on public.projects;
drop policy if exists "Projects delete policy" on public.projects;
drop policy if exists "Milestones access policy" on public.milestones;
drop policy if exists "Transactions access policy" on public.transactions;

-- 1. STRICT PROJECTS SELECT POLICY
-- A user can ONLY view a project if they are the direct client or direct freelancer
create policy "Projects select policy"
  on public.projects for select
  using (
    client_id = auth.uid()
    or freelancer_id = auth.uid()
    or (is_public_invitation = true and invitation_token is not null and invitation_status = 'active')
    or is_demo = true
  );

-- 2. STRICT PROJECTS INSERT POLICY
create policy "Projects insert policy"
  on public.projects for insert
  with check (
    client_id = auth.uid()
    or freelancer_id = auth.uid()
    or is_demo = true
  );

-- 3. STRICT PROJECTS UPDATE POLICY
create policy "Projects update policy"
  on public.projects for update
  using (
    client_id = auth.uid()
    or freelancer_id = auth.uid()
  )
  with check (
    client_id = auth.uid()
    or freelancer_id = auth.uid()
  );

-- 4. STRICT MILESTONES ACCESS POLICY
create policy "Milestones access policy"
  on public.milestones for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
      and (p.client_id = auth.uid() or p.freelancer_id = auth.uid() or p.is_demo = true)
    )
  );

-- 5. STRICT TRANSACTIONS ACCESS POLICY
create policy "Transactions access policy"
  on public.transactions for all
  using (
    payer_id = auth.uid()
    or payee_id = auth.uid()
    or exists (
      select 1 from public.projects p
      where p.id = project_id
      and (p.client_id = auth.uid() or p.freelancer_id = auth.uid())
    )
  );
