import type { LivvTier } from "./identity";
import { EMBERS_PER_DOLLAR, MIN_REDEEM_EMBERS } from "./ember-economy";

export type TierDef = {
  id: LivvTier;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  multiplier: number;
  featured?: boolean;
  perks: string[];
};

/**
 * Paid tiers unlock depth: tools, protocols, downloads, programs.
 * Spark stays a complete product. Cosmetics are side perks only.
 */
export const TIERS: TierDef[] = [
  {
    id: "spark",
    name: "Spark",
    price: "Free",
    cadence: "forever",
    blurb: "The full core system. Enough to build the habit.",
    multiplier: 1,
    perks: [
      "Daily, Train, Mind, Health, and Progress",
      "Photo identity and cloud-backed account",
      "Embers at 1x - redeem on Collection when ready",
      `${EMBERS_PER_DOLLAR} Embers = $1 off Collection (min ${MIN_REDEEM_EMBERS.toLocaleString()})`,
    ],
  },
  {
    id: "rise",
    name: "Rise",
    price: "$12",
    cadence: "/mo",
    blurb: "Unlock the Member Vault - protocols, tools, and downloads.",
    multiplier: 2,
    featured: true,
    perks: [
      "Member Vault access",
      "7-day protocol packs with printable PDFs",
      "Advanced Daily trackers and tools",
      "Member-only Mind series",
      "Embers at 2x on standard awards",
    ],
  },
  {
    id: "apex",
    name: "Apex",
    price: "$29",
    cadence: "/mo",
    blurb: "Full programs, deeper tools, and the complete Vault.",
    multiplier: 4,
    perks: [
      "Everything in Rise",
      "4-week transformation programs",
      "Progress Lab - patterns and weak-link insights",
      "Meal plan builder and export packs",
      "Embers at 4x on standard awards",
    ],
  },
  {
    id: "circle",
    name: "Inner Circle",
    price: "$149",
    cadence: "/yr",
    blurb: "The complete operating system - closest seat to LIVV.",
    multiplier: 6,
    perks: [
      "Everything in Apex",
      "Embers at 6x on standard awards",
      "Collection early access when drops go live",
      "Inner Circle mark on your profile",
      "Best yearly rate for the full Vault",
    ],
  },
];

export function tierRank(tier: LivvTier) {
  return TIERS.findIndex((t) => t.id === tier);
}

export function hasTier(current: LivvTier, needed: LivvTier) {
  return tierRank(current) >= tierRank(needed);
}

export function getTier(id: LivvTier) {
  return TIERS.find((t) => t.id === id) || TIERS[0];
}
