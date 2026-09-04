/** Come back without total loss of identity. */

import { loadRecord, saveRecord } from "./record";
import { enqueueMilestone } from "./milestones";

const KEY = "livv-last-broken-streak";

export function noteBrokenStreak(previous: number) {
  if (typeof window === "undefined" || previous < 3) return;
  window.localStorage.setItem(
    KEY,
    JSON.stringify({ previous, at: Date.now() })
  );
}

export function getRepairOffer(): { previous: number; restored: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const { previous, at } = JSON.parse(raw) as { previous: number; at: number };
    // offer valid 7 days
    if (Date.now() - at > 7 * 86400000) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    if (previous < 3) return null;
    const rec = loadRecord();
    if (rec.streak >= previous) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    // restore half, min 2
    const restored = Math.max(2, Math.floor(previous / 2));
    return { previous, restored };
  } catch {
    return null;
  }
}

export function applyStreakRepair() {
  const offer = getRepairOffer();
  if (!offer) return null;
  const rec = loadRecord();
  rec.streak = Math.max(rec.streak, offer.restored);
  saveRecord(rec);
  window.localStorage.removeItem(KEY);
  enqueueMilestone("repair");
  return offer;
}
