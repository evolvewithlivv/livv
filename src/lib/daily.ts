/**
 * LIVV Daily — the retention engine.
 * Open → Discover → Act → Earn → Unlock → Reflect → Come back tomorrow.
 */

import { addEmbers, loadIdentity, patchIdentity } from "./identity";
import { logCustomAction, loadRecord, useStreakFreeze } from "./record";
import { dayKey } from "./dates";

export type DailyTask = {
  id: "mind" | "body" | "life";
  label: string;
  title: string;
  description: string;
  pillar: string;
  xpSize: "small" | "standard" | "major";
};

export type DailyJournalEntry = {
  key: string;
  question: string;
  answer: string;
  savedAt: number;
};

export type DropKind =
  | "embers"
  | "xp_boost"
  | "streak_freeze"
  | "pack_ticket"
  | "frame"
  | "artifact"
  | "accent"
  | "double_xp_day";

export type DailyDrop = {
  id: string;
  kind: DropKind;
  name: string;
  description: string;
  icon: string;
  /** Embers granted on claim (0 if none) */
  embers: number;
  /** XP granted on claim */
  xp: number;
  /** Extra payload (frame id, accent hex, etc.) */
  meta?: string;
};

export type DailyBuffs = {
  /** dayKey until which 2x XP is active */
  doubleXpUntil: string | null;
  /** Owned profile frame ids */
  frames: string[];
  activeFrame: string | null;
  /** Artifact collectible ids */
  artifacts: string[];
  /** Bonus pack tickets (claim on Packs) */
  packTickets: number;
};

export const DAILY_KEY = "livv-daily-v1";
export const BUFFS_KEY = "livv-daily-buffs-v1";
export const SEASON_START = "2026-09-01";

const QUESTIONS = [
  "What are you avoiding that you already know you need to do?",
  "What would the strongest version of you do next?",
  "Where are you making your life harder than it needs to be?",
  "What deserves your attention more than your phone does today?",
  "What truth would make today's decision easier?",
  "What are you tolerating that you should change?",
  "If nobody could judge you, what would you start?",
  "What did yesterday teach you that you can actually use today?",
  "What would make you proud of today tonight?",
  "Where are you waiting for permission you do not need?",
  "What conversation are you delaying that would free energy?",
  "What would you do if you trusted yourself completely?",
];

const DAILY_SETS = [
  [
    ["Mind", "Clear the noise", "Write one honest sentence about the decision you have been postponing.", "mind", "small"],
    ["Body", "Move for 10 minutes", "Walk, stretch, or train. No optimization. Just move.", "body", "standard"],
    ["Life", "Fix one friction point", "Clean, cancel, repair, or handle one small thing you keep stepping around.", "life", "standard"],
  ],
  [
    ["Mind", "Choose the hard truth", "Name one thing you know is true but keep negotiating with.", "mind", "small"],
    ["Body", "20 squats + 10 push-ups", "Complete the circuit once. Scale if needed — finish it.", "body", "standard"],
    ["Life", "Make one useful move", "Do one action that makes tomorrow easier before anything optional.", "life", "standard"],
  ],
  [
    ["Mind", "Five minutes of silence", "Phone down. Sit without consuming anything for five minutes. Then write what surfaced.", "mind", "small"],
    ["Body", "Get outside", "At least 15 minutes outside. Change the environment.", "body", "standard"],
    ["Life", "Upgrade your space", "Improve one visible part of your environment. Small change, immediate proof.", "life", "standard"],
  ],
  [
    ["Mind", "Write the next move", "Turn one vague goal into a single physical action you can do today.", "mind", "small"],
    ["Body", "Train the basics", "3 rounds of a simple bodyweight circuit at your pace.", "body", "major"],
    ["Life", "Create before consuming", "Finish one useful task before entertainment or scrolling.", "life", "standard"],
  ],
  [
    ["Mind", "Name the resistance", "What is the real reason you have not started? Write it without editing.", "mind", "small"],
    ["Body", "Heart rate up", "10 minutes continuous movement — walk, run, jump rope, or shadow work.", "body", "standard"],
    ["Life", "Close one open loop", "Reply, pay, schedule, or finish one thing that has been open too long.", "life", "standard"],
  ],
] as const;

/** Weighted drop pool — rare outcomes are rarer. */
const DROP_POOL: { weight: number; drop: DailyDrop }[] = [
  {
    weight: 28,
    drop: {
      id: "ember-cache",
      kind: "embers",
      name: "Ember Cache",
      description: "Fuel for the long run.",
      icon: "✦",
      embers: 40,
      xp: 15,
    },
  },
  {
    weight: 18,
    drop: {
      id: "ember-surge",
      kind: "embers",
      name: "Ember Surge",
      description: "A bigger hit for finishing the full Daily.",
      icon: "✧",
      embers: 75,
      xp: 25,
    },
  },
  {
    weight: 12,
    drop: {
      id: "xp-spark",
      kind: "xp_boost",
      name: "XP Spark",
      description: "Instant progress toward your next Evolution level.",
      icon: "↑",
      embers: 15,
      xp: 80,
    },
  },
  {
    weight: 10,
    drop: {
      id: "freeze-token",
      kind: "streak_freeze",
      name: "Streak Freeze",
      description: "One more freeze in the vault. Protect the chain.",
      icon: "❄",
      embers: 10,
      xp: 10,
    },
  },
  {
    weight: 8,
    drop: {
      id: "pack-ticket",
      kind: "pack_ticket",
      name: "Pack Ticket",
      description: "An extra pull. Claim it on the Packs tab.",
      icon: "▣",
      embers: 20,
      xp: 20,
    },
  },
  {
    weight: 8,
    drop: {
      id: "double-xp",
      kind: "double_xp_day",
      name: "2× XP Day",
      description: "Tomorrow’s actions grant double XP until midnight.",
      icon: "⚡",
      embers: 25,
      xp: 30,
    },
  },
  {
    weight: 6,
    drop: {
      id: "frame-signal",
      kind: "frame",
      name: "Frame · Signal",
      description: "A profile frame. Equip it from Profile when ready.",
      icon: "◎",
      embers: 30,
      xp: 20,
      meta: "signal",
    },
  },
  {
    weight: 5,
    drop: {
      id: "frame-ascent",
      kind: "frame",
      name: "Frame · Ascent",
      description: "Rare profile frame for people who finish Dailies.",
      icon: "◉",
      embers: 40,
      xp: 25,
      meta: "ascent",
    },
  },
  {
    weight: 4,
    drop: {
      id: "artifact-ledger",
      kind: "artifact",
      name: "Artifact · The Ledger",
      description: "A collectible mark of continuity. Yours permanently.",
      icon: "◈",
      embers: 50,
      xp: 40,
      meta: "ledger",
    },
  },
  {
    weight: 1,
    drop: {
      id: "golden-drop",
      kind: "embers",
      name: "Golden Drop",
      description: "The uncommon pull. Consistency made visible.",
      icon: "✹",
      embers: 150,
      xp: 100,
    },
  },
];

const WORLD_BY_WEEKDAY: Record<number, [string, string, string]> = {
  0: ["THE RETURN", "Rest is strategy. Do not confuse it with escape.", "Focus: Recovery"],
  1: ["THE ASCENT", "Start before you feel ready.", "Focus: Discipline"],
  2: ["THE PRESSURE", "Do the thing that has been waiting on you.", "Focus: Resilience"],
  3: ["THE CLEARING", "Remove noise. Keep what matters.", "Focus: Mental clarity"],
  4: ["THE FORGE", "Make today’s version harder to break.", "Focus: Strength"],
  5: ["THE EDGE", "Comfort is not the objective.", "Focus: Courage"],
  6: ["THE STANDARD", "Keep the line when nobody is scoring it.", "Focus: Consistency"],
};

function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function storage(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(DAILY_KEY) || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

function save(value: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DAILY_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event("livv-daily"));
}

export function loadBuffs(): DailyBuffs {
  if (typeof window === "undefined") {
    return { doubleXpUntil: null, frames: [], activeFrame: null, artifacts: [], packTickets: 0 };
  }
  try {
    const raw = window.localStorage.getItem(BUFFS_KEY);
    if (!raw) {
      return { doubleXpUntil: null, frames: [], activeFrame: null, artifacts: [], packTickets: 0 };
    }
    return {
      doubleXpUntil: null,
      frames: [],
      activeFrame: null,
      artifacts: [],
      packTickets: 0,
      ...JSON.parse(raw),
    } as DailyBuffs;
  } catch {
    return { doubleXpUntil: null, frames: [], activeFrame: null, artifacts: [], packTickets: 0 };
  }
}

function saveBuffs(b: DailyBuffs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BUFFS_KEY, JSON.stringify(b));
  window.dispatchEvent(new Event("livv-buffs"));
}

export function isDoubleXpActive(date = new Date()) {
  const b = loadBuffs();
  if (!b.doubleXpUntil) return false;
  return dayKey(date) <= b.doubleXpUntil;
}

export function seasonDay(date = new Date()) {
  const start = new Date(`${SEASON_START}T00:00:00`);
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.max(1, Math.floor((current.getTime() - start.getTime()) / 86400000) + 1);
}

export function seasonState(date = new Date()) {
  const day = seasonDay(date);
  const dayInSeason = ((day - 1) % 28) + 1;
  const chapter = Math.floor((dayInSeason - 1) / 7) + 1;
  const chapterNames = ["Ignition", "Pressure", "Momentum", "Ascent"];
  return {
    name: "SEASON 01 · THE ASCENT",
    day,
    dayInSeason,
    chapter,
    chapterName: chapterNames[chapter - 1],
    remaining: 28 - dayInSeason,
    progress: Math.round((dayInSeason / 28) * 100),
  };
}

/** Visible world state — changes with the weekday. */
export function worldState(date = new Date()): {
  title: string;
  line: string;
  focus: string;
} {
  const row = WORLD_BY_WEEKDAY[date.getDay()] || WORLD_BY_WEEKDAY[1];
  return { title: row[0], line: row[1], focus: row[2] };
}

export function dailyQuestion(date = new Date()) {
  return QUESTIONS[hash(dayKey(date)) % QUESTIONS.length];
}

export function dailyTasks(date = new Date()): DailyTask[] {
  const set = DAILY_SETS[hash(dayKey(date)) % DAILY_SETS.length];
  return set.map(([label, title, description, pillar, xpSize], index) => ({
    id: (["mind", "body", "life"] as const)[index],
    label,
    title,
    description,
    pillar,
    xpSize: xpSize as DailyTask["xpSize"],
  }));
}

/** Deterministic drop for the day (same for everyone that day — FOMO shared). */
export function dailyDrop(date = new Date()): DailyDrop {
  const h = hash(`${dayKey(date)}-drop-v2`);
  const total = DROP_POOL.reduce((s, x) => s + x.weight, 0);
  let roll = h % total;
  for (const entry of DROP_POOL) {
    if (roll < entry.weight) return entry.drop;
    roll -= entry.weight;
  }
  return DROP_POOL[0].drop;
}

export function loadDailyState(date = new Date()) {
  const data = storage();
  const key = dayKey(date);
  const completed = Array.isArray(data.completed)
    ? data.completed.filter((x): x is string => typeof x === "string")
    : [];
  const journal = Array.isArray(data.journal)
    ? (data.journal as DailyJournalEntry[]).filter(
        (x) => x && typeof x === "object" && typeof x.key === "string"
      )
    : [];
  const claimed =
    data.claimed && typeof data.claimed === "object"
      ? (data.claimed as Record<string, boolean>)
      : {};
  const dropRevealed =
    data.dropRevealed && typeof data.dropRevealed === "object"
      ? (data.dropRevealed as Record<string, boolean>)
      : {};

  return {
    key,
    completed: completed
      .filter((id) => id.startsWith(`${key}:`))
      .map((id) => id.slice(key.length + 1)),
    journal,
    dropClaimed: Boolean(claimed[key]),
    dropRevealed: Boolean(dropRevealed[key]),
  };
}

export function completeDailyTask(id: DailyTask["id"], date = new Date()) {
  const data = storage();
  const key = dayKey(date);
  const completed = Array.isArray(data.completed)
    ? data.completed.filter((x): x is string => typeof x === "string")
    : [];
  const token = `${key}:${id}`;
  if (!completed.includes(token)) {
    // Mind requires journal answer first
    if (id === "mind") {
      const journal = Array.isArray(data.journal) ? (data.journal as DailyJournalEntry[]) : [];
      if (!journal.some((j) => j.key === key && j.answer.trim().length > 0)) {
        return loadDailyState(date);
      }
    }
    const task = dailyTasks(date).find((item) => item.id === id);
    if (task) {
      logCustomAction({
        title: `Daily · ${task.title}`,
        pillar: task.pillar,
        size: task.xpSize,
      });
    }
    completed.push(token);
    data.completed = completed.slice(-120);
    save(data);
  }
  return loadDailyState(date);
}

export function saveDailyJournal(answer: string, date = new Date()) {
  const clean = answer.trim();
  if (!clean) return loadDailyState(date);
  const data = storage();
  const key = dayKey(date);
  const journal = Array.isArray(data.journal)
    ? (data.journal as DailyJournalEntry[]).filter(
        (x) => x && typeof x === "object" && typeof x.key === "string"
      )
    : [];
  const entry: DailyJournalEntry = {
    key,
    question: dailyQuestion(date),
    answer: clean,
    savedAt: Date.now(),
  };
  data.journal = [...journal.filter((item) => item.key !== key), entry].slice(-90);
  save(data);
  // Completing the journal counts as Mind
  return completeDailyTask("mind", date);
}

function applyDropEffects(drop: DailyDrop) {
  if (drop.embers > 0) addEmbers(drop.embers);
  if (drop.xp > 0) {
    logCustomAction({
      title: `Daily Drop · ${drop.name}`,
      pillar: "life",
      size: drop.xp >= 80 ? "major" : drop.xp >= 40 ? "standard" : "small",
    });
  }

  const buffs = loadBuffs();

  if (drop.kind === "streak_freeze") {
    try {
      const rec = loadRecord();
      rec.streakFreezes = (rec.streakFreezes || 0) + 1;
      // persist via localStorage path used by record
      window.localStorage.setItem("livv-record-v1", JSON.stringify(rec));
      window.dispatchEvent(new Event("livv-record"));
    } catch {
      /* noop */
    }
  }

  if (drop.kind === "pack_ticket") {
    buffs.packTickets += 1;
  }

  if (drop.kind === "double_xp_day") {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    buffs.doubleXpUntil = dayKey(t);
  }

  if (drop.kind === "frame" && drop.meta) {
    if (!buffs.frames.includes(drop.meta)) buffs.frames.push(drop.meta);
  }

  if (drop.kind === "artifact" && drop.meta) {
    if (!buffs.artifacts.includes(drop.meta)) buffs.artifacts.push(drop.meta);
  }

  if (drop.kind === "accent" && drop.meta) {
    try {
      patchIdentity({ accent: drop.meta });
    } catch {
      /* noop */
    }
  }

  saveBuffs(buffs);
}

export function claimDailyDrop(date = new Date()) {
  const data = storage();
  const key = dayKey(date);
  const claimed =
    data.claimed && typeof data.claimed === "object"
      ? { ...(data.claimed as Record<string, boolean>) }
      : {};
  const state = loadDailyState(date);
  if (state.completed.length < 3 || claimed[key]) {
    return { claimed: false as const, drop: dailyDrop(date) };
  }
  const drop = dailyDrop(date);
  claimed[key] = true;
  data.claimed = claimed;
  const revealed =
    data.dropRevealed && typeof data.dropRevealed === "object"
      ? { ...(data.dropRevealed as Record<string, boolean>) }
      : {};
  revealed[key] = true;
  data.dropRevealed = revealed;
  save(data);
  applyDropEffects(drop);
  return { claimed: true as const, drop };
}

export function journalCallback(date = new Date()) {
  const target = new Date(date);
  target.setDate(target.getDate() - 30);
  const targetKey = dayKey(target);
  return loadDailyState(date).journal.find((e) => e.key === targetKey) || null;
}

export function journalHistory() {
  return loadDailyState()
    .journal.slice()
    .sort((a, b) => b.key.localeCompare(a.key));
}

/** Summary for Home — “3 things waiting” */
export function dailySummary(date = new Date()) {
  const state = loadDailyState(date);
  const tasks = dailyTasks(date);
  const world = worldState(date);
  const season = seasonState(date);
  const drop = dailyDrop(date);
  const done = state.completed.length;
  return {
    world,
    season,
    tasks,
    done,
    total: tasks.length,
    allDone: done >= tasks.length,
    dropClaimed: state.dropClaimed,
    drop,
    question: dailyQuestion(date),
    hasJournal: state.journal.some((j) => j.key === state.key),
    callback: journalCallback(date),
    doubleXp: isDoubleXpActive(date),
  };
}

export function consumePackTicket(): boolean {
  const b = loadBuffs();
  if (b.packTickets <= 0) return false;
  b.packTickets -= 1;
  saveBuffs(b);
  return true;
}
