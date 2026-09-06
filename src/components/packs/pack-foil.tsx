"use client";

import { GRADE_META, type PackGrade } from "@/lib/packs";

const RAW = "https://raw.githubusercontent.com/evolvewithlivv/livv/main";

const PACK_ART: Record<PackGrade, string> = {
  1: `${RAW}/public%3Apacks%3Aspark.jpg.PNG`,
  2: `${RAW}/public%3Apacks%3Arise.jpg.PNG`,
  3: `${RAW}/public%3Apacks%3Asignal.jpg.PNG`,
  4: `${RAW}/public%3Apacks%3Aapex.jpg.PNG`,
};

export function PackFoil({
  grade,
  size = "md",
  pulse,
}: {
  grade: PackGrade;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}) {
  const meta = GRADE_META[grade];
  const dims =
    size === "lg"
      ? "h-[300px] w-[188px]"
      : size === "sm"
        ? "h-[104px] w-[66px]"
        : "h-[176px] w-[110px]";

  return (
    <div className={`relative ${dims} ${pulse ? "pack-pulse" : ""}`}>
      <div className="absolute inset-0 overflow-hidden rounded-[16px] bg-black shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PACK_ART[grade]}
          alt={meta.name}
          className="h-full w-full object-cover"
          draggable={false}
        />
        <div
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.22) 0%, transparent 38%, rgba(0,0,0,0.16) 72%, rgba(255,255,255,0.1) 100%)",
          }}
        />
        {pulse && (
          <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-[220%] pack-sheen" />
        )}
      </div>

      <style jsx>{`
        .pack-pulse {
          animation: packFloat 3s ease-in-out infinite;
        }
        .pack-sheen {
          background: linear-gradient(
            105deg,
            transparent 42%,
            rgba(255, 255, 255, 0.28) 50%,
            transparent 58%
          );
          animation: sheen 2.6s ease-in-out infinite;
        }
        @keyframes packFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes sheen {
          0% {
            transform: translateX(-28%);
          }
          100% {
            transform: translateX(28%);
          }
        }
      `}</style>
    </div>
  );
}
