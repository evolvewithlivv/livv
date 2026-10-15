"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuthenticatedUser } from "@/lib/supabase/real-auth";

export default function NotFound() {
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const onOnline = () => setBusy(false);
    window.addEventListener("online", onOnline);
    let cancelled = false;
    getAuthenticatedUser()
      .then((user) => {
        if (!cancelled) setSignedIn(Boolean(user && !user.is_anonymous));
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      });
    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-livv-bg px-6 text-livv-ink">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] border border-livv-border text-xl font-semibold text-livv-ink">
          404
        </div>
        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.34em] text-livv-muted">LIVV</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Nothing here.</h1>
        <p className="mt-3 text-sm leading-relaxed text-livv-muted">
          That page does not exist or has moved.
          {signedIn ? " Your account and progress are unaffected." : ""}
        </p>
        <div className="mt-7 flex justify-center gap-2">
          <Link href={signedIn ? "/home" : "/"} prefetch={false} className="rounded-full bg-livv-ink px-6 py-3 text-sm font-semibold text-livv-bg">
            Go to Home
          </Link>
          {signedIn ? (
            <Link href="/" prefetch={false} className="rounded-full border border-livv-border px-5 py-3 text-sm font-semibold text-livv-muted">
              LIVV landing
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => {
            setBusy(true);
            window.location.reload();
          }}
          disabled={busy}
          className="mt-4 text-xs text-livv-muted underline underline-offset-4 disabled:opacity-50"
        >
          {busy ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </main>
  );
}
