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
      "Train, Evolve, Connect, Progress",
      "Photo identity across the app",
      "Embers earned at 1x",
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
      "Weekly training planner PDF, generated for your week",
      "Identity frames and accent colors",
      "Embers at 2x on every check-in",
      "Private Rise drops before they hit merch",
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
      "Personalized meal architecture, not a random grocery list",
      "App themes: Ember, Midnight, Bone",
      "Monthly review PDF you can actually print",
      "Embers at 4x. This is how people bank gear later.",
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
      "Yearly Ember allotment toward future LIVV gear",
      "First access when merch and custom pieces go live",
      "A mark on your profile nobody else can buy aesthetically",
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
