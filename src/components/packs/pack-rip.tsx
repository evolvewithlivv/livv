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
    <div className={`relative h-[300px] w-[188px] ${ripping ? "pack-rip-on" : ""}`}>
      <div className="pack-rip-half pack-rip-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} draggable={false} />
      </div>
      <div className="pack-rip-half pack-rip-right">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" draggable={false} />
      </div>
      <div className="pack-rip-seam" />
      <div className="pack-rip-ember e1" />
      <div className="pack-rip-ember e2" />
      <div className="pack-rip-ember e3" />
      <div className="pack-rip-ember e4" />
      <div className="pack-rip-ember e5" />
    </div>
  );
}
