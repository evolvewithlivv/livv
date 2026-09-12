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
- Supabase anonymous identity foundation
- Five real sign-in methods: Google, Apple, X, email, and phone/SMS
- OAuth callback handling with account-safe identity materialization
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

## Authentication

LIVV uses Supabase Auth for real account creation and sign-in. The production entry screen exposes exactly five methods:

1. Continue with Google
2. Continue with Apple
3. Continue with X
4. Continue with email
5. Continue with phone

Email uses passwordless magic-link authentication. Phone uses SMS OTP verification. Google, Apple, and X use Supabase OAuth. Anonymous device identities are upgraded in place when a provider supports identity linking, preserving the same Supabase `auth.users.id` used by billing and entitlements.

Provider credentials and redirect URLs are configured in the Supabase project; the application never treats a provider button as a fake/local-only sign-in.

## Billing architecture

The browser is still responsible for local UX state, but paid subscription authority is backed by `public.entitlements` in Supabase.

Stripe webhook events are signature-verified and recorded in `public.stripe_webhook_events` only after successful handling. Client access uses the server entitlement when available and falls back to the local entitlement cache when the network is unavailable.

The Stripe Customer Portal and Checkout session confirmation require the authenticated Supabase user and do not trust a client-supplied Stripe customer id as ownership proof.

## Supabase

Migration files live in `supabase/migrations/` and are applied in the LIVV Supabase project. The filenames below intentionally match the live Supabase migration history.

Current migration families include:

- `20260911040855_a3_1_identity_profiles.sql`
- `20260911174348_b1_entitlements.sql`
- `20260911235509_security_harden_function_privileges.sql`
- `20260911235540_security_harden_profile_privileges.sql`
- `20260911235816_optimize_rls_auth_checks.sql`
- `20260912001121_harden_table_privileges.sql`
- `20260912001140_harden_profile_select_privilege.sql`

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

## Verification

```bash
npm run typecheck
npm run shipping:audit
npm run build
```

`shipping:audit` is a dependency-free static guard for critical production invariants across authentication, billing ownership, server entitlements, pack safety, security headers, and Evala authentication. It runs in GitHub CI for Node 20 and Node 22 so future changes cannot silently remove these protections.

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
7. The five authentication methods have each been smoke-tested in the production Supabase configuration.

## Explicitly deferred

- Server-side pack inventory/ledger
- Full cloud progress synchronization
- Refund fulfillment for one-time packs
- Broader multi-device account migration

Those are product batches, not prerequisites for the current V1 billing/security foundation.
