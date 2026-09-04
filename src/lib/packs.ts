/** LIVV Evolution Packs — tier cadence + 4 pack grades. */

import type { LivvTier } from "./identity";
import { loadIdentity } from "./identity";

export type Rarity = "common" | "elevated" | "rare" | "apex";
/** Pack grade 1–4. Grade 4 is purchase-only. */
export type PackGrade = 1 | 2 | 3 | 4;

export type CardDef = {
  id: string;
  name: string;
  line: string;
  pillar: string;
  rarity: Rarity;
  hue: number;
};

export type OwnedCard = {
  instanceId: string;
  cardId: string;
  openedAt: number;
  fromGrade: PackGrade;
};

export type PendingPack = {
  id: string;
  grade: PackGrade;
  grantedAt: number;
};

export type PackState = {
  pending: PendingPack[];
  owned: OwnedCard[];
  /** When the current membership cycle last granted packs */
  lastGrantAt: number | null;
  totalOpened: number;
};

const KEY = "livv-packs-v2";

export const RARITY_META: Record<
  Rarity,
  { label: string; weight: number; glow: string }
> = {
  common: { label: "Common", weight: 55, glow: "rgba(180,190,210,0.35)" },
  elevated: { label: "Elevated", weight: 28, glow: "rgba(76,141,255,0.45)" },
  rare: { label: "Rare", weight: 13, glow: "rgba(168,130,255,0.5)" },
  apex: { label: "Apex", weight: 4, glow: "rgba(255,210,120,0.55)" },
};

export const GRADE_META: Record<
  PackGrade,
  {
    name: string;
    subtitle: string;
    foilFrom: string;
    foilTo: string;
    purchasableOnly?: boolean;
    rarityBias: Rarity[];
  }
> = {
  1: {
    name: "Spark Pack",
    subtitle: "Minimum tier",
    foilFrom: "#1a4a9e",
    foilTo: "#4C8DFF",
    rarityBias: ["common", "common", "elevated"],
  },
  2: {
    name: "Rise Pack",
    subtitle: "Above minimum",
    foilFrom: "#3a2a7a",
    foilTo: "#9b7cff",
    rarityBias: ["elevated", "elevated", "rare"],
  },
  3: {
    name: "Signal Pack",
    subtitle: "Third tier",
    foilFrom: "#5a3a10",
    foilTo: "#e8a040",
    rarityBias: ["rare", "rare", "apex"],
  },
  4: {
    name: "Apex Pack",
    subtitle: "Purchase only",
    foilFrom: "#0a0c12",
    foilTo: "#F5C542",
    purchasableOnly: true,
    rarityBias: ["apex", "rare", "apex"],
  },
};

/** Cadence rules by membership. */
export function packEntitlement(tier: LivvTier): {
  intervalMs: number;
  grants: PackGrade[];
  label: string;
} {
  switch (tier) {
    case "rise":
      return {
        intervalMs: 12 * 60 * 60 * 1000,
        grants: [1],
        label: "Every 12 hours · Spark Pack",
      };
    case "apex":
      return {
        intervalMs: 12 * 60 * 60 * 1000,
        grants: [2],
        label: "Every 12 hours · Rise Pack",
      };
    case "circle":
      return {
        intervalMs: 24 * 60 * 60 * 1000,
        grants: [1, 1, 2, 2, 3],
        label: "Every 24 hours · 5 packs",
      };
    default:
      return {
        intervalMs: 24 * 60 * 60 * 1000,
        grants: [1],
        label: "Every 24 hours · Spark Pack",
      };
  }
}

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
  lastGrantAt: null,
  totalOpened: 0,
};

export function loadPacks(): PackState {
  if (typeof window === "undefined") return { ...EMPTY, pending: [], owned: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      // migrate v1 silently
      const old = window.localStorage.getItem("livv-packs-v1");
      if (old) {
        const p = JSON.parse(old);
        return {
          pending: (p.pending || []).map((x: { id: string; grantedAt: number }) => ({
            id: x.id,
            grade: 1 as PackGrade,
            grantedAt: x.grantedAt,
          })),
          owned: (p.owned || []).map(
            (x: OwnedCard & { fromPack?: string }) => ({
              instanceId: x.instanceId,
              cardId: x.cardId,
              openedAt: x.openedAt,
              fromGrade: 1 as PackGrade,
            })
          ),
          lastGrantAt: p.lastDailyDay ? Date.now() - 1000 : null,
          totalOpened: p.totalOpened || 0,
        };
      }
      return { ...EMPTY, pending: [], owned: [] };
    }
    const p = JSON.parse(raw) as PackState;
    return {
      pending: p.pending || [],
      owned: p.owned || [],
      lastGrantAt: p.lastGrantAt ?? null,
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

export function nextGrantAt(tier?: LivvTier): number | null {
  const state = loadPacks();
  if (!state.lastGrantAt) return Date.now(); // available now
  const t = tier || loadIdentity().tier;
  const { intervalMs } = packEntitlement(t);
  return state.lastGrantAt + intervalMs;
}

export function msUntilNextPack(tier?: LivvTier): number {
  const at = nextGrantAt(tier);
  if (at === null) return 0;
  return Math.max(0, at - Date.now());
}

export function canClaimPacks(tier?: LivvTier): boolean {
  return msUntilNextPack(tier) <= 0;
}

/** Claim all packs due for current membership. */
export function claimPacksIfDue(): PackState {
  const identity = loadIdentity();
  const state = loadPacks();
  const { intervalMs, grants } = packEntitlement(identity.tier);
  const now = Date.now();

  if (state.lastGrantAt && now - state.lastGrantAt < intervalMs) {
    return state;
  }

  // Don't stack infinite pending — only claim if no pending from this cycle
  // Always allow claim when timer is up
  for (const grade of grants) {
    state.pending.push({
      id: `pack_${grade}_${now}_${Math.random().toString(36).slice(2, 6)}`,
      grade,
      grantedAt: now,
    });
  }
  state.lastGrantAt = now;
  savePacks(state);
  return state;
}

/** Purchase grade-4 Apex pack (demo — no payment). */
export function purchaseApexPack(): PackState {
  const state = loadPacks();
  state.pending.push({
    id: `pack_4_${Date.now()}`,
    grade: 4,
    grantedAt: Date.now(),
  });
  savePacks(state);
  return state;
}

function rollFromBias(bias: Rarity[]): Rarity {
  return bias[Math.floor(Math.random() * bias.length)];
}

function pickCard(rarity: Rarity): CardDef {
  let pool = CARD_CATALOG.filter((c) => c.rarity === rarity);
  if (!pool.length) pool = CARD_CATALOG.filter((c) => c.rarity === "common");
  return pool[Math.floor(Math.random() * pool.length)];
}

export function openPack(packId: string): { card: CardDef; owned: OwnedCard } | null {
  const state = loadPacks();
  const idx = state.pending.findIndex((p) => p.id === packId);
  if (idx < 0) return null;
  const pack = state.pending[idx];
  const meta = GRADE_META[pack.grade];
  const rarity = rollFromBias(meta.rarityBias);
  const card = pickCard(rarity);
  const owned: OwnedCard = {
    instanceId: `own_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    cardId: card.id,
    openedAt: Date.now(),
    fromGrade: pack.grade,
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

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "Ready";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
  return `${m}m ${String(sec).padStart(2, "0")}s`;
}

// Back-compat aliases used by older components
export type PackKind = "daily" | "streak" | "pillar" | "apex";
export const PACK_META = {
  daily: GRADE_META[1],
  streak: GRADE_META[2],
  pillar: GRADE_META[3],
  apex: GRADE_META[4],
};
export function tryGrantDailyPack() {
  return claimPacksIfDue();
}
