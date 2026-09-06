"use client";

import { PACK_ART } from "./pack-art";
import { GRADE_META, type PackGrade } from "@/lib/packs";

export function PackRip({
  grade,
  ripping,
}: {
  grade: PackGrade;
  ripping: boolean;
}) {
  const src = PACK_ART[grade];
  const name = GRADE_META[grade].name;

  return (
    <div className={`pack-env ${ripping ? "pack-env-on" : ""}`}>
      <div className="pack-env-slot" />
      <div className="pack-env-body">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} draggable={false} />
      </div>
      <div className="pack-env-flap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" draggable={false} />
      </div>
      <div className="pack-env-sheen" />
    </div>
  );
}
