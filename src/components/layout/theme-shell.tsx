"use client";

import { useEffect, useState } from "react";
import { loadIdentity, type LivvTheme } from "@/lib/identity";

const THEMES: Record<LivvTheme, string> = {
  ember: "#050505",
  midnight: "#07080f",
  bone: "#12100e",
};

export function ThemeShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<LivvTheme>("ember");

  useEffect(() => {
    const apply = () => setTheme(loadIdentity().theme);
    apply();
    window.addEventListener("livv-identity", apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener("livv-identity", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  return (
    <div className="min-h-dvh pb-24" style={{ background: THEMES[theme] }}>
      {children}
    </div>
  );
}
