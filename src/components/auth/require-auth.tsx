"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/supabase/real-auth";
import { RouteSkeleton } from "@/components/motion/route-skeletons";

/**
 * Protects member routes using the authoritative Supabase session.
 * Anonymous Supabase sessions never count as authenticated access.
 * Local account state is treated as a cache, not the auth authority.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
      router.replace("/auth" + window.location.search);
    };

    void check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state === "checking") return <RouteSkeleton pathname={pathname} />;

  if (state === "denied") return null;
  return <>{children}</>;
}
