"use client";

import { useMemo } from "react";
import type { LivvRecord } from "@/lib/record";
import { dayKey } from "@/lib/dates";

const COLORS = ["#0F7FFF", "#F93827", "#F61981", "#FF9D23", "#9A00FF", "#4DFF00", "#FCF927"];

function buildDays(rec: LivvRecord, count = 14) {
  const days: { key: string; label: string; active: boolean; score: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const log = rec.days[key];
    const actions = (log?.objectives?.length || 0) + (log?.custom?.length || 0);
    const score = Math.min(4, (log?.checkIn ? 1 : 0) + (log?.workout ? 2 : 0) + (actions ? 1 : 0));
    days.push({ key, label: d.toLocaleDateString(undefined, { weekday: "narrow" }), active: score > 0, score });
  }
  return days;
}

export function ActivityConstellation({ rec }: { rec: LivvRecord }) {
  const days = useMemo(() => buildDays(rec), [rec]);
  const active = days.filter((d) => d.active).length;
  const average = days.length ? Math.round((days.reduce((sum, d) => sum + d.score, 0) / (days.length * 4)) * 100) : 0;

  return (
    <section className="relative mt-7 overflow-hidden rounded-[30px] border border-white/10 bg-white/[.025] p-5">
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#0F7FFF]/[.06] blur-3xl" />
      <div className="relative flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-white/40">Activity field</p>
          <h2 className="font-display mt-1 text-[23px]">Fourteen days in motion.</h2>
        </div>
        <div className="text-right">
          <p className="font-display text-[22px] font-semibold">{active}<span className="text-white/35">/14</span></p>
          <p className="text-[9px] uppercase tracking-[.16em] text-white/35">active days</p>
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const color = COLORS[index % COLORS.length];
          return (
            <div key={day.key} className="group relative flex flex-col items-center gap-2">
              <div
                className="relative grid h-9 w-9 place-items-center rounded-full border transition duration-300 group-hover:scale-110"
                style={{
                  borderColor: day.active ? `${color}70` : "rgba(255,255,255,.08)",
                  background: day.active ? `${color}${day.score === 4 ? "24" : day.score >= 2 ? "16" : "0B"}` : "rgba(255,255,255,.025)",
                  boxShadow: day.active ? `0 0 ${8 + day.score * 3}px ${color}${day.score === 4 ? "35" : "18"}` : "none",
                }}
              >
                <span
                  className="rounded-full transition-all duration-500"
                  style={{ width: `${6 + day.score * 3}px`, height: `${6 + day.score * 3}px`, background: day.active ? color : "rgba(255,255,255,.14)" }}
                />
              </div>
              <span className="text-[8px] uppercase tracking-[.1em] text-white/30">{day.label}</span>
              <span className="sr-only">{day.key}: {day.active ? `${day.score} of 4 activity` : "no activity"}</span>
            </div>
          );
        })}
      </div>

      <div className="relative mt-6 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0F7FFF] shadow-[0_0_10px_#0F7FFF]" />
            <span className="truncate text-[9px] font-semibold uppercase tracking-[.16em] text-white/40">Activity density</span>
          </div>
          <span className="font-display text-[15px]">{average}%</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[.07]">
          <div className="h-full rounded-full bg-[#0F7FFF] transition-[width] duration-700" style={{ width: `${average}%` }} />
        </div>
      </div>
    </section>
  );
}
