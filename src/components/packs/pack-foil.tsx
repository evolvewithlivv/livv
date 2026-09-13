"use client";

import { useState } from "react";
import { GRADE_META, type PackGrade } from "@/lib/packs";
import { PACK_ART } from "./pack-art";

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
  const [imageFailed, setImageFailed] = useState(false);
  const dims =
    size === "lg"
      ? "h-[300px] w-[188px]"
      : size === "sm"
        ? "h-[112px] w-[72px]"
        : "h-[184px] w-[116px]";

  return (
    <div className={`relative shrink-0 ${dims} ${pulse ? "pack-pulse" : ""}`}>
      <div className="livv-pack-frame shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
        {!imageFailed ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={`${PACK_ART[grade]}?v=2`}
            alt={meta.name}
            className="h-full w-full object-cover"
            draggable={false}
            loading="eager"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="livv-pack-fallback" aria-label={`${meta.name} artwork unavailable`}>
            <div className="text-center">
              <div
                className="mx-auto rounded-full"
                style={{
                  width: size === "lg" ? 72 : size === "sm" ? 28 : 48,
                  height: size === "lg" ? 72 : size === "sm" ? 28 : 48,
                  background: `radial-gradient(circle at 35% 30%, ${meta.foilTo}, ${meta.foilFrom})`,
                  boxShadow: `0 0 30px ${meta.foilTo}88`,
                }}
              />
              <span className="mt-2 block text-[8px] font-semibold uppercase tracking-[0.18em]" style={{ color: meta.foilTo }}>
                {meta.name.replace(" Pack", "")}
              </span>
            </div>
          </div>
        )}
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
    </div>
  );
}
