/** Optional accountability pair — scaffold until real social graph. */

export type PairChain = {
  partnerName: string;
  partnerUsername: string;
  pillar: string;
  sharedDays: number;
  lastActive: string | null;
};

const KEY = "livv-pair-chain-v1";

export function loadPair(): PairChain | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PairChain) : null;
  } catch {
    return null;
  }
}

export function setPair(input: Omit<PairChain, "sharedDays" | "lastActive">) {
  const p: PairChain = {
    ...input,
    sharedDays: 0,
    lastActive: null,
  };
  window.localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("livv-pair"));
  return p;
}

export function clearPair() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("livv-pair"));
}

export function bumpPairDay() {
  const p = loadPair();
  if (!p) return null;
  const today = new Date().toDateString();
  if (p.lastActive === today) return p;
  p.sharedDays += 1;
  p.lastActive = today;
  window.localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("livv-pair"));
  return p;
}
