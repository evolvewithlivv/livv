"use client";

import { useEffect, useState } from "react";
import {
  dismissMilestone,
  evaluateMilestones,
  peekMilestone,
  type MilestoneDef,
} from "@/lib/milestones";
import { feedback } from "@/lib/sensory";

export function MilestoneCeremony() {
  const [m, setM] = useState<MilestoneDef | null>(null);

  useEffect(() => {
    evaluateMilestones();
    setM(peekMilestone());
    const sync = () => setM(peekMilestone());
    window.addEventListener("livv-milestones", sync);
    window.addEventListener("livv-record", () => {
      evaluateMilestones();
      sync();
    });
    return () => {
      window.removeEventListener("livv-milestones", sync);
    };
  }, []);

  if (!m) return null;

  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black/92 backdrop-blur-md">
      <p className="text-[10px] uppercase tracking-[0.36em] text-livv-accent-soft">Milestone</p>
      <h2 className="font-display mt-6 max-w-[16ch] text-center text-[36px] font-semibold leading-tight tracking-tight">
        {m.title}
      </h2>
      <p className="mt-4 max-w-[28ch] text-center text-[15px] leading-relaxed text-white/50">
        {m.line}
      </p>
      <button
        type="button"
        onClick={() => {
          feedback("unlock");
          dismissMilestone();
          setM(peekMilestone());
        }}
        className="mt-12 rounded-full bg-white px-8 py-3 text-[14px] font-semibold text-black"
      >
        Continue
      </button>
    </div>
  );
}
