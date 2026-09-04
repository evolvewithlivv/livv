import type { LivvTier } from "./identity";

/** Designated color per membership tier — used for avatar glow ring. */
export const TIER_COLORS: Record<
  LivvTier,
  { hex: string; label: string; glow: string }
> = {
  spark: {
    hex: "#8B93A7",
    label: "Spark",
    glow: "rgba(139,147,167,0.55)",
  },
  rise: {
    hex: "#4C8DFF",
    label: "Rise",
    glow: "rgba(76,141,255,0.65)",
  },
  apex: {
    hex: "#A78BFA",
    label: "Apex",
    glow: "rgba(167,139,250,0.7)",
  },
  circle: {
    hex: "#F5C542",
    label: "Inner Circle",
    glow: "rgba(245,197,66,0.75)",
  },
};

export function tierColor(tier: LivvTier) {
  return TIER_COLORS[tier] || TIER_COLORS.spark;
}
