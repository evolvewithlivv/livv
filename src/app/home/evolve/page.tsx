"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { activityFromObjective } from "@/lib/activity";
import {
  liveAchievements,
  livePillars,
  loadRecord,
  logCustomAction,
  setObjective,
  todaysCustom,
  todaysObjectives,
  type LivvRecord,
} from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { feedback } from "@/lib/sensory";
import { PILLAR_DEFS } from "@/lib/evolve-data";

const SIZES = [
  { id: "small" as const, label: "Small", hint: "15 XP" },
  { id: "standard" as const, label: "Standard", hint: "30 XP" },
  { id: "major" as const, label: "Major", hint: "55 XP" },
];

export default function EvolvePage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pillar, setPillar] = useState("Body");
  const [size, setSize] = useState<"small" | "standard" | "major">("standard");

  const sync = () => setRec(loadRecord());

  useEffect(() => {
    sync();
    window.addEventListener("livv-record", sync);
    return () => window.removeEventListener("livv-record", sync);
  }, []);

  if (!rec) return null;

  const objectives = todaysObjectives(rec);
  const custom = todaysCustom(rec);
  const pillars = livePillars(rec);
  const achievements = liveAchievements(rec);
  const completedCount = objectives.filter((o) => o.completed).length;
  const xpProgress = Math.round((rec.currentXp / rec.xpToNext) * 100);
  const evo = evolutionTitle(rec.level);

  const toggleObjective = (id: string, t: string, p: string, xp: number, next: boolean) => {
    const updated = setObjective(id, next);
    if (next) {
      activityFromObjective({ objectiveTitle: t, pillar: p, xp });
      feedback("checkin");
    } else feedback("tick");
    setRec(updated);
  };

  const submitCustom = () => {
    if (title.trim().length < 2) return;
    const updated = logCustomAction({ title, pillar, size });
    feedback("complete");
    setRec(updated);
    setTitle("");
    setOpen(false);
  };

  return (
    <main className="relative overflow-hidden pt-8 pb-6">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-livv-gradient opacity-50" />
      <Container className="relative">
        <div className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-livv-muted">Growth engine</p>
          <h1 className="font-display mt-2 text-[2.4rem] font-semibold leading-none tracking-tight">Evolve</h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/45">
            Body, mind, work, money, people. Log the real life, not just the checklist.
          </p>
        </div>

        <section className="mb-6 rounded-3xl border border-livv-border bg-livv-surface/95 p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-livv-muted">Evolution Level</p>
              <p className="font-display mt-1 text-5xl font-semibold leading-none tracking-tight">{rec.level}</p>
              <p className="mt-2 text-sm text-livv-accent-soft">{evo.name}</p>
              <p className="mt-1 max-w-[22ch] text-[12px] text-white/40">{evo.line}</p>
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
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.22em] text-livv-muted">Daily objectives</p>
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
                  "flex w-full items-center gap-3 rounded-2xl border p-4 text-left active:scale-[0.99]",
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

          {custom.length > 0 && (
            <div className="mt-3 space-y-2">
              {custom.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-livv-accent/30 bg-livv-accent/10 px-4 py-3"
                >
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="mt-0.5 text-xs text-livv-muted">
                    {c.pillar} · +{c.xp} XP · logged
                  </p>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-3 flex h-12 w-full items-center justify-center rounded-full border border-dashed border-livv-border text-sm text-white/55"
          >
            + Add action
          </button>
        </section>

        <section className="mb-8">
          <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">Pillars</p>
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

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/70 backdrop-blur-sm sm:items-center sm:justify-center">
          <div className="w-full max-w-lg rounded-t-[24px] border border-livv-border bg-livv-surface p-5 sm:rounded-[24px]">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">Add action</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">What did you do?</h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Walked 4 miles · shipped a feature · called home"
              className="mt-4 w-full rounded-2xl border border-livv-border bg-black/30 px-4 py-3.5 text-sm outline-none"
            />
            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-white/35">Pillar</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PILLAR_DEFS.filter((p) => p.id !== "life").map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPillar(p.name)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs",
                    pillar === p.name
                      ? "border-livv-accent bg-livv-accent/15"
                      : "border-livv-border text-white/50"
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-white/35">Meaning</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSize(s.id)}
                  className={cn(
                    "rounded-2xl border px-2 py-3 text-center",
                    size === s.id
                      ? "border-livv-accent bg-livv-accent/10"
                      : "border-livv-border"
                  )}
                >
                  <span className="block text-sm font-medium">{s.label}</span>
                  <span className="text-[11px] text-white/40">{s.hint}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-livv-border py-3 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCustom}
                className="flex-1 rounded-full bg-livv-accent py-3 text-sm font-semibold text-white"
              >
                Log it
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
