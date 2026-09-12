"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { finishSupabaseCallback } from "@/lib/supabase/real-auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const finish = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const authError = params.get("error");
        const authErrorDescription = params.get("error_description");
        if (authError) {
          throw new Error(
            authErrorDescription || `Authentication request returned ${authError}.`
          );
        }

        const code = params.get("code") || undefined;
        await finishSupabaseCallback(code);
        if (active) router.replace("/home");
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Authentication could not be completed.");
        }
      }
    };

    void finish();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#050505] px-6 text-white">
      <div className="w-full max-w-sm text-center">
        {!error ? (
          <>
            <div className="mx-auto h-10 w-10 animate-pulse rounded-full border border-white/20" />
            <h1 className="mt-6 text-xl font-semibold">Finishing your LIVV sign-in…</h1>
            <p className="mt-2 text-sm text-white/40">Securely connecting your account and restoring your LIVV session.</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">We couldn&apos;t finish that sign-in</h1>
            <p className="mt-3 text-sm leading-6 text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => router.replace("/auth")}
              className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white/75"
            >
              Back to sign in
            </button>
          </>
        )}
      </div>
    </main>
  );
}
