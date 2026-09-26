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

export const TIERS: TierDef[] = [
  {
    id: "spark",
    name: "Spark",
    price: "Free",
    cadence: "forever",
    blurb: "The rooms. The daily page. Enough to start.",
    multiplier: 1,
    perks: [
      "Full Daily, Train, Mind, Health, and Progress",
      "Photo identity across the app",
      "Embers at 1× — redeem on Collection when ready",
      `${EMBERS_PER_DOLLAR} Embers = $1 off (min ${MIN_REDEEM_EMBERS.toLocaleString()})`,
    ],
  },
  {
    id: "rise",
    name: "Rise",
    price: "$12",
    cadence: "/mo",
    blurb: "Make LIVV yours. Earn Embers faster.",
    multiplier: 2,
    featured: true,
    perks: [
      "Accent color customization",
      "Embers at 2× on standard awards",
      "Rise membership on your profile",
      "Same Collection redemption rate — faster earn path",
    ],
  },
  {
    id: "apex",
    name: "Apex",
    price: "$29",
    cadence: "/mo",
    blurb: "Own the look of the system.",
    multiplier: 4,
    perks: [
      "Everything in Rise",
      "Embers at 4× on standard awards",
      "App themes: Midnight and Bone",
      "Faster path to Collection credit",
    ],
  },
  {
    id: "circle",
    name: "Inner Circle",
    price: "$149",
    cadence: "/yr",
    blurb: "The room most people will never be in.",
    multiplier: 6,
    perks: [
      "Everything in Apex",
      "Embers at 6× on standard awards",
      "Exclusive Inner Circle profile mark",
      "Fastest Ember path toward Collection",
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
