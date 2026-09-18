"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GRADE_META, openPack, rewardProgress, type CardDef, type PackGrade } from "@/lib/packs";
import { feedback } from "@/lib/sensory";
import { PackFoil } from "./pack-foil";
import { CardFace } from "./card-face";

export function PackOpenModal({
  packId,
  grade,
  onClose,
  onOpened,
}: {
  packId: string;
  grade: PackGrade;
  onClose: () => void;
  onOpened?: (card: CardDef) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"opening" | "reveal">("opening");
  const [result, setResult] = useState<ReturnType<typeof openPack>>(null);
  const meta = GRADE_META[grade];

  useEffect(() => {
    setMounted(true);
    // lock body scroll while open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    feedback("complete");
    const t = window.setTimeout(() => {
      const out = openPack(packId);
      if (!out) {
        onClose();
        return;
      }
      setResult(out);
      onOpened?.(out.card);
      setPhase("reveal");
      if (out.card.rarity === "apex" || out.card.rarity === "rare") feedback("unlock");
    }, 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packId]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 px-5"
      style={{ top: 0, left: 0, right: 0, bottom: 0, height: "100dvh", width: "100vw" }}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 z-10 text-[12px] font-semibold text-white/60"
        style={{ top: "max(2.5rem, env(safe-area-inset-top))" }}
      >
        Close
      </button>

      {phase === "opening" ? (
        <div className="flex flex-col items-center justify-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">{meta.name}</p>
          <p className="mt-2 text-[13px] text-white/65">Opening your pack...</p>
          <div className="mt-10 animate-pulse">
            <PackFoil grade={grade} size="lg" pulse />
          </div>
        </div>
      ) : result ? (
        <div className="flex max-h-[100dvh] w-full max-w-sm flex-col items-center overflow-y-auto py-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-livv-accent-soft">You pulled a card</p>
          <div className="mt-5">
            <CardFace card={result.card} size="lg" reveal />
          </div>
          <div className="mt-6 w-full rounded-[24px] border border-white/10 bg-white/[0.05] p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Reward progress</p>
            <p className="font-display mt-2 text-[24px] font-semibold">
              +{result.fragments} fragment{result.fragments === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-[13px] text-white/70">{result.reward.name}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-livv-accent transition-all duration-700"
                style={{
                  width: `${Math.round((rewardProgress(result.reward.id) / result.reward.target) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-2 text-[11px] text-white/55">
              {rewardProgress(result.reward.id)} / {result.reward.target} fragments
            </p>
            {result.unlocked && (
              <p className="mt-3 font-semibold text-livv-accent-soft">Reward unlocked.</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-7 rounded-full bg-white px-8 py-3 text-[13px] font-semibold text-black"
          >
            Add to Vault
          </button>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
