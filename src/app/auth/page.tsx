"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  continueWithSocial,
  isSignedInLocal,
  normalizeUsername,
  signInWithEmail,
  signInWithPhone,
  signUpWithProvider,
  suggestUsername,
  type AuthProvider,
} from "@/lib/auth";

type Mode = "choose" | "email-in" | "email-up" | "phone-in" | "phone-up" | "x-up";

const LOGO = "/livv-logo.png";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choose");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [xHandle, setXHandle] = useState("");

  useEffect(() => {
    if (isSignedInLocal()) router.replace("/home");
  }, [router]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      router.replace("/home");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const social = (provider: "google" | "apple" | "x") =>
    run(async () => {
      const result = await continueWithSocial(provider, {
        displayName: displayName || undefined,
        xHandle: xHandle || undefined,
      });
      if (result.isNew && provider === "x" && !xHandle) {
        /* ok */
      }
    });

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#050505] px-5 pb-16 pt-12 text-white">
      <div className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="LIVV" className="h-14 w-14 object-contain" />
          <h1 className="mt-5 text-[28px] font-semibold tracking-tight">Join LIVV</h1>
          <p className="mt-2 text-[13px] text-white/40">Device-local account · progress stays on this browser</p>
        </div>

        {mode === "choose" && (
          <div className="mt-10 space-y-3">
            <Button className="w-full" onClick={() => setMode("email-up")}>
              Continue with email
            </Button>
            <Button className="w-full" variant="secondary" onClick={() => setMode("email-in")}>
              Sign in with email
            </Button>
            <Button className="w-full" variant="secondary" onClick={() => setMode("phone-up")}>
              Continue with phone
            </Button>
            <Button className="w-full" variant="secondary" onClick={() => social("google")}>
              Continue with Google
            </Button>
            <Button className="w-full" variant="secondary" onClick={() => social("apple")}>
              Continue with Apple
            </Button>
            <Button className="w-full" variant="secondary" onClick={() => setMode("x-up")}>
              Continue with X
            </Button>
            <button
              type="button"
              className="mt-4 w-full text-center text-[13px] text-white/35"
              onClick={() => router.push("/onboarding")}
            >
              Back to Enter LIVV
            </button>
          </div>
        )}

        {mode === "email-up" && (
          <form
            className="mt-10 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void run(() =>
                signUpWithProvider({
                  provider: "email",
                  email,
                  password,
                  displayName: displayName || email.split("@")[0] || "Member",
                  username: username || suggestUsername(displayName || email, "email"),
                })
              );
            }}
          >
            <Field label="Display name" value={displayName} onChange={setDisplayName} />
            <Field label="Username" value={username} onChange={(v) => setUsername(normalizeUsername(v))} />
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Field label="Password" value={password} onChange={setPassword} type="password" />
            <Button className="w-full" disabled={busy} type="submit">
              Create account
            </Button>
            <Back onClick={() => setMode("choose")} />
          </form>
        )}

        {mode === "email-in" && (
          <form
            className="mt-10 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void run(() => signInWithEmail(email, password));
            }}
          >
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Field label="Password" value={password} onChange={setPassword} type="password" />
            <Button className="w-full" disabled={busy} type="submit">
              Sign in
            </Button>
            <Back onClick={() => setMode("choose")} />
          </form>
        )}

        {mode === "phone-up" && (
          <form
            className="mt-10 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void run(() =>
                signUpWithProvider({
                  provider: "phone",
                  phone,
                  displayName: displayName || "Member",
                  username: username || suggestUsername(displayName || phone, "phone"),
                })
              );
            }}
          >
            <Field label="Display name" value={displayName} onChange={setDisplayName} />
            <Field label="Username" value={username} onChange={(v) => setUsername(normalizeUsername(v))} />
            <Field label="Phone" value={phone} onChange={setPhone} type="tel" />
            <Button className="w-full" disabled={busy} type="submit">
              Create account
            </Button>
            <Back onClick={() => setMode("choose")} />
          </form>
        )}

        {mode === "phone-in" && (
          <form
            className="mt-10 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void run(() => signInWithPhone(phone));
            }}
          >
            <Field label="Phone" value={phone} onChange={setPhone} type="tel" />
            <Button className="w-full" disabled={busy} type="submit">
              Sign in
            </Button>
            <Back onClick={() => setMode("choose")} />
          </form>
        )}

        {mode === "x-up" && (
          <form
            className="mt-10 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                await continueWithSocial("x", {
                  displayName: displayName || xHandle || "X Member",
                  xHandle,
                });
              });
            }}
          >
            <Field label="Display name" value={displayName} onChange={setDisplayName} />
            <Field label="X handle" value={xHandle} onChange={setXHandle} />
            <Button className="w-full" disabled={busy} type="submit">
              Continue with X
            </Button>
            <Back onClick={() => setMode("choose")} />
          </form>
        )}

        {error && <p className="mt-6 text-center text-[13px] text-red-400">{error}</p>}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white outline-none focus:border-white/25"
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
