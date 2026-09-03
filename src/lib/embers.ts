/** Embers = consistency / momentum currency. Not a game wallet. */

export const EMBERS_BLURB =
  "Embers track showing up. XP builds your pillars and Evolution Level. Embers measure momentum — earned by real actions, spent later on profile depth and unlocks.";

export function embersFromAction(kind: "checkin" | "workout" | "objective" | "custom", size: "small" | "standard" | "major" = "standard") {
  if (kind === "checkin") return 10;
  if (kind === "workout") return 12;
  if (kind === "objective") return 6;
  if (size === "small") return 4;
  if (size === "major") return 16;
  return 8;
}
