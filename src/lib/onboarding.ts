/**
 * Onboarding draft + completion flags (local-first).
 * Survives reload within the same browser. Not cloud-backed.
 */

export type OnboardingDraft = {
  why: string;
  goals: string[];
  interests: string[];
  displayName: string;
  completedAt: number | null;
};

const DRAFT_KEY = "livv-onboarding-v1";
const FIRST_SESSION_KEY = "livv-first-session-v1";

const EMPTY: OnboardingDraft = {
  why: "",
  goals: [],
  interests: [],
  displayName: "",
  completedAt: null,
};

export function loadOnboardingDraft(): OnboardingDraft {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    return {
      why: typeof parsed.why === "string" ? parsed.why : "",
      goals: Array.isArray(parsed.goals) ? parsed.goals.filter((g) => typeof g === "string") : [],
      interests: Array.isArray(parsed.interests)
        ? parsed.interests.filter((g) => typeof g === "string")
        : [],
      displayName: typeof parsed.displayName === "string" ? parsed.displayName : "",
      completedAt: typeof parsed.completedAt === "number" ? parsed.completedAt : null,
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveOnboardingDraft(partial: Partial<OnboardingDraft>): OnboardingDraft {
  const next = { ...loadOnboardingDraft(), ...partial };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  }
  return next;
}

export function markOnboardingComplete(): OnboardingDraft {
  return saveOnboardingDraft({ completedAt: Date.now() });
}

export function isOnboardingComplete(): boolean {
  return Boolean(loadOnboardingDraft().completedAt);
}

/** Set once when onboarding finishes so Home can show a first action. */
export function markFirstSessionPending() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(FIRST_SESSION_KEY, "1");
}

/** Returns true once, then clears. */
export function consumeFirstSessionPending(): boolean {
  if (typeof window === "undefined") return false;
  const v = window.sessionStorage.getItem(FIRST_SESSION_KEY);
  if (v !== "1") return false;
  window.sessionStorage.removeItem(FIRST_SESSION_KEY);
  return true;
}
