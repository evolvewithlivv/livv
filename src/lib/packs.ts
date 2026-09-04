/** LIVV Evolution Packs — collectible cards earned by showing up. */

import { dayKey } from "./dates";

export type Rarity = "common" | "elevated" | "rare" | "apex";
export type PackKind = "daily" | "streak" | "pillar" | "apex";

export type CardDef = {
  id: string;
  name: string;
  line: string;
  pillar: string;
  rarity: Rarity;
  /** Placeholder hue until real art lands */
  hue: number;
};

export type OwnedCard = {
  instanceId: string;
  cardId: string;
  openedAt: number;
  fromPack: PackKind;
};

export type PendingPack = {
  id: string;
  kind: PackKind;
  grantedAt: number;
  day: string;
};

export type PackState = {
  pending: PendingPack[];
  owned: OwnedCard[];
  lastDailyDay: string | null;
  totalOpened: number;
};

const KEY = "livv-packs-v1";

export const RARITY_META: Record<
  Rarity,
  { label: string; weight: number; glow: string }
> = {
  common: { label: "Common", weight: 55, glow: "rgba(180,190,210,0.35)" },
  elevated: { label: "Elevated", weight: 28, glow: "rgba(76,141,255,0.45)" },
  rare: { label: "Rare", weight: 13, glow: "rgba(168,130,255,0.5)" },
  apex: { label: "Apex", weight: 4, glow: "rgba(255,210,120,0.55)" },
};

export const PACK_META: Record<
  PackKind,
  { name: string; subtitle: string; foil: string; foilFrom: string; foilTo: string }
> = {
  daily: {
    name: "Daily Spark",
    subtitle: "Earned by showing up",
    foil: "cobalt",
    foilFrom: "#1a4a9e",
    foilTo: "#4C8DFF",
  },
  streak: {
    name: "Streak Pack",
    subtitle: "Chain reward",
    foil: "ember",
    foilFrom: "#8a4a12",
    foilTo: "#e8a040",
  },
  pillar: {
    name: "Pillar Pack",
    subtitle: "Life system drop",
    foil: "violet",
    foilFrom: "#3a2a7a",
    foilTo: "#9b7cff",
  },
  apex: {
    name: "Apex Pack",
    subtitle: "Rare signal",
    foil: "obsidian",
    foilFrom: "#0a0c12",
    foilTo: "#3a5a9a",
  },
};

/** Starter catalog — swap art later; ids stay stable. */
export const CARD_CATALOG: CardDef[] = [
  { id: "c_silence", name: "Silence First", line: "Think before the performance.", pillar: "Mind", rarity: "common", hue: 220 },
  { id: "c_show_up", name: "Show Up", line: "Presence beats perfection.", pillar: "Life", rarity: "common", hue: 200 },
  { id: "c_no_theater", name: "No Theater", line: "Skip the announcement. Do the thing.", pillar: "Body", rarity: "elevated", hue: 210 },
  { id: "c_one_rep", name: "One More", line: "The set ends when you decide it ends.", pillar: "Body", rarity: "common", hue: 195 },
  { id: "c_ledger", name: "The Ledger", line: "Money only moves when you look at it.", pillar: "Finance", rarity: "elevated", hue: 160 },
  { id: "c_priority", name: "One Priority", line: "Everything else is noise until this is done.", pillar: "Career", rarity: "common", hue: 35 },
  { id: "c_reach", name: "Reach Out", line: "One real message over twenty likes.", pillar: "Social", rarity: "common", hue: 300 },
  { id: "c_protect", name: "Protect the Window", line: "Evenings break more chains than mornings.", pillar: "Mind", rarity: "elevated", hue: 250 },
  { id: "c_compound", name: "Compound", line: "Boring consistency is the real edge.", pillar: "Life", rarity: "rare", hue: 215 },
  { id: "c_edge", name: "The Edge", line: "You already know. You’re delaying.", pillar: "Career", rarity: "rare", hue: 25 },
  { id: "c_body_proof", name: "Body Proof", line: "The mirror doesn’t negotiate.", pillar: "Body", rarity: "rare", hue: 190 },
  { id: "c_apex_signal", name: "Apex Signal", line: "Few hold this. Fewer earned it.", pillar: "Life", rarity: "apex", hue: 45 },
  { id: "c_stillness", name: "Stillness", line: "Capacity is built in the quiet.", pillar: "Mind", rarity: "elevated", hue: 260 },
  { id: "c_transfer", name: "Transfer", line: "Move money with intention, not mood.", pillar: "Finance", rarity: "common", hue: 150 },
  { id: "c_circle", name: "Inner Circle", line: "Who you keep shapes who you become.", pillar: "Social", rarity: "rare", hue: 320 },
  { id: "c_momentum", name: "Momentum", line: "Day three is where most people quit.", pillar: "Life", rarity: "elevated", hue: 205 },
];

export function getCard(id: string) {
  return CARD_CATALOG.find((c) => c.id === id) || CARD_CATALOG[0];
}

const EMPTY: PackState = {
  pending: [],
  owned: [],
  lastDailyDay: null,
  totalOpened: 0,
};

export function loadPacks(): PackState {
  if (typeof window === "undefined") return { ...EMPTY, pending: [], owned: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY, pending: [], owned: [] };
    const p = JSON.parse(raw) as PackState;
    return {
      pending: p.pending || [],
      owned: p.owned || [],
      lastDailyDay: p.lastDailyDay ?? null,
      totalOpened: p.totalOpened || 0,
    };
  } catch {
    return { ...EMPTY, pending: [], owned: [] };
  }
}

export function savePacks(state: PackState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("livv-packs"));
}

/** Grant daily pack once per calendar day after any real action. */
export function tryGrantDailyPack() {
  const state = loadPacks();
  const today = dayKey();
  if (state.lastDailyDay === today) return state;
  if (state.pending.some((p) => p.kind === "daily" && p.day === today)) return state;

  state.pending.push({
    id: `pack_${Date.now()}`,
    kind: "daily",
    grantedAt: Date.now(),
    day: today,
  });
  state.lastDailyDay = today;
  savePacks(state);
  return state;
}

export function grantStreakPack() {
  const state = loadPacks();
  state.pending.push({
    id: `pack_s_${Date.now()}`,
    kind: "streak",
    grantedAt: Date.now(),
    day: dayKey(),
  });
  savePacks(state);
  return state;
}

function rollRarity(kind: PackKind): Rarity {
  const boost = kind === "streak" ? 1.4 : kind === "apex" ? 2.2 : kind === "pillar" ? 1.2 : 1;
  const pool = (Object.keys(RARITY_META) as Rarity[]).flatMap((r) => {
    const w = Math.round(RARITY_META[r].weight * (r === "common" ? 1 / boost : boost));
    return Array.from({ length: Math.max(1, w) }, () => r);
  });
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickCard(rarity: Rarity, kind: PackKind): CardDef {
  let pool = CARD_CATALOG.filter((c) => c.rarity === rarity);
  if (kind === "pillar") {
    // slight bias already via rarity; keep full pool
  }
  if (!pool.length) pool = CARD_CATALOG.filter((c) => c.rarity === "common");
  return pool[Math.floor(Math.random() * pool.length)];
}

export function openPack(packId: string): { card: CardDef; owned: OwnedCard } | null {
  const state = loadPacks();
  const idx = state.pending.findIndex((p) => p.id === packId);
  if (idx < 0) return null;
  const pack = state.pending[idx];
  const rarity = rollRarity(pack.kind);
  const card = pickCard(rarity, pack.kind);
  const owned: OwnedCard = {
    instanceId: `own_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    cardId: card.id,
    openedAt: Date.now(),
    fromPack: pack.kind,
  };
  state.pending.splice(idx, 1);
  state.owned.unshift(owned);
  state.totalOpened += 1;
  savePacks(state);
  return { card, owned };
}

export function pendingPacks() {
  return loadPacks().pending;
}

export function ownedCards() {
  return loadPacks().owned;
}

export function collectionStats() {
  const state = loadPacks();
  const unique = new Set(state.owned.map((o) => o.cardId));
  return {
    totalOpened: state.totalOpened,
    ownedCount: state.owned.length,
    uniqueCount: unique.size,
    catalogSize: CARD_CATALOG.length,
    pending: state.pending.length,
  };
}
