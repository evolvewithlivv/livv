-- Persist onboarding completion on the authenticated profile so returning
-- members are recognized across browsers/devices.
alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

create index if not exists profiles_onboarding_completed_idx
  on public.profiles (id)
  where onboarding_completed_at is not null;
