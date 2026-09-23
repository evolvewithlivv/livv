import fs from "node:fs";
import path from "node:path";
const root=process.cwd();const read=(file)=>fs.readFileSync(path.join(root,file),"utf8");
const checks=[
{name:"email-only authentication is surfaced",file:"src/app/auth/page.tsx",patterns:["startEmailAuth","verifyEmailAuth","Sign in with email","Create account with email","8-digit code","Verify & enter LIVV","Change email"],absentPatterns:["startPhoneAuth","verifyPhoneAuth","Continue with phone","Continue with Google","Continue with Apple","Continue with X","Continue with Twitter","Continue with Snapchat"]},
{name:"real Supabase authentication is email-only OTP",file:"src/lib/supabase/real-auth.ts",patterns:["signInWithOtp","verifyEmailAuth",'type: "email"',"shouldCreateUser: true","materializeSupabaseUser"],absentPatterns:["signInWithOAuth","linkIdentity","type: \"sms\"","startPhoneAuth","verifyPhoneAuth","normalizePhoneE164","phone: cleanPhone","provider === \"phone\""]},
{name:"local auth provider model is email-only",file:"src/lib/auth.ts",patterns:['export type AuthProvider="email"','provider:AuthProvider'],absentPatterns:["AuthProvider = \"phone\"","signInWithPhone","phone?: string","provider === \"phone\"","phone number required"]},
{name:"member routes require a real LIVV account",file:"src/components/auth/require-auth.tsx",patterns:["getAuthenticatedUser","user.is_anonymous","router.replace(\"/auth\")"],absentPatterns:["resolveHomeAccess","isSignedInLocal"]},
{name:"returning users skip onboarding after email verification",file:"src/app/auth/page.tsx",patterns:["isOnboardingComplete","isCloudOnboardingComplete","window.location.replace(\"/home\")","window.location.replace(\"/onboarding\")"]},
{name:"opening flow requires authentication before onboarding",file:"src/app/page.tsx",patterns:['redirect("/auth")'],absentPatterns:['redirect("/onboarding")','router.push("/onboarding")']},
{name:"email callback exchanges the server-issued code",file:"src/app/auth/callback/page.tsx",patterns:["finishSupabaseCallback",'params.get("code")',"Authentication could not be completed"]},
{name:"onboarding completion verifies a non-anonymous Supabase user",file:"src/lib/auth.ts",patterns:["client.auth.getUser()","data.user.is_anonymous","Please verify your email before entering LIVV"],absentPatterns:["await ensureAnonymousSession();"]},
{name:"billing portal is authenticated and server-bound",file:"src/app/api/stripe/portal/route.ts",patterns:["getVerifiedSupabaseUser",'.from("entitlements")','.eq("user_id", verifiedUserId)',"billingPortal.sessions.create"]},
{name:"Stripe session confirmation is authenticated and user-bound",file:"src/app/api/stripe/session/route.ts",patterns:["getVerifiedSupabaseUser","checkout.sessions.retrieve","client_reference_id"]},
{name:"production cannot use the demo paid-unlock path",file:"src/lib/billing.ts",patterns:["NEXT_PUBLIC_LIVV_DEMO_UNLOCK","process.env.NODE_ENV === \"production\""]},
{name:"server entitlements migration exists",file:"supabase/migrations",patterns:[]},
{name:"production security headers are configured",file:"next.config.ts",patterns:["Content-Security-Policy","X-Content-Type-Options","Referrer-Policy"]},
{name:"cross-device member state is cloud-backed",file:"src/lib/supabase/cloud-state.ts",patterns:["member_state","bootstrapCloudMemberState","mergeOnlyChanged","notifyStateHydrated"]},
{name:"cloud sync is serialized to prevent stale concurrent writes",file:"src/lib/supabase/cloud-state.ts",patterns:["syncInFlight","return syncInFlight"]},
{name:"cloud sync stops during sign-out",file:"src/lib/supabase/cloud-state.ts",patterns:["SIGNING_OUT_KEY","canSync","clearLocalCloudSyncedState"]},
{name:"sign-out clears device member state without deleting cloud data",file:"src/lib/auth.ts",patterns:["clearLocalCloudSyncedState","client.auth.signOut"]},
{name:"public health endpoint is no-store and non-indexable",file:"src/app/api/health/route.ts",patterns:["force-dynamic","Cache-Control","no-store","X-Robots-Tag","noindex"]},
{name:"PWA manifest is standalone and scoped",file:"src/app/manifest.ts",patterns:["display:\"standalone\"","scope:\"/\"","prefer_related_applications:false","192x192","512x512"]},
{name:"PWA service worker avoids authenticated and API caching",file:"public/sw.js",patterns:["serviceWorker","CACHE","/auth","/manifest.webmanifest","/api/","/home"]},
{name:"root registers the service worker",file:"src/app/layout.tsx",patterns:["serviceWorker","navigator.serviceWorker.register","/sw.js"]},
{name:"private routes are excluded from robots",file:"src/app/robots.ts",patterns:["/home","/auth","/onboarding","/api","sitemap.xml"]},
];
const normalized=(source)=>source.replace(/\s+/g," ").replace(/(['\"])([^'\"]+)\1/g,"$2");
let failed=0;for(const check of checks){let source;try{source=read(check.file);}catch{failed++;console.error(`FAIL  ${check.name} — missing ${check.file}`);continue;}const normalizedSource=normalized(source);const missing=(check.patterns||[]).filter(p=>!normalizedSource.includes(normalized(p)));const forbidden=(check.absentPatterns||[]).filter(p=>normalizedSource.includes(normalized(p)));if(missing.length||forbidden.length){failed++;console.error(`FAIL  ${check.name}`);for(const p of missing)console.error(`      missing: ${p}`);for(const p of forbidden)console.error(`      forbidden: ${p}`);}else console.log(`PASS  ${check.name}`);}if(failed){console.error(`\nShipping audit failed: ${failed} check(s).`);process.exit(1);}console.log(`\nShipping audit passed: ${checks.length}/${checks.length} invariants.`);
// Keep this audit aligned with the authoritative Supabase session boundary.
