/** Rare ceremonies — not badge spam. */

import { loadRecord } from "./record";

export type MilestoneId =
  | "chain_7"
  | "chain_30"
  | "chain_100"
  | "clear_day"
  | "level_up"
  | "first_pack"
  | "repair";

export type MilestoneDef = {
  id: MilestoneId;
  title: string;
  line: string;
};

export const MILESTONE_DEFS: MilestoneDef[] = [
  { id: "chain_7", title: "Seven days", line: "The chain held for a week. Most people never get here." },
  { id: "chain_30", title: "Thirty days", line: "A month of proof. This is identity, not a mood." },
  { id: "chain_100", title: "One hundred", line: "Three digits. You are not the same person who started." },
  { id: "clear_day", title: "Clear day", line: "Every pillar had signal. Protect recovery." },
  { id: "level_up", title: "Evolution", line: "You crossed a threshold. The title changes because you did." },
  { id: "first_pack", title: "First pull", line: "The vault is no longer empty." },
  { id: "repair", title: "Rebuilt", line: "You came back. The chain is not only for the unbroken." },
];

const KEY = "livv-milestones-v1";
const QUEUE_KEY = "livv-milestone-queue-v1";

export function loadSeen(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

function saveSeen(ids: string[]) {
  window.localStorage.setItem(KEY, JSON.stringify(ids));
}

export function loadQueue(): MilestoneId[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(QUEUE_KEY) || "[]") as MilestoneId[];
  } catch {
    return [];
  }
}

function saveQueue(q: MilestoneId[]) {
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  window.dispatchEvent(new Event("livv-milestones"));
}

export function enqueueMilestone(id: MilestoneId) {
  const seen = loadSeen();
  if (seen.includes(id) && id !== "level_up" && id !== "clear_day") return;
  // level_up and clear_day can fire more than once with unique keys
  const key = id === "level_up" ? `level_up_${loadRecord().level}` : id === "clear_day" ? `clear_${new Date().toDateString()}` : id;
  if (seen.includes(key)) return;
  seen.push(key);
  saveSeen(seen);
  const q = loadQueue();
  if (!q.includes(id)) {
    q.push(id);
    saveQueue(q);
  }
}

export function peekMilestone(): MilestoneDef | null {
  const q = loadQueue();
  if (!q.length) return null;
  return MILESTONE_DEFS.find((m) => m.id === q[0]) || null;
}

export function dismissMilestone() {
  const q = loadQueue();
  q.shift();
  saveQueue(q);
}

/** Call after record changes to detect new milestones. */
export function evaluateMilestones() {
  const rec = loadRecord();
  if (rec.streak >= 7) enqueueMilestone("chain_7");
  if (rec.streak >= 30) enqueueMilestone("chain_30");
  if (rec.streak >= 100) enqueueMilestone("chain_100");
}
