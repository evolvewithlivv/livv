"use client";

import { useEffect, useState } from "react";
import { applyAppearance, loadIdentity } from "@/lib/identity";
import { hydrateServerEntitlement } from "@/lib/billing";
import { ensureAnonymousSession } from "@/lib/supabase/anon-session";
import { startCloudMemberStateSync } from "@/lib/supabase/cloud-state";
import { ensureCloudAuthForCurrentBrowser } from "@/lib/supabase/real-auth";

export function ThemeShell({ children }: { children: React.ReactNode }) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const apply = () => {
      const me = loadIdentity();
      applyAppearance(me.appearance, me.accent);
      const mode = me.appearance === "light" ? "light" : me.appearance === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : "dark";
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", mode === "light" ? "#f2f3f6" : "#030405");
    };
    apply();
    const updateConnection = () => setOffline(!navigator.onLine);
    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);

    if ("serviceWorker" in navigator && window.isSecureContext) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
        console.warn("[LIVV PWA] service worker registration deferred", error);
      });
    }

    let stopCloudSync = () => {};
    let cancelled = false;
    void (async () => {
      try {
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
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  return (
    <>
      {offline && (
        <div role="status" className="fixed inset-x-0 top-0 z-[100] border-b border-white/10 bg-black/90 px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white/70 backdrop-blur-xl">
          You’re offline. LIVV will sync your progress when you’re back online.
        </div>
      )}
      {children}
    </>
  );
}
