/**
 * First-party behavioral event bus (local-first).
 * Powers reports, Evala evidence, personalization — not a remote analytics product yet.
 * LIMITATION: stored on-device; not cloud-synced.
 */

export type LivvEventName =
  | "mission_started"
  | "mission_completed"
  | "mission_missed"
  | "commitment_created"
  | "commitment_modified"
  | "checkin_completed"
  | "checkin_missed"
  | "focus_session_completed"
  | "training_completed"
  | "goal_created"
  | "goal_completed"
  | "streak_started"
  | "streak_broken"
  | "streak_recovered"
  | "evala_insight_viewed"
  | "onboarding_completed"
  | "pack_opened"
  | "day_reviewed";

export type LivvEvent = {
  id: string;
  name: LivvEventName;
  at: number;
  dayKey?: string;
  meta?: Record<string, string | number | boolean | null>;
};

const KEY = "livv-events-v1";
const MAX = 500;

function dayKeyFrom(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function loadEvents(): LivvEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LivvEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEvents(events: LivvEvent[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(events.slice(0, MAX)));
  window.dispatchEvent(new Event("livv-events"));
}

export function emitEvent(
  name: LivvEventName,
  meta?: LivvEvent["meta"]
): LivvEvent {
  const at = Date.now();
  const event: LivvEvent = {
    id: `ev_${at}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    at,
    dayKey: dayKeyFrom(at),
    meta,
  };
  if (typeof window === "undefined") return event;
  const next = [event, ...loadEvents()].slice(0, MAX);
  saveEvents(next);
  return event;
}

export function eventsInRange(fromMs: number, toMs = Date.now()) {
  return loadEvents().filter((e) => e.at >= fromMs && e.at <= toMs);
}

export function countEvents(name: LivvEventName, fromMs?: number) {
  const list = fromMs != null ? eventsInRange(fromMs) : loadEvents();
  return list.filter((e) => e.name === name).length;
}
