"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/supabase/real-auth";

/**
 * Protects member routes using the authoritative Supabase session.
 * Anonymous Supabase sessions never count as authenticated access.
 * Local account state is treated as a cache, not the auth authority.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const timeout = new Promise<null>((resolve) => {
        window.setTimeout(() => resolve(null), 8000);
      });
      const user = await Promise.race([getAuthenticatedUser(), timeout]);
      if (cancelled) return;

      if (user && !user.is_anonymous) {
        setState("allowed");
        return;
      }

      setState("denied");
      router.replace("/auth");
    };

    void check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state === "checking") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-livv-black px-6 text-white">
        <div className="text-center" role="status" aria-live="polite">
          <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
          <p className="text-sm text-white/50">Checking your LIVV session…</p>
        </div>
      </main>
    );
  }

  if (state === "denied") return null;
  return <>{children}</>;
}
