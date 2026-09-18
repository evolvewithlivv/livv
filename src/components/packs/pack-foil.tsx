"use client";

import { PACK_ART } from "./pack-art";
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
  const src = PACK_ART[grade];
  const dims =
    size === "lg"
      ? "h-[300px] w-[188px]"
      : size === "sm"
        ? "h-[112px] w-[72px]"
        : "h-[184px] w-[116px]";

  return (
    <div className={`relative shrink-0 ${dims} ${pulse ? "pack-pulse" : ""}`}>
      <div className="relative h-full w-full overflow-hidden rounded-[18px]">
        {/* Use the actual LIVV pack artwork uploaded for each tier — no generated placeholder foil. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={meta.name}
          draggable={false}
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
