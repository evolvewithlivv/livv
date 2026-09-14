import type { LivvTier } from "./identity";

/** Designated color per membership tier, using only the LIVV seven-color palette. */
export const TIER_COLORS: Record<
  LivvTier,
  { hex: string; label: string; glow: string }
> = {
  spark: {
    hex: "#FCF927",
    label: "Spark",
    glow: "rgba(252,249,39,0.55)",
  },
  rise: {
    hex: "#0F7FFF",
    label: "Rise",
    glow: "rgba(15,127,255,0.65)",
  },
  apex: {
    hex: "#9A00FF",
    label: "Apex",
    glow: "rgba(154,0,255,0.7)",
  },
  circle: {
    hex: "#FF9D23",
    label: "Inner Circle",
    glow: "rgba(255,157,35,0.75)",
  },
};

export function tierColor(tier: LivvTier) {
  return TIER_COLORS[tier] || TIER_COLORS.spark;
}
