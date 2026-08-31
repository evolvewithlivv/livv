"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import {
  PILLARS,
  INITIAL_OBJECTIVES,
  ACHIEVEMENTS,
  EVOLUTION_STATS,
  type Objective,
  type Achievement,
} from "@/lib/evolve-data";
import {
  activityFromObjective,
  activityFromAchievement,
  activityFromLevelUp,
} from "@/lib/activity";

export default function EvolvePage() {
  const [objectives, setObjectives] = useState<Objective[]>(INITIAL_OBJECTIVES);
  const [stats, setStats] = useState(EVOLUTION_STATS);
  const [achievements, setAchievements] =
    useState<Achievement[]>(ACHIEVEMENTS);

  const completedCount = objectives.filter((o) => o.completed).length;
  const xpProgress = Math.round((stats.currentXp / stats.xpToNext) * 100);

  const toggleObjective = (id: string) => {
    setObjectives((prev) =>
      prev.map((obj) => {
        if (obj.id !== id) return obj;
        const next = !obj.completed;

        if (next) {
          activityFromObjective({
            objectiveTitle: obj.title,
            pillar: obj.pillar,
            xp: obj.xp,
          });

          setStats((s) => {
            const newXp = s.currentXp + obj.xp;
            let level = s.level;
            let currentXp = newXp;
            let xpToNext = s.xpToNext;

            if (currentXp >= xpToNext) {
              level += 1;
              currentXp = currentXp - xpToNext;
              xpToNext = Math.round(xpToNext * 1.25);
              activityFromLevelUp({ level });
            }

            return {
              ...s,
              currentXp,
              xpToNext,
              level,
              goalsCompletedToday: s.goalsCompletedToday + 1,
            };
          });

          setAchievements((achs) =>
            achs.map((a) => {
              if (a.id === "a1" && !a.unlocked) {
                activityFromAchievement({
                  title: a.title,
                  description: a.description,
                  icon: a.icon,
                  xp: 50,
                });
                return { ...a, unlocked: true };
              }
              return a;
            })
          );
        } else {
          setStats((s) => ({
            ...s,
            currentXp: Math.max(0, s.currentXp - obj.xp),
            goalsCompletedToday: Math.max(0, s.goalsCompletedToday - 1),
          }));
        }

        return { ...obj, completed: next };
      })
    );
  };

  return (
    <main className="pt-8 pb-6">
      <Container>
        <div className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-livv-muted">
            Identity
          </p>
          <h1 className="mt-2 font-display text-[2.4rem] leading-none">Evolve</h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/45">
            Growth across every dimension. Check the boxes that matter today.
          </p>
        </div>

        <section className="mb-6 rounded-3xl border border-livv-border bg-livv-surface p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-livv-muted">
                Evolution Level
              </p>
              <p className="mt-1 font-display text-5xl leading-none">{stats.level}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-livv-muted">Streak</p>
              <p className="mt-1 text-lg font-medium text-livv-accent-soft">
                {stats.streak} days
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs text-livv-muted">
              <span>
                {stats.currentXp} / {stats.xpToNext} XP
              </span>
              <span>{xpProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-livv-accent to-livv-energy transition-all duration-500"
                style={{ width: `${Math.min(xpProgress, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-livv-muted">
              {stats.xpToNext - stats.currentXp} XP to Level {stats.level + 1}
            </p>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.22em] text-livv-muted">
              Today&apos;s Objectives
            </p>
            <p className="text-xs text-livv-muted">
              {completedCount}/{objectives.length}
            </p>
          </div>

          <div className="space-y-2">
            {objectives.map((obj) => (
              <button
                key={obj.id}
                onClick={() => toggleObjective(obj.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                  obj.completed
                    ? "border-livv-accent/40 bg-livv-accent/10"
                    : "border-livv-border bg-livv-surface hover:border-white/15"
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
                  <p
                    className={cn(
                      "text-sm font-medium",
                      obj.completed && "text-white/50 line-through"
                    )}
                  >
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
          <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">
            Evolution Pillars
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className="rounded-2xl border border-livv-border bg-livv-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-xl leading-none">{pillar.name}</p>
                  <span className="text-xs text-livv-accent-soft">
                    Lv {pillar.level}
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-livv-muted">
                  {pillar.description}
                </p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-black/50">
                  <div
                    className="h-full bg-livv-accent/80"
                    style={{ width: `${pillar.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">
            Achievements
          </p>
          <div className="space-y-2">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3.5",
                  ach.unlocked
                    ? "border-livv-border bg-livv-surface"
                    : "border-livv-border/50 bg-livv-black/40 opacity-60"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/50 text-lg">
                  {ach.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{ach.title}</p>
                  <p className="text-xs text-livv-muted">{ach.description}</p>
                </div>
                {ach.unlocked && (
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-livv-accent-soft">
                    Unlocked
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
