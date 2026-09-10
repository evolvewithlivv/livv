/**
 * Progress Intelligence v1 — derived, explainable insights from LivvRecord only.
 * Local-first. No invented psychology, dopamine, or causal claims.
 * Every field is computable from days / pillarXp / counters already on the record.
 */

import { dayKey } from "./dates";
import type { DayLog, LivvRecord } from "./record";
import { PILLAR_DEFS } from "./evolve-data";

export type InsightEvidence = {
  /** Short human label for the metric */
  label: string;
  /** Concrete numbers / facts from the record */
  facts: string[];
};

export type PillarInsight = {
  id: string;
  name: string;
  xp: number;
  /** Share of total pillar XP (0–100), or 0 if total is 0 */
  sharePct: number;
};

export type ProgressInsights = {
  /** How many calendar days we scanned */
  windowDays: number;
  daysWithActivity: number;
  /** daysWithActivity / windowDays * 100 */
  consistencyPct: number;
  checkInDays: number;
  workoutDays: number;
  workoutsInWindow: number;
  objectivesCompletedInWindow: number;
  /** Longest consecutive active-day run found in stored day logs */
  longestActiveRun: number;
  /** Current streak from record (not recomputed) */
  currentStreak: number;
  workoutsAllTime: number;
  goalsAllTime: number;
  level: number;
  currentXp: number;
  xpToNext: number;
  pillars: PillarInsight[];
  strongest: PillarInsight | null;
  weakest: PillarInsight | null;
  /** One-line summaries with evidence — safe to show in UI */
  bullets: { title: string; detail: string; evidence: InsightEvidence }[];
  empty: boolean;
};

function isActive(log: DayLog | undefined): boolean {
  if (!log) return false;
  return Boolean(
    log.checkIn ||
      log.workout ||
      (log.objectives && log.objectives.length > 0) ||
      (log.custom && log.custom.length > 0)
  );
}

function pastDayKeys(n: number, end = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    keys.push(dayKey(d));
  }
  return keys;
}

/** Longest consecutive run of active days among keys present in rec.days (sorted). */
export function longestActiveRun(rec: LivvRecord): number {
  const keys = Object.keys(rec.days || {}).filter((k) => isActive(rec.days[k])).sort();
  if (keys.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < keys.length; i++) {
    const prev = new Date(keys[i - 1] + "T12:00:00");
    const cur = new Date(keys[i] + "T12:00:00");
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }
  return best;
}

export function buildProgressInsights(rec: LivvRecord, windowDays = 14): ProgressInsights {
  const window = Math.max(1, Math.min(90, windowDays));
  const keys = pastDayKeys(window);
  let daysWithActivity = 0;
  let checkInDays = 0;
  let workoutDays = 0;
  let objectivesCompletedInWindow = 0;

  for (const k of keys) {
    const log = rec.days[k];
    if (!log) continue;
    if (isActive(log)) daysWithActivity += 1;
    if (log.checkIn) checkInDays += 1;
    if (log.workout) workoutDays += 1;
    objectivesCompletedInWindow += (log.objectives?.length || 0) + (log.custom?.length || 0);
  }

  const consistencyPct = Math.round((daysWithActivity / window) * 100);
  const pillarXp = rec.pillarXp || {};
  const totalPillarXp = PILLAR_DEFS.reduce((s, p) => s + (pillarXp[p.id] || 0), 0);

  const pillars: PillarInsight[] = PILLAR_DEFS.map((p) => {
    const xp = pillarXp[p.id] || 0;
    return {
      id: p.id,
      name: p.name,
      xp,
      sharePct: totalPillarXp > 0 ? Math.round((xp / totalPillarXp) * 100) : 0,
    };
  }).sort((a, b) => b.xp - a.xp);

  const strongest = pillars[0] && pillars[0].xp > 0 ? pillars[0] : null;
  const weakest =
    pillars.length > 0
      ? [...pillars].sort((a, b) => a.xp - b.xp)[0]
      : null;

  const longest = longestActiveRun(rec);
  const empty =
    daysWithActivity === 0 &&
    rec.workoutsCompleted === 0 &&
    rec.goalsCompleted === 0 &&
    totalPillarXp === 0;

  const bullets: ProgressInsights["bullets"] = [];

  bullets.push({
    title: `${window}-day consistency`,
    detail: empty
      ? "No activity logged in this window yet."
      : `${daysWithActivity} of ${window} days had a recorded action (${consistencyPct}%).`,
    evidence: {
      label: "Day logs",
      facts: [
        `Window: last ${window} calendar days`,
        `Active days: ${daysWithActivity}`,
        `Check-in days: ${checkInDays}`,
        `Workout days: ${workoutDays}`,
        `Objectives completed in window: ${objectivesCompletedInWindow}`,
      ],
    },
  });

  bullets.push({
    title: "Streak",
    detail: `Current chain ${rec.streak} day${rec.streak === 1 ? "" : "s"}. Longest consecutive active run in stored logs: ${longest}.`,
    evidence: {
      label: "Record counters + day map",
      facts: [
        `record.streak = ${rec.streak}`,
        `Longest run from sorted active day keys = ${longest}`,
        `lastActiveDay = ${rec.lastActiveDay ?? "none"}`,
      ],
    },
  });

  bullets.push({
    title: "Training volume",
    detail: `${rec.workoutsCompleted} session${rec.workoutsCompleted === 1 ? "" : "s"} all-time. ${workoutDays} day${workoutDays === 1 ? "" : "s"} with a workout in the last ${window}.`,
    evidence: {
      label: "Workouts",
      facts: [
        `workoutsCompleted = ${rec.workoutsCompleted}`,
        `Workout-flagged days in window = ${workoutDays}`,
        rec.lastWorkout
          ? `Last workout: ${rec.lastWorkout.name} (${rec.lastWorkout.focus})`
          : "No last workout stored",
      ],
    },
  });

  if (strongest) {
    bullets.push({
      title: "Leading pillar",
      detail: `${strongest.name} leads with ${strongest.xp} XP (${strongest.sharePct}% of pillar XP).`,
      evidence: {
        label: "pillarXp",
        facts: pillars.map((p) => `${p.name}: ${p.xp} XP (${p.sharePct}%)`),
      },
    });
  }

  if (weakest && totalPillarXp > 0) {
    bullets.push({
      title: "Lowest pillar XP",
      detail: `${weakest.name} has the least logged XP (${weakest.xp}). This is a count of recorded XP, not a judgment.`,
      evidence: {
        label: "pillarXp ranking",
        facts: [`Lowest: ${weakest.name} = ${weakest.xp} XP`, `Total pillar XP = ${totalPillarXp}`],
      },
    });
  }

  return {
    windowDays: window,
    daysWithActivity,
    consistencyPct,
    checkInDays,
    workoutDays,
    workoutsInWindow: workoutDays,
    objectivesCompletedInWindow,
    longestActiveRun: longest,
    currentStreak: rec.streak,
    workoutsAllTime: rec.workoutsCompleted,
    goalsAllTime: rec.goalsCompleted,
    level: rec.level,
    currentXp: rec.currentXp,
    xpToNext: rec.xpToNext,
    pillars,
    strongest,
    weakest: totalPillarXp > 0 ? weakest : null,
    bullets,
    empty,
  };
}
