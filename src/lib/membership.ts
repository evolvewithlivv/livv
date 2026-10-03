/**
 * LIVV V1 membership surface.
 *
 * V1 is a free core product. Embers are earned at 1× for every user.
 * Paid subscription tiers are intentionally not offered in V1.
 * Historical Stripe entitlements infrastructure may still exist for
 * data continuity and future Collection checkout — not for gated tiers.
 */

import { EMBERS_PER_DOLLAR, MIN_REDEEM_EMBERS } from "./ember-economy";

export type LivvTierId = "free";

export type TierDef = {
  id: LivvTierId;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  multiplier: number;
  perks: string[];
};

/** Single V1 product story — free core for everyone. */
export const TIERS: TierDef[] = [
  {
    id: "free",
    name: "LIVV",
    price: "Free",
    cadence: "forever",
    blurb: "The full core system. Embers track showing up.",
    multiplier: 1,
    perks: [
      "Daily, Train, Health, Progress, Shop, and You",
      "Photo identity and cloud-backed account",
      "Embers at 1× — redeem on Collection when ready",
      `${EMBERS_PER_DOLLAR} Embers = $1 off Collection (min ${MIN_REDEEM_EMBERS.toLocaleString()})`,
      "Vault content free to every LIVV user",
    ],
  },
];

export function getTier(_id?: string) {
  return TIERS[0];
}

export function tierRank(_tier?: string) {
  return 0;
}

export function hasTier(_current?: string, _needed?: string) {
  return true;
}
