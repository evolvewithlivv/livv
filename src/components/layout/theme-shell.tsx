"use client";

import { useEffect } from "react";
import { applyAppearance, loadIdentity } from "@/lib/identity";
import { hydrateServerEntitlement } from "@/lib/billing";
import { ensureAnonymousSession } from "@/lib/supabase/anon-session";
import { startCloudMemberStateSync } from "@/lib/supabase/cloud-state";
import { ensureCloudAuthForCurrentBrowser } from "@/lib/supabase/real-auth";

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

    let stopCloudSync = () => {};
    let cancelled = false;

    void (async () => {
      try {
        // Keep startup resilient: a transient Supabase failure must not blank the app.
        await ensureAnonymousSession();
        await hydrateServerEntitlement();
        if (cancelled) return;
        await ensureCloudAuthForCurrentBrowser();
        if (cancelled) return;
        stopCloudSync = startCloudMemberStateSync();
      } catch (error) {
        console.warn("[LIVV startup] cloud services deferred", error);
      }
    })();

    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onScheme = () => {
      if (loadIdentity().appearance === "system") apply();
    };
    mq.addEventListener("change", onScheme);
    window.addEventListener("livv-identity", apply);
    window.addEventListener("storage", apply);
    return () => {
      cancelled = true;
      stopCloudSync();
      mq.removeEventListener("change", onScheme);
      window.removeEventListener("livv-identity", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  return <>{children}</>;
}
