"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Wraps authenticated app content so each tab/route gets a clean enter.
 * Keyed by pathname so navigation feels intentional, not static.
 */
export function PageMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/home";

  return (
    <div key={pathname} className="livv-page-motion min-h-0">
      {children}
    </div>
  );
}
