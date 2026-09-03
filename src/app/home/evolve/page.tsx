"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { activityFromObjective } from "@/lib/activity";
import {
  liveAchievements,
  livePillars,
  loadRecord,
  setObjective,
  todaysObjectives,
  type LivvRecord,
} from "@/lib/record";
import { feedback } from "@/lib/sensory";

export default function EvolvePage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);

  const sync = () => setRec(loadRecord());

  useEffect(() => {
    sync();
    window.addEventListener("livv-record", sync);
    return () => window.removeEventListener("livv-record", sync);
  }, []);

  if (!rec) return null;

  const objectives = todaysObjectives(rec);
  const pillars = livePillars(rec);
  const achievements = liveAchievements(rec);
  const completedCount = objectives.filter((o) => o.completed).length;
  const xpProgress = Math.round((rec.currentXp / rec.xpToNext) * 100);

  const toggleObjective = (id: string, title: string, pillar: string, xp: number, next: boolean) => {
    const updated = setObjective(id, next);
    if (next) {
      activityFromObjective({ objectiveTitle: title, pillar, xp });
      feedback("checkin");
    } else {
      feedback("tick");
    }
    setRec(updated);
  };

  return (
    <main className="relative overflow-hidden pt-8 pb-6">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-livv-gradient opacity-50" />
      <Container className="relative">
        <div className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-livv-muted">Identity</p>
          <h1 className="mt-2 text-[2.4rem] font-semibold leading-none tracking-tight">Evolve</h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/45">
            Growth across every dimension. Check the boxes that matter today.
          </p>
        </div>

        <section className="mb-6 rounded-3xl border border-livv-border bg-livv-surface/95 p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-livv-muted">Evolution Level</p>
              <p className="mt-1 text-5xl font-semibold leading-none tracking-tight">{rec.level}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-livv-muted">Streak</p>
              <p className="mt-1 text-lg font-medium text-livv-accent-soft">{rec.streak} days</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs text-livv-muted">
              <span>
                {rec.currentXp} / {rec.xpToNext} XP
              </span>
              <span>{xpProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-livv-accent to-livv-energy transition-all duration-700"
                style={{ width: `${Math.min(xpProgress, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-livv-muted">
              {rec.xpToNext - rec.currentXp} XP to Level {rec.level + 1}
            </p>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.22em] text-livv-muted">Today&apos;s Objectives</p>
            <p className="text-xs text-livv-muted">
              {completedCount}/{objectives.length}
            </p>
          </div>

          <div className="space-y-2">
            {objectives.map((obj) => (
              <button
                key={obj.id}
                onClick={() => toggleObjective(obj.id, obj.title, obj.pillar, obj.xp, !obj.completed)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all active:scale-[0.99]",
                  obj.completed
                    ? "border-livv-accent/40 bg-livv-accent/10"
                    : "border-livv-border bg-livv-surface"
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs",
                    obj.completed
                      ? "border-livv-accent bg-livv-accent text-white"
                      : "border-livv-border"
                  )}
                >
                  {obj.completed && "✓"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium", obj.completed && "text-white/50 line-through")}>
                    {obj.title}
                  </p>
                  <p className="mt-0.5 text-xs text-livv-muted">
                    {obj.pillar} · +{obj.xp} XP
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">Evolution Pillars</p>
          <div className="grid grid-cols-2 gap-2.5">
            {pillars.map((pillar) => (
              <div key={pillar.id} className="rounded-2xl border border-livv-border bg-livv-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold leading-none tracking-tight">{pillar.name}</p>
                  <span className="text-xs text-livv-accent-soft">Lv {pillar.level}</span>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-livv-muted">{pillar.description}</p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-black/50">
                  <div
                    className="h-full bg-livv-accent/80 transition-all duration-700"
                    style={{ width: `${pillar.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">Achievements</p>
          <div className="space-y-2">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3.5",
                  ach.unlocked
                    ? "border-livv-border bg-livv-surface"
                    : "border-livv-border/50 bg-black/20 opacity-55"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/50 text-lg">
                  {ach.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{ach.title}</p>
                  <p className="text-xs text-livv-muted">{ach.description}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/35">
                  {ach.unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
