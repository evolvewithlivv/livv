/**
 * Adaptive Daily v1 — bias which deterministic Daily set is shown
 * using LivvRecord (pillar XP, activity) and, when XP is flat,
 * declared onboarding goal intent as a soft bias.
 * No psychological/neuro metrics. Local-first and explainable.
 *
 * Intentionally does not import from daily.ts or command.ts to avoid cycles.
 */

import { dayKey } from "./dates";
import { loadRecord, type LivvRecord } from "./record";
import { PILLAR_DEFS } from "./evolve-data";
import {
  intentDailySlot,
  loadOnboardingDraft,
  onboardingIntentKey,
  type DailyIntentSlot,
} from "./onboarding";

export type AdaptiveDailyTask = {
  id: "mind" | "body" | "life";
  label: string;
  title: string;
  description: string;
  pillar: string;
  xpSize: "small" | "standard" | "major";
};

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
  [
    ["Mind", "Capture the win condition", "Define what ‘enough’ looks like for today in one sentence.", "mind", "small"],
    ["Body", "Mobility reset", "5–10 minutes of stretching or joint work. No performance score.", "body", "small"],
    ["Life", "Protect tomorrow", "Lay out clothes, prep food, or block one calendar slot for deep work.", "life", "standard"],
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
  /** How focusSlot was chosen */
  focusSource: "pillar_xp" | "onboarding_goals";
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
  return "life";
}

function weakestPillar(rec: LivvRecord): { id: string; name: string; xp: number } {
  const xp = rec.pillarXp || {};
  let best = { id: "mind", name: "Mind", xp: Number.POSITIVE_INFINITY };
  for (const p of PILLAR_DEFS) {
    const v = xp[p.id] ?? 0;
    if (v < best.xp) best = { id: p.id, name: p.name, xp: v };
  }
  return best;
}

/** True when pillar XP cannot establish a meaningful weakest pillar. */
function pillarXpIsFlat(rec: LivvRecord): boolean {
  const vals = PILLAR_DEFS.map((p) => rec.pillarXp?.[p.id] ?? 0);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  return max === 0 || max === min;
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
    const size = row[4];
    if (slot === focus) {
      score += 10;
      if (size === "major") score += 6;
      else if (size === "standard") score += 3;
    }
  });
  return score;
}

function slotLabel(slot: DailyIntentSlot): string {
  return slot === "body" ? "Body" : slot === "mind" ? "Mind" : "Life";
}

export function getAdaptiveDailyContext(
  date = new Date(),
  rec: LivvRecord = loadRecord()
): AdaptiveDailyContext {
  const weak = weakestPillar(rec);
  const draft = loadOnboardingDraft();
  const intent = intentDailySlot(draft);
  const flat = pillarXpIsFlat(rec);

  let focusSlot: DailyIntentSlot = pillarToDailySlot(weak.id);
  let focusSource: "pillar_xp" | "onboarding_goals" = "pillar_xp";

  if (flat && intent) {
    focusSlot = intent;
    focusSource = "onboarding_goals";
  }

  const windowDays = 14;
  const keys = pastKeys(windowDays, date);
  const inactiveDaysInWindow = keys.filter((k) => !dayWasActive(rec, k)).length;

  const scored = ADAPTIVE_SETS.map((set, index) => ({
    index,
    score: scoreSet([...set], focusSlot),
  }));
  const maxScore = Math.max(...scored.map((s) => s.score));
  const candidates = scored.filter((s) => s.score === maxScore).map((s) => s.index);
  const intentKey = focusSource === "onboarding_goals" ? onboardingIntentKey(draft) : "";
  const setIndex =
    candidates[
      hash(`${dayKey(date)}:${focusSlot}:adapt-v1:${intentKey}`) % candidates.length
    ];

  const focusLabel = slotLabel(focusSlot);
  const evidence = [
    `Lowest pillar XP: ${weak.name} (${weak.xp} XP)`,
    flat ? "Pillar XP empty or tied — no meaningful weakest pillar" : "Pillar XP imbalance present",
    focusSource === "onboarding_goals"
      ? `Focus from declared onboarding goals → ${focusLabel}`
      : `Focus from pillar XP → ${focusLabel} (${weak.name})`,
    `Inactive days in last ${windowDays}: ${inactiveDaysInWindow}`,
    `Current streak: ${rec.streak}`,
    `Selected set index: ${setIndex} (score ${maxScore})`,
  ];

  let reason: string;
  if (focusSource === "onboarding_goals") {
    reason = `Pillar XP is flat. Today's set leans ${focusLabel} from goals you chose in onboarding — declared direction, not measured traits.`;
  } else if (inactiveDaysInWindow >= 7) {
    reason = `${inactiveDaysInWindow} quiet days in the last ${windowDays}. Today's set leans ${focusLabel} because ${weak.name} has the least pillar XP.`;
  } else if (rec.streak === 0) {
    reason = `No active chain. Set biased toward ${focusLabel} from ${weak.name} XP standing.`;
  } else {
    reason = `Set biased toward ${focusLabel} — ${weak.name} has the least pillar XP. Same calendar day resolves the same way.`;
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
    focusSource,
  };
}

export function adaptiveDailyTasks(
  date = new Date(),
  rec: LivvRecord = loadRecord()
): AdaptiveDailyTask[] {
  const ctx = getAdaptiveDailyContext(date, rec);
  const set = ADAPTIVE_SETS[ctx.setIndex];
  return set.map(([label, title, description, pillar, xpSize], index) => {
    const id = (["mind", "body", "life"] as const)[index];
    let size = xpSize as AdaptiveDailyTask["xpSize"];
    if (id === ctx.focusSlot && size === "small") size = "standard";
    return { id, label, title, description, pillar, xpSize: size };
  });
}
