/** Finite chapter arcs — metrics scoped to chapter window only. */

import { dayKey } from "./dates";
import { loadRecord, type LivvRecord } from "./record";

export type SeasonId = "foundation" | "pressure" | "quiet" | "edge";

export type SeasonDef = {
  id: SeasonId;
  name: string;
  line: string;
  days: number;
  objectives: {
    id: string;
    title: string;
    target: number;
    metric: "active_days" | "workouts" | "actions" | "pillars";
  }[];
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
      const s: SeasonState = {
        seasonId: "foundation",
        startedOn: dayKey(),
        completedIds: [],
        claimed: false,
      };
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

function inChapterWindow(dayKeyStr: string, startedOn: string, chapterDays: number) {
  if (dayKeyStr < startedOn) return false;
  const start = new Date(startedOn + "T12:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + chapterDays);
  const endKey = dayKey(end);
  return dayKeyStr <= endKey;
}

/** Metrics only from days inside the current chapter window. */
export function chapterMetrics(rec: LivvRecord, startedOn: string, chapterDays: number) {
  let activeDays = 0;
  let workouts = 0;
  let actions = 0;
  const pillars = new Set<string>();

  for (const [key, day] of Object.entries(rec.days || {})) {
    if (!inChapterWindow(key, startedOn, chapterDays)) continue;
    const hasCustom = Boolean(day.custom?.length);
    const active =
      day.checkIn || day.workout || day.objectives.length > 0 || hasCustom;
    if (active) activeDays += 1;
    if (day.workout) {
      workouts += 1;
      pillars.add("body");
    }
    actions += day.objectives.length + (day.custom?.length || 0);
    for (const oid of day.objectives) {
      // soft map from objective ids if present in defs — count via custom pillars too
      void oid;
    }
    for (const c of day.custom || []) {
      pillars.add(c.pillar.toLowerCase());
    }
  }

  return {
    active_days: activeDays,
    workouts,
    actions,
    pillars: pillars.size,
  };
}

export function seasonProgress(state = loadSeason()) {
  const def = currentSeasonDef(state);
  const rec = loadRecord();
  const elapsed = daysSince(state.startedOn);
  const remaining = Math.max(0, def.days - elapsed);
  const metrics = chapterMetrics(rec, state.startedOn, def.days);

  const objectives = def.objectives.map((o) => {
    const current = metrics[o.metric] || 0;
    const done = current >= o.target || state.completedIds.includes(o.id);
    return { ...o, current: Math.min(current, o.target), done };
  });

  const allDone = objectives.every((o) => o.done);
  const pct = Math.round(
    (objectives.reduce((s, o) => s + o.current / o.target, 0) / objectives.length) * 100
  );

  return { def, state, objectives, elapsed, remaining, allDone, pct, metrics };
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

/** Reset chapter clock (debug / new run). */
export function restartCurrentSeason() {
  const state = loadSeason();
  state.startedOn = dayKey();
  state.completedIds = [];
  state.claimed = false;
  save(state);
  return state;
}
