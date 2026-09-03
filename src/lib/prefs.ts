export type LivvPrefs = {
  sound: boolean;
  haptics: boolean;
};

const KEY = "livv-prefs-v1";

export const DEFAULT_PREFS: LivvPrefs = {
  sound: true,
  haptics: true,
};

export function loadPrefs(): LivvPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(next: LivvPrefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("livv-prefs"));
}

export function patchPrefs(partial: Partial<LivvPrefs>) {
  const next = { ...loadPrefs(), ...partial };
  savePrefs(next);
  return next;
}
