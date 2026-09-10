/**
 * LIVV Daily — the retention engine.
 * Open → Discover → Act → Earn → Unlock → Reflect → Come back tomorrow.
 */

import { addEmbers, loadIdentity, patchIdentity } from "./identity";
import { logCustomAction, loadRecord, useStreakFreeze } from "./record";
import { dayKey } from "./dates";
import { adaptiveDailyTasks } from "./daily-adaptive";

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
  embers: number;
  xp: number;
  meta?: string;
};

export type DailyBuffs = {
  doubleXpUntil: string | null;
  frames: string[];
  activeFrame: string | null;
  artifacts: string[];
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

const DROP_POOL: { weight: number; drop: DailyDrop }[] = [
  { weight: 28, drop: { id: "ember-cache", kind: "embers", name: "Ember Cache", description: "Fuel for the long run.", icon: "✦", embers: 40, xp: 15 } },
  { weight: 18, drop: { id: "ember-surge", kind: "embers", name: "Ember Surge", description: "A bigger hit for finishing the full Daily.", icon: "✧", embers: 75, xp: 25 } },
  { weight: 12, drop: { id: "xp-spark", kind: "xp_boost", name: "XP Spark", description: "Instant progress toward your next Evolution level.", icon: "↑", embers: 15, xp: 80 } },
  { weight: 10, drop: { id: "freeze-token", kind: "streak_freeze", name: "Streak Freeze", description: "One more freeze in the vault. Protect the chain.", icon: "❄", embers: 10, xp: 10 } },
  { weight: 10, drop: { id: "pack-ticket", kind: "pack_ticket", name: "Pack Ticket", description: "One free pack open on the Shop.", icon: "▣", embers: 5, xp: 10 } },
  { weight: 8, drop: { id: "double-xp", kind: "double_xp_day", name: "Double XP Window", description: "Next 24 hours of actions count double toward Evolution.", icon: "⚡", embers: 20, xp: 20, meta: "1" } },
  { weight: 7, drop: { id: "frame-ember", kind: "frame", name: "Ember Frame", description: "A profile frame unlocked by finishing the Daily.", icon: "◎", embers: 10, xp: 15, meta: "frame-ember" } },
  { weight: 5, drop: { id: "artifact-shard", kind: "artifact", name: "Artifact Shard", description: "A collectible for the long game.", icon: "◆", embers: 25, xp: 30, meta: "shard-1" } },
  { weight: 2, drop: { id: "accent-shift", kind: "accent", name: "Accent Shift", description: "A temporary accent tone for your profile.", icon: "◌", embers: 15, xp: 20, meta: "#67d8ff" } },
];

const WORLD_BY_WEEKDAY: Record<number, [string, string, string]> = {
  0: ["Sunday reset", "Clear the week. Keep only what compounds.", "Reflect"],
  1: ["Monday ignition", "Start before the noise starts.", "Body"],
  2: ["Tuesday build", "Stack one brick. Then another.", "Career"],
  3: ["Wednesday hold", "Middle of the week. Do not negotiate.", "Mind"],
  4: ["Thursday pressure", "Finish what you opened.", "Life"],
  5: ["Friday proof", "Leave evidence you showed up.", "Body"],
  6: ["Saturday range", "Train freedom with structure.", "Social"],
};

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function storage(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DAILY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function save(value: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DAILY_KEY, JSON.stringify(value));
    window.dispatchEvent(new Event("livv-daily"));
  } catch {}
}

export function loadBuffs(): DailyBuffs {
  if (typeof window === "undefined") {
    return { doubleXpUntil: null, frames: [], activeFrame: null, artifacts: [], packTickets: 0 };
  }
  try {
    const raw = window.localStorage.getItem(BUFFS_KEY);
    if (!raw) return { doubleXpUntil: null, frames: [], activeFrame: null, artifacts: [], packTickets: 0 };
    const p = JSON.parse(raw) as Partial<DailyBuffs>;
    return {
      doubleXpUntil: typeof p.doubleXpUntil === "string" ? p.doubleXpUntil : null,
      frames: Array.isArray(p.frames) ? p.frames.filter((x) => typeof x === "string") : [],
      activeFrame: typeof p.activeFrame === "string" ? p.activeFrame : null,
      artifacts: Array.isArray(p.artifacts) ? p.artifacts.filter((x) => typeof x === "string") : [],
      packTickets: typeof p.packTickets === "number" ? p.packTickets : 0,
    };
  } catch {
    return { doubleXpUntil: null, frames: [], activeFrame: null, artifacts: [], packTickets: 0 };
  }
}

function saveBuffs(b: DailyBuffs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BUFFS_KEY, JSON.stringify(b));
    window.dispatchEvent(new Event("livv-buffs"));
  } catch {}
}

export function isDoubleXpActive(date = new Date()) {
  const until = loadBuffs().doubleXpUntil;
  if (!until) return false;
  return dayKey(date) <= until;
}

export function seasonDay(date = new Date()) {
  const start = new Date(SEASON_START + "T12:00:00");
  const cur = new Date(date);
  cur.setHours(12, 0, 0, 0);
  return Math.max(0, Math.floor((cur.getTime() - start.getTime()) / 86400000));
}

export function seasonState(date = new Date()) {
  const day = seasonDay(date);
  const dayInSeason = (day % 28) + 1;
  const chapter = Math.floor(day / 28) % 4;
  const chapterNames = ["Ignition", "Pressure", "Range", "Proof"];
  return {
    day,
    dayInSeason,
    chapter: chapter + 1,
    chapterName: chapterNames[chapter],
    remaining: 28 - dayInSeason,
    progress: Math.round((dayInSeason / 28) * 100),
  };
}

export function worldState(date = new Date()): { title: string; line: string; focus: string } {
  const row = WORLD_BY_WEEKDAY[date.getDay()] || WORLD_BY_WEEKDAY[1];
  return { title: row[0], line: row[1], focus: row[2] };
}

export function dailyQuestion(date = new Date()) {
  return QUESTIONS[hash(dayKey(date)) % QUESTIONS.length];
}

export function dailyTasks(date = new Date()): DailyTask[] {
  try {
    return adaptiveDailyTasks(date, loadRecord()) as DailyTask[];
  } catch {
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
}

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
    completed: completed.filter((id) => id.startsWith(`${key}:`)).map((id) => id.slice(key.length + 1)),
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
    data.completed = completed;
    save(data);
  }
  return loadDailyState(date);
}

export function saveDailyJournal(answer: string, date = new Date()) {
  const data = storage();
  const key = dayKey(date);
  const journal = Array.isArray(data.journal)
    ? (data.journal as DailyJournalEntry[]).filter(
        (x) => x && typeof x === "object" && typeof x.key === "string"
      )
    : [];
  const next: DailyJournalEntry = {
    key,
    question: dailyQuestion(date),
    answer: answer.trim(),
    savedAt: Date.now(),
  };
  const idx = journal.findIndex((j) => j.key === key);
  if (idx >= 0) journal[idx] = next;
  else journal.unshift(next);
  data.journal = journal.slice(0, 60);
  save(data);
  return next;
}

function applyDropEffects(drop: DailyDrop) {
  if (drop.embers > 0) addEmbers(drop.embers);
  if (drop.xp > 0) {
    try {
      logCustomAction({
        title: `Daily drop: ${drop.name}`,
        pillar: "life",
        size: drop.xp >= 50 ? "major" : drop.xp >= 20 ? "standard" : "small",
      });
    } catch {}
  }
  const buffs = loadBuffs();
  if (drop.kind === "pack_ticket") buffs.packTickets += 1;
  if (drop.kind === "streak_freeze") {
    try {
      useStreakFreeze();
    } catch {}
  }
  if (drop.kind === "double_xp_day") {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    buffs.doubleXpUntil = dayKey(d);
  }
  if (drop.kind === "frame" && drop.meta) {
    if (!buffs.frames.includes(drop.meta)) buffs.frames.push(drop.meta);
    buffs.activeFrame = drop.meta;
  }
  if (drop.kind === "artifact" && drop.meta) {
    if (!buffs.artifacts.includes(drop.meta)) buffs.artifacts.push(drop.meta);
  }
  if (drop.kind === "accent" && drop.meta) {
    try {
      patchIdentity({ accent: drop.meta });
    } catch {}
  }
  saveBuffs(buffs);
}

export function claimDailyDrop(date = new Date()) {
  const data = storage();
  const key = dayKey(date);
  const claimed =
    data.claimed && typeof data.claimed === "object"
      ? (data.claimed as Record<string, boolean>)
      : {};
  if (claimed[key]) return { ok: false as const, drop: null };
  const state = loadDailyState(date);
  if (state.completed.length < 3) return { ok: false as const, drop: null };
  const drop = dailyDrop(date);
  claimed[key] = true;
  data.claimed = claimed;
  save(data);
  applyDropEffects(drop);
  return { ok: true as const, drop };
}

export function journalCallback(date = new Date()) {
  return saveDailyJournal("", date);
}

export function journalHistory() {
  const data = storage();
  return Array.isArray(data.journal) ? (data.journal as DailyJournalEntry[]) : [];
}

export function dailySummary(date = new Date()) {
  const state = loadDailyState(date);
  const tasks = dailyTasks(date);
  return {
    key: state.key,
    completedCount: state.completed.length,
    totalTasks: tasks.length,
    dropClaimed: state.dropClaimed,
    season: seasonState(date),
    world: worldState(date),
  };
}

export function consumePackTicket(): boolean {
  const b = loadBuffs();
  if (b.packTickets <= 0) return false;
  b.packTickets -= 1;
  saveBuffs(b);
  return true;
}
