"use client";

import { useEffect, useState } from "react";
import {
  dismissMilestone,
  evaluateMilestones,
  peekMilestone,
  type MilestoneDef,
} from "@/lib/milestones";
import { feedback } from "@/lib/sensory";
import { Presence } from "@/components/motion/presence";

export function MilestoneCeremony() {
  const [m, setM] = useState<MilestoneDef | null>(null);

  useEffect(() => {
    evaluateMilestones();
    setM(peekMilestone());
    const sync = () => setM(peekMilestone());
    const onRecord = () => {
      evaluateMilestones();
      sync();
    };
    window.addEventListener("livv-milestones", sync);
    window.addEventListener("livv-record", onRecord);
    return () => {
      window.removeEventListener("livv-milestones", sync);
      window.removeEventListener("livv-record", onRecord);
    };
  }, []);

  return (
    <Presence open={Boolean(m)}>
    {m ? <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black/[0.97] px-6">
      <div className="relative flex max-w-md flex-col items-center text-center">
        <div className="h-px w-16 bg-white/20" />
        <p className="mt-7 text-[10px] uppercase tracking-[0.36em] text-white/45">Progress</p>
        <h2 className="font-display mt-5 max-w-[16ch] text-[36px] font-semibold leading-[1.02] tracking-[-0.045em]">
          {m.title}
        </h2>
        <p className="mt-4 max-w-[30ch] text-[15px] leading-relaxed text-white/55">
          {m.line}
        </p>
        <button
          type="button"
          onClick={() => {
            feedback("unlock");
            dismissMilestone();
            setM(peekMilestone());
          }}
          className="mt-10 rounded-full border border-white/20 bg-white px-8 py-3 text-[14px] font-semibold text-black transition hover:bg-white/90"
        >
          Continue
        </button>
      </div>
    </div> : null}
    </Presence>
  );
}
