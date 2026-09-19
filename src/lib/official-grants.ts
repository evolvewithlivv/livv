/**
 * Official account grants (allowlisted usernames only).
 * Applied when identity loads. Safe to call repeatedly — no event loops.
 * LIMITATION: localStorage can still be edited manually — product seeding, not security.
 */

import type { Identity, LivvTier } from "./identity";
import { loadRecord, saveRecord, type LivvRecord } from "./record";

const FLAG = "livv-official-profile-grants-v2";
const ENTITLEMENTS_KEY = "livv-entitlements-v1";

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

/** Write entitlement silently unless the tier actually changed. */
function ensureEntitlement(tier: LivvTier): boolean {
  if (typeof window === "undefined") return false;
  if (readStoredTier() === tier) return false;
  try {
    window.localStorage.setItem(
      ENTITLEMENTS_KEY,
      JSON.stringify({ tier, source: "demo", expiresAt: null }),
    );
    // Defer event so we never re-enter loadIdentity synchronously.
    window.setTimeout(() => {
      try {
        window.dispatchEvent(new Event("livv-billing"));
      } catch {
        /* ignore */
      }
    }, 0);
    return true;
  } catch {
    return false;
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
      const rec = loadRecord();
      const nextRec: LivvRecord = {
        ...rec,
        level: Math.max(rec.level ?? 0, grant.level),
        currentXp: Math.max(rec.currentXp ?? 0, grant.currentXp),
        xpToNext: grant.xpToNext,
        streak: Math.max(rec.streak ?? 0, grant.streak),
        workoutsCompleted: Math.max(rec.workoutsCompleted ?? 0, grant.workoutsCompleted),
        goalsCompleted: Math.max(rec.goalsCompleted ?? 0, grant.goalsCompleted),
      };
      done[key] = true;
      window.localStorage.setItem(FLAG, JSON.stringify(done));
      // Defer record save event to avoid sync re-entry via livv-record listeners.
      try {
        window.localStorage.setItem("livv-record-v1", JSON.stringify(nextRec));
        window.setTimeout(() => {
          try {
            window.dispatchEvent(new Event("livv-record"));
          } catch {
            /* ignore */
          }
        }, 0);
      } catch {
        saveRecord(nextRec);
      }
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
