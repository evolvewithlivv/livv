"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveHomeAccess } from "@/lib/auth";

/**
 * A3-3: Waits for Supabase anonymous session resolution before redirecting.
 * Does not treat "pending" as signed-out.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const access = await resolveHomeAccess();
      if (cancelled) return;

      if (access === "ok") {
        setOk(true);
        return;
      }

      // deny only after session ensure finished (or local-only mode)
      router.replace("/auth");
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ok) {
    return <div className="min-h-dvh bg-livv-black" />;
  }

  return <>{children}</>;
}
