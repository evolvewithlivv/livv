/** Local fasting tracker — not medical advice. */

export type FastProtocol = {
  id: string;
  name: string;
  hours: number;
  blurb: string;
};

export type FastSession = {
  id: string;
  protocolId: string;
  protocolName: string;
  targetHours: number;
  startedAt: number;
  endedAt: number | null;
  status: "active" | "completed" | "broken";
  note?: string;
};

export type FastState = {
  sessions: FastSession[];
  activeId: string | null;
};

const KEY = "livv-fasting-v1";

export const PROTOCOLS: FastProtocol[] = [
  { id: "16-8", name: "16:8", hours: 16, blurb: "Most popular. Eat in an 8-hour window." },
  { id: "18-6", name: "18:6", hours: 18, blurb: "Tighter window. Stronger discipline." },
  { id: "20-4", name: "20:4", hours: 20, blurb: "Warrior-style. One main meal window." },
  { id: "omad", name: "OMAD", hours: 23, blurb: "One meal a day. Advanced." },
  { id: "24", name: "24h", hours: 24, blurb: "Full day reset." },
  { id: "36", name: "36h", hours: 36, blurb: "Extended. Only if you know your body." },
  { id: "custom", name: "Custom", hours: 16, blurb: "Set your own target hours." },
];

function empty(): FastState { return { sessions: [], activeId: null }; }

export function loadFastState(): FastState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as FastState;
    if (!parsed || !Array.isArray(parsed.sessions)) return empty();
    return { sessions: parsed.sessions.slice(0, 60), activeId: parsed.activeId || null };
  } catch { return empty(); }
}

export function saveFastState(state: FastState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ sessions: state.sessions.slice(0, 60), activeId: state.activeId }));
    window.dispatchEvent(new Event("livv-fasting"));
  } catch {}
}

export function getActiveFast(state = loadFastState()): FastSession | null {
  if (!state.activeId) return null;
  return state.sessions.find((s) => s.id === state.activeId && s.status === "active") || null;
}

export function startFast(opts: { protocolId: string; targetHours?: number; note?: string }): FastSession {
  const state = loadFastState();
  const current = getActiveFast(state);
  if (current) return current;
  const protocol = PROTOCOLS.find((p) => p.id === opts.protocolId) || PROTOCOLS[0];
  const hours = opts.targetHours && Number.isFinite(opts.targetHours) && opts.targetHours > 0 ? Math.min(168, opts.targetHours) : protocol.hours;
  const session: FastSession = {
    id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    protocolId: protocol.id,
    protocolName: protocol.name,
    targetHours: hours,
    startedAt: Date.now(),
    endedAt: null,
    status: "active",
    note: opts.note?.trim() || undefined,
  };
  state.sessions = [session, ...state.sessions].slice(0, 60);
  state.activeId = session.id;
  saveFastState(state);
  return session;
}

export function endFast(opts?: { broken?: boolean; note?: string }): FastSession | null {
  const state = loadFastState();
  const active = getActiveFast(state);
  if (!active) return null;
  active.endedAt = Date.now();
  const elapsedH = (active.endedAt - active.startedAt) / 3_600_000;
  active.status = opts?.broken ? "broken" : elapsedH >= active.targetHours * 0.95 ? "completed" : "broken";
  if (opts?.note?.trim()) active.note = opts.note.trim();
  state.activeId = null;
  state.sessions = state.sessions.map((s) => (s.id === active.id ? active : s));
  saveFastState(state);
  return active;
}

export function cancelFast() {
  const state = loadFastState();
  const active = getActiveFast(state);
  if (!active) return;
  state.activeId = null;
  state.sessions = state.sessions.filter((s) => s.id !== active.id);
  saveFastState(state);
}

export function elapsedMs(session: FastSession, now = Date.now()) {
  return Math.max(0, (session.endedAt ?? now) - session.startedAt);
}

export function progressPct(session: FastSession, now = Date.now()) {
  const target = session.targetHours * 3_600_000;
  if (target <= 0) return 0;
  return Math.min(100, Math.round((elapsedMs(session, now) / target) * 100));
}

export function formatDuration(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export function formatClock(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function remainingMs(session: FastSession, now = Date.now()) {
  return Math.max(0, session.targetHours * 3_600_000 - elapsedMs(session, now));
}

export function fastingStats(state = loadFastState()) {
  const done = state.sessions.filter((s) => s.status === "completed");
  const totalHours = done.reduce((sum, s) => sum + elapsedMs(s) / 3_600_000, 0);
  const longest = done.reduce((max, s) => Math.max(max, elapsedMs(s)), 0);
  const days = new Set(done.map((s) => {
    const d = new Date(s.endedAt || s.startedAt);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 60; i++) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (days.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  return { completed: done.length, totalHours: Math.round(totalHours * 10) / 10, longestMs: longest, streak };
}
