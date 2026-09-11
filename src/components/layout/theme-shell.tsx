"use client";

import { useEffect } from "react";
import { applyAppearance, loadIdentity } from "@/lib/identity";
import { ensureAnonymousSession } from "@/lib/supabase/anon-session";

export function ThemeShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apply = () => {
      const me = loadIdentity();
      applyAppearance(me.appearance, me.accent);
      const mode =
        me.appearance === "light"
          ? "light"
          : me.appearance === "system"
            ? window.matchMedia("(prefers-color-scheme: light)").matches
              ? "light"
              : "dark"
            : "dark";
      document.querySelector('meta[name="theme-color"]')?.setAttribute(
        "content",
        mode === "light" ? "#f2f3f6" : "#030405"
      );
    };
    apply();

    // A3-2: restore or create anonymous Supabase session (no-op if env unset).
    // Does not gate UI; does not clear local progress on failure.
    void ensureAnonymousSession();

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
