"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Replays the page enter when the route changes.
 * Keyed on the pathname so the layout around it stays mounted.
 */
export function PageMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  return (
    <div key={pathname} className="livv-page-motion min-h-0">
      {children}
    </div>
  );
}

/** Public routes only. Member routes already enter inside the home shell. */
export function RouteMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  if (pathname === "/home" || pathname.startsWith("/home/")) return <>{children}</>;
  return <PageMotion>{children}</PageMotion>;
}
