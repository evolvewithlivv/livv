/**
 * Behavior Loop v1 — single local snapshot that ties together:
 * - Progress Intelligence (consistency / streak / pillar XP)
 * - Evala Evidence (why the live read says what it says)
 * - Adaptive Daily (which Daily set is biased and why)
 * - Command nextMove (existing next action)
 *
 * No fabricated psychology or AI claims. Every field is derived from LivvRecord.
 */

import { nextMove, type Move } from "./command";
import { getAdaptiveDailyContext, type AdaptiveDailyContext } from "./daily-adaptive";
import { buildEvalaEvidence, type EvalaEvidence } from "./evala-evidence";
import { buildProgressInsights, type ProgressInsights } from "./progress-insights";
import { loadRecord, type LivvRecord } from "./record";

export type BehaviorLoop = {
  /** One sentence status — only numbers and named record fields */
  status: string;
  /** What to do next (existing command system) */
  move: Move;
  /** Adaptive Daily focus for today */
  adapt: AdaptiveDailyContext;
  /** Progress window stats */
  progress: ProgressInsights;
  /** Evala evidence pack */
  evidence: EvalaEvidence;
  /** Short evidence lines for UI (max 3) */
  because: string[];
};

export function buildBehaviorLoop(
  rec: LivvRecord = loadRecord(),
  date = new Date()
): BehaviorLoop {
  const progress = buildProgressInsights(rec, 14);
  const adapt = getAdaptiveDailyContext(date, rec);
  const evidence = buildEvalaEvidence(rec);
  const move = nextMove(rec);

  const status = progress.empty
    ? "No local activity logged yet. One recorded action starts the loop."
    : `${progress.daysWithActivity}/${progress.windowDays} active days (${progress.consistencyPct}%). Chain ${rec.streak}d. Daily leans ${adapt.focusLabel} because ${adapt.weakPillarName} has the least pillar XP.`;

  const because = [
    ...progress.bullets[0]?.evidence.facts.slice(0, 1) ?? [],
    `Adaptive focus: ${adapt.focusLabel} ← ${adapt.weakPillarName}`,
    evidence.items[0]?.because[0] ?? evidence.headline,
  ].slice(0, 3);

  return { status, move, adapt, progress, evidence, because };
}
