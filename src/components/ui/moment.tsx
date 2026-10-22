"use client";

import { useEffect, useState } from "react";
import { feedback } from "@/lib/sensory";

export function Moment({
  title,
  subtitle,
  onDone,
}: {
  title: string;
  subtitle?: string;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    feedback("unlock");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reduce ? 900 : 1800;
    const exit = reduce ? 0 : 220;
    const leave = window.setTimeout(() => setPhase("out"), hold);
    const done = window.setTimeout(onDone, hold + exit);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className={"livv-sheet fixed inset-0 z-[80] flex items-center justify-center bg-black/80 " + (phase === "out" ? "is-out" : "is-in")}>
      <div className="px-8 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-livv-accent-soft">
          Locked in
        </p>
        <h2 className="mt-4 text-[34px] font-semibold leading-tight tracking-tight">{title}</h2>
        {subtitle && <p className="mt-3 text-sm text-white/50">{subtitle}</p>}
      </div>
    </div>
  );
}
