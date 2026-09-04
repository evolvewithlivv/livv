"use client";

import { useState } from "react";
import { openPack, type CardDef, type PackKind, PACK_META } from "@/lib/packs";
import { feedback } from "@/lib/sensory";
import { PackFoil } from "./pack-foil";
import { CardFace } from "./card-face";

export function PackOpenModal({
  packId,
  kind,
  onClose,
  onOpened,
}: {
  packId: string;
  kind: PackKind;
  onClose: () => void;
  onOpened?: (card: CardDef) => void;
}) {
  const [phase, setPhase] = useState<"idle" | "ripping" | "reveal">("idle");
  const [card, setCard] = useState<CardDef | null>(null);
  const meta = PACK_META[kind];

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
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-12 text-[13px] text-white/40"
      >
        Close
      </button>

      {phase !== "reveal" && (
        <>
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/35">{meta.subtitle}</p>
          <p className="font-display mt-2 text-[22px] font-semibold">{meta.name}</p>
          <button type="button" onClick={rip} className="mt-10" disabled={phase === "ripping"}>
            <div className={phase === "ripping" ? "animate-pulse scale-95 transition" : ""}>
              <PackFoil kind={kind} size="lg" pulse={phase === "idle"} />
            </div>
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
          <button
            type="button"
            onClick={onClose}
            className="mt-10 rounded-full bg-white px-8 py-3 text-[14px] font-semibold text-black"
          >
            Add to Vault
          </button>
        </>
      )}
    </div>
  );
}
