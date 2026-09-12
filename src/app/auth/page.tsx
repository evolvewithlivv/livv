"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  startEmailAuth,
  startPhoneAuth,
  verifyEmailAuth,
  verifyPhoneAuth,
} from "@/lib/supabase/real-auth";
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
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const startCooldown = () => {
    setResendSeconds(60);
    const timer = window.setInterval(() => {
      setResendSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
  };

  const afterAuth = () => {
    router.replace(isOnboardingComplete() ? "/home" : "/onboarding");
  };

  const submitEmail = () =>
    void run(async () => {
      await startEmailAuth(email);
      setEmailPending(true);
      setEmailOtp("");
      setNotice(
        "Enter the 6-digit code from your email. If the email only has a link and no code, the Magic Link template still needs the Token variable in Supabase."
      );
      startCooldown();
    });

  const submitPhone = () =>
    void run(async () => {
      const result = await startPhoneAuth(phone);
      if (result.phone) setPhone(result.phone);
      setPhonePending(true);
      setPhoneOtp("");
      setNotice("We sent a 6-digit code to your phone.");
      startCooldown();
    });

  const verifyEmail = () =>
    void run(async () => {
      await verifyEmailAuth(email, emailOtp);
      afterAuth();
    });

  const verifyPhone = () =>
    void run(async () => {
      await verifyPhoneAuth(phone, phoneOtp);
      afterAuth();
    });

  const resendEmail = () =>
    void run(async () => {
      await startEmailAuth(email);
      setNotice("A new email is on its way. Enter the 6-digit code from that message.");
      startCooldown();
    });

  const resendPhone = () =>
    void run(async () => {
      const result = await startPhoneAuth(phone);
      if (result.phone) setPhone(result.phone);
      setNotice("A new 6-digit code is on its way.");
      startCooldown();
    });

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#050505] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(var(--livv-accent)/0.12),transparent_55%)]"
      />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-10 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="LIVV" className="h-14 w-14 object-contain" />
          <h1 className="mt-5 text-center text-[28px] font-semibold tracking-tight">Enter LIVV</h1>
          <p className="mt-2 text-center text-[13px] text-white/40">
            Email or phone. 6-digit codes only. No social login.
          </p>
        </div>

        {mode === "choose" && (
          <div className="space-y-3">
            <Button
              className="w-full"
              type="button"
              onClick={() => {
                setMode("email");
                setError("");
                setNotice("");
              }}
            >
              Continue with email
            </Button>
            <Button
              className="w-full"
              variant="secondary"
              type="button"
              onClick={() => {
                setMode("phone");
                setError("");
                setNotice("");
              }}
            >
              Continue with phone
            </Button>
            <p className="pt-2 text-center text-[11px] leading-relaxed text-white/25">
              We only use email OTP and SMS OTP. Google, Apple, and other social providers are not used.
            </p>
          </div>
        )}

        {mode === "email" && (
          <div className="space-y-4">
            {!emailPending ? (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitEmail();
                }}
              >
                <Field
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <Button className="w-full" disabled={busy || !email.includes("@")} type="submit">
                  {busy ? "Sending…" : "Send 6-digit code"}
                </Button>
              </form>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyEmail();
                }}
              >
                <Field
                  label="6-digit code"
                  value={emailOtp}
                  onChange={(v) => setEmailOtp(v.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                />
                <p className="text-[12px] leading-5 text-white/35">
                  Enter the code sent to <span className="text-white/60">{email.trim().toLowerCase()}</span>.
                </p>
                <Button className="w-full" disabled={busy || emailOtp.length !== 6} type="submit">
                  {busy ? "Verifying…" : "Verify & enter LIVV"}
                </Button>
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    disabled={busy || resendSeconds > 0}
                    onClick={resendEmail}
                    className="text-[12px] text-white/45 disabled:opacity-30"
                  >
                    {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend code"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setEmailPending(false);
                      setEmailOtp("");
                      setNotice("");
                      setError("");
                    }}
                    className="text-[12px] text-white/35 disabled:opacity-30"
                  >
                    Change email
                  </button>
                </div>
              </form>
            )}
            {notice && <Notice>{notice}</Notice>}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Back
              onClick={() => {
                setEmailPending(false);
                setMode("choose");
                setNotice("");
                setError("");
              }}
            />
          </div>
        )}

        {mode === "phone" && (
          <div className="space-y-4">
            {!phonePending ? (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitPhone();
                }}
              >
                <Field
                  label="Phone"
                  value={phone}
                  onChange={setPhone}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+15551234567"
                />
                <p className="text-[11px] text-white/30">
                  Include country code. US numbers without + are assumed +1.
                </p>
                <Button
                  className="w-full"
                  disabled={busy || phone.replace(/\D/g, "").length < 7}
                  type="submit"
                >
                  {busy ? "Sending…" : "Send 6-digit code"}
                </Button>
              </form>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyPhone();
                }}
              >
                <Field
                  label="6-digit code"
                  value={phoneOtp}
                  onChange={(v) => setPhoneOtp(v.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                />
                <p className="text-[12px] leading-5 text-white/35">
                  Enter the code we sent to <span className="text-white/60">{phone.trim()}</span>.
                </p>
                <Button className="w-full" disabled={busy || phoneOtp.length !== 6} type="submit">
                  {busy ? "Verifying…" : "Verify & enter LIVV"}
                </Button>
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    disabled={busy || resendSeconds > 0}
                    onClick={resendPhone}
                    className="text-[12px] text-white/45 disabled:opacity-30"
                  >
                    {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend code"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setPhonePending(false);
                      setPhoneOtp("");
                      setNotice("");
                      setError("");
                    }}
                    className="text-[12px] text-white/35 disabled:opacity-30"
                  >
                    Change number
                  </button>
                </div>
              </form>
            )}
            {notice && <Notice>{notice}</Notice>}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Back
              onClick={() => {
                setPhonePending(false);
                setMode("choose");
                setNotice("");
                setError("");
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/20 focus:border-white/25"
      />
    </label>
  );
}

function Notice({ children }: { children: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[12px] leading-5 text-white/60">
      {children}
    </div>
  );
}

function ErrorMessage({ children }: { children: string }) {
  return <p className="text-center text-[13px] text-red-400">{children}</p>;
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full py-2 text-center text-[13px] text-white/35">
      Back
    </button>
  );
}
