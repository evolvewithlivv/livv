import { dayKey } from "./dates";
import { ACHIEVEMENT_DEFS, OBJECTIVE_DEFS, PILLAR_DEFS } from "./evolve-data";
import { activityFromAchievement, activityFromLevelUp } from "./activity";
import { addEmbers } from "./identity";
import { embersFromAction } from "./embers";
import { noteBrokenStreak } from "./streak-repair";
import { enqueueMilestone, evaluateMilestones } from "./milestones";
import { bumpPairDay } from "./pair-chain";

export type DayLog = {
  key: string;
  checkIn: boolean;
  workout: boolean;
  objectives: string[];
  xp: number;
  custom: { id: string; title: string; pillar: string; xp: number }[];
};

export type LastWorkout = {
  name: string;
  focus: string;
  duration: string;
  exercises: number;
  at: number;
};

export type LivvRecord = {
  level: number;
  currentXp: number;
  xpToNext: number;
  streak: number;
  lastActiveDay: string | null;
  workoutsCompleted: number;
  goalsCompleted: number;
  mindObjectives: number;
  pillarXp: Record<string, number>;
  pillarsTouched: string[];
  achievements: string[];
  days: Record<string, DayLog>;
  lastWorkout: LastWorkout | null;
  streakFreezes: number;
  freezeWeekKey: string | null;
  frozenDays: string[];
};

const KEY = "livv-record-v1";

export const EMPTY_RECORD: LivvRecord = {
  level: 1,
  currentXp: 0,
  xpToNext: 200,
  streak: 0,
  lastActiveDay: null,
  workoutsCompleted: 0,
  goalsCompleted: 0,
  mindObjectives: 0,
  pillarXp: {
    body: 0,
    mind: 0,
    career: 0,
    finance: 0,
    social: 0,
    life: 0,
  },
  pillarsTouched: [],
  achievements: [],
  days: {},
  lastWorkout: null,
  streakFreezes: 1,
  freezeWeekKey: null,
  frozenDays: [],
};

function weekKey(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  return dayKey(d);
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

function ensureFreezeQuota(rec: LivvRecord) {
  const wk = weekKey();
  if (rec.freezeWeekKey !== wk) {
    rec.freezeWeekKey = wk;
    rec.streakFreezes = 1;
  }
  if (typeof rec.streakFreezes !== "number") rec.streakFreezes = 1;
  if (!rec.frozenDays) rec.frozenDays = [];
  return rec;
}

export function loadRecord(): LivvRecord {
  if (typeof window === "undefined") return { ...EMPTY_RECORD };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_RECORD, pillarXp: { ...EMPTY_RECORD.pillarXp } };
    const parsed = { ...EMPTY_RECORD, ...JSON.parse(raw) } as LivvRecord;
    parsed.pillarXp = { ...EMPTY_RECORD.pillarXp, ...parsed.pillarXp };
    parsed.days = parsed.days || {};
    parsed.achievements = parsed.achievements || [];
    return ensureFreezeQuota(parsed);
  } catch {
    return { ...EMPTY_RECORD, pillarXp: { ...EMPTY_RECORD.pillarXp } };
  }
}

export function saveRecord(next: LivvRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("livv-record"));
  try {
    evaluateMilestones();
  } catch {
    /* noop */
  }
}

function dayOf(rec: LivvRecord, key: string): DayLog {
  const existing = rec.days[key];
  return (
    existing || {
      key,
      checkIn: false,
      workout: false,
      objectives: [],
      xp: 0,
      custom: [],
    }
  );
}

function applyStreak(rec: LivvRecord, today: string) {
  if (rec.lastActiveDay === today) return rec;
  if (rec.lastActiveDay === yesterdayKey() || rec.frozenDays?.includes(yesterdayKey())) {
    rec.streak += 1;
  } else {
    if (rec.streak >= 3) noteBrokenStreak(rec.streak);
    rec.streak = 1;
  }
  rec.lastActiveDay = today;
  try {
    bumpPairDay();
  } catch {
    /* noop */
  }
  return rec;
}

function addXp(rec: LivvRecord, amount: number) {
  rec.currentXp += amount;
  while (rec.currentXp >= rec.xpToNext) {
    rec.currentXp -= rec.xpToNext;
    rec.level += 1;
    rec.xpToNext = Math.round(rec.xpToNext * 1.25);
    activityFromLevelUp({ level: rec.level });
    try {
      enqueueMilestone("level_up");
    } catch {
      /* noop */
    }
  }
  return rec;
}

function pillarIdFromName(name: string) {
  return name.toLowerCase();
}

export function pillarState(rec: LivvRecord, id: string) {
  const xp = rec.pillarXp[id] || 0;
  const level = 1 + Math.floor(xp / 100);
  const progress = xp % 100;
  return { level, progress, xp };
}

function evaluateAchievements(rec: LivvRecord) {
  const body = pillarState(rec, "body");
  const checks: Record<string, boolean> = {
    a1: rec.goalsCompleted >= 1,
    a2: rec.streak >= 3,
    a3: body.level >= 3,
    a4: rec.mindObjectives >= 10,
    a5: rec.streak >= 14,
    a6: rec.pillarsTouched.length >= 6,
  };

  for (const def of ACHIEVEMENT_DEFS) {
    if (checks[def.id] && !rec.achievements.includes(def.id)) {
      rec.achievements.push(def.id);
      activityFromAchievement({
        title: def.title,
        description: def.description,
        icon: def.icon,
        xp: 50,
      });
    }
  }
  return rec;
}

export function useStreakFreeze() {
  const rec = ensureFreezeQuota(loadRecord());
  if (rec.streakFreezes <= 0) return null;
  if (rec.streak <= 0) return null;
  const miss = yesterdayKey();
  rec.streakFreezes -= 1;
  if (!rec.frozenDays.includes(miss)) rec.frozenDays.push(miss);
  if (rec.lastActiveDay !== dayKey()) rec.lastActiveDay = miss;
  saveRecord(rec);
  return rec;
}

export function checkInRecord() {
  const rec = ensureFreezeQuota(loadRecord());
  const today = dayKey();
  const day = dayOf(rec, today);
  if (day.checkIn) {
    return { record: rec, already: true as const, emberBonus: 0 };
  }
  day.checkIn = true;
  rec.days[today] = day;
  applyStreak(rec, today);
  evaluateAchievements(rec);
  const emberBonus = Math.random() < 0.28 ? [5, 8, 12, 15][Math.floor(Math.random() * 4)] : 0;
  saveRecord(rec);
  return { record: rec, already: false as const, emberBonus };
}

export function completeWorkout(input: {
  name: string;
  focus: string;
  duration: string;
  exercises: number;
  xp?: number;
}) {
  const rec = loadRecord();
  const today = dayKey();
  const day = dayOf(rec, today);
  const xp = input.xp ?? Math.max(40, input.exercises * 20);
  if (!day.workout) {
    rec.workoutsCompleted += 1;
    day.workout = true;
    day.xp += xp;
    addXp(rec, xp);
    const pid = "body";
    rec.pillarXp[pid] = (rec.pillarXp[pid] || 0) + xp;
    if (!rec.pillarsTouched.includes(pid)) rec.pillarsTouched.push(pid);
    applyStreak(rec, today);
    if (!day.objectives.includes("obj1")) {
      day.objectives.push("obj1");
      rec.goalsCompleted += 1;
    }
    addEmbers(embersFromAction("workout"));
  }
  rec.lastWorkout = {
    name: input.name,
    focus: input.focus,
    duration: input.duration,
    exercises: input.exercises,
    at: Date.now(),
  };
  rec.days[today] = day;
  evaluateAchievements(rec);
  saveRecord(rec);
  return rec;
}

export function setObjective(id: string, done: boolean) {
  const rec = loadRecord();
  const today = dayKey();
  const day = dayOf(rec, today);
  const def = OBJECTIVE_DEFS.find((o) => o.id === id);
  if (!def) return rec;

  const has = day.objectives.includes(id);
  const pid = pillarIdFromName(def.pillar);

  if (done && !has) {
    day.objectives.push(id);
    day.xp += def.xp;
    rec.goalsCompleted += 1;
    if (pid === "mind") rec.mindObjectives += 1;
    rec.pillarXp[pid] = (rec.pillarXp[pid] || 0) + def.xp;
    if (!rec.pillarsTouched.includes(pid)) rec.pillarsTouched.push(pid);
    addXp(rec, def.xp);
    applyStreak(rec, today);
    addEmbers(embersFromAction("objective"));
  }

  if (!done && has) {
    day.objectives = day.objectives.filter((x) => x !== id);
    day.xp = Math.max(0, day.xp - def.xp);
    rec.goalsCompleted = Math.max(0, rec.goalsCompleted - 1);
    if (pid === "mind") rec.mindObjectives = Math.max(0, rec.mindObjectives - 1);
    rec.pillarXp[pid] = Math.max(0, (rec.pillarXp[pid] || 0) - def.xp);
    rec.currentXp = Math.max(0, rec.currentXp - def.xp);
  }

  rec.days[today] = day;
  evaluateAchievements(rec);
  saveRecord(rec);
  return rec;
}

const SIZE_XP = { small: 15, standard: 30, major: 55 } as const;

export function logCustomAction(input: {
  title: string;
  pillar: string;
  size: "small" | "standard" | "major";
}) {
  const rec = loadRecord();
  const today = dayKey();
  const day = dayOf(rec, today);
  if (!day.custom) day.custom = [];
  const xp = SIZE_XP[input.size];
  const id = `c_${Date.now()}`;
  day.custom.push({ id, title: input.title.trim(), pillar: input.pillar, xp });
  day.xp += xp;
  const pid = pillarIdFromName(input.pillar);
  rec.pillarXp[pid] = (rec.pillarXp[pid] || 0) + xp;
  if (!rec.pillarsTouched.includes(pid)) rec.pillarsTouched.push(pid);
  if (pid === "mind") rec.mindObjectives += 1;
  rec.goalsCompleted += 1;
  addXp(rec, xp);
  applyStreak(rec, today);
  rec.days[today] = day;
  evaluateAchievements(rec);
  saveRecord(rec);
  addEmbers(embersFromAction("custom", input.size));
  return rec;
}

export function todaysObjectives(rec = loadRecord()) {
  const today = dayOf(rec, dayKey());
  return OBJECTIVE_DEFS.map((o) => ({
    ...o,
    completed: today.objectives.includes(o.id),
  }));
}

export function todaysCustom(rec = loadRecord()) {
  return dayOf(rec, dayKey()).custom || [];
}

export function livePillars(rec = loadRecord()) {
  return PILLAR_DEFS.map((p) => {
    const s = pillarState(rec, p.id);
    return { ...p, level: s.level, progress: s.progress, xp: s.xp };
  });
}

export function liveAchievements(rec: LivvRecord) {
  return ACHIEVEMENT_DEFS.map((a) => ({
    ...a,
    unlocked: rec.achievements.includes(a.id),
  }));
}

export function weekBars(rec = loadRecord()) {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return labels.map((label, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + mondayOffset + i);
    const log = rec.days[dayKey(d)];
    const active = Boolean(
      log && (log.checkIn || log.workout || log.objectives.length || (log.custom && log.custom.length))
    );
    const score = log
      ? Math.min(
          100,
          (log.checkIn ? 25 : 0) +
            (log.workout ? 45 : 0) +
            log.objectives.length * 8 +
            (log.custom?.length || 0) * 8
        )
      : 0;
    return { d: label, v: score, active, key: dayKey(d) };
  });
}

export function weekHitCount(rec = loadRecord()) {
  return weekBars(rec).filter((d) => d.active).length;
}

export function isCheckedInToday(rec = loadRecord()) {
  return Boolean(rec.days[dayKey()]?.checkIn);
}

export function missedYesterday(rec = loadRecord()) {
  const y = yesterdayKey();
  if (rec.lastActiveDay === y || rec.frozenDays?.includes(y)) return false;
  if (!rec.lastActiveDay) return false;
  if (rec.lastActiveDay === dayKey()) return false;
  const log = rec.days[y];
  if (log && (log.checkIn || log.workout || log.objectives.length)) return false;
  return rec.workoutsCompleted + rec.goalsCompleted > 0;
}
