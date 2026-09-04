"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AmbientField } from "@/components/layout/ambient-field";
import {
  livePillars,
  loadRecord,
  weekBars,
  weekHitCount,
  type LivvRecord,
} from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { needsAttention, strongestPillar } from "@/lib/command";
import { feedback } from "@/lib/sensory";

export default function ProgressPage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);

  useEffect(() => {
    const sync = () => setRec(loadRecord());
    sync();
    window.addEventListener("livv-record", sync);
    return () => window.removeEventListener("livv-record", sync);
  }, []);

  if (!rec) return <main className="min-h-dvh bg-[#050505]" />;

  const week = weekBars(rec);
  const hits = weekHitCount(rec);
  const pillars = livePillars(rec);
  const empty = rec.workoutsCompleted === 0 && rec.goalsCompleted === 0 && rec.streak === 0;
  const evo = evolutionTitle(rec.level);
  const strong = strongestPillar(rec);
  const weak = needsAttention(rec);

  let weekMessage = "Empty board. One action changes that.";
  if (hits >= 5) weekMessage = "You showed up more than most weeks. Keep the line.";
  else if (hits >= 3) weekMessage = "Momentum is forming. Do not treat the rest of the week casually.";
  else if (hits >= 1) weekMessage = "Signal exists. Stack another day.";

  const shareRecap = async () => {
    feedback("tick");
    const text = `LIVV · ${hits}/7 days · streak ${rec.streak} · ${evo.name} Lv ${rec.level} · strongest ${strong.name}`;
    try {
      if (navigator.share) await navigator.share({ title: "LIVV", text });
      else await navigator.clipboard.writeText(text);
    } catch {
      /* cancelled */
    }
  };

  return (
    <main className="relative min-h-full overflow-hidden pb-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div
          className="absolute right-[-20%] top-10 h-[300px] w-[300px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgb(var(--livv-accent) / 0.14), transparent 70%)",
          }}
        />
        <AmbientField />
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/30">Long view</p>
        <h1 className="font-display mt-2 text-[34px] font-semibold tracking-tight">Progress</h1>
        <p className="mt-2 max-w-[26ch] text-[14px] text-white/40">
          Where you are improving. Where you are quiet. What is changing.
        </p>

        {empty ? (
          <div className="mt-16 text-center">
            <p className="font-display text-[22px]">No signal yet</p>
            <p className="mt-2 text-[14px] text-white/40">Complete one action. This page only tells the truth.</p>
            <Link href="/home" className="mt-8 inline-block text-[14px] text-livv-accent-soft">
              Open command center →
            </Link>
          </div>
        ) : (
          <>
            <section className="mt-12">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">This week</p>
              <p className="font-display mt-3 text-[56px] font-semibold leading-none tracking-tight">
                {hits}
                <span className="text-[28px] text-white/30"> / 7</span>
              </p>
              <p className="mt-3 max-w-[30ch] text-[15px] text-white/55">{weekMessage}</p>

              <div className="mt-8 flex h-24 items-end justify-between gap-2">
                {week.map((day) => (
                  <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-full transition-all duration-700"
                      style={{
                        height: `${Math.max(day.v, day.active ? 14 : 4)}%`,
                        minHeight: day.active ? 14 : 4,
                        background: day.active
                          ? "linear-gradient(to top, rgb(var(--livv-accent)), rgb(var(--livv-accent-soft) / 0.7))"
                          : "rgba(255,255,255,0.08)",
                        boxShadow: day.active ? "0 0 16px rgb(var(--livv-accent) / 0.35)" : "none",
                      }}
                    />
                    <span className="text-[10px] tracking-wider text-white/30">{day.d}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={shareRecap}
                className="mt-6 text-[13px] text-livv-accent-soft"
              >
                Share week recap →
              </button>
            </section>

            <section className="mt-14 grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Strongest</p>
                <p className="mt-2 text-[22px] font-semibold">{strong.name}</p>
                <p className="text-[13px] text-livv-accent-soft">Level {strong.level}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Needs weight</p>
                <p className="mt-2 text-[22px] font-semibold">{weak.name}</p>
                <p className="text-[13px] text-white/40">Level {weak.level}</p>
              </div>
            </section>

            <section className="mt-14">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Evolution</p>
              <p className="font-display mt-2 text-[28px] font-semibold">
                Level {rec.level}
              </p>
              <p className="text-[14px] text-livv-accent-soft">{evo.name}</p>
              <p className="mt-2 max-w-[28ch] text-[13px] text-white/40">{evo.line}</p>
            </section>

            <section className="mt-14">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Pillars</p>
              <div className="mt-6 space-y-5">
                {pillars.map((p) => (
                  <div key={p.id}>
                    <div className="flex items-baseline justify-between">
                      <p className="text-[16px] font-medium">{p.name}</p>
                      <p className="text-[12px] text-white/35">Lv {p.level}</p>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-livv-accent transition-all duration-700"
                        style={{
                          width: `${p.progress}%`,
                          boxShadow: "0 0 12px rgb(var(--livv-accent) / 0.4)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-14 flex gap-8 text-[14px] text-white/45">
              <div>
                <p className="text-[22px] font-semibold text-white">{rec.workoutsCompleted}</p>
                <p className="text-[11px] text-white/30">Sessions</p>
              </div>
              <div>
                <p className="text-[22px] font-semibold text-white">{rec.goalsCompleted}</p>
                <p className="text-[11px] text-white/30">Actions</p>
              </div>
              <div>
                <p className="text-[22px] font-semibold text-white">{rec.streak}d</p>
                <p className="text-[11px] text-white/30">Streak</p>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
