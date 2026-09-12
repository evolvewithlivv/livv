"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startEmailAuth, startPhoneAuth, verifyEmailAuth, verifyPhoneAuth } from "@/lib/supabase/real-auth";
import { isOnboardingComplete } from "@/lib/onboarding";

const LOGO = "/livv-logo.png";
type Mode = "choose" | "email" | "phone";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choose");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailPending, setEmailPending] = useState(false);
  const [phonePending, setPhonePending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError(""); setNotice("");
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Try again."); }
    finally { setBusy(false); }
  };
  const startCooldown = () => {
    setResendSeconds(60);
    const timer = window.setInterval(() => setResendSeconds((seconds) => {
      if (seconds <= 1) { window.clearInterval(timer); return 0; }
      return seconds - 1;
    }), 1000);
  };
  const submitEmail = () => void run(async () => { await startEmailAuth(email); setEmailPending(true); setEmailOtp(""); setNotice("We sent a 6-digit code to your email."); startCooldown(); });
  const submitPhone = () => void run(async () => { await startPhoneAuth(phone); setPhonePending(true); setPhoneOtp(""); setNotice("We sent a 6-digit code to your phone."); startCooldown(); });
  const verifyEmail = () => void run(async () => { await verifyEmailAuth(email, emailOtp); router.replace(isOnboardingComplete() ? "/home" : "/onboarding"); });
  const verifyPhone = () => void run(async () => { await verifyPhoneAuth(phone, phoneOtp); router.replace(isOnboardingComplete() ? "/home" : "/onboarding"); });
  const resendEmail = () => void run(async () => { await startEmailAuth(email); setNotice("A new 6-digit code is on its way."); startCooldown(); });
  const resendPhone = () => void run(async () => { await startPhoneAuth(phone); setNotice("A new 6-digit code is on its way."); startCooldown(); });

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#050505] px-5 pb-16 pt-12 text-white">
      <div className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="LIVV" className="h-14 w-14 object-contain" />
          <h1 className="mt-5 text-[28px] font-semibold tracking-tight">Enter LIVV</h1>
          <p className="mt-2 max-w-xs text-[13px] leading-5 text-white/40">Create or access your real LIVV account with a code sent to an email address or phone number you control.</p>
        </div>
        {mode === "choose" && <div className="mt-10 space-y-3">
          <Button className="w-full" disabled={busy} onClick={() => { setError(""); setNotice(""); setMode("email"); }}>Continue with email</Button>
          <Button className="w-full" variant="secondary" disabled={busy} onClick={() => { setError(""); setNotice(""); setMode("phone"); }}>Continue with phone</Button>
          <p className="pt-3 text-center text-[11px] leading-5 text-white/25">No passwords. No social sign-ins. Just your email or phone and a one-time code.</p>
          <button type="button" className="mt-2 w-full text-center text-[13px] text-white/35" onClick={() => router.push("/")}>Back</button>
        </div>}
        {mode === "email" && <div className="mt-10 space-y-4">
          {!emailPending ? <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submitEmail(); }}>
            <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" placeholder="you@example.com" />
            <p className="text-[12px] leading-5 text-white/35">We&apos;ll send a 6-digit verification code. New email addresses create a LIVV account automatically.</p>
            <Button className="w-full" disabled={busy || !email.trim()} type="submit">{busy ? "Sending…" : "Send me a code"}</Button>
          </form> : <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); verifyEmail(); }}>
            <Field label="6-digit code" value={emailOtp} onChange={(v) => setEmailOtp(v.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" />
            <p className="text-[12px] leading-5 text-white/35">Enter the code we sent to <span className="text-white/60">{email.trim().toLowerCase()}</span>.</p>
            <Button className="w-full" disabled={busy || emailOtp.length !== 6} type="submit">{busy ? "Verifying…" : "Verify & enter LIVV"}</Button>
            <div className="flex items-center justify-between gap-4"><button type="button" disabled={busy || resendSeconds > 0} onClick={resendEmail} className="text-[12px] text-white/45 disabled:opacity-30">{resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend code"}</button><button type="button" disabled={busy} onClick={() => { setEmailPending(false); setEmailOtp(""); setNotice(""); setError(""); }} className="text-[12px] text-white/35 disabled:opacity-30">Change email</button></div>
          </form>}
          {notice && <Notice>{notice}</Notice>}{error && <ErrorMessage>{error}</ErrorMessage>}
          <Back onClick={() => { setEmailPending(false); setMode("choose"); setNotice(""); setError(""); }} />
        </div>}
        {mode === "phone" && <div className="mt-10 space-y-4">
          {!phonePending ? <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submitPhone(); }}>
            <Field label="Phone number" value={phone} onChange={setPhone} type="tel" autoComplete="tel" inputMode="tel" placeholder="+1 555 123 4567" />
            <p className="text-[12px] leading-5 text-white/35">We&apos;ll text a 6-digit verification code. New phone numbers create a LIVV account automatically.</p>
            <Button className="w-full" disabled={busy || !phone.trim()} type="submit">{busy ? "Sending…" : "Text me a code"}</Button>
          </form> : <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); verifyPhone(); }}>
            <Field label="6-digit code" value={phoneOtp} onChange={(v) => setPhoneOtp(v.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" />
            <p className="text-[12px] leading-5 text-white/35">Enter the code we sent to <span className="text-white/60">{phone.trim()}</span>.</p>
            <Button className="w-full" disabled={busy || phoneOtp.length !== 6} type="submit">{busy ? "Verifying…" : "Verify & enter LIVV"}</Button>
            <div className="flex items-center justify-between gap-4"><button type="button" disabled={busy || resendSeconds > 0} onClick={resendPhone} className="text-[12px] text-white/45 disabled:opacity-30">{resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend code"}</button><button type="button" disabled={busy} onClick={() => { setPhonePending(false); setPhoneOtp(""); setNotice(""); setError(""); }} className="text-[12px] text-white/35 disabled:opacity-30">Change number</button></div>
          </form>}
          {notice && <Notice>{notice}</Notice>}{error && <ErrorMessage>{error}</ErrorMessage>}
          <Back onClick={() => { setPhonePending(false); setMode("choose"); setNotice(""); setError(""); }} />
        </div>}
      </div>
    </main>
  );
}
function Field({ label, value, onChange, type = "text", autoComplete, inputMode, placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string; inputMode?: "numeric" | "tel" | "email" | "text"; placeholder?: string; }) { return <label className="block"><span className="text-[10px] uppercase tracking-[0.2em] text-white/30">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} inputMode={inputMode} placeholder={placeholder} className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/20 focus:border-white/25" /></label>; }
function Notice({ children }: { children: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[12px] leading-5 text-white/60">{children}</div>; }
function ErrorMessage({ children }: { children: string }) { return <p className="text-center text-[13px] text-red-400">{children}</p>; }
function Back({ onClick }: { onClick: () => void }) { return <button type="button" onClick={onClick} className="w-full py-2 text-center text-[13px] text-white/35">Back</button>; }
