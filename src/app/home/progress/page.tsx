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

  return (
    <main className="pt-8 pb-6">
      <Container>
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-livv-muted">
          Scoreboard
        </p>
        <h1 className="mt-2 text-[2.4rem] font-semibold leading-none tracking-tight">Progress</h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/45">
          Built from what you actually logged. Empty days stay empty.
        </p>

        <section className="mt-8 rounded-3xl border border-livv-border bg-livv-surface p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-livv-muted">This week</p>
              <p className="mt-1 text-4xl font-semibold leading-none tracking-tight">
                {hits} / 7
              </p>
            </div>
            <p className="text-sm text-livv-accent-soft">{hits >= 4 ? "On pace" : "Build it"}</p>
          </div>
          <div className="mt-6 flex h-28 items-end justify-between gap-2">
            {week.map((day) => (
              <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-20 w-full items-end rounded-full bg-black/40">
                  <div
                    className="w-full rounded-full bg-gradient-to-t from-livv-accent to-livv-energy"
                    style={{ height: `${Math.max(day.v, day.active ? 12 : 0)}%` }}
                  />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-livv-muted">{day.d}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-2.5">
          {[
            { label: "Workouts", value: String(rec.workoutsCompleted) },
            { label: "Objectives", value: String(rec.goalsCompleted) },
            { label: "Streak", value: `${rec.streak}d` },
            { label: "Level", value: String(rec.level) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-livv-border bg-livv-surface px-4 py-4"
            >
              <p className="text-[10px] uppercase tracking-[0.22em] text-livv-muted">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold leading-none tracking-tight">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">Pillars</p>
          <div className="space-y-2.5">
            {pillars.map((pillar) => (
              <div key={pillar.id} className="rounded-2xl border border-livv-border bg-livv-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold leading-none tracking-tight">{pillar.name}</p>
                  <span className="text-xs text-livv-accent-soft">Lv {pillar.level}</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/50">
                  <div className="h-full rounded-full bg-livv-accent" style={{ width: `${pillar.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
