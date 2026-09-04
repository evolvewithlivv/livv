/** User-chosen weekly active-day target. */

import { dayKey } from "./dates";
import { weekHitCount, loadRecord } from "./record";

export type WeeklyClearState = {
  target: number; // 3–7
  weekKey: string;
  claimed: boolean;
};

const KEY = "livv-weekly-clear-v1";

function weekKey(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  return dayKey(d);
}

export function loadWeeklyClear(): WeeklyClearState {
  if (typeof window === "undefined") {
    return { target: 4, weekKey: weekKey(), claimed: false };
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    const wk = weekKey();
    if (!raw) {
      const s = { target: 4, weekKey: wk, claimed: false };
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw) as WeeklyClearState;
    if (parsed.weekKey !== wk) {
      const s = { target: parsed.target || 4, weekKey: wk, claimed: false };
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return parsed;
  } catch {
    return { target: 4, weekKey: weekKey(), claimed: false };
  }
}

function save(s: WeeklyClearState) {
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("livv-weekly"));
}

export function setWeeklyTarget(target: number) {
  const s = loadWeeklyClear();
  s.target = Math.min(7, Math.max(3, target));
  save(s);
  return s;
}

export function weeklyClearStatus() {
  const s = loadWeeklyClear();
  const hits = weekHitCount(loadRecord());
  const met = hits >= s.target;
  return { ...s, hits, met, remaining: Math.max(0, s.target - hits) };
}

export function claimWeeklyClear() {
  const st = weeklyClearStatus();
  if (!st.met || st.claimed) return null;
  const s = loadWeeklyClear();
  s.claimed = true;
  save(s);
  return s;
}
