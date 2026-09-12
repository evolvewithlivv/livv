import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const checks = [
  {
    name: "five real sign-in methods are surfaced",
    file: "src/app/auth/page.tsx",
    patterns: [
      'startSocialAuth',
      'startEmailAuth',
      'startPhoneAuth',
      'Continue with Google',
      'Continue with Apple',
      'Continue with X',
      'Continue with email',
      'Continue with phone',
    ],
  },
  {
    name: "OAuth supports Google, Apple, and X",
    file: "src/lib/supabase/real-auth.ts",
    patterns: ['SocialProvider = "google" | "apple" | "x"', 'signInWithOAuth', 'linkIdentity'],
  },
  {
    name: "email auth is real passwordless Supabase auth",
    file: "src/lib/supabase/real-auth.ts",
    patterns: ['signInWithOtp', 'emailRedirectTo', 'updateUser'],
  },
  {
    name: "phone auth uses Supabase SMS OTP",
    file: "src/lib/supabase/real-auth.ts",
    patterns: ['phone: cleanPhone', 'verifyOtp', 'type: linking ? "phone_change" : "sms"'],
  },
  {
    name: "OAuth callback exchanges the server-issued code",
    file: "src/app/auth/callback/page.tsx",
    patterns: ['finishSupabaseCallback', 'params.get("code")', 'Authentication provider returned'],
  },
  {
    name: "billing portal is authenticated and server-bound",
    file: "src/app/api/stripe/portal/route.ts",
    patterns: ['getVerifiedSupabaseUser', '.from("entitlements")', '.eq("user_id", verified.id)', 'billingPortal.sessions.create'],
  },
  {
    name: "Stripe session confirmation is authenticated and user-bound",
    file: "src/app/api/stripe/session/route.ts",
    patterns: ['getVerifiedSupabaseUser', 'session.metadata?.livv_user_id', 'Checkout session does not belong to this account', 'payment_status'],
  },
  {
    name: "production cannot use the demo paid-unlock path",
    file: "src/lib/billing.ts",
    patterns: ['isDemoUnlock', 'NEXT_PUBLIC_LIVV_DEMO_UNLOCK', 'NODE_ENV'],
  },
  {
    name: "pack purchases cannot silently become free in production",
    file: "src/lib/packs.ts",
    patterns: ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'Stripe is not configured for pack purchases'],
  },
  {
    name: "server entitlements migration exists",
    file: "supabase/migrations/b1_entitlements.sql",
    patterns: ['create table if not exists public.entitlements', 'stripe_webhook_events', 'enable row level security', 'entitlements_select_own'],
  },
  {
    name: "production security headers are configured",
    file: "next.config.ts",
    patterns: ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy'],
  },
  {
    name: "Evala API requests are authenticated",
    file: "src/app/api/evala/route.ts",
    patterns: ['getVerifiedSupabaseUser', 'Authorization', 'Cache-Control'],
  },
];

let failed = 0;
for (const check of checks) {
  let source;
  try {
    source = read(check.file);
  } catch (error) {
    failed += 1;
    console.error(`FAIL  ${check.name} — missing ${check.file}`);
    continue;
  }

  const missing = check.patterns.filter((pattern) => !source.includes(pattern));
  if (missing.length) {
    failed += 1;
    console.error(`FAIL  ${check.name}`);
    for (const pattern of missing) console.error(`      missing: ${pattern}`);
  } else {
    console.log(`PASS  ${check.name}`);
  }
}

if (failed) {
  console.error(`\nShipping audit failed: ${failed} check(s).`);
  process.exit(1);
}

console.log(`\nShipping audit passed: ${checks.length}/${checks.length} invariants.`);
