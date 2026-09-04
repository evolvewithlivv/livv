"use client";

import { RARITY_META, type CardDef } from "@/lib/packs";

export function CardFace({
  card,
  size = "md",
  reveal,
}: {
  card: CardDef;
  size?: "sm" | "md" | "lg";
  reveal?: boolean;
}) {
  const rarity = RARITY_META[card.rarity];
  const dims =
    size === "lg"
      ? "h-[320px] w-[210px]"
      : size === "sm"
        ? "h-[120px] w-[80px]"
        : "h-[200px] w-[132px]";

  return (
    <div
      className={`relative ${dims} overflow-hidden rounded-[16px] ${reveal ? "card-reveal" : ""}`}
      style={{
        background: `linear-gradient(160deg, hsl(${card.hue} 40% 12%), hsl(${card.hue} 50% 6%) 60%, #050505)`,
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.12),
          0 0 40px ${rarity.glow},
          0 24px 48px rgba(0,0,0,0.5)
        `,
      }}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(circle at 30% 20%, hsl(${card.hue} 80% 50% / 0.35), transparent 55%)`,
        }}
      />
      {/* placeholder art mark */}
      <div className="absolute inset-x-0 top-[18%] flex justify-center">
        <div
          className="rounded-full"
          style={{
            width: size === "lg" ? 72 : size === "sm" ? 28 : 48,
            height: size === "lg" ? 72 : size === "sm" ? 28 : 48,
            background: `radial-gradient(circle at 35% 30%, hsl(${card.hue} 70% 60% / 0.8), hsl(${card.hue} 50% 25% / 0.3))`,
            boxShadow: `0 0 30px hsl(${card.hue} 80% 50% / 0.4)`,
          }}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3">
        <p
          className="text-[9px] font-medium uppercase tracking-[0.2em]"
          style={{ color: rarity.glow.replace(/[\d.]+\)$/, "0.9)") }}
        >
          {rarity.label} · {card.pillar}
        </p>
        <p
          className="font-display mt-1 font-semibold leading-tight text-white"
          style={{ fontSize: size === "lg" ? 20 : size === "sm" ? 11 : 15 }}
        >
          {card.name}
        </p>
        {size !== "sm" && (
          <p className="mt-1 text-[11px] leading-snug text-white/45">{card.line}</p>
        )}
      </div>

      <style jsx>{`
        .card-reveal {
          animation: cardIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        @keyframes cardIn {
          0% {
            opacity: 0;
            transform: scale(0.85) rotateY(-12deg);
            filter: brightness(2);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateY(0);
            filter: brightness(1);
          }
        }
      `}</style>
    </div>
  );
}
