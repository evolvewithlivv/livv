# LIVV

LIVV is a personal evolution ecosystem built around daily action, training, reflection, progress, connection, packs, and the six life pillars.

## Stack

- Next.js 15 App Router
- React 19 + TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- Stripe Checkout + Customer Portal + webhooks
- Vercel
- Shopify storefront integration

## Current product

- Opening experience + onboarding
- Device-local identity and progression model
- Supabase anonymous identity foundation, with optional email linking
- Daily, Train, Mind, Evala, Connect, Profile, Settings, Progress, Shop, Packs, and Vault surfaces
- Evolution Packs with local collection state and paid Stripe Checkout
- Stripe subscription tiers: Spark, Rise, Apex, Inner Circle
- Server-side Stripe entitlements with webhook idempotency
- Client dual-read entitlement resolver with safe offline/local fallback
- Authenticated Stripe Customer Portal ownership
- Authenticated and user-bound Checkout session confirmation
- Production-safe demo unlock and paid-pack fallback behavior
- Production security headers and authenticated Evala API
- Local JSON export/import and full device-data wipe
- Installable PWA manifest and mobile-safe viewport metadata

## Billing architecture

The browser is still responsible for local UX state, but paid subscription authority is backed by `public.entitlements` in Supabase.

Stripe webhook events are signature-verified and recorded in `public.stripe_webhook_events` only after successful handling. Client access uses the server entitlement when available and falls back to the local entitlement cache when the network is unavailable.

The Stripe Customer Portal and Checkout session confirmation require the authenticated Supabase user and do not trust a client-supplied Stripe customer id as ownership proof.

## Supabase

Migration files live in `supabase/migrations/` and are applied in the LIVV Supabase project.

Current migration families include:

- `a3_1_identity_profiles.sql`
- `b1_entitlements.sql`
- `security_harden_function_privileges.sql`
- `security_harden_profile_privileges.sql`
- `optimize_rls_auth_checks.sql`
- `harden_table_privileges.sql`
- `harden_profile_select_privilege.sql`

Client access is protected by RLS. Server-owned billing and webhook tables have no client write path. Billing/webhook table privileges are also explicitly revoked from `anon` and unnecessary client operations are removed from profiles.

## Environment

Server secrets must never use a `NEXT_PUBLIC_` prefix.

Important production variables include:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_RISE`
- `STRIPE_PRICE_APEX`
- `STRIPE_PRICE_CIRCLE`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `XAI_API_KEY` and/or `OPENAI_API_KEY` for live Evala responses

`NEXT_PUBLIC_LIVV_DEMO_UNLOCK` is a non-production QA flag and is ignored by production builds.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Operations

`GET /api/health` returns a minimal no-store health payload and the Vercel Git commit when available. It intentionally does not expose secrets or service configuration.

## Production

The `main` branch deploys through Vercel. GitHub CI builds against Node 20 and Node 22.

Before shipping a billing change, verify:

1. Supabase migrations are applied to the production project.
2. Required production secrets are present in Vercel.
3. Stripe webhook delivery is configured for the production URL.
4. The current Vercel deployment is Ready.
5. The paid Checkout → webhook → entitlement → client hydration path is tested end-to-end.
6. `/api/health` reports the expected production commit after deployment.

## Explicitly deferred

- Server-side pack inventory/ledger
- Full cloud progress synchronization
- Refund fulfillment for one-time packs
- Broader multi-device account migration

Those are product batches, not prerequisites for the current V1 billing/security foundation.
