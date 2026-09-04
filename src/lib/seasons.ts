/** Finite chapter arcs — not infinite treadmill. */

import { dayKey } from "./dates";
import { loadRecord } from "./record";

export type SeasonId = "foundation" | "pressure" | "quiet" | "edge";

export type SeasonDef = {
  id: SeasonId;
  name: string;
  line: string;
  days: number;
  objectives: { id: string; title: string; target: number; metric: "active_days" | "workouts" | "actions" | "pillars" }[];
};

export const SEASONS: SeasonDef[] = [
  {
    id: "foundation",
    name: "Foundation",
    line: "Show up. Build the floor under everything else.",
    days: 14,
    objectives: [
      { id: "f_days", title: "Active days", target: 8, metric: "active_days" },
      { id: "f_train", title: "Training sessions", target: 4, metric: "workouts" },
      { id: "f_act", title: "Logged actions", target: 10, metric: "actions" },
    ],
  },
  {
    id: "pressure",
    name: "Pressure",
    line: "Hold the line when life gets loud.",
    days: 21,
    objectives: [
      { id: "p_days", title: "Active days", target: 14, metric: "active_days" },
      { id: "p_train", title: "Training sessions", target: 8, metric: "workouts" },
      { id: "p_pillars", title: "Distinct pillars touched", target: 4, metric: "pillars" },
    ],
  },
  {
    id: "quiet",
    name: "Quiet Strength",
    line: "Capacity is built when nobody is watching.",
    days: 21,
    objectives: [
      { id: "q_days", title: "Active days", target: 12, metric: "active_days" },
      { id: "q_act", title: "Logged actions", target: 20, metric: "actions" },
      { id: "q_train", title: "Training sessions", target: 6, metric: "workouts" },
    ],
  },
  {
    id: "edge",
    name: "The Edge",
    line: "You already know. Do it anyway.",
    days: 28,
    objectives: [
      { id: "e_days", title: "Active days", target: 18, metric: "active_days" },
      { id: "e_train", title: "Training sessions", target: 12, metric: "workouts" },
      { id: "e_pillars", title: "Distinct pillars touched", target: 5, metric: "pillars" },
      { id: "e_act", title: "Logged actions", target: 30, metric: "actions" },
    ],
  },
];

export type SeasonState = {
  seasonId: SeasonId;
  startedOn: string;
  completedIds: string[];
  claimed: boolean;
};

const KEY = "livv-season-v1";

export function loadSeason(): SeasonState {
  if (typeof window === "undefined") {
    return { seasonId: "foundation", startedOn: dayKey(), completedIds: [], claimed: false };
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const s = { seasonId: "foundation" as SeasonId, startedOn: dayKey(), completedIds: [], claimed: false };
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as SeasonState;
  } catch {
    return { seasonId: "foundation", startedOn: dayKey(), completedIds: [], claimed: false };
  }
}

function save(s: SeasonState) {
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("livv-season"));
}

export function currentSeasonDef(state = loadSeason()) {
  return SEASONS.find((x) => x.id === state.seasonId) || SEASONS[0];
}

function daysSince(start: string) {
  const a = new Date(start + "T12:00:00");
  const b = new Date();
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / 86400000));
}

export function seasonProgress(state = loadSeason()) {
  const def = currentSeasonDef(state);
  const rec = loadRecord();
  const elapsed = daysSince(state.startedOn);
  const remaining = Math.max(0, def.days - elapsed);

  // Approximate metrics from record (lifetime within season window is soft)
  const activeDays = Object.values(rec.days).filter(
    (d) => d.checkIn || d.workout || d.objectives.length || (d.custom && d.custom.length)
  ).length;
  const metrics: Record<string, number> = {
    active_days: Math.min(activeDays, def.days + 5),
    workouts: rec.workoutsCompleted,
    actions: rec.goalsCompleted,
    pillars: rec.pillarsTouched.length,
  };

  const objectives = def.objectives.map((o) => {
    const current = metrics[o.metric] || 0;
    const done = current >= o.target || state.completedIds.includes(o.id);
    return { ...o, current: Math.min(current, o.target), done };
  });

  const allDone = objectives.every((o) => o.done);
  const pct = Math.round(
    (objectives.reduce((s, o) => s + o.current / o.target, 0) / objectives.length) * 100
  );

  return { def, state, objectives, elapsed, remaining, allDone, pct };
}

export function advanceSeason() {
  const state = loadSeason();
  const idx = SEASONS.findIndex((s) => s.id === state.seasonId);
  const next = SEASONS[Math.min(idx + 1, SEASONS.length - 1)];
  const s: SeasonState = {
    seasonId: next.id,
    startedOn: dayKey(),
    completedIds: [],
    claimed: false,
  };
  save(s);
  return s;
}

export function claimSeasonComplete() {
  const state = loadSeason();
  state.claimed = true;
  save(state);
  return state;
}
