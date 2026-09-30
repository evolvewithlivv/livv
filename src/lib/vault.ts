import type { LivvTier } from "./identity";

export type VaultModule = {
  id: string;
  title: string;
  blurb: string;
  kind: "protocol" | "tool" | "program" | "series" | "lab";
  /** Minimum tier required */
  minTier: LivvTier;
  /** Minutes or weeks label */
  meta: string;
  /** Printable / downloadable */
  downloadable?: boolean;
  steps?: string[];
  body?: string[];
};

/**
 * Member Vault catalog.
 * Rise unlocks protocols + tools.
 * Apex unlocks programs + lab.
 * Circle inherits all.
 */
export const VAULT_MODULES: VaultModule[] = [
  {
    id: "sleep-reset-7",
    title: "7-Day Sleep Reset",
    blurb: "One anchor time, less negotiation, better mornings.",
    kind: "protocol",
    minTier: "rise",
    meta: "7 days · printable",
    downloadable: true,
    steps: [
      "Pick a fixed wake time for all 7 days. Protect it like an appointment.",
      "Dim screens 45 minutes before bed. Charge the phone outside the room if you can.",
      "Same wind-down sequence every night: lights down, short stretch, one page of reading.",
      "No caffeine after 2pm for the full week.",
      "Log sleep quality each morning in Daily (1-5). Look for the pattern, not perfection.",
      "If you miss a night, keep the wake time. Do not sleep in to compensate.",
      "On day 7, write the wake time that actually worked. That becomes your default.",
    ],
    body: [
      "This protocol is not about perfect sleep. It is about removing the daily argument with yourself.",
      "The goal is a repeatable night that survives ordinary stress, not a heroic weekend recovery.",
    ],
  },
  {
    id: "money-baseline-7",
    title: "7-Day Money Baseline",
    blurb: "See where money actually goes before you try to optimize it.",
    kind: "protocol",
    minTier: "rise",
    meta: "7 days · printable",
    downloadable: true,
    steps: [
      "Open your main accounts and list every recurring charge. Cancel one you do not use.",
      "Write down yesterday's spending in three lines: needs, wants, forgotten.",
      "Move a small fixed amount to savings on the same day you get paid - before anything else.",
      "Pick one category to watch this week (food, delivery, subscriptions). Track only that.",
      "No new non-essential purchases over $40 unless you wait 24 hours.",
      "Review the week in 10 minutes. Circle the one leak that surprised you.",
      "Set next week's single money rule based on that leak. One rule only.",
    ],
    body: [
      "Clarity beats complicated budgets. One week of honest observation is enough to start.",
    ],
  },
  {
    id: "discipline-stack-7",
    title: "7-Day Discipline Stack",
    blurb: "Three non-negotiables a day. Nothing heroic. Everything repeatable.",
    kind: "protocol",
    minTier: "rise",
    meta: "7 days · printable",
    downloadable: true,
    steps: [
      "Choose three daily anchors: move, make, recover (example: walk, one work block, phone away after 10).",
      "Write them where you will see them at the start of the day.",
      "Complete all three before entertainment. Order can flex. Completion cannot.",
      "If you miss one, do a minimum version the same day - 5 minutes counts.",
      "Do not add a fourth anchor this week.",
      "Log completion in Daily each night with one honest sentence.",
      "On day 7, keep the two anchors that stuck. Rebuild the third if needed.",
    ],
  },
  {
    id: "focus-block-tool",
    title: "Focus Block Planner",
    blurb: "Plan one protected hour. Decide the outcome before the hour starts.",
    kind: "tool",
    minTier: "rise",
    meta: "Tool · printable",
    downloadable: true,
    steps: [
      "Name the single outcome for the block (one sentence).",
      "Set a start time and end time. Put it on the calendar.",
      "Silence nonessential notifications for that window.",
      "Work only on the named outcome until the timer ends.",
      "Write what moved and what is left for tomorrow.",
    ],
    body: [
      "One quiet hour beats a scattered day. This tool exists to make that hour concrete.",
    ],
  },
  {
    id: "member-mind-series",
    title: "Member Mind Series",
    blurb: "Deeper reads on attention, standards, and long-game habits.",
    kind: "series",
    minTier: "rise",
    meta: "Series · in Vault",
    body: [
      "Member series expand on the free Mind desk with longer, more practical playbooks.",
      "Start with attention, standards, and recovery. Open any protocol to put the idea into motion the same week.",
    ],
  },
  {
    id: "body-rebuild-28",
    title: "28-Day Body Rebuild",
    blurb: "Training, walking, and recovery in a plan that survives a normal month.",
    kind: "program",
    minTier: "apex",
    meta: "4 weeks · printable",
    downloadable: true,
    steps: [
      "Week 1: Establish 3 training sessions and a daily walk floor. Keep sessions under 45 minutes.",
      "Week 2: Add one harder set or slightly longer walk. Sleep remains non-negotiable.",
      "Week 3: Hold the schedule. Focus on form and consistency, not max effort.",
      "Week 4: Test a simple benchmark (same walk route time, or same lift weight for clean reps).",
      "Missed days: resume the next scheduled session. Do not double up.",
      "Protein at each meal. Water target stays on Daily trackers.",
      "End of week 4: keep the weekly structure. Only change one variable at a time afterward.",
    ],
    body: [
      "This is not a challenge that peaks on day 3 and dies on day 10. It is a month of showing up.",
    ],
  },
  {
    id: "deep-work-28",
    title: "28-Day Deep Work Program",
    blurb: "Build a reliable focus practice across four weeks.",
    kind: "program",
    minTier: "apex",
    meta: "4 weeks · printable",
    downloadable: true,
    steps: [
      "Week 1: One 45-minute focus block on your highest-value task, five days.",
      "Week 2: Two blocks on heavy days. Protect the calendar like a meeting with yourself.",
      "Week 3: Same volume. Improve the environment - fewer tabs, clearer outcome statements.",
      "Week 4: Review output. Keep the block times that produced real work.",
      "Phone out of reach during blocks. Notes only for the task at hand.",
      "End each block with a one-line handoff for tomorrow.",
    ],
  },
  {
    id: "meal-plan-builder",
    title: "Weekly Meal Plan Builder",
    blurb: "Turn Health recipes into a simple 7-day plan you can print.",
    kind: "tool",
    minTier: "apex",
    meta: "Tool · printable",
    downloadable: true,
    steps: [
      "Pick 3 breakfast options, 3 lunches, 3 dinners from the recipe library.",
      "Assign them across 7 days. Repeat is fine - repetition is the point.",
      "Write a single grocery list from those meals only.",
      "Batch one item on the weekend (protein, grains, or chopped vegetables).",
      "Leave one flexible meal for real life.",
    ],
  },
  {
    id: "progress-lab",
    title: "Progress Lab",
    blurb: "See patterns in consistency, weak days, and which rooms you actually use.",
    kind: "lab",
    minTier: "apex",
    meta: "Insights",
    body: [
      "Progress Lab turns your record into signal: which days slip, which rooms compound, where to simplify.",
      "Use it weekly. Adjust one behavior based on what the data shows - not on how motivated you feel today.",
    ],
  },
];

export function modulesForTier(tier: LivvTier): VaultModule[] {
  const rank = { spark: 0, rise: 1, apex: 2, circle: 3 }[tier] ?? 0;
  const need = { spark: 0, rise: 1, apex: 2, circle: 3 };
  return VAULT_MODULES.filter((m) => rank >= need[m.minTier]);
}

export function moduleById(id: string): VaultModule | null {
  return VAULT_MODULES.find((m) => m.id === id) || null;
}

export function lockedModules(tier: LivvTier): VaultModule[] {
  const open = new Set(modulesForTier(tier).map((m) => m.id));
  return VAULT_MODULES.filter((m) => !open.has(m.id));
}
