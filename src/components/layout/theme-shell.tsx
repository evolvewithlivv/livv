"use client";

import { useEffect } from "react";
import { applyAppearance, loadIdentity } from "@/lib/identity";

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
