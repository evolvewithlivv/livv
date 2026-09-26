/** Embers = consistency currency. Earned slowly; redeemed only on Collection. */

import {
  EMBERS_PER_DOLLAR,
  MIN_REDEEM_EMBERS,
  REDEEM_RULES_COPY,
} from "./ember-economy";

export { EMBERS_PER_DOLLAR, MIN_REDEEM_EMBERS, REDEEM_RULES_COPY };

export const EMBERS_BLURB =
  "Embers track showing up. Earn them through real actions. Redeem them on Collection — never as cash.";

/**
 * Base award amounts (before tier multiplier).
 * Kept low so discounts require sustained use, not a single session.
 * Must stay within server allow-list: 4,6,8,10,12,15,16,20,25,30,40,50,75,150
 */
export function embersFromAction(
  kind: "checkin" | "workout" | "objective" | "custom",
  size: "small" | "standard" | "major" = "standard",
) {
  if (kind === "checkin") return 6;
  if (kind === "workout") return 10;
  if (kind === "objective") return 4;
  if (size === "small") return 4;
  if (size === "major") return 12;
  return 6;
}
