-- Prevent the device-first onboarding flow from minting a local LIVV member
-- session unless the browser has a real, verified Supabase Auth identity.
-- The application must still perform its normal email OTP verification before
-- reaching onboarding; this database migration documents the server-side
-- boundary and supports the client guard added alongside it.

alter table if exists public.profiles
  add column if not exists email_verified_at timestamptz;

create index if not exists profiles_email_verified_at_idx
  on public.profiles (id)
  where email_verified_at is not null;

comment on column public.profiles.email_verified_at is
  'Timestamp recorded by the client after successful Supabase email OTP verification; informational only.';
