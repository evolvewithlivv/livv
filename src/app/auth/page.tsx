"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  startEmailAuth,
  startPhoneAuth,
  verifyPhoneAuth,
} from "@/lib/supabase/real-auth";

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
  const [otp, setOtp] = useState("");
  const [phoneLinking, setPhoneLinking] = useState(false);

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

  const submitEmail = () =>
    void run(async () => {
      await startEmailAuth(email);
      setNotice("Check your email. Use the secure LIVV link to finish signing in.");
    });

  const submitPhone = () =>
    void run(async () => {
      const result = await startPhoneAuth(phone);
      setPhoneLinking(result.linked);
      setNotice("We sent a 6-digit code to your phone.");
    });

  const verifyPhone = () =>
    void run(async () => {
      await verifyPhoneAuth(phone, otp, phoneLinking);
      router.replace("/home");
    });

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#050505] px-5 pb-16 pt-12 text-white">
      <div className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="LIVV" className="h-14 w-14 object-contain" />
          <h1 className="mt-5 text-[28px] font-semibold tracking-tight">Enter LIVV</h1>
          <p className="mt-2 max-w-xs text-[13px] leading-5 text-white/40">
            Create or access your real LIVV account. Your authentication is handled securely by Supabase.
          </p>
        </div>

        {mode === "choose" && (
          <div className="mt-10 space-y-3">
            <Button className="w-full" disabled={busy} onClick={() => setMode("email")}>
              Continue with email
            </Button>
            <Button className="w-full" variant="secondary" disabled={busy} onClick={() => setMode("phone")}>
              Continue with phone
            </Button>

            <p className="pt-3 text-center text-[11px] leading-5 text-white/25">
              LIVV keeps sign-in simple. Use an email address or phone number you control.
            </p>

            <button
              type="button"
              className="mt-2 w-full text-center text-[13px] text-white/35"
              onClick={() => router.push("/onboarding")}
            >
              Back to Enter LIVV
            </button>
          </div>
        )}

        {mode === "email" && (
          <form
            className="mt-10 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitEmail();
            }}
          >
            <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
            <p className="text-[12px] leading-5 text-white/35">
              We&apos;ll email you a secure sign-in link. New emails create an account automatically.
            </p>
            <Button className="w-full" disabled={busy || !email} type="submit">
              {busy ? "Sending…" : "Email me a sign-in link"}
            </Button>
            <Back onClick={() => setMode("choose")} />
          </form>
        )}

        {mode === "phone" && (
          <div className="mt-10 space-y-4">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                submitPhone();
              }}
            >
              <Field
                label="Phone number"
                value={phone}
                onChange={setPhone}
                type="tel"
                autoComplete="tel"
                placeholder="+1 555 123 4567"
              />
              <p className="text-[12px] leading-5 text-white/35">
                We&apos;ll text you a one-time verification code. New numbers create an account automatically.
              </p>
              <Button className="w-full" disabled={busy || !phone} type="submit">
                {busy ? "Sending…" : "Text me a code"}
              </Button>
            </form>

            {notice && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[12px] leading-5 text-white/60">
                {notice}
              </div>
            )}

            {notice && (
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  verifyPhone();
                }}
              >
                <Field
                  label="6-digit code"
                  value={otp}
                  onChange={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
                <Button className="w-full" disabled={busy || otp.length !== 6} type="submit">
                  {busy ? "Verifying…" : "Verify & enter LIVV"}
                </Button>
              </form>
            )}

            <Back onClick={() => setMode("choose")} />
          </div>
        )}

        {(error || notice) && mode !== "phone" && (
          <div className="mt-6 space-y-2 text-center">
            {notice && <p className="text-[13px] text-emerald-300">{notice}</p>}
            {error && <p className="text-[13px] text-red-400">{error}</p>}
          </div>
        )}
        {error && mode === "phone" && <p className="mt-5 text-center text-[13px] text-red-400">{error}</p>}
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
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/20 focus:border-white/25"
      />
    </label>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full py-2 text-center text-[13px] text-white/35">
      Back
    </button>
  );
}
