-- LIVV Crew foundation. Shared writes are server-authoritative.
create extension if not exists pgcrypto;

create table if not exists public.crews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 40),
  description text not null default '' check (char_length(description) <= 240),
  created_by uuid not null references auth.users(id) on delete restrict,
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crew_members (
  crew_id uuid not null references public.crews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  status text not null default 'active' check (status in ('active','left','removed')),
  display_name text not null default 'Member' check (char_length(display_name) between 1 and 60),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (crew_id, user_id)
);
create index if not exists crew_members_user_active_idx on public.crew_members(user_id, status, joined_at desc);
create index if not exists crew_members_crew_active_idx on public.crew_members(crew_id, status, joined_at);

create table if not exists public.crew_invitations (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  token_hash text not null unique,
  created_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz not null,
  max_uses integer not null default 10 check (max_uses between 1 and 50),
  uses integer not null default 0 check (uses >= 0 and uses <= max_uses),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists crew_invites_crew_idx on public.crew_invitations(crew_id, created_at desc);

create table if not exists public.crew_challenges (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid references public.crews(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 3 and 80),
  description text not null default '' check (char_length(description) <= 500),
  challenge_type text not null check (challenge_type in ('daily_action_days','workout_sessions','learning_sessions','custom_checkin')),
  rules_version integer not null default 1 check (rules_version > 0),
  target_count integer not null check (target_count between 1 and 100),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  visibility text not null default 'crew' check (visibility in ('crew','private')),
  created_by uuid not null references auth.users(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft','active','completed','cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists crew_challenges_crew_dates_idx on public.crew_challenges(crew_id, starts_at, ends_at);

create table if not exists public.crew_challenge_members (
  challenge_id uuid not null references public.crew_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_count integer not null check (target_count between 1 and 100),
  enrolled_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active','completed','withdrawn')),
  primary key (challenge_id, user_id)
);

create table if not exists public.crew_completions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.crew_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_key text not null check (char_length(activity_key) between 1 and 80),
  occurred_at timestamptz not null,
  accepted_at timestamptz not null default now(),
  source text not null check (source in ('server_verified','app_recorded','self_reported')),
  idempotency_key uuid not null,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  unique (challenge_id, user_id, idempotency_key)
);
create index if not exists crew_completions_progress_idx on public.crew_completions(challenge_id, user_id, occurred_at);

create table if not exists public.crew_audit_events (
  id bigint generated always as identity primary key,
  crew_id uuid references public.crews(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (char_length(event_type) between 2 and 80),
  subject_user_id uuid references auth.users(id) on delete set null,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now()
);
create index if not exists crew_audit_events_crew_created_idx on public.crew_audit_events(crew_id, created_at desc);

-- Enable RLS everywhere. Client writes are deliberately not granted; trusted
-- API routes use the server-only service role after verifying the caller.
alter table public.crews enable row level security;
alter table public.crew_members enable row level security;
alter table public.crew_invitations enable row level security;
alter table public.crew_challenges enable row level security;
alter table public.crew_challenge_members enable row level security;
alter table public.crew_completions enable row level security;
alter table public.crew_audit_events enable row level security;

drop policy if exists "Crew members can view their active crews" on public.crews;
create policy "Crew members can view their active crews" on public.crews
for select to authenticated using (
  exists (select 1 from public.crew_members m where m.crew_id = crews.id and m.user_id = auth.uid() and m.status = 'active')
);

drop policy if exists "Members can view their crew roster" on public.crew_members;
create policy "Members can view their crew roster" on public.crew_members
for select to authenticated using (
  exists (select 1 from public.crew_members mine where mine.crew_id = crew_members.crew_id and mine.user_id = auth.uid() and mine.status = 'active')
);

drop policy if exists "Members can view crew challenges" on public.crew_challenges;
create policy "Members can view crew challenges" on public.crew_challenges
for select to authenticated using (
  crew_id is not null and exists (select 1 from public.crew_members m where m.crew_id = crew_challenges.crew_id and m.user_id = auth.uid() and m.status = 'active')
);

drop policy if exists "Members can view challenge enrollment" on public.crew_challenge_members;
create policy "Members can view challenge enrollment" on public.crew_challenge_members
for select to authenticated using (
  user_id = auth.uid() or exists (
    select 1 from public.crew_challenges c join public.crew_members m on m.crew_id = c.crew_id
    where c.id = crew_challenge_members.challenge_id and m.user_id = auth.uid() and m.status = 'active'
  )
);

drop policy if exists "Members can view shared crew completions" on public.crew_completions;
create policy "Members can view shared crew completions" on public.crew_completions
for select to authenticated using (
  user_id = auth.uid() or exists (
    select 1 from public.crew_challenges c join public.crew_members m on m.crew_id = c.crew_id
    where c.id = crew_completions.challenge_id and m.user_id = auth.uid() and m.status = 'active'
  )
);

-- Invitations and audit history are server-only; no direct authenticated policies.
revoke all on public.crew_invitations, public.crew_audit_events from anon, authenticated;
revoke insert, update, delete on public.crews, public.crew_members, public.crew_challenges,
  public.crew_challenge_members, public.crew_completions from anon, authenticated;
grant select on public.crews, public.crew_members, public.crew_challenges,
  public.crew_challenge_members, public.crew_completions to authenticated;

comment on table public.crew_completions is 'Accepted activity events. Scores must be derived from eligible rows, never client-submitted totals.';
comment on table public.crew_invitations is 'Invitation tokens are stored only as cryptographic hashes and managed by trusted server routes.';
