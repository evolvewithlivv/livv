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
- **Capacitor** native shell (iOS / Android) for App Store & Google Play

## Current product

- Opening experience + onboarding
- Device-local UX cache backed by durable cloud member state
- Supabase anonymous identity foundation
- Email-only passwordless authentication with 8-digit OTP verification
- Secure email confirmation callback handling
- Returning-account profile hydration across browsers/devices
- Cross-device synchronization for member-owned LIVV local state
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
- Native App Store / Play Store packaging via Capacitor live-server shell

## Authentication

LIVV V1 intentionally keeps authentication simple: **email only**.

Members can:

1. Sign up with an email address.
2. Sign in with an email address.
3. Receive an 8-digit one-time verification code by email.
4. Verify the code inside LIVV.
5. Return later from another browser or device and recover the same cloud-backed account and member state.
6. Change their email through the verified email-authentication flow.

LIVV does not use phone/SMS authentication or Apple, Google, X/Twitter, Snapchat, or other social/OAuth identity providers for sign-in or sign-up. Social platforms may be sharing destinations for future LIVV share cards, not identity providers.

## Member data architecture

Supabase Auth is the durable identity layer. `public.profiles` stores the authenticated member's profile and onboarding completion state. `public.member_state` stores member-owned application state that must survive browser/device loss.

The browser still maintains local state for fast UX and offline behavior, but authenticated member state is synchronized to `public.member_state` and hydrated again after verified login. Anonymous Supabase sessions are explicitly excluded from member-state storage by RLS.

## Billing architecture

The browser is still responsible for local UX state, but paid subscription authority is backed by `public.entitlements` in Supabase.

Stripe webhook events are signature-verified and recorded in `public.stripe_webhook_events` only after successful handling. Client access uses the server entitlement when available and falls back to the local entitlement cache when the network is unavailable.

The Stripe Customer Portal and Checkout session confirmation require the authenticated Supabase user and do not trust a client-supplied Stripe customer id as ownership proof.

## Native App Store path

LIVV ships as a **Capacitor live-server shell**. The native iOS/Android containers load the production site (`https://evolvewithlivv.com`). This preserves every server feature (Auth OTP, Stripe ownership, entitlements, Evala, API routes) while giving a true App Store binary.

See **[docs/APP_STORE.md](docs/APP_STORE.md)** for the full checklist, Xcode/Android Studio steps, and App Store Connect requirements.

Quick start after cloning:

```bash
npm install
npx cap add ios      # once
npx cap add android  # once
npx cap sync
npm run cap:ios      # or cap:android
```

## Supabase

Migration files live in `supabase/migrations/` and are applied in the LIVV Supabase project. Current migration families include the identity/profile, billing/security, onboarding persistence, and member-state cloud-sync migrations.

Client access is protected by RLS. Server-owned billing and webhook tables have no client write path. Billing/webhook table privileges are also explicitly revoked from `anon` and unnecessary client operations are removed from profiles. Member state is restricted to permanent authenticated users rather than anonymous sessions.

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
7. Email OTP authentication has been smoke-tested in the production Supabase configuration.
8. Cross-device account recovery has been smoke-tested with a clean browser profile.

## Explicitly deferred

- Server-side pack inventory/ledger
- Refund fulfillment for one-time packs

These are product batches, not prerequisites for the current V1 account, billing, and cloud-state foundation.
