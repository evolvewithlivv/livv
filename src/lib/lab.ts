import { addEmbers } from "./identity";
import { logCustomAction } from "./record";

export type HuntStatus = "hunting" | "forming" | "locked";

export type Signal = {
  id: string;
  at: number;
  source: string;
  proof: string;
};

export type Hunt = {
  id: string;
  question: string;
  status: HuntStatus;
  openedAt: number;
  lockedAt: number | null;
  verdict: string;
  signals: Signal[];
};

export type LabState = { hunts: Hunt[] };

const KEY = "livv-lab-v1";
const EMPTY: LabState = { hunts: [] };

export function loadLab(): LabState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) } as LabState;
  } catch {
    return EMPTY;
  }
}

function save(next: LabState) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("livv-lab"));
}

export function openHunts(state = loadLab()) {
  return state.hunts.filter((h) => h.status !== "locked");
}

export function lockedHunts(state = loadLab()) {
  return state.hunts.filter((h) => h.status === "locked");
}

export function startHunt(question: string) {
  const state = loadLab();
  const hunt: Hunt = {
    id: `hunt_${Date.now()}`,
    question: question.trim(),
    status: "hunting",
    openedAt: Date.now(),
    lockedAt: null,
    verdict: "",
    signals: [],
  };
  state.hunts.unshift(hunt);
  save(state);
  return state;
}

export function addSignal(huntId: string, source: string, proof: string) {
  const state = loadLab();
  const hunt = state.hunts.find((h) => h.id === huntId);
  if (!hunt || hunt.status === "locked") return state;
  hunt.signals.unshift({
    id: `sig_${Date.now()}`,
    at: Date.now(),
    source: source.trim(),
    proof: proof.trim(),
  });
  if (hunt.signals.length >= 2) hunt.status = "forming";
  save(state);
  logCustomAction({
    title: `Signal · ${hunt.question.slice(0, 42)}`,
    pillar: "Mind",
    size: "standard",
  });
  addEmbers(4);
  return state;
}

export function lockHunt(huntId: string, verdict: string) {
  const state = loadLab();
  const hunt = state.hunts.find((h) => h.id === huntId);
  if (!hunt || hunt.status === "locked") return state;
  hunt.status = "locked";
  hunt.lockedAt = Date.now();
  hunt.verdict = verdict.trim();
  save(state);
  logCustomAction({
    title: `Locked hunt · ${hunt.question.slice(0, 42)}`,
    pillar: "Mind",
    size: "major",
  });
  addEmbers(10);
  return state;
}
