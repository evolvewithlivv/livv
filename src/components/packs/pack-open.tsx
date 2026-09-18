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
  const [openingStep, setOpeningStep] = useState<"charge" | "tear" | "burst">("charge");
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
    const step1 = window.setTimeout(() => setOpeningStep("tear"), 650);
    const step2 = window.setTimeout(() => setOpeningStep("burst"), 1250);
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
    return () => {
      window.clearTimeout(step1);
      window.clearTimeout(step2);
      window.clearTimeout(t);
    };
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
          <div className={`livv-pack-stage livv-pack-stage-${openingStep} mt-8`} aria-label="Opening pack">
            <div className="livv-pack-aura" />
            <div className="livv-pack-light" />
            <div className="livv-pack-card-ghost" />
            <div className="livv-pack-shell">
              <div className="livv-pack-half livv-pack-half-top"><PackFoil grade={grade} size="lg" /></div>
              <div className="livv-pack-half livv-pack-half-bottom"><PackFoil grade={grade} size="lg" /></div>
              <div className="livv-pack-full"><PackFoil grade={grade} size="lg" /></div>
            </div>
            <div className="livv-pack-spark livv-pack-spark-1" />
            <div className="livv-pack-spark livv-pack-spark-2" />
            <div className="livv-pack-spark livv-pack-spark-3" />
            <div className="livv-pack-spark livv-pack-spark-4" />
          </div>
          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
            {openingStep === "charge" ? "Preparing" : openingStep === "tear" ? "Opening" : "Revealing"}
          </p>
          <style jsx>{`
            .livv-pack-stage{position:relative;width:188px;height:300px;perspective:1100px;transform-style:preserve-3d}
            .livv-pack-shell{position:absolute;inset:0;transform-style:preserve-3d}
            .livv-pack-full,.livv-pack-half{position:absolute;inset:0;display:flex;justify-content:center;overflow:hidden;transform-style:preserve-3d}
            .livv-pack-full{z-index:3;animation:packFloat 2s ease-in-out infinite}
            .livv-pack-half{z-index:4;opacity:0;pointer-events:none}
            .livv-pack-half-top{clip-path:inset(0 0 50% 0);transform-origin:50% 100%}
            .livv-pack-half-bottom{clip-path:inset(50% 0 0 0);transform-origin:50% 0%}
            .livv-pack-light{position:absolute;left:50%;top:50%;width:28px;height:120px;border-radius:999px;transform:translate(-50%,-50%) scaleY(.25);background:white;box-shadow:0 0 25px 10px rgba(255,255,255,.75),0 0 80px 30px rgba(76,141,255,.65);opacity:0;z-index:2}
            .livv-pack-card-ghost{position:absolute;left:50%;top:50%;width:92px;height:138px;border-radius:12px;transform:translate(-50%,-50%) translateY(70px) rotate(-3deg) scale(.72);background:linear-gradient(160deg,rgba(255,255,255,.96),rgba(210,225,255,.82));box-shadow:0 0 45px rgba(255,255,255,.5),0 25px 55px rgba(0,0,0,.55);opacity:0;z-index:1}
            .livv-pack-aura{position:absolute;inset:12%;border-radius:50%;background:radial-gradient(circle,rgba(76,141,255,.35),transparent 65%);filter:blur(18px);opacity:.25;z-index:0}
            .livv-pack-spark{position:absolute;left:50%;top:50%;width:4px;height:28px;border-radius:999px;background:white;box-shadow:0 0 12px rgba(255,255,255,.9);opacity:0;z-index:6}
            .livv-pack-spark-1{transform:translate(-50%,-50%) rotate(15deg)}.livv-pack-spark-2{transform:translate(-50%,-50%) rotate(70deg)}.livv-pack-spark-3{transform:translate(-50%,-50%) rotate(120deg)}.livv-pack-spark-4{transform:translate(-50%,-50%) rotate(-35deg)}
            .livv-pack-stage-charge .livv-pack-full{animation:packCharge .65s ease-in-out infinite alternate}
            .livv-pack-stage-charge .livv-pack-aura{animation:auraCharge .65s ease-in-out infinite alternate}
            .livv-pack-stage-tear .livv-pack-full{opacity:0}
            .livv-pack-stage-tear .livv-pack-half{opacity:1;animation:tearTop 1.05s cubic-bezier(.2,.8,.2,1) forwards}
            .livv-pack-stage-tear .livv-pack-half-bottom{animation-name:tearBottom}
            .livv-pack-stage-tear .livv-pack-light{animation:lightBreak 1.05s ease-out forwards}
            .livv-pack-stage-burst .livv-pack-full{opacity:0}
            .livv-pack-stage-burst .livv-pack-half{opacity:1}
            .livv-pack-stage-burst .livv-pack-half-top{transform:translateY(-105px) rotateX(22deg) rotateZ(-3deg)}
            .livv-pack-stage-burst .livv-pack-half-bottom{transform:translateY(105px) rotateX(-22deg) rotateZ(3deg)}
            .livv-pack-stage-burst .livv-pack-light{opacity:.95;animation:burstLight .45s ease-out forwards}
            .livv-pack-stage-burst .livv-pack-card-ghost{animation:cardLaunch .65s cubic-bezier(.15,.85,.2,1) forwards}
            .livv-pack-stage-burst .livv-pack-spark{animation:sparkOut .55s ease-out forwards}
            .livv-pack-stage-burst .livv-pack-spark-2{animation-delay:.04s}.livv-pack-stage-burst .livv-pack-spark-3{animation-delay:.08s}.livv-pack-stage-burst .livv-pack-spark-4{animation-delay:.12s}
            @keyframes packCharge{from{transform:translateY(0) scale(1) rotateZ(-1deg);filter:brightness(1)}to{transform:translateY(-3px) scale(1.025) rotateZ(1deg);filter:brightness(1.22)}}
            @keyframes auraCharge{from{opacity:.2;transform:scale(.92)}to{opacity:.55;transform:scale(1.08)}}
            @keyframes tearTop{0%{transform:translateY(0) rotateX(0)}100%{transform:translateY(-72px) rotateX(16deg) rotateZ(-2deg)}}
            @keyframes tearBottom{0%{transform:translateY(0) rotateX(0)}100%{transform:translateY(72px) rotateX(-16deg) rotateZ(2deg)}}
            @keyframes lightBreak{0%{opacity:0;transform:translate(-50%,-50%) scaleY(.2)}45%{opacity:.9;transform:translate(-50%,-50%) scaleY(1)}100%{opacity:.1;transform:translate(-50%,-50%) scaleY(1.35)}}
            @keyframes burstLight{0%{opacity:.2;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(3.8)}}
            @keyframes cardLaunch{0%{opacity:0;transform:translate(-50%,-50%) translateY(80px) rotate(-8deg) scale(.65)}35%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) translateY(-150px) rotate(2deg) scale(1.05)}}
            @keyframes sparkOut{0%{opacity:0;transform:translate(-50%,-50%) scale(.2) rotate(15deg)}30%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) translateX(95px) translateY(-55px) scale(.6) rotate(15deg)}}
            @keyframes packFloat{0%,100%{transform:translateY(0) rotateZ(0)}50%{transform:translateY(-5px) rotateZ(.5deg)}}
            @media(prefers-reduced-motion:reduce){.livv-pack-full,.livv-pack-aura,.livv-pack-half,.livv-pack-light,.livv-pack-card-ghost,.livv-pack-spark{animation:none!important}}
          `}</style>
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
