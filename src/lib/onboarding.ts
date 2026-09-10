/**
 * Onboarding draft + completion flags (local-first).
 * Survives reload within the same browser. Not cloud-backed.
 *
 * Goals/interests are declared user intent — never measured traits.
 */

export type OnboardingDraft = {
  why: string;
  goals: string[];
  interests: string[];
  displayName: string;
  completedAt: number | null;
};

export type DailyIntentSlot = "mind" | "body" | "life";

const DRAFT_KEY = "livv-onboarding-v1";
const FIRST_SESSION_KEY = "livv-first-session-v1";

/** Display labels for goal ids collected in onboarding. */
export const GOAL_LABELS: Record<string, string> = {
  fitness: "Get stronger & leaner",
  mindset: "Build better habits",
  identity: "Define who I want to become",
  community: "Connect with like-minded people",
  progress: "Track my growth over time",
  premium: "Access premium tools & products",
};

/**
 * Goal id → Daily mind/body/life slot.
 * `premium` is intentionally omitted (commerce, not behavior).
 * `progress` is neutral (no slot bias).
 */
const GOAL_TO_SLOT: Record<string, DailyIntentSlot | null> = {
  fitness: "body",
  mindset: "mind",
  identity: "life",
  community: "life",
  progress: null,
  premium: null,
};

/** Interests only break ties when goals yield no slot. */
const INTEREST_TO_SLOT: Record<string, DailyIntentSlot> = {
  Training: "body",
  Nutrition: "body",
  Recovery: "body",
  Longevity: "body",
  Mindset: "mind",
  Discipline: "mind",
  Style: "life",
  Community: "life",
};

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

/** Human labels for selected goal ids (skips unknown ids). */
export function goalLabels(goals: string[] = loadOnboardingDraft().goals): string[] {
  return goals.map((id) => GOAL_LABELS[id] || id).filter(Boolean);
}

/** Short “Goals: A · B” line, or empty string if none. */
export function formatGoalsLine(goals?: string[]): string {
  const labels = goalLabels(goals ?? loadOnboardingDraft().goals);
  if (!labels.length) return "";
  return `Goals: ${labels.slice(0, 3).join(" · ")}${labels.length > 3 ? " · …" : ""}`;
}

/**
 * Soft Daily intent from declared goals (interests only if goals give no slot).
 * Returns null when nothing maps — caller keeps existing XP logic.
 */
export function intentDailySlot(
  draft: OnboardingDraft = loadOnboardingDraft()
): DailyIntentSlot | null {
  const counts: Record<DailyIntentSlot, number> = { mind: 0, body: 0, life: 0 };
  for (const id of draft.goals) {
    if (id === "premium") continue;
    const slot = GOAL_TO_SLOT[id];
    if (slot) counts[slot] += 2;
  }
  const goalTotal = counts.mind + counts.body + counts.life;
  if (goalTotal === 0) {
    for (const label of draft.interests) {
      const slot = INTEREST_TO_SLOT[label];
      if (slot) counts[slot] += 1;
    }
  }
  const ranked = (Object.entries(counts) as [DailyIntentSlot, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  if (!ranked[0] || ranked[0][1] === 0) return null;
  // Tie → null (do not invent a preference)
  if (ranked[1] && ranked[1][1] === ranked[0][1]) return null;
  return ranked[0][0];
}

/** Stable signature for deterministic adaptive hashing. */
export function onboardingIntentKey(draft: OnboardingDraft = loadOnboardingDraft()): string {
  const goals = [...draft.goals].filter((g) => g !== "premium").sort().join(",");
  const interests = [...draft.interests].sort().join(",");
  return `${goals}|${interests}`;
}
