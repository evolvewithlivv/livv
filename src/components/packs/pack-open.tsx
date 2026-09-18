"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GRADE_META, openPack, rewardProgress, type CardDef, type PackGrade } from "@/lib/packs";
import { feedback } from "@/lib/sensory";
import { PackFoil } from "./pack-foil";
import { CardFace } from "./card-face";

type OpeningStep = "charge" | "tear" | "burst" | "emerge";

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
  const [openingStep, setOpeningStep] = useState<OpeningStep>("charge");
  const [result, setResult] = useState<ReturnType<typeof openPack>>(null);
  const meta = GRADE_META[grade];

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    let opened = false;
    const step1 = window.setTimeout(() => {
      setOpeningStep("tear");
      feedback("complete");
    }, 700);
    const step2 = window.setTimeout(() => {
      setOpeningStep("burst");
      feedback("unlock");
    }, 1350);
    const open = window.setTimeout(() => {
      const out = openPack(packId);
      if (!out) {
        onClose();
        return;
      }
      opened = true;
      setResult(out);
      onOpened?.(out.card);
      setOpeningStep("emerge");
    }, 1750);
    const reveal = window.setTimeout(() => {
      if (opened) setPhase("reveal");
    }, 2450);
    return () => {
      window.clearTimeout(step1);
      window.clearTimeout(step2);
      window.clearTimeout(open);
      window.clearTimeout(reveal);
    };
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
          <p className="mt-2 text-[13px] text-white/60">Open the standard.</p>

          <div className={`livv-pack-stage livv-pack-stage-${openingStep} mt-8`} aria-label="Opening pack">
            <div className="livv-pack-shadow" />
            <div className="livv-pack-aura" />
            <div className="livv-pack-light" />
            <div className="livv-pack-seam" />
            {result && (
              <div className="livv-pack-emerging-card">
                <CardFace card={result.card} size="lg" />
              </div>
            )}
            <div className="livv-pack-shell">
              <div className="livv-pack-half livv-pack-half-top"><PackFoil grade={grade} size="lg" /></div>
              <div className="livv-pack-half livv-pack-half-bottom"><PackFoil grade={grade} size="lg" /></div>
              <div className="livv-pack-full"><PackFoil grade={grade} size="lg" /></div>
            </div>
            {[1,2,3,4,5,6].map((n) => <div key={n} className={`livv-pack-spark livv-pack-spark-${n}`} />)}
          </div>

          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
            {openingStep === "charge" ? "Preparing" : openingStep === "tear" ? "Breaking the seal" : openingStep === "burst" ? "Opening" : "Pulling your card"}
          </p>

          <style jsx>{`
            .livv-pack-stage{position:relative;width:220px;height:340px;perspective:1200px;transform-style:preserve-3d;isolation:isolate}
            .livv-pack-shell{position:absolute;inset:0;transform-style:preserve-3d;z-index:5}
            .livv-pack-full,.livv-pack-half{position:absolute;inset:0;display:flex;justify-content:center;transform-style:preserve-3d;transform-origin:50% 50%}
            .livv-pack-full{z-index:3;animation:packFloat 2.2s ease-in-out infinite;filter:drop-shadow(0 28px 24px rgba(0,0,0,.55))}
            .livv-pack-half{z-index:4;opacity:0;pointer-events:none;overflow:visible}
            .livv-pack-half-top{clip-path:inset(0 0 50% 0);transform-origin:50% 100%}
            .livv-pack-half-bottom{clip-path:inset(50% 0 0 0);transform-origin:50% 0%}
            .livv-pack-shadow{position:absolute;left:50%;bottom:2px;width:145px;height:28px;transform:translateX(-50%);border-radius:50%;background:rgba(0,0,0,.7);filter:blur(14px);z-index:0}
            .livv-pack-aura{position:absolute;inset:8%;border-radius:50%;background:radial-gradient(circle,rgba(82,145,255,.28),transparent 67%);filter:blur(20px);opacity:.18;z-index:1}
            .livv-pack-light{position:absolute;left:50%;top:50%;width:18px;height:175px;border-radius:999px;transform:translate(-50%,-50%) scaleY(.1);background:white;box-shadow:0 0 30px 12px rgba(255,255,255,.85),0 0 100px 42px rgba(76,141,255,.62);opacity:0;z-index:4;pointer-events:none}
            .livv-pack-seam{position:absolute;left:50%;top:50%;width:2px;height:255px;transform:translate(-50%,-50%);border-radius:999px;background:linear-gradient(180deg,transparent,rgba(255,255,255,.9),transparent);box-shadow:0 0 14px rgba(255,255,255,.55);opacity:0;z-index:6;pointer-events:none}
            .livv-pack-emerging-card{position:absolute;left:50%;top:50%;z-index:2;transform:translate(-50%,-50%) translateY(70px) scale(.72) rotateY(-16deg) rotateZ(-3deg);opacity:0;filter:brightness(1.35) drop-shadow(0 20px 35px rgba(0,0,0,.55));pointer-events:none}
            .livv-pack-spark{position:absolute;left:50%;top:50%;width:3px;height:34px;border-radius:999px;background:white;box-shadow:0 0 14px rgba(255,255,255,.95);opacity:0;z-index:8;pointer-events:none}
            .livv-pack-spark-1{transform:translate(-50%,-50%) rotate(12deg)}.livv-pack-spark-2{transform:translate(-50%,-50%) rotate(52deg)}.livv-pack-spark-3{transform:translate(-50%,-50%) rotate(91deg)}.livv-pack-spark-4{transform:translate(-50%,-50%) rotate(132deg)}.livv-pack-spark-5{transform:translate(-50%,-50%) rotate(-32deg)}.livv-pack-spark-6{transform:translate(-50%,-50%) rotate(-72deg)}
            .livv-pack-stage-charge .livv-pack-full{animation:packCharge .7s ease-in-out infinite alternate}
            .livv-pack-stage-charge .livv-pack-aura{animation:auraCharge .7s ease-in-out infinite alternate}
            .livv-pack-stage-charge .livv-pack-seam{animation:seamCharge .7s ease-in-out infinite alternate}
            .livv-pack-stage-tear .livv-pack-full{opacity:0}
            .livv-pack-stage-tear .livv-pack-half{opacity:1;animation:tearTop 1.05s cubic-bezier(.16,.84,.22,1) forwards}
            .livv-pack-stage-tear .livv-pack-half-bottom{animation-name:tearBottom}
            .livv-pack-stage-tear .livv-pack-light{animation:lightBreak 1.05s ease-out forwards}
            .livv-pack-stage-tear .livv-pack-seam{animation:seamBreak 1.05s ease-out forwards}
            .livv-pack-stage-burst .livv-pack-full{opacity:0}
            .livv-pack-stage-burst .livv-pack-half{opacity:1}
            .livv-pack-stage-burst .livv-pack-half-top{transform:translateY(-112px) translateX(-5px) rotateX(24deg) rotateY(-4deg) rotateZ(-3deg)}
            .livv-pack-stage-burst .livv-pack-half-bottom{transform:translateY(112px) translateX(5px) rotateX(-24deg) rotateY(4deg) rotateZ(3deg)}
            .livv-pack-stage-burst .livv-pack-light{animation:burstLight .55s ease-out forwards}
            .livv-pack-stage-burst .livv-pack-aura{animation:auraBurst .65s ease-out forwards}
            .livv-pack-stage-burst .livv-pack-spark{animation:sparkOut .7s cubic-bezier(.15,.8,.2,1) forwards}
            .livv-pack-stage-burst .livv-pack-spark-2{animation-delay:.04s}.livv-pack-stage-burst .livv-pack-spark-3{animation-delay:.08s}.livv-pack-stage-burst .livv-pack-spark-4{animation-delay:.12s}.livv-pack-stage-burst .livv-pack-spark-5{animation-delay:.16s}.livv-pack-stage-burst .livv-pack-spark-6{animation-delay:.2s}
            .livv-pack-stage-emerge .livv-pack-full{opacity:0}
            .livv-pack-stage-emerge .livv-pack-half{opacity:1;transition:transform .7s cubic-bezier(.2,.8,.2,1)}
            .livv-pack-stage-emerge .livv-pack-half-top{transform:translateY(-135px) translateX(-9px) rotateX(30deg) rotateY(-8deg) rotateZ(-5deg)}
            .livv-pack-stage-emerge .livv-pack-half-bottom{transform:translateY(135px) translateX(9px) rotateX(-30deg) rotateY(8deg) rotateZ(5deg)}
            .livv-pack-stage-emerge .livv-pack-emerging-card{animation:cardEmerge 1.05s cubic-bezier(.15,.85,.2,1) forwards}
            .livv-pack-stage-emerge .livv-pack-aura{animation:auraReveal 1.05s ease-out forwards}
            @keyframes packCharge{from{transform:translateY(0) scale(1) rotateZ(-1deg) rotateY(-1deg);filter:brightness(1)}to{transform:translateY(-5px) scale(1.035) rotateZ(1deg) rotateY(2deg);filter:brightness(1.2)}}
            @keyframes auraCharge{from{opacity:.18;transform:scale(.9)}to{opacity:.5;transform:scale(1.1)}}
            @keyframes seamCharge{from{opacity:.08;transform:translate(-50%,-50%) scaleY(.65)}to{opacity:.55;transform:translate(-50%,-50%) scaleY(1)}}
            @keyframes tearTop{0%{transform:translateY(0) rotateX(0) rotateY(0)}100%{transform:translateY(-82px) translateX(-3px) rotateX(19deg) rotateY(-5deg) rotateZ(-2deg)}}
            @keyframes tearBottom{0%{transform:translateY(0) rotateX(0) rotateY(0)}100%{transform:translateY(82px) translateX(3px) rotateX(-19deg) rotateY(5deg) rotateZ(2deg)}}
            @keyframes lightBreak{0%{opacity:0;transform:translate(-50%,-50%) scaleY(.1)}42%{opacity:.95;transform:translate(-50%,-50%) scaleY(1)}100%{opacity:.12;transform:translate(-50%,-50%) scaleY(1.4)}}
            @keyframes seamBreak{0%{opacity:.3;transform:translate(-50%,-50%) scaleY(.5)}55%{opacity:1;transform:translate(-50%,-50%) scaleY(1.1)}100%{opacity:0;transform:translate(-50%,-50%) scaleY(1.6)}}
            @keyframes burstLight{0%{opacity:.25;transform:translate(-50%,-50%) scale(.6)}45%{opacity:1;transform:translate(-50%,-50%) scale(1.3)}100%{opacity:0;transform:translate(-50%,-50%) scale(4.4)}}
            @keyframes auraBurst{0%{opacity:.2;transform:scale(.9)}35%{opacity:.9;transform:scale(1.2)}100%{opacity:0;transform:scale(1.55)}}
            @keyframes cardEmerge{0%{opacity:0;transform:translate(-50%,-50%) translateY(85px) scale(.62) rotateY(-20deg) rotateZ(-4deg);filter:brightness(2.2) drop-shadow(0 0 25px rgba(255,255,255,.8))}35%{opacity:1}72%{opacity:1;transform:translate(-50%,-50%) translateY(-36px) scale(.93) rotateY(8deg) rotateZ(1deg);filter:brightness(1.25) drop-shadow(0 25px 45px rgba(0,0,0,.65))}100%{opacity:1;transform:translate(-50%,-50%) translateY(-70px) scale(1) rotateY(0) rotateZ(0);filter:brightness(1) drop-shadow(0 30px 50px rgba(0,0,0,.65))}}
            @keyframes sparkOut{0%{opacity:0;transform:translate(-50%,-50%) scale(.2) rotate(20deg)}25%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) translateX(105px) translateY(-72px) scale(.45) rotate(20deg)}}
            @keyframes packFloat{0%,100%{transform:translateY(0) rotateZ(0) rotateY(-1deg)}50%{transform:translateY(-6px) rotateZ(.6deg) rotateY(1deg)}}
            @keyframes auraReveal{0%{opacity:.6;transform:scale(1)}100%{opacity:.05;transform:scale(1.35)}}
            @media(max-width:420px){.livv-pack-stage{transform:scale(.88);margin-bottom:-25px}}
            @media(prefers-reduced-motion:reduce){.livv-pack-full,.livv-pack-aura,.livv-pack-seam,.livv-pack-half,.livv-pack-light,.livv-pack-emerging-card,.livv-pack-spark{animation:none!important}}
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
