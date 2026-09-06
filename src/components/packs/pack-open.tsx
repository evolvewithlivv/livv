"use client";

import { useState } from "react";
import { openPack, GRADE_META, type CardDef, type PackGrade } from "@/lib/packs";
import { feedback } from "@/lib/sensory";
import { PackFoil } from "./pack-foil";
import { PackRip } from "./pack-rip";
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
  const [phase, setPhase] = useState<"idle" | "ripping" | "reveal">("idle");
  const [card, setCard] = useState<CardDef | null>(null);
  const meta = GRADE_META[grade];

  const rip = () => {
    if (phase !== "idle") return;
    setPhase("ripping");
    feedback("complete");
    window.setTimeout(() => {
      const result = openPack(packId);
      if (result) {
        setCard(result.card);
        setPhase("reveal");
        onOpened?.(result.card);
        if (result.card.rarity === "apex" || result.card.rarity === "rare") {
          feedback("unlock");
        }
      } else {
        onClose();
      }
    }, 1150);
  };

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/92 backdrop-blur-md">
      <button type="button" onClick={onClose} className="absolute right-5 top-12 text-[13px] text-white/40">
        Close
      </button>

      {phase !== "reveal" && (
        <>
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/35">{meta.subtitle}</p>
          <p className="font-display mt-2 text-[22px] font-semibold">{meta.name}</p>
          <button type="button" onClick={rip} className="mt-10" disabled={phase === "ripping"}>
            {phase === "idle" ? <PackFoil grade={grade} size="lg" pulse /> : <PackRip grade={grade} ripping />}
          </button>
          <p className="mt-10 text-[13px] text-white/40">
            {phase === "idle" ? "Tap pack to open" : "Opening…"}
          </p>
        </>
      )}

      {phase === "reveal" && card && (
        <>
          <p className="text-[10px] uppercase tracking-[0.32em] text-livv-accent-soft">Pulled</p>
          <div className="mt-6">
            <CardFace card={card} size="lg" reveal />
          </div>
          <button type="button" onClick={onClose} className="mt-10 rounded-full bg-white px-8 py-3 text-[14px] font-semibold text-black">
            Add to Vault
          </button>
        </>
      )}
    </div>
  );
}
