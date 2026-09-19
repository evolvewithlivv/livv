/**
 * Official account grants (allowlisted usernames only).
 * Applied when identity loads. Safe to call repeatedly — no event loops.
 * Does not import record.ts (avoids identity ↔ record circular dependency).
 * LIMITATION: localStorage can still be edited manually — product seeding, not security.
 */

import type { Identity, LivvTier } from "./identity";

const FLAG = "livv-official-profile-grants-v2";
const ENTITLEMENTS_KEY = "livv-entitlements-v1";
const RECORD_KEY = "livv-record-v1";

type OfficialGrant = {
  tier: LivvTier;
  level: number;
  currentXp: number;
  xpToNext: number;
  streak: number;
  workoutsCompleted: number;
  goalsCompleted: number;
};

/** Highest tier is "circle" (Inner Circle). */
const OFFICIAL: Record<string, OfficialGrant> = {
  evolvewithlivv: {
    tier: "circle",
    level: 20,
    currentXp: 500,
    xpToNext: 800,
    streak: 30,
    workoutsCompleted: 50,
    goalsCompleted: 100,
  },
  kanyethomas: {
    tier: "circle",
    level: 18,
    currentXp: 420,
    xpToNext: 800,
    streak: 90,
    workoutsCompleted: 120,
    goalsCompleted: 400,
  },
};

function readStoredTier(): LivvTier | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ENTITLEMENTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { tier?: string };
    if (parsed.tier === "spark" || parsed.tier === "rise" || parsed.tier === "apex" || parsed.tier === "circle") {
      return parsed.tier;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Write entitlement only when tier changes. Defer events to avoid re-entry. */
function ensureEntitlement(tier: LivvTier): void {
  if (typeof window === "undefined") return;
  if (readStoredTier() === tier) return;
  try {
    window.localStorage.setItem(
      ENTITLEMENTS_KEY,
      JSON.stringify({ tier, source: "demo", expiresAt: null }),
    );
    window.setTimeout(() => {
      try {
        window.dispatchEvent(new Event("livv-billing"));
      } catch {
        /* ignore */
      }
    }, 0);
  } catch {
    /* ignore */
  }
}

function boostRecord(grant: OfficialGrant): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(RECORD_KEY);
    const rec = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const next = {
      ...rec,
      level: Math.max(Number(rec.level) || 0, grant.level),
      currentXp: Math.max(Number(rec.currentXp) || 0, grant.currentXp),
      xpToNext: grant.xpToNext,
      streak: Math.max(Number(rec.streak) || 0, grant.streak),
      workoutsCompleted: Math.max(Number(rec.workoutsCompleted) || 0, grant.workoutsCompleted),
      goalsCompleted: Math.max(Number(rec.goalsCompleted) || 0, grant.goalsCompleted),
    };
    window.localStorage.setItem(RECORD_KEY, JSON.stringify(next));
    window.setTimeout(() => {
      try {
        window.dispatchEvent(new Event("livv-record"));
      } catch {
        /* ignore */
      }
    }, 0);
  } catch {
    /* ignore */
  }
}

export function applyOfficialProfileGrant(identity: Identity): Identity {
  if (typeof window === "undefined") return identity;
  const clean = (identity.username || "").toLowerCase().replace(/^@/, "");
  if (!clean) return identity;
  const grant = OFFICIAL[clean];
  if (!grant) return identity;

  try {
    const raw = window.localStorage.getItem(FLAG);
    const done = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    const key = `${clean}:${grant.tier}:v2`;

    ensureEntitlement(grant.tier);

    if (!done[key]) {
      done[key] = true;
      window.localStorage.setItem(FLAG, JSON.stringify(done));
      boostRecord(grant);
    }

    if (identity.tier === grant.tier) return identity;
    return { ...identity, tier: grant.tier };
  } catch {
    return { ...identity, tier: grant.tier };
  }
}

/** True when username is on the official grant list. */
export function isOfficialGrantedUsername(username: string): boolean {
  const clean = (username || "").toLowerCase().replace(/^@/, "");
  return Boolean(OFFICIAL[clean]);
}
