import { addEmbers } from "./identity";
import { logCustomAction } from "./record";

export type CanonSession = {
  id: string;
  at: number;
  minutes: number;
  stolen: string;
};

export type Volume = {
  id: string;
  title: string;
  author: string;
  openedAt: number;
  closedAt: number | null;
  scar: string;
  sessions: CanonSession[];
};

export type CanonState = {
  activeId: string | null;
  volumes: Volume[];
};

const KEY = "livv-canon-v1";

const EMPTY: CanonState = { activeId: null, volumes: [] };

export function loadCanon(): CanonState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) } as CanonState;
  } catch {
    return EMPTY;
  }
}

function save(next: CanonState) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("livv-canon"));
}

export function activeVolume(state = loadCanon()) {
  return state.volumes.find((v) => v.id === state.activeId) || null;
}

export function shelf(state = loadCanon()) {
  return state.volumes
    .filter((v) => v.closedAt)
    .sort((a, b) => (b.closedAt || 0) - (a.closedAt || 0));
}

export function openVolume(title: string, author: string) {
  const state = loadCanon();
  if (state.activeId) return state;
  const vol: Volume = {
    id: `vol_${Date.now()}`,
    title: title.trim(),
    author: author.trim(),
    openedAt: Date.now(),
    closedAt: null,
    scar: "",
    sessions: [],
  };
  state.volumes.unshift(vol);
  state.activeId = vol.id;
  save(state);
  return state;
}

export function sitWithVolume(minutes: number, stolen: string) {
  const state = loadCanon();
  const vol = state.volumes.find((v) => v.id === state.activeId);
  if (!vol) return state;
  const mins = Math.max(1, Math.min(240, Math.round(minutes || 1)));
  vol.sessions.unshift({
    id: `sit_${Date.now()}`,
    at: Date.now(),
    minutes: mins,
    stolen: stolen.trim(),
  });
  save(state);
  logCustomAction({
    title: `Sat with ${vol.title} · ${mins}m`,
    pillar: "Mind",
    size: mins >= 40 ? "major" : mins >= 20 ? "standard" : "small",
  });
  addEmbers(mins >= 40 ? 6 : 3);
  return state;
}

export function closeVolume(scar: string) {
  const state = loadCanon();
  const vol = state.volumes.find((v) => v.id === state.activeId);
  if (!vol) return state;
  vol.closedAt = Date.now();
  vol.scar = scar.trim();
  state.activeId = null;
  save(state);
  logCustomAction({
    title: `Closed ${vol.title}`,
    pillar: "Mind",
    size: "major",
  });
  addEmbers(8);
  return state;
}

export function minutesIn(vol: Volume) {
  return vol.sessions.reduce((n, s) => n + s.minutes, 0);
}
