"use client";

import { useEffect } from "react";
import { applyAppearance, loadIdentity } from "@/lib/identity";

export function ThemeShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apply = () => {
      const me = loadIdentity();
      applyAppearance(me.appearance, me.accent);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onScheme = () => {
      if (loadIdentity().appearance === "system") apply();
    };
    mq.addEventListener("change", onScheme);
    window.addEventListener("livv-identity", apply);
    window.addEventListener("storage", apply);
    return () => {
      mq.removeEventListener("change", onScheme);
      window.removeEventListener("livv-identity", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  return <>{children}</>;
}
