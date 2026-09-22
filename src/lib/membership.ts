import type { LivvTier } from "./identity";

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
      "Daily home that changes every morning",
      "Train, Evolve, Progress",
      "Photo identity across the app",
      "Embers earned at 1×",
    ],
  },
  {
    id: "rise",
    name: "Rise",
    price: "$12",
    cadence: "/mo",
    blurb: "The operating system. Not another content dump.",
    multiplier: 2,
    featured: true,
    perks: [
      "Accent color customization",
      "Embers at 2× on standard Ember awards",
      "Rise membership identity",
    ],
  },
  {
    id: "apex",
    name: "Apex",
    price: "$29",
    cadence: "/mo",
    blurb: "The body and the system, written for you.",
    multiplier: 4,
    perks: [
      "Embers at 4× on standard Ember awards",
      "App themes: Ember, Midnight, Bone",
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
      "Embers at 6× on standard Ember awards",
      "Exclusive Inner Circle profile mark",
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
