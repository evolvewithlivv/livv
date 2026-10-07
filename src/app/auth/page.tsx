"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser, startEmailAuth, verifyEmailAuth } from "@/lib/supabase/real-auth";
import { isOnboardingComplete, markOnboardingComplete } from "@/lib/onboarding";
import { isCloudOnboardingComplete, markCloudOnboardingComplete } from "@/lib/supabase/onboarding-state";

const LOGO = "/livv-logo.png";
const RESEND_SECONDS = 30;
const AGE_KEY = "livv-age-gate-v1";
type AgeBand = "under13" | "13to17" | "18plus";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(AGE_KEY);
      if (saved === "13to17" || saved === "18plus") {
        setAgeBand(saved);
        setAgeConfirmed(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  // Cold start / PWA reopen: if a real email session already exists, skip the form.
  useEffect(() => {
    let cancelled = false;
    const resume = async () => {
      try {
        const user = await getAuthenticatedUser();
        if (cancelled || !user || user.is_anonymous || !user.email) return;
        if (isOnboardingComplete()) {
          window.location.replace("/home");
          return;
        }
        let cloudComplete = false;
        try {
          cloudComplete = await isCloudOnboardingComplete();
        } catch {
          cloudComplete = false;
        }
        if (cancelled) return;
        if (cloudComplete) {
          markOnboardingComplete();
          window.location.replace("/home");
          return;
        }
        window.location.replace("/onboarding");
      } catch {
        /* stay on auth form */
      }
    };
    void resume();
    return () => {
      cancelled = true;
    };
  }, []);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    setNotice("");
    try { await fn(); }
    catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Try again."); }
    finally { setBusy(false); }
  };

  const chooseAge = (value: AgeBand) => {
    setAgeBand(value);
    setAgeConfirmed(false);
    setError("");
    setNotice(value === "under13" ? "LIVV is for people 13 and older. You cannot create an account yet." : "");
  };

  const confirmAge = () => {
    if (!ageBand || ageBand === "under13") return;
    try { window.localStorage.setItem(AGE_KEY, ageBand); } catch {}
    setAgeConfirmed(true);
    setNotice("Age eligibility confirmed.");
  };

  const sendEmail = (resend = false) => void run(async () => {
    if (resend && resendIn > 0) return;
    if (mode === "signup" && (!ageBand || ageBand === "under13" || !ageConfirmed)) {
      throw new Error("Confirm that you are 13 or older before creating an account.");
    }
    await startEmailAuth(email, mode === "signup", ageBand === "13to17" || ageBand === "18plus" ? ageBand : undefined);
    setPending(true);
    setOtp("");
    setResendIn(RESEND_SECONDS);
    setNotice(mode === "signin" ? "Welcome back. Enter the 8-digit code from your email." : "Welcome to LIVV. Enter the 8-digit code from your email to get started.");
  });

  const verifyEmail = () => void run(async () => {
    await verifyEmailAuth(email, otp);
    const localComplete = isOnboardingComplete();
    if (localComplete) {
      try { await markCloudOnboardingComplete(""); } catch { /* local gate already satisfied */ }
      window.location.replace("/home");
      return;
    }
    let cloudComplete = false;
    try { cloudComplete = await isCloudOnboardingComplete(); } catch { cloudComplete = false; }
    if (cloudComplete) {
      markOnboardingComplete();
      window.location.replace("/home");
      return;
    }
    window.location.replace("/onboarding");
  });

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#050505] text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(var(--livv-accent)/0.12),transparent_55%)]" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-9 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="LIVV" className="h-14 w-14 object-contain" />
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight">LIVV</h1>
          <p className="mt-2 text-center text-[13px] text-white/40">{mode === "signin" ? "Sign in to continue your journey." : "Create your account and start evolving."}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-white/[0.04] p-1">
              <button type="button" onClick={() => { setMode("signin"); setError(""); setNotice(""); }} className={`rounded-xl px-3 py-2.5 text-[12px] font-medium transition ${mode === "signin" ? "bg-white text-black" : "text-white/45 hover:text-white/70"}`}>Sign in</button>
              <button type="button" onClick={() => { setMode("signup"); setError(""); setNotice(""); }} className={`rounded-xl px-3 py-2.5 text-[12px] font-medium transition ${mode === "signup" ? "bg-white text-black" : "text-white/45 hover:text-white/70"}`}>Create account</button>
          </div>

          {!pending ? (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); sendEmail(false); }}>
              {mode === "signup" ? (
                <section className="space-y-3" aria-labelledby="age-title">
                  <div>
                    <p id="age-title" className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">Age</p>
                    <p className="mt-1.5 text-[12px] leading-5 text-white/35">LIVV accounts are for people 13 and older.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Age range">
                    {([
                      ["under13", "Under 13"],
                      ["13to17", "13-17"],
                      ["18plus", "18+"],
                    ] as const).map(([value, label]) => (
                      <button key={value} type="button" role="radio" aria-checked={ageBand === value} onClick={() => chooseAge(value)}
                        className={`rounded-2xl border px-2 py-3 text-[12px] transition ${ageBand === value ? "border-white/40 bg-white text-black" : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {ageBand === "under13" ? <p className="text-[12px] text-red-400">You must be at least 13 to create an account.</p> : null}
                  {ageBand && ageBand !== "under13" ? (
                    <label className="flex items-start gap-3 text-[11px] leading-5 text-white/45">
                      <input type="checkbox" checked={ageConfirmed} onChange={(e) => { setAgeConfirmed(e.target.checked); if (e.target.checked) confirmAge(); }} className="mt-1 accent-[rgb(var(--livv-accent))]" />
                      <span>I confirm that I am 13 or older and agree to the <a className="text-white/70 underline" href="/legal/terms">Terms</a> and <a className="text-white/70 underline" href="/legal/privacy">Privacy Policy</a>.</span>
                    </label>
                  ) : null}
                </section>
              ) : null}
              <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" placeholder="you@example.com" />
              <Button className="w-full" disabled={busy || !email.includes("@") || (mode === "signup" && (!ageBand || ageBand === "under13" || !ageConfirmed))} type="submit">
                {busy ? "Sending…" : mode === "signin" ? "Sign in with email" : "Create account with email"}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); verifyEmail(); }}>
              <Field label="8-digit code" value={otp} onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" autoComplete="one-time-code" placeholder="00000000" />
              <p className="text-[12px] leading-5 text-white/35">Enter the code sent to <span className="text-white/60">{email.trim().toLowerCase()}</span>.</p>
              <Button className="w-full" disabled={busy || otp.length !== 8} type="submit">
                {busy ? "Verifying…" : "Continue"}
              </Button>
              <div className="flex items-center justify-between gap-3 pt-1">
                <button type="button" disabled={busy} onClick={() => { setPending(false); setOtp(""); setError(""); setNotice(""); setResendIn(0); }} className="text-[12px] text-white/35 disabled:opacity-30">Change email</button>
                <button type="button" disabled={busy || resendIn > 0} onClick={() => sendEmail(true)} className="text-[12px] text-white/35 disabled:opacity-30">
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}

          {error ? <p className="mt-4 text-center text-[13px] text-red-400" role="alert">{error}</p> : null}
          {notice && !error ? <p className="mt-4 text-center text-[13px] text-white/50" role="status">{notice}</p> : null}
        </div>

        <p className="mt-8 text-center text-[11px] text-white/25">
          <a href="/legal/privacy" className="underline-offset-2 hover:underline">Privacy</a>
          {" · "}
          <a href="/legal/terms" className="underline-offset-2 hover:underline">Terms</a>
          {" · "}
          <a href="/legal/dmca" className="underline-offset-2 hover:underline">Copyright</a>
        </p>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete, inputMode, placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string; inputMode?: "numeric" | "tel" | "email" | "text"; placeholder?: string; }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-white/25 focus:border-white/25"
      />
    </label>
  );
}
