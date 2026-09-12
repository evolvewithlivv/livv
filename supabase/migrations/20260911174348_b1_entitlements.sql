-- B1 · Server-side subscription entitlements + webhook idempotency
-- Apply in Supabase SQL Editor (service role / dashboard).
-- Does NOT change profiles.tier authority.
-- Does NOT touch localStorage client entitlements.

-- ---------------------------------------------------------------------------
-- entitlements: one membership row per auth user
-- ---------------------------------------------------------------------------
create table if not exists public.entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  tier text not null default 'spark'
    check (tier in ('spark', 'rise', 'apex', 'circle')),
  status text not null default 'none'
    check (status in ('none', 'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  source text not null default 'stripe',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists entitlements_stripe_subscription_id_uidx
  on public.entitlements (stripe_subscription_id)
  where stripe_subscription_id is not null;

create index if not exists entitlements_stripe_customer_id_idx
  on public.entitlements (stripe_customer_id)
  where stripe_customer_id is not null;

create or replace function public.set_entitlements_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists entitlements_set_updated_at on public.entitlements;
create trigger entitlements_set_updated_at
  before update on public.entitlements
  for each row
  execute function public.set_entitlements_updated_at();

alter table public.entitlements enable row level security;

drop policy if exists "entitlements_select_own" on public.entitlements;
create policy "entitlements_select_own"
  on public.entitlements
  for select
  to authenticated
  using (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated/anon.
-- Service role (webhook) bypasses RLS.

grant select on public.entitlements to authenticated;

-- ---------------------------------------------------------------------------
-- stripe_webhook_events: idempotency log (service role only)
-- ---------------------------------------------------------------------------
create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;
-- No policies for anon/authenticated — clients cannot read or write.
