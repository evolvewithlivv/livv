# Launch readiness audit — 2026-10-22

Scope: `evolvewithlivv/livv` (Next.js 15 App Router, Supabase, Stripe, Vercel, Capacitor). This pass read the repository, the live Supabase project `evolvewithlivv`, Vercel project `livv-app-v1` environment **names** (values were not recorded), gitleaks history, and `npm audit`. Header and motion files were not edited. No migration, RLS policy, grant, Stripe/billing path, or data-deleting change was applied.

**Verdict:** production is not clear to treat as fully launch-ready. There is no confirmed unauthenticated account takeover or open redirect. Four P1 items need an explicit approval because they sit in SQL, the deployed deletion function, or billing routes. Safe code fixes in this pull request are marked shipped.

Code commit: `d98f0159ddb9716159878bfc7055f6e169d56974`

## Findings

| ID | Severity | Area | Evidence | Fix | Status |
|---|---|---|---|---|---|
| LR-01 | P1 | Supabase grants | Live `information_schema.column_privileges`: `authenticated` may `UPDATE` `profiles.username`. Grant: `supabase/migrations/20260911235540_security_harden_profile_privileges.sql:8-15`. Cooldown lives only in `public.change_username` at `supabase/migrations/20261007112046_username_change_hardening.sql:43-52`. The app calls that RPC from `src/lib/auth.ts:38`, but PostgREST can patch the column directly. | `revoke update (username) on public.profiles from authenticated;` | needs approval |
| LR-02 | P1 | Account deletion | Deployed edge function `delete-account` (version 3, `verify_jwt` true) is active and is **not** in the repo. `src/lib/supabase/account-deletion.ts:11` calls it. Settings never calls that helper (`src/app/home/settings/page.tsx`). The function deletes `member_state`, `entitlements`, and `profiles` in parallel, then `auth.admin.deleteUser`. Live foreign keys `crews.created_by`, `crew_challenges.created_by`, and `crew_invitations.created_by` are `ON DELETE RESTRICT`. A user who created a crew can lose the profile and then fail user deletion. | See proposed function order below. Do not ship a delete button until that order is transactional. | needs approval |
| LR-03 | P1 | Embers / billing | `POST /api/embers/redeem` (`src/app/api/embers/redeem/route.ts:40-65`) sends client `orderId` and `subtotalCents` to `public.redeem_embers` (`supabase/migrations/20260929144821_ember_redeem_ledger.sql:48-90`). Nothing checks a paid order. `order_id` is globally unique. No client in this repo calls the route. | Return 410 from `POST` until a server-side paid order exists. Proposed diff below. | needs approval |
| LR-04 | P1 | Stripe | `GET /api/stripe/session` (`src/app/api/stripe/session/route.ts:17-25`) verifies the bearer token only when `isSupabaseServerConfigured()` is true. Otherwise it returns tier, customer id, and email for a `cs_` id. Production does set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. | Fail closed. Proposed diff below. | needs approval |
| LR-05 | P1 | Auth abuse | Email OTP is client-side `signInWithOtp` (`src/lib/supabase/real-auth.ts:136`). Resend cooldown is 30 seconds in the browser (`src/app/auth/auth-screen.tsx:127`). No captcha and no server route in front of Auth. | Supabase Auth captcha or a server throttle. Not added here; it needs a provider decision. | recommend |
| LR-06 | P1 | Monitoring | No Sentry, no `instrumentation` hook, no `global-error` reporter. `src/app/error.tsx` only retries. API failures use `console.error`. | Add an error reporter and alert on 5xx. | recommend |
| LR-07 | P1 | Session handoff | `www` copies `access_token` and `refresh_token` into `#livv_handoff=` (`src/lib/www-handoff-core.mjs:151` and `:212`). The fragment is stripped with `history.replaceState`. Referrer on that response is `no-referrer`. PostHog scrubs the fragment. The refresh token still enters the URL, history, and any extension that reads the location. | One canonical host, or a one-time server code. Not a small patch. | recommend |
| LR-08 | P2 | RLS | Live security advisor `auth_allow_anonymous_sign_ins` on `crews`, `crew_members`, `crew_challenges`, `crew_updates`, `crew_encouragements`. Policies are `TO authenticated`, and anonymous sessions use that role. Crew routes reject `isAnonymous`. A member row for an anonymous id could still be read. Profiles already require `is_anonymous = false` (`supabase/migrations/20260921194418_auth_policy_hardening.sql:9-31`). | Add the same `is_anonymous` predicate to those crew `SELECT` policies. | needs approval |
| LR-09 | P2 | RLS | `entitlements` and `pack_purchases` `SELECT` own row with no anonymous guard (`supabase/migrations/20260911235816_optimize_rls_auth_checks.sql:24-28`, `supabase/migrations/20260913084219_pack_purchases_server_ledger.sql:20-23`). Rows include Stripe ids. | Recreate both policies with `is_anonymous = false`. | needs approval |
| LR-10 | P2 | SECURITY DEFINER | `public.change_username` and `public.is_username_available` are `SECURITY DEFINER` in `public` with `search_path = public`, and live advisors flag them as executable by `authenticated`. That execute grant is intentional. `public.crew_accept_invitation` uses `search_path = public, pg_temp` and is `service_role` only (`supabase/migrations/20261014171704_crew_foundation.sql:145` and `:188-189`). | Lock `search_path` to empty after confirming every identifier is schema-qualified. Keep execute grants as they are. | needs approval |
| LR-11 | P2 | Rate limits | New limits are process memory (`src/lib/request-guards.ts:19`). They do not hold across Vercel isolates. Database caps remain for crew posts (12/hour) and ember awards (20/day). | Keep the code limits. Add a shared store before launch traffic. | shipped in `d98f0159ddb9716159878bfc7055f6e169d56974` |
| LR-12 | P2 | CSP | `next.config.ts` still has `script-src 'unsafe-inline' 'unsafe-eval'` and `img-src https:`. `frame-ancestors 'none'` and `X-Frame-Options: DENY` are present. | Nonce CSP later. Removing `unsafe-eval` now would risk breaking Next and PostHog. | recommend |
| LR-13 | P2 | Export | `src/lib/supabase/cloud-state.ts:3` copies every `livv-*` localStorage key except a short denylist into `member_state`, including `livv-health-v2`. `src/lib/data-portability.ts` exports a smaller allowlist and does not include the auth user or Stripe rows. | Copy now says so. A full account export is still email-only. | copy shipped in `d98f0159ddb9716159878bfc7055f6e169d56974`; full export recommend |
| LR-14 | P2 | Migrations | `create schema private` exists only in `supabase/migration-archive/20260919000100_launch_hardening.sql:16`. Active SQL creates `private.ember_awards`. `20260921194418_auth_policy_hardening.sql:34` alters `private.evala_rate_limits`, which a fresh replay may not have. Live production already has `private.ember_awards` and RLS on. | Forward migration below. Do not rewrite applied history. | needs approval |
| LR-15 | P2 | Env split | Code reads `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. On `livv-app-v1` those three names are production-target only. Preview/development also have `livv_SUPABASE_*` names this code does not read. | Point preview at the names in `.env.example`, or teach the code one prefix. | recommend |
| LR-16 | P2 | Resend | No Resend import in `src/`. Vercel has key name `RESEND_API_KEY` on development, preview, and production. Privacy copy now says the repo does not call Resend and that the key may still be used outside the repo. Supabase SMTP was not inspected. | Confirm whether Auth SMTP is Resend. | copy shipped in `d98f0159ddb9716159878bfc7055f6e169d56974`; SMTP unverified |
| LR-17 | P2 | Onboarding | `/home` checks auth only (`src/app/home/layout.tsx:18-27`). It does not read `profiles.onboarding_completed_at`. Refresh on `/onboarding` restores the draft but resets the step to `"why"` (`src/app/onboarding/page.tsx:46-82`). If the browser client is not configured, the page used to dead-end; it now links back to `/auth` (`src/app/onboarding/page.tsx:118`). | Do not force an onboarding redirect until existing profiles are known complete. | link shipped in `d98f0159ddb9716159878bfc7055f6e169d56974`; gate recommend |
| LR-18 | P3 | Service role | `getSupabaseAdmin` is imported only from route handlers and `src/lib/stripe-entitlements.ts`. `src/lib/supabase/admin.ts:6` now imports `server-only`. The key name is not `NEXT_PUBLIC_`. | Shipped. | shipped in `d98f0159ddb9716159878bfc7055f6e169d56974` |
| LR-19 | P3 | Headers | App routes already sent HSTS, `frame-ancestors 'none'`, referrer, and a permissions policy. Middleware HTML, script, and redirect responses did not. They now do (`src/middleware.ts:7-18`). Permissions policy also disables `interest-cohort`, `browsing-topics`, and `usb`. | Shipped. | shipped in `d98f0159ddb9716159878bfc7055f6e169d56974` |
| LR-20 | P3 | Input validation | Crew ids used `/^[0-9a-f-]{36}$/i`, which accepts 36 hyphens. Routes now use `isUuid` (`src/lib/request-guards.ts:15`). `/api/icon` treats a non-numeric `s` as 32 (`src/app/api/icon/route.ts`). JSON bodies on the guarded POSTs are size-capped. | Shipped. | shipped in `d98f0159ddb9716159878bfc7055f6e169d56974` |
| LR-21 | P3 | Health endpoint | `GET /api/health` returned a git SHA prefix. It now returns `{ ok, service }` only. | Shipped. | shipped in `d98f0159ddb9716159878bfc7055f6e169d56974` |
| LR-22 | P3 | Analytics key | `src/lib/funnel.ts:17` had a hardcoded public PostHog project key as the fallback. It now initializes only when `NEXT_PUBLIC_POSTHOG_KEY` is set (`src/lib/funnel.ts:55`). That name is set on production. | Shipped. The old literal remains in git history. Gitleaks did not flag it. | shipped in `d98f0159ddb9716159878bfc7055f6e169d56974` |
| LR-23 | P3 | Dependencies | `next` 15.5.21 was inside the unauthenticated RSC/image advisories fixed before 15.5.24. This PR pins `next` and `eslint-config-next` to 15.5.28 and direct `postcss` to 8.5.23. | Remaining advisories need majors. See below. | shipped in `d98f0159ddb9716159878bfc7055f6e169d56974` |
| LR-24 | P3 | A11y | Auth email input had `outline-none` without a focus-visible ring (`src/app/auth/auth-screen.tsx`). Onboarding why/name fields had placeholders only. Goal and interest toggles had no `aria-pressed`. Error and callback muted text was `text-white/40`. | Labels, `aria-pressed`, focus rings, and stronger muted text shipped. Header and motion files were not touched. Contrast was not measured with a tool. | shipped in `d98f0159ddb9716159878bfc7055f6e169d56974` |
| LR-25 | P3 | Support | Terms contact was “the current contact information published by LIVV”. DMCA remains `evolvewithlivv@gmail.com` (`src/app/legal/dmca/page.tsx:21`). | Terms and Settings now link `privacy@evolvewithlivv.com`. DMCA address was left alone. | shipped in `d98f0159ddb9716159878bfc7055f6e169d56974` |
| LR-26 | P3 | Auth passwords | Live advisor: leaked-password protection is off. The product path is email OTP, not passwords. Whether the password provider is enabled in the dashboard was not checked. | Turn the provider off, or enable leaked-password protection. | recommend |
| LR-27 | P3 | Deletion CORS | `delete-account` sends `Access-Control-Allow-Origin: *`. The caller still needs the user JWT. | Restrict the origin to `https://evolvewithlivv.com`. | recommend |
| LR-28 | P3 | Storage | Repo has no storage SQL. Live `storage.buckets` returned no rows. | None until a bucket is created. | recommend |
| LR-29 | P3 | Migration hygiene | `profiles` goal `GRANT` is duplicated in `20261015181517` and `20261015181526`. | Leave history. Do not add a third copy. | recommend |
| LR-30 | P3 | Stripe checkout | `POST /api/stripe/checkout` returns 410 (`src/app/api/stripe/checkout/route.ts:6-10`). Webhook uses `constructEvent` (`src/app/api/stripe/webhook/route.ts:44-48`) and claims `stripe_webhook_events` before work (`src/lib/stripe-entitlements.ts`). | No code change. `scripts/shipping-audit.mjs` still looks for the old string `BILLING_DISABLED_V1`. | recommend (test drift) |

No `"use server"` modules exist. Server auth on API routes is `supabase.auth.getUser(token)` (`src/lib/supabase/server-auth.ts:54`), not `getSession`.

## What is in good shape

- Every application table in `public` and `private` has RLS on, both in migrations and on the live database. `anon` has no column privileges on `profiles`.
- Tables with RLS and no policies (`stripe_webhook_events`, `crew_invitations`, `crew_audit_events`, `crew_challenge_members`, `crew_completions`, `private.ember_awards`, `private.ember_redemptions`) are denied to the client on purpose. Service role bypasses RLS.
- `grant_embers` and `redeem_embers` are `SECURITY DEFINER` with `search_path = ''` and `EXECUTE` only for `service_role`.
- Privileged profile columns `tier` and `embers` are not in the client `UPDATE` grant. `private.protect_membership_fields` blocks client changes when `auth.uid()` is present.
- Crew handlers bind `user_id` to the verified bearer user and check membership before reads and writes.
- Checkout for new paid tiers is retired with 410. Portal and webhook paths still exist for an existing Stripe relationship.
- Redirects used by auth and onboarding append the current query string to fixed paths. `src` is sanitized. No `next=` open redirect was found.
- Sessions are in `localStorage` (`livv-supabase-auth`), not an httpOnly cookie. That is an XSS tradeoff, called out under LR-07 and LR-12, not a separate bug.
- PostHog autocapture, session recording, and surveys are off (`src/lib/funnel.ts`).
- Gitleaks 8.28.0 scanned 1833 commits and reported no leaks. `.env` is gitignored. `.env.example` has placeholders only.

## Proposed changes for approval

### LR-01 username cooldown

```sql
revoke update (username) on public.profiles from authenticated;
```

The signed-in app already changes usernames through `change_username`. After this revoke, a direct `PATCH /rest/v1/profiles` can no longer skip the 30-day cooldown.

### LR-08 and LR-09 anonymous reads

```sql
drop policy if exists "entitlements_select_own" on public.entitlements;
create policy "entitlements_select_own" on public.entitlements
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
  );

drop policy if exists "pack_purchases_select_own" on public.pack_purchases;
create policy "pack_purchases_select_own" on public.pack_purchases
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
  );
```

Crew `SELECT` policies need the same `is_anonymous` predicate. Apply that in a new migration after reading each current policy from `pg_policies`, so the membership predicate is preserved.

### LR-14 private schema for a fresh replay

```sql
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;
```

Put this in a **new** migration. Do not edit `20260921194418` in place. Guard or remove the `evala_rate_limits` statements in a forward migration if a clean `db reset` is required.

### LR-10 search_path

```sql
alter function public.change_username(text) set search_path = '';
alter function public.is_username_available(text) set search_path = '';
alter function public.crew_accept_invitation(text, uuid, text) set search_path = '';
```

Run the username and invite functions in a transaction that rolls back before applying this on production. Both function bodies already schema-qualify tables, but this was not executed here.

### LR-02 deletion order

Do not wire Settings to `deleteSupabaseAccount()` yet. The deployed function should, in one transaction:

1. Refuse anonymous users (it already does).
2. For `crews`, `crew_challenges`, and `crew_invitations` whose `created_by` is the caller, either delete those rows when the caller is the sole member or reassign `created_by` before `deleteUser`. `ON DELETE RESTRICT` otherwise aborts `deleteUser`.
3. Delete `member_state`, `entitlements`, and `profiles` only in that same transaction.
4. Call `auth.admin.deleteUser` only after the restrict rows are gone.
5. Roll back the row deletes if `deleteUser` fails.

`crew_audit_events.actor_user_id` and `subject_user_id` are `ON DELETE SET NULL`, so audit rows survive without the user id. Say that in the privacy copy if deletion ships.

Also set `Access-Control-Allow-Origin` to the production origin instead of `*`.

### LR-03 redeem

```diff
--- a/src/app/api/embers/redeem/route.ts
+++ b/src/app/api/embers/redeem/route.ts
@@
-export async function POST(req: NextRequest) {
-  // current handler trusts orderId and subtotalCents
-}
+export async function POST() {
+  return NextResponse.json(
+    { error: "Ember redemption is not available." },
+    { status: 410, headers: { "Cache-Control": "no-store" } },
+  );
+}
```

Keep `GET` for the signed-in balance. Restore `POST` only when it loads a paid order that this server created and checks the subtotal against that order.

### LR-04 session confirm

```diff
--- a/src/app/api/stripe/session/route.ts
+++ b/src/app/api/stripe/session/route.ts
@@
-    let verifiedUserId:string|null=null;
-    if(isSupabaseServerConfigured()){
-      const verified=await getVerifiedSupabaseUser(req);
-      if(!verified)return json({error:"Authenticated session required"},{status:401});
-      if(verified.isAnonymous)return json({error:"Verify your email before confirming payment"},{status:403});
-      verifiedUserId=verified.id;
-    }
+    const verified=await getVerifiedSupabaseUser(req);
+    if(!verified)return json({error:"Authenticated session required"},{status:401});
+    if(verified.isAnonymous)return json({error:"Verify your email before confirming payment"},{status:403});
+    const verifiedUserId=verified.id;
```

The later branch that returns checkout details when `verifiedUserId` is null must stay unreachable.

## Dependency audit

Before: 1 critical, 9 high, 2 moderate (`next` 15.5.21).

After this PR’s pins: 0 critical, 9 high, 3 moderate.

| Package | Remaining | Why it was not bumped |
|---|---|---|
| `next` 15.5.28 | Moderate cache-poisoning advisories whose fix is `next` 16.4.2 | Major upgrade. The critical advisories closed by 15.5.24 are covered. |
| `sharp` 0.34.5 (via Next) | High libvips, libheif, and librsvg | Next 15.5.28 pins 0.34.5. An override was not applied. |
| `postcss` inside Next | 8.4.31 still nested | Direct dependency is 8.5.23. The nested copy moves with a Next major. |
| `tailwindcss` 3.4.19 and eslint’s `fast-glob` / `braces` / `micromatch` | High dev-time ReDoS | `npm audit` wants Tailwind 4 or an eslint-config downgrade to 14. Both are breaking. |

## Tests

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Pass |
| `node --experimental-strip-types scripts/request-guards.test.mjs` | Pass |
| `node scripts/www-handoff.test.mjs` | Pass |
| `node scripts/funnel-events.test.mjs` | Pass |
| `node scripts/landing-entry.test.mjs` | Pass |
| `node scripts/sw-navigation.test.mjs` | Fail, pre-existing. `public/sw.js` cache name is `livv-shell-v4`; the test requires `livv-shell-v3`. |
| `node scripts/shipping-audit.mjs` | 4 fails, pre-existing and not caused by this diff: root page redirects to `/auth` while the test expects landing copy; service worker expects `livv-shell-v3`; checkout route no longer contains the string `BILLING_DISABLED_V1`. Security-header and PostHog checks passed. |
| `GET /api/health` on local dev | `{"ok":true,"service":"livv"}` |
| `GET /api/icon?s=foo` | 200 |
| 25 `POST /api/landing-event` | 20 times 204, then 429 |
| `GET /legal/privacy` headers | HSTS, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, expanded Permissions-Policy |
| Browser | Privacy providers, terms contact, auth email label and focus ring, onboarding unavailable state. Screenshots under the review artifacts. Signed-in Settings was not opened. |

## Not verified

- This branch was not deployed to Vercel production.
- `next build` was not run as a production build.
- OTP delivery, captcha, and Supabase Auth rate limits were not called against the live project.
- Stripe webhook replay and portal session creation were not executed.
- Capacitor iOS and Android shells were not opened.
- Supabase Auth SMTP (whether it is Resend) was not opened in the dashboard.
- Whether the password provider is enabled was not opened in the dashboard.
- Hidden production env vars exist (`hiddenProductionEnvCount` was non-zero). Their names were not listed.
- TruffleHog was not installed; it was not run. Gitleaks was.
- WCAG contrast was judged from the classes and a screenshot, not from a contrast meter.
- No user rows, tokens, or secret values were printed. Env findings are key names and targets only.
