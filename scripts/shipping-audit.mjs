import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const checks = [
  { name: "only email and phone sign-in methods are surfaced", file: "src/app/auth/page.tsx", patterns: ["startEmailAuth", "startPhoneAuth", "Continue with email", "Continue with phone", "6-digit code", "Verify & enter LIVV"], absentPatterns: ["startSocialAuth", "Continue with Google", "Continue with Apple", "Continue with X"] },
  { name: "social OAuth authentication paths are absent", file: "src/lib/supabase/real-auth.ts", patterns: ["startEmailAuth", "startPhoneAuth", "verifyEmailAuth", "verifyPhoneAuth"], absentPatterns: ["signInWithOAuth", "linkIdentity", "SocialProvider", 'provider === "google"', 'provider === "apple"', 'provider === "x"'] },
  { name: "email auth is real passwordless Supabase OTP auth", file: "src/lib/supabase/real-auth.ts", patterns: ["signInWithOtp", "verifyEmailAuth", 'type: "email"'], absentPatterns: ["emailRedirectTo"] },
  { name: "phone auth uses Supabase SMS OTP", file: "src/lib/supabase/real-auth.ts", patterns: ["phone: cleanPhone", "verifyOtp", 'type: "sms"'], absentPatterns: ["phone_change"] },
  { name: "opening flow requires authentication before onboarding", file: "src/app/page.tsx", patterns: ['router.push("/auth")'], absentPatterns: ['router.push("/onboarding")'] },
  { name: "email callback exchanges the server-issued code", file: "src/app/auth/callback/page.tsx", patterns: ["finishSupabaseCallback", 'params.get("code")', "Authentication could not be completed"], absentPatterns: ["Authentication provider returned"] },
  { name: "billing portal is authenticated and server-bound", file: "src/app/api/stripe/portal/route.ts", patterns: ["getVerifiedSupabaseUser", '.from("entitlements")', '.eq("user_id", verified.id)', "billingPortal.sessions.create"] },
  { name: "Stripe session confirmation is authenticated and user-bound", file: "src/app/api/stripe/session/route.ts", patterns: ["getVerifiedSupabaseUser", "session.metadata?.livv_user_id", "Checkout session does not belong to this account", "payment_status"] },
  { name: "production cannot use the demo paid-unlock path", file: "src/lib/billing.ts", patterns: ["isDemoUnlock", "NEXT_PUBLIC_LIVV_DEMO_UNLOCK", "NODE_ENV"] },
  { name: "production pack checkout cannot silently create free inventory", file: "src/lib/pack-shop.ts", patterns: ["isStripeConfigured", "process.env.NODE_ENV === \"production\"", "Pack billing is temporarily unavailable"] },
  { name: "server entitlements migration exists", file: "supabase/migrations/20260911174348_b1_entitlements.sql", patterns: ["create table if not exists public.entitlements", "stripe_webhook_events", "enable row level security", "entitlements_select_own"] },
  { name: "production security headers are configured", file: "next.config.ts", patterns: ["Content-Security-Policy", "X-Content-Type-Options", "Referrer-Policy"] },
  { name: "Evala API requests are authenticated", file: "src/app/api/evala/route.ts", patterns: ["getVerifiedSupabaseUser", "Authorization", "Cache-Control"] },
];

let failed = 0;
for (const check of checks) {
  let source;
  try { source = read(check.file); } catch { failed += 1; console.error(`FAIL  ${check.name} — missing ${check.file}`); continue; }
  const missing = (check.patterns || []).filter((pattern) => !source.includes(pattern));
  const forbidden = (check.absentPatterns || []).filter((pattern) => source.includes(pattern));
  if (missing.length || forbidden.length) {
    failed += 1; console.error(`FAIL  ${check.name}`);
    for (const pattern of missing) console.error(`      missing: ${pattern}`);
    for (const pattern of forbidden) console.error(`      forbidden: ${pattern}`);
  } else console.log(`PASS  ${check.name}`);
}
if (failed) { console.error(`\nShipping audit failed: ${failed} check(s).`); process.exit(1); }
console.log(`\nShipping audit passed: ${checks.length}/${checks.length} invariants.`);
