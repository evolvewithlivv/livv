"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  continueWithSocial,
  isSignedIn,
  isUsernameAvailable,
  normalizeUsername,
  signInWithEmail,
  signInWithPhone,
  signUpWithProvider,
  suggestUsername,
  type AuthProvider,
} from "@/lib/auth";

type Mode = "choose" | "email-in" | "email-up" | "phone-in" | "phone-up" | "x-up";

const LOGO =
  "https://raw.githubusercontent.com/evolvewithlivv/livv/main/Photoroom_20260831_123254.png";

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
    if (isSignedIn()) router.replace("/home");
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
        // still fine — username was auto-suggested
      }
    });

  return (
    <main className="flex min-h-dvh flex-col bg-livv-black px-5 pb-10 pt-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="" className="h-16 w-16 object-contain" />
          <h1 className="mt-5 text-[28px] font-semibold tracking-tight">Join LIVV</h1>
          <p className="mt-2 text-sm text-white/45">
            One account. Locked username. Your progress stays.
          </p>
        </div>

        {mode === "choose" && (
          <div className="space-y-3">
            <AuthButton
              label="Continue with Google"
              onClick={() => social("google")}
              disabled={busy}
            />
            <AuthButton
              label="Continue with Apple"
              onClick={() => social("apple")}
              disabled={busy}
            />
            <AuthButton
              label="Continue with X"
              onClick={() => setMode("x-up")}
              disabled={busy}
            />
            <AuthButton
              label="Email"
              onClick={() => setMode("email-up")}
              disabled={busy}
              muted
            />
            <AuthButton
              label="Phone"
              onClick={() => setMode("phone-up")}
              disabled={busy}
              muted
            />

            <p className="pt-4 text-center text-sm text-white/40">
              Already have an account?{" "}
              <button
                type="button"
                className="text-livv-accent-soft"
                onClick={() => setMode("email-in")}
              >
                Sign in
              </button>
            </p>
          </div>
        )}

        {mode === "email-up" && (
          <Form
            title="Create with email"
            error={error}
            onBack={() => setMode("choose")}
            onSubmit={() =>
              run(() =>
                signUpWithProvider({
                  provider: "email",
                  email,
                  password,
                  displayName: displayName || email.split("@")[0],
                  username:
                    username ||
                    suggestUsername(displayName || email.split("@")[0], "email"),
                })
              )
            }
            busy={busy}
          >
            <Field label="Display name" value={displayName} onChange={setDisplayName} />
            <UsernameField value={username} onChange={setUsername} seed={displayName || email} />
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Field label="Password" value={password} onChange={setPassword} type="password" />
          </Form>
        )}

        {mode === "email-in" && (
          <Form
            title="Sign in with email"
            error={error}
            onBack={() => setMode("choose")}
            onSubmit={() => run(() => signInWithEmail(email, password))}
            busy={busy}
            cta="Sign in"
          >
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Field label="Password" value={password} onChange={setPassword} type="password" />
            <button
              type="button"
              className="text-left text-sm text-white/40"
              onClick={() => setMode("phone-in")}
            >
              Use phone instead
            </button>
          </Form>
        )}

        {mode === "phone-up" && (
          <Form
            title="Create with phone"
            error={error}
            onBack={() => setMode("choose")}
            onSubmit={() =>
              run(() =>
                signUpWithProvider({
                  provider: "phone",
                  phone,
                  displayName: displayName || "Member",
                  username: username || suggestUsername(displayName || phone, "phone"),
                })
              )
            }
            busy={busy}
          >
            <Field label="Display name" value={displayName} onChange={setDisplayName} />
            <UsernameField value={username} onChange={setUsername} seed={displayName || phone} />
            <Field label="Phone" value={phone} onChange={setPhone} type="tel" placeholder="+1..." />
          </Form>
        )}

        {mode === "phone-in" && (
          <Form
            title="Sign in with phone"
            error={error}
            onBack={() => setMode("choose")}
            onSubmit={() => run(() => signInWithPhone(phone))}
            busy={busy}
            cta="Sign in"
          >
            <Field label="Phone" value={phone} onChange={setPhone} type="tel" />
          </Form>
        )}

        {mode === "x-up" && (
          <Form
            title="Continue with X"
            error={error}
            onBack={() => setMode("choose")}
            onSubmit={() =>
              run(async () => {
                await continueWithSocial("x", {
                  displayName: displayName || xHandle || "X Member",
                  xHandle: xHandle || undefined,
                });
              })
            }
            busy={busy}
            cta="Continue"
          >
            <Field
              label="X handle"
              value={xHandle}
              onChange={setXHandle}
              placeholder="@yourhandle"
            />
            <Field label="Display name" value={displayName} onChange={setDisplayName} />
            <p className="text-[12px] leading-relaxed text-white/35">
              Real X OAuth plugs in once keys are live. For now this saves a locked LIVV account tied
              to your handle so ads from X land on a real identity.
            </p>
          </Form>
        )}
      </div>
    </main>
  );
}

function AuthButton({
  label,
  onClick,
  disabled,
  muted,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-12 w-full items-center justify-center rounded-full border text-sm font-medium",
        muted
          ? "border-livv-border bg-livv-surface text-white"
          : "border-white/15 bg-white text-black"
      )}
    >
      {label}
    </button>
  );
}

function Form({
  title,
  children,
  onBack,
  onSubmit,
  error,
  busy,
  cta = "Create account",
}: {
  title: string;
  children: React.ReactNode;
  onBack: () => void;
  onSubmit: () => void;
  error: string;
  busy: boolean;
  cta?: string;
}) {
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-6 text-sm text-white/40">
        ← Back
      </button>
      <h2 className="text-[22px] font-semibold tracking-tight">{title}</h2>
      <div className="mt-6 space-y-4">{children}</div>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <Button
        variant="accent"
        size="lg"
        className="mt-8 w-full"
        disabled={busy}
        onClick={onSubmit}
      >
        {busy ? "Working…" : cta}
      </Button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-white/35">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-livv-border bg-livv-surface px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-livv-accent/40"
      />
    </label>
  );
}

function UsernameField({
  value,
  onChange,
  seed,
}: {
  value: string;
  onChange: (v: string) => void;
  seed: string;
}) {
  const clean = normalizeUsername(value || suggestUsername(seed || "member", "email"));
  const available = !value || isUsernameAvailable(clean);

  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-white/35">Username</span>
      <div className="mt-2 flex items-center rounded-2xl border border-livv-border bg-livv-surface">
        <span className="pl-4 text-white/35">@</span>
        <input
          value={value}
          onChange={(e) => onChange(normalizeUsername(e.target.value))}
          placeholder={suggestUsername(seed || "member", "email")}
          className="w-full bg-transparent px-2 py-3.5 text-sm outline-none"
        />
      </div>
      <p className={cn("mt-1.5 text-[12px]", available ? "text-white/35" : "text-red-400")}>
        {available ? "Locked to you once you create the account" : "Taken"}
      </p>
    </label>
  );
}
