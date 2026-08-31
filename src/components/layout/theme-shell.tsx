"use client";

import { useEffect } from "react";
import { applyAppColor, loadIdentity } from "@/lib/identity";

export function ThemeShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apply = () => {
      const me = loadIdentity();
      applyAppColor(me.accent, me.theme);
    };
    apply();
    window.addEventListener("livv-identity", apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener("livv-identity", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  return <>{children}</>;
}
