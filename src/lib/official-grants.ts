/**
 * Official account grants (allowlisted usernames only).
 * Applied once per device when identity loads.
 * LIMITATION: localStorage can still be edited manually — product seeding, not security.
 */

import type { Identity, LivvTier } from "./identity";
import { loadRecord, saveRecord, type LivvRecord } from "./record";

const FLAG = "livv-official-profile-grants-v1";
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

const OFFICIAL: Record<string, OfficialGrant> = {
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

function writeEntitlement(tier: LivvTier) {
  if (typeof window === "undefined") return;
  const e = {
    tier,
    source: "demo" as const,
    expiresAt: null,
  };
  window.localStorage.setItem(ENTITLEMENTS_KEY, JSON.stringify(e));
  window.dispatchEvent(new Event("livv-billing"));
}

export function applyOfficialProfileGrant(identity: Identity): Identity {
  if (typeof window === "undefined") return identity;
  const clean = identity.username.toLowerCase().replace(/^@/, "");
  const grant = OFFICIAL[clean];
  if (!grant) return identity;

  try {
    const raw = window.localStorage.getItem(FLAG);
    const done = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    if (done[clean]) {
      if (identity.tier !== grant.tier) {
        writeEntitlement(grant.tier);
        return { ...identity, tier: grant.tier };
      }
      return identity;
    }

    const rec = loadRecord();
    const nextRec: LivvRecord = {
      ...rec,
      level: Math.max(rec.level, grant.level),
      currentXp: Math.max(rec.currentXp, grant.currentXp),
      xpToNext: grant.xpToNext,
      streak: Math.max(rec.streak, grant.streak),
      workoutsCompleted: Math.max(rec.workoutsCompleted, grant.workoutsCompleted),
      goalsCompleted: Math.max(rec.goalsCompleted, grant.goalsCompleted),
    };
    saveRecord(nextRec);
    writeEntitlement(grant.tier);
    done[clean] = true;
    window.localStorage.setItem(FLAG, JSON.stringify(done));

    return { ...identity, tier: grant.tier };
  } catch {
    return identity;
  }
}
