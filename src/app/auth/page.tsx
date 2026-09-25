"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { startEmailAuth, verifyEmailAuth } from "@/lib/supabase/real-auth";
import { isOnboardingComplete, markOnboardingComplete } from "@/lib/onboarding";
import { isCloudOnboardingComplete, markCloudOnboardingComplete } from "@/lib/supabase/onboarding-state";

const LOGO = "/livv-logo.png";
const RESEND_SECONDS = 30;

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    setNotice("");
    try { await fn(); }
    catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Try again."); }
    finally { setBusy(false); }
  };

  const sendEmail = (resend = false) => void run(async () => {
    if (resend && resendIn > 0) return;
    await startEmailAuth(email, mode === "signup");
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
          <h1 className="mt-5 text-center text-[28px] font-semibold tracking-tight">{mode === "signin" ? "Welcome back." : "Welcome to LIVV."}</h1>
          <p className="mt-2 text-center text-[13px] text-white/40">{mode === "signin" ? "Sign in to continue your journey." : "Create your account and start evolving."}</p>
        </div>

        <div className="space-y-5">
          {!pending && (
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
              <button type="button" onClick={() => { setMode("signin"); setError(""); setNotice(""); }} className={`rounded-xl px-3 py-2.5 text-[12px] font-medium transition ${mode === "signin" ? "bg-white text-black" : "text-white/45 hover:text-white/70"}`}>Sign in</button>
              <button type="button" onClick={() => { setMode("signup"); setError(""); setNotice(""); }} className={`rounded-xl px-3 py-2.5 text-[12px] font-medium transition ${mode === "signup" ? "bg-white text-black" : "text-white/45 hover:text-white/70"}`}>Create account</button>
            </div>
          )}
          {!pending ? (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); sendEmail(); }}>
              <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" placeholder="you@example.com" />
              <Button className="w-full" disabled={busy || !email.includes("@")} type="submit">
                {busy ? "Sending…" : mode === "signin" ? "Sign in with email" : "Create account with email"}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); verifyEmail(); }}>
              <Field label="8-digit code" value={otp} onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" autoComplete="one-time-code" placeholder="00000000" />
              <p className="text-[12px] leading-5 text-white/35">Enter the code sent to <span className="text-white/60">{email.trim().toLowerCase()}</span>.</p>
              <Button className="w-full" disabled={busy || otp.length !== 8} type="submit">
                {busy ? "Verifying…" : "Verify & enter LIVV"}
              </Button>
              <div className="flex items-center justify-between gap-4">
                <button type="button" disabled={busy || resendIn > 0} onClick={() => sendEmail(true)} className="text-[12px] text-white/45 disabled:opacity-30">
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </button>
                <button type="button" disabled={busy} onClick={() => { setPending(false); setOtp(""); setError(""); setNotice(""); setResendIn(0); }} className="text-[12px] text-white/35 disabled:opacity-30">Change email</button>
              </div>
            </form>
          )}
          {notice && <Notice>{notice}</Notice>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {!pending && <div className="pt-2 text-center text-[10px] uppercase tracking-[0.14em] text-white/25"><a href="/legal/privacy" className="hover:text-white/50">Privacy</a><span className="mx-2">·</span><a href="/legal/terms" className="hover:text-white/50">Terms</a></div>}
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete, inputMode, placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string; inputMode?: "numeric" | "tel" | "email" | "text"; placeholder?: string; }) {
  return <label className="block"><span className="text-[10px] uppercase tracking-[0.2em] text-white/30">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} inputMode={inputMode} placeholder={placeholder} className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/20 focus:border-white/25" /></label>;
}
function Notice({ children }: { children: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[12px] leading-5 text-white/60">{children}</div>; }
function ErrorMessage({ children }: { children: string }) { return <p className="text-center text-[13px] text-red-400">{children}</p>; }
