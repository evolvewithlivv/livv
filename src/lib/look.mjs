/** Daylight and Midnight, plus the unset system scheme.
 * A theme is persisted only after an explicit choice.
 * Theme and appearance stay in sync: midnight alone is midnight, not daylight.
 */

/**
 * @param {boolean} prefersDark
 * @returns {{ appearance: "dark" | "light", theme: "daylight" | "midnight" }}
 */
export function systemPaint(prefersDark) {
  return prefersDark
    ? { appearance: "dark", theme: "midnight" }
    : { appearance: "light", theme: "daylight" };
}

export function prefersDarkScheme() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function norm(value) {
  return String(value || "").toLowerCase();
}

function isMidnight(appearance, theme) {
  const themeName = norm(theme);
  return themeName === "midnight" || themeName === "ember" || themeName === "dark" || norm(appearance) === "dark";
}

/**
 * Concrete Daylight or Midnight pair, or null when the record should follow the system.
 * @param {string | null | undefined} appearance
 * @param {string | null | undefined} theme
 * @returns {{ appearance: "dark" | "light", theme: "daylight" | "midnight" } | null}
 */
export function explicitPaint(appearance, theme) {
  const appearanceName = norm(appearance);
  const themeName = norm(theme);
  if (appearanceName === "system" && !isMidnight(appearance, theme)) return null;
  if (isMidnight(appearance, theme)) return { appearance: "dark", theme: "midnight" };
  if (themeName === "daylight" || themeName === "bone" || appearanceName === "light") {
    return { appearance: "light", theme: "daylight" };
  }
  return null;
}

/**
 * @param {string | null | undefined} appearance
 * @param {string | null | undefined} theme
 * @param {boolean | undefined} prefersDark
 * @returns {{ appearance: "dark" | "light", theme: "daylight" | "midnight" }}
 */
export function normalizeLook(appearance, theme, prefersDark) {
  return explicitPaint(appearance, theme) || systemPaint(Boolean(prefersDark));
}

/** True when this record is a member's choice, not the untouched daylight default. */
export function isStoredLookChoice(record, hasLookKey) {
  if (hasLookKey) return true;
  if (!record || typeof record !== "object") return false;
  const appearanceName = norm(record.appearance);
  const themeName = norm(record.theme);
  if (appearanceName === "system") return isMidnight(record.appearance, record.theme);
  if (isMidnight(record.appearance, record.theme)) return true;
  if (appearanceName === "light" || themeName === "daylight" || themeName === "bone") {
    return Boolean(record.displayName || record.username || record.bio || record.photo || Number(record.embers) > 0);
  }
  return false;
}
