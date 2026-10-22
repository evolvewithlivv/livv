"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LivvMark } from "@/components/brand/livv-mark";
import { applyAppearance, hasExplicitLookChoice, loadIdentity } from "@/lib/identity";
import { hydrateServerEntitlement } from "@/lib/billing";
import { startCloudMemberStateSync } from "@/lib/supabase/cloud-state";
import { ensureCloudAuthForCurrentBrowser } from "@/lib/supabase/real-auth";
import { flushIdentityCloudSync } from "@/lib/auth";
import "@/app/loading-screen.css";

const BOOT_MS = 2400;
const BOOT_KEY = "livv-boot-shown";
const TAB_ROUTES = new Set(["/home", "/home/daily", "/home/train", "/home/health", "/home/shop", "/home/profile"]);

/** A Daylight or Midnight choice already stored on this device. */
function hasSavedLandingChoice() {
  return hasExplicitLookChoice();
}

/** Public `/` with no saved choice follows the system scheme. Midnight or Daylight only. */
function applyLandingSystemScheme() {
  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const root = document.documentElement;
  root.dataset.livvScheme = "system";
  root.dataset.theme = dark ? "dark" : "light";
  root.dataset.livvTheme = dark ? "midnight" : "daylight";
  root.style.colorScheme = dark ? "dark" : "light";
  root.style.removeProperty("background-color");
  document.body?.style.removeProperty("background-color");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#090a0c" : "#f7f7f5");
  return dark;
}

function BootOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = reduced ? 400 : BOOT_MS;
    const t = window.setTimeout(onDone, ms);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div className="ll ll-boot" role="status" aria-live="polite" aria-label="Loading LIVV">
      <div className="ll-void" aria-hidden />
      <div className="ll-grid" aria-hidden />
      <div className="ll-pulse" aria-hidden />
      <div className="ll-stage">
        <div className="ll-signal" aria-hidden>
          <div className="ll-ring r1" />
          <div className="ll-ring r2" />
          <div className="ll-ring r3" />
          <div className="ll-core">
            <LivvMark kind="flame" alt="" />
          </div>
        </div>
        <p className="ll-line">Loading your world.</p>
      </div>
    </div>
  );
}

export function ThemeShell({ children }: { children: React.ReactNode }) {
  const [offline, setOffline] = useState(false);
  const [boot, setBoot] = useState(false);
  const pathname = usePathname();
  // Public `/` is the logged-out landing. Skip the member boot screen there.
  const isPublicDiscovery = pathname === "/" || pathname.startsWith("/go/") || pathname === "/home/health/recipes";
  const isTabRoute = TAB_ROUTES.has(pathname);

  useEffect(() => {
    document.documentElement.dataset.livvRoute =
      pathname.replaceAll("/", "-").replace(/^-|-$/g, "") || "root";
  }, [pathname]);

  useEffect(() => {
    if (isPublicDiscovery || isTabRoute) return;
    try {
      if (sessionStorage.getItem(BOOT_KEY) === "1") return;
    } catch {
      // private mode \u2014 still show boot
    }
    setBoot(true);
  }, [isPublicDiscovery, isTabRoute]);

  const finishBoot = () => {
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      // ignore
    }
    setBoot(false);
  };

  useEffect(() => {
    const apply = () => {
      if (!hasSavedLandingChoice()) {
        applyLandingSystemScheme();
        return;
      }
      const me = loadIdentity();
      applyAppearance(me.appearance, me.accent, me.theme);
      const mode =
        me.appearance === "light"
          ? "light"
          : me.appearance === "system"
            ? window.matchMedia("(prefers-color-scheme: light)").matches
              ? "light"
              : "dark"
            : "dark";
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", mode === "light" ? "#f2f3f6" : "#030405");
    };
    apply();
    const updateConnection = () => setOffline(!navigator.onLine);
    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    let stopCloudSync = () => {};
    let cancelled = false;
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((error) => console.warn("[LIVV PWA] service worker deferred", error));
    }
    if (!isPublicDiscovery) {
      void (async () => {
        try {
          await ensureCloudAuthForCurrentBrowser();
          if (cancelled) return;
          await hydrateServerEntitlement();
          if (cancelled) return;
          stopCloudSync = startCloudMemberStateSync();
        } catch (error) {
          console.warn("[LIVV startup] cloud services deferred", error);
        }
      })();
    }
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onScheme = () => {
      if (!hasSavedLandingChoice()) {
        apply();
        return;
      }
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
  }, [isPublicDiscovery]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (!hasSavedLandingChoice()) {
          applyLandingSystemScheme();
          return;
        }
        const me = loadIdentity();
        applyAppearance(me.appearance, me.accent, me.theme);
      } else {
        void flushIdentityCloudSync();
      }
    };
    const onHide = () => { void flushIdentityCloudSync(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
    };
  }, []);

  return (
    <>
      {boot && !isPublicDiscovery && !isTabRoute ? <BootOverlay onDone={finishBoot} /> : null}
      {offline && !isPublicDiscovery && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-3 top-2 z-[100] mx-auto max-w-xl rounded-2xl border border-white/10 bg-black/90 px-4 py-3 text-center text-[11px] font-medium tracking-wide text-white/75 shadow-lg backdrop-blur-xl"
        >
          Offline mode \u00b7 Your local changes are safe and will sync when you reconnect.
        </div>
      )}
      {children}
    </>
  );
}
