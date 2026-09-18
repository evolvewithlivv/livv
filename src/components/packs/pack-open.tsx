"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GRADE_META, openPack, rewardProgress, type CardDef, type PackGrade } from "@/lib/packs";
import { feedback } from "@/lib/sensory";
import { PackFoil } from "./pack-foil";
import { CardFace } from "./card-face";

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"opening" | "reveal">("opening");
  const [result, setResult] = useState<ReturnType<typeof openPack>>(null);
  const meta = GRADE_META[grade];

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const out = openPack(packId);
      if (!out) {
        onClose();
        return;
      }
      setResult(out);
      onOpened?.(out.card);
      setPhase("reveal");
      feedback("unlock");
    }, 900);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packId]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/[0.97] px-5"
      style={{ top: 0, left: 0, right: 0, bottom: 0, height: "100dvh", width: "100vw" }}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={phase === "reveal" ? onClose : undefined}
        disabled={phase !== "reveal"}
        className="absolute right-5 z-20 text-[12px] font-semibold text-white/55 disabled:cursor-default disabled:opacity-30"
        style={{ top: "max(2.5rem, env(safe-area-inset-top))" }}
      >
        Close
      </button>

      {phase === "opening" ? (
        <div className="flex w-full flex-col items-center justify-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">{meta.name}</p>
          <p className="mt-2 text-[13px] text-white/60">Opening your pack.</p>

          <div className="mt-8 flex h-[340px] w-[220px] items-center justify-center">
            <div className="livv-pack-simple">
              <PackFoil grade={grade} size="lg" />
            </div>
          </div>

          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
            Preparing your card
          </p>

          <style jsx>{`
            .livv-pack-simple {
              animation: simplePackIn .45s ease-out both;
              filter: drop-shadow(0 24px 30px rgba(0,0,0,.45));
            }
            @keyframes simplePackIn {
              from { opacity: 0; transform: translateY(8px) scale(.97); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @media(prefers-reduced-motion:reduce) {
              .livv-pack-simple { animation:none!important; }
            }
          `}</style>
        </div>
      ) : result ? (
        <div className="flex max-h-[100dvh] w-full max-w-sm flex-col items-center overflow-y-auto py-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-livv-accent-soft">You pulled a card</p>
          <div className="mt-5"><CardFace card={result.card} size="lg" reveal /></div>
          <div className="mt-6 w-full rounded-[24px] border border-white/10 bg-white/[0.05] p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Reward progress</p>
            <p className="font-display mt-2 text-[24px] font-semibold">+{result.fragments} fragment{result.fragments === 1 ? "" : "s"}</p>
            <p className="mt-1 text-[13px] text-white/70">{result.reward.name}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-livv-accent transition-all duration-700" style={{ width: `${Math.round((rewardProgress(result.reward.id) / result.reward.target) * 100)}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-white/55">{rewardProgress(result.reward.id)} / {result.reward.target} fragments</p>
            {result.unlocked && <p className="mt-3 font-semibold text-livv-accent-soft">Reward unlocked.</p>}
          </div>
          <button type="button" onClick={onClose} className="mt-7 rounded-full bg-white px-8 py-3 text-[13px] font-semibold text-black">Add to Vault</button>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
