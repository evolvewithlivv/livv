"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
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

  if (!rec) return null;

  const week = weekBars(rec);
  const hits = weekHitCount(rec);
  const pillars = livePillars(rec);
  const empty = rec.workoutsCompleted === 0 && rec.goalsCompleted === 0 && rec.streak === 0;
  const evo = evolutionTitle(rec.level);
  const strong = strongestPillar(rec);
  const weak = needsAttention(rec);

  let weekMessage = "Build the week.";
  if (hits >= 5) weekMessage = "You showed up more than most weeks. Keep the line.";
  else if (hits >= 3) weekMessage = "Momentum is forming. Do not treat the rest of the week casually.";
  else if (hits >= 1) weekMessage = "Signal exists. Stack another day.";
  else weekMessage = "Empty board. One action changes that.";

  const shareRecap = async () => {
    feedback("tick");
    const text = `LIVV week · ${hits}/7 days · streak ${rec.streak} · ${evo.name} Lv ${rec.level} · ${rec.workoutsCompleted} sessions · strongest ${strong.name}`;
    try {
      if (navigator.share) await navigator.share({ title: "LIVV", text });
      else await navigator.clipboard.writeText(text);
    } catch {
      // cancelled
    }
  };

  return (
    <main className="relative overflow-hidden pt-8 pb-6">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-livv-gradient opacity-70" />
      <Container className="relative">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-livv-muted">The long view</p>
        <h1 className="font-display mt-2 text-[2.4rem] font-semibold leading-none tracking-tight">Progress</h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/45">
          Where you are improving. Where you are neglecting yourself. What is changing.
        </p>

        {empty ? (
          <div className="mt-10 rounded-[24px] border border-livv-border bg-livv-surface px-6 py-12 text-center">
            <p className="text-[18px] font-semibold tracking-tight">No signal yet</p>
            <p className="mt-2 text-sm text-white/45">
              Complete one action. This page only tells the truth.
            </p>
          </div>
        ) : (
          <>
            <section className="mt-8 rounded-3xl border border-livv-border bg-livv-surface/95 p-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-livv-muted">This week</p>
                  <p className="font-display mt-1 text-4xl font-semibold leading-none tracking-tight">
                    {hits} / 7
                  </p>
                </div>
                <button
                  type="button"
                  onClick={shareRecap}
                  className="rounded-full border border-livv-border px-3 py-1.5 text-[12px] text-livv-accent-soft"
                >
                  Share recap
                </button>
              </div>
              <p className="mt-2 text-sm text-white/50">{weekMessage}</p>
              <div className="mt-6 flex h-28 items-end justify-between gap-2">
                {week.map((day) => (
                  <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-20 w-full items-end rounded-full bg-black/40">
                      <div
                        className="w-full rounded-full bg-gradient-to-t from-livv-accent to-livv-energy transition-all duration-700"
                        style={{ height: `${Math.max(day.v, day.active ? 12 : 0)}%` }}
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-livv-muted">{day.d}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-livv-border bg-livv-surface px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-livv-muted">Strongest</p>
                <p className="mt-2 text-lg font-semibold">{strong.name}</p>
                <p className="text-xs text-livv-accent-soft">Level {strong.level}</p>
              </div>
              <div className="rounded-2xl border border-livv-border bg-livv-surface px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-livv-muted">Needs attention</p>
                <p className="mt-2 text-lg font-semibold">{weak.name}</p>
                <p className="text-xs text-white/40">Level {weak.level}</p>
              </div>
            </section>

            <section className="mt-4 rounded-2xl border border-livv-border bg-livv-surface px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-livv-muted">Evolution</p>
              <p className="font-display mt-1 text-2xl font-semibold">
                Level {rec.level} · {evo.name}
              </p>
              <p className="mt-1 text-sm text-white/45">{evo.line}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-livv-accent"
                  style={{ width: `${Math.min(100, (rec.currentXp / rec.xpToNext) * 100)}%` }}
                />
              </div>
            </section>

            <section className="mt-6 grid grid-cols-2 gap-2.5">
              {[
                { label: "Sessions", value: String(rec.workoutsCompleted) },
                { label: "Actions", value: String(rec.goalsCompleted) },
                { label: "Streak", value: `${rec.streak}d` },
                { label: "XP bank", value: String(rec.currentXp) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-livv-border bg-livv-surface px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-livv-muted">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold leading-none tracking-tight">{stat.value}</p>
                </div>
              ))}
            </section>

            <section className="mt-8">
              <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">Pillar levels</p>
              <div className="space-y-2.5">
                {pillars.map((pillar) => (
                  <div key={pillar.id} className="rounded-2xl border border-livv-border bg-livv-surface p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold leading-none tracking-tight">{pillar.name}</p>
                      <span className="text-xs text-livv-accent-soft">Lv {pillar.level}</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/50">
                      <div
                        className="h-full rounded-full bg-livv-accent transition-all duration-700"
                        style={{ width: `${pillar.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </Container>
    </main>
  );
}
