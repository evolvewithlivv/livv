/**
 * Adaptive Daily v1 — bias which deterministic Daily set is shown
 * using LivvRecord only (pillar XP, recent day activity, streak).
 * No psychological/neuro metrics. Local-first and explainable.
 */

import { dayKey } from "./dates";
import { needsAttention } from "./command";
import { loadRecord, type LivvRecord } from "./record";
import type { DailyTask } from "./daily";

/** Same shape as DAILY_SETS rows in daily.ts — kept local to avoid circular imports of the pool. */
const ADAPTIVE_SETS: readonly (readonly (readonly [string, string, string, string, string])[])[] = [
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
];

export type AdaptiveDailyContext = {
  focusSlot: "mind" | "body" | "life";
  focusLabel: string;
  weakPillarName: string;
  inactiveDaysInWindow: number;
  windowDays: number;
  reason: string;
  evidence: string[];
  setIndex: number;
};

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Map six-pillar system → Daily mind/body/life slots. */
export function pillarToDailySlot(pillarIdOrName: string): "mind" | "body" | "life" {
  const p = pillarIdOrName.toLowerCase();
  if (p === "body") return "body";
  if (p === "mind") return "mind";
  // career / finance / social / life → life slot (open loops, environment, useful moves)
  return "life";
}

function pastKeys(n: number, end = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    keys.push(dayKey(d));
  }
  return keys;
}

function dayWasActive(rec: LivvRecord, key: string): boolean {
  const log = rec.days[key];
  if (!log) return false;
  return Boolean(
    log.checkIn ||
      log.workout ||
      (log.objectives && log.objectives.length > 0) ||
      (log.custom && log.custom.length > 0)
  );
}

function scoreSet(
  set: (readonly [string, string, string, string, string])[],
  focus: "mind" | "body" | "life"
): number {
  let score = 0;
  set.forEach((row, i) => {
    const slot = (["mind", "body", "life"] as const)[i];
    const xp = row[4];
    if (slot === focus) {
      score += 10;
      if (xp === "major") score += 6;
      else if (xp === "standard") score += 3;
    }
  });
  return score;
}

export function getAdaptiveDailyContext(
  date = new Date(),
  rec: LivvRecord = loadRecord()
): AdaptiveDailyContext {
  const weak = needsAttention(rec);
  const focusSlot = pillarToDailySlot(weak.id || weak.name);
  const windowDays = 14;
  const keys = pastKeys(windowDays, date);
  const inactiveDaysInWindow = keys.filter((k) => !dayWasActive(rec, k)).length;

  const scored = ADAPTIVE_SETS.map((set, index) => ({
    index,
    score: scoreSet([...set], focusSlot),
  }));
  const maxScore = Math.max(...scored.map((s) => s.score));
  const candidates = scored.filter((s) => s.score === maxScore).map((s) => s.index);
  // Deterministic among best sets for this calendar day + focus
  const setIndex = candidates[hash(`${dayKey(date)}:${focusSlot}:adapt-v1`) % candidates.length];

  const focusLabel = focusSlot === "body" ? "Body" : focusSlot === "mind" ? "Mind" : "Life";
  const evidence = [
    `Weakest pillar signal: ${weak.name} (Lv ${weak.level})`,
    `Mapped Daily slot: ${focusLabel}`,
    `Inactive days in last ${windowDays}: ${inactiveDaysInWindow}`,
    `Current streak: ${rec.streak}`,
    `Selected set index: ${setIndex} (score ${maxScore})`,
  ];

  let reason: string;
  if (inactiveDaysInWindow >= 7) {
    reason = `${inactiveDaysInWindow} quiet days in the last ${windowDays}. Today's set leans ${focusLabel} because ${weak.name} is the lightest pillar on record.`;
  } else if (rec.streak === 0) {
    reason = `No active chain. Set biased toward ${focusLabel} from ${weak.name} XP standing.`;
  } else {
    reason = `Set biased toward ${focusLabel} — ${weak.name} has the least pillar XP. Same day always resolves the same way.`;
  }

  return {
    focusSlot,
    focusLabel,
    weakPillarName: weak.name,
    inactiveDaysInWindow,
    windowDays,
    reason,
    evidence,
    setIndex,
  };
}

export function adaptiveDailyTasks(
  date = new Date(),
  rec: LivvRecord = loadRecord()
): DailyTask[] {
  const ctx = getAdaptiveDailyContext(date, rec);
  const set = ADAPTIVE_SETS[ctx.setIndex];
  return set.map(([label, title, description, pillar, xpSize], index) => {
    const id = (["mind", "body", "life"] as const)[index];
    let size = xpSize as DailyTask["xpSize"];
    // Mild, visible bias: if this is the focus slot and still "small", bump to standard
    if (id === ctx.focusSlot && size === "small") size = "standard";
    return {
      id,
      label,
      title,
      description,
      pillar,
      xpSize: size,
    };
  });
}
