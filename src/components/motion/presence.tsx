"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const EXIT_MS = 220;

/** Keeps a sheet mounted through its close so opacity and transform can finish. */
export function Presence({ open, children }: { open: boolean; children: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState<"in" | "out">(open ? "in" : "out");
  const held = useRef(children);
  if (open) held.current = children;

  useEffect(() => {
    if (open) {
      setMounted(true);
      setPhase("in");
      return;
    }
    if (!mounted) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setMounted(false);
      return;
    }
    setPhase("out");
    const timer = window.setTimeout(() => setMounted(false), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open, mounted]);

  if (!mounted) return null;
  return (
    <div className={"livv-presence " + (phase === "out" ? "is-out" : "is-in")}>
      {open ? children : held.current}
    </div>
  );
}
