"use client";

import { GRADE_META, type PackGrade } from "@/lib/packs";

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
      ? "h-[280px] w-[180px]"
      : size === "sm"
        ? "h-[96px] w-[62px]"
        : "h-[160px] w-[104px]";

  return (
    <div className={`relative ${dims} ${pulse ? "pack-pulse" : ""}`}>
      <div
        className="absolute inset-0 overflow-hidden rounded-[14px]"
        style={{
          background: `linear-gradient(145deg, ${meta.foilFrom} 0%, ${meta.foilTo} 48%, ${meta.foilFrom} 100%)`,
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.18),
            0 20px 50px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.35),
            inset 0 -20px 40px rgba(0,0,0,0.25)
          `,
        }}
      >
        <div
          className="pointer-events-none absolute -left-1/2 top-0 h-full w-[200%] opacity-40"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%)",
            animation: pulse ? "sheen 2.4s ease-in-out infinite" : undefined,
          }}
        />
        <div className="absolute inset-x-0 top-0 h-3 bg-black/20" />
        <div className="absolute inset-x-0 top-3 h-px bg-white/25" />
        <div className="absolute inset-x-0 bottom-0 h-3 bg-black/25" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          <p
            className="font-display font-bold tracking-[0.2em] text-white"
            style={{ fontSize: size === "lg" ? 22 : size === "sm" ? 9 : 13 }}
          >
            LIVV
          </p>
          <div
            className="my-2 rounded-full"
            style={{
              width: size === "lg" ? 36 : 22,
              height: size === "lg" ? 36 : 22,
              boxShadow: "0 0 0 1.5px rgba(255,255,255,0.5), inset 0 0 12px rgba(255,255,255,0.2)",
              background: "rgba(0,0,0,0.25)",
            }}
          />
          <p
            className="font-medium uppercase tracking-[0.14em] text-white/90"
            style={{ fontSize: size === "lg" ? 10 : size === "sm" ? 5.5 : 7.5 }}
          >
            {meta.name}
          </p>
        </div>
      </div>

      <style jsx>{`
        .pack-pulse {
          animation: packFloat 3s ease-in-out infinite;
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
            transform: translateX(-30%);
          }
          100% {
            transform: translateX(30%);
          }
        }
      `}</style>
    </div>
  );
}
