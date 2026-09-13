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

    void (async () => {
      // A3-2: restore or create anonymous Supabase session when signed out.
      await ensureAnonymousSession();
      await hydrateServerEntitlement();

      // A verified member gets their cloud identity/state back on any browser.
      // Anonymous sessions never start the member-state sync.
      await ensureCloudAuthForCurrentBrowser();
      stopCloudSync = startCloudMemberStateSync();
    })();

    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onScheme = () => {
      if (loadIdentity().appearance === "system") apply();
    };
    mq.addEventListener("change", onScheme);
    window.addEventListener("livv-identity", apply);
    window.addEventListener("storage", apply);
    return () => {
      stopCloudSync();
      mq.removeEventListener("change", onScheme);
      window.removeEventListener("livv-identity", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  return <>{children}</>;
}
