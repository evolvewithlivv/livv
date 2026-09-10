/**
 * Evala Evidence Layer — why the live read says what it says.
 * Built only from LivvRecord + existing command helpers + declared onboarding goals.
 * No invented psychology. Local-first.
 */

import { dayKey } from "./dates";
import { needsAttention, strongestPillar } from "./command";
import { evolutionTitle } from "./levels";
import {
  loadRecord,
  todaysObjectives,
  weekHitCount,
  type LivvRecord,
} from "./record";
import { buildProgressInsights } from "./progress-insights";
import { formatGoalsLine, goalLabels, loadOnboardingDraft } from "./onboarding";

export type EvalaEvidenceItem = {
  claim: string;
  because: string[];
};

export type EvalaEvidence = {
  headline: string;
  items: EvalaEvidenceItem[];
  /** Compact strings safe to put in the API snapshot */
  snapshotLines: string[];
};

function todayLog(rec: LivvRecord) {
  return rec.days[dayKey()];
}

export function buildEvalaEvidence(rec: LivvRecord = loadRecord()): EvalaEvidence {
  const strong = strongestPillar(rec);
  const weak = needsAttention(rec);
  const evo = evolutionTitle(rec.level);
  const open = todaysObjectives(rec).filter((o) => !o.completed);
  const done = todaysObjectives(rec).filter((o) => o.completed);
  const log = todayLog(rec);
  const insights = buildProgressInsights(rec, 14);
  const weekHits = weekHitCount(rec);
  const draft = loadOnboardingDraft();
  const labels = goalLabels(draft.goals);

  const items: EvalaEvidenceItem[] = [];

  if (labels.length > 0) {
    const line = formatGoalsLine(draft.goals);
    items.push({
      claim: `You set direction in onboarding: ${labels.slice(0, 4).join(", ")}.`,
      because: [
        "Source: livv-onboarding-v1 goals (user-selected, not measured traits)",
        line || `goal ids: ${draft.goals.join(", ")}`,
        draft.completedAt
          ? `onboarding completedAt=${new Date(draft.completedAt).toISOString().slice(0, 10)}`
          : "onboarding completedAt not set",
        "premium is ignored for behavioral recommendations",
      ],
    });
  }

  if (open.length > 0) {
    items.push({
      claim: `Open on today's list: ${open[0].title}.`,
      because: [
        `${open.length} incomplete objective(s) on ${dayKey()}`,
        open.map((o) => o.title).slice(0, 3).join(" · "),
      ],
    });
  } else if (done.length > 0) {
    items.push({
      claim: `Today's objectives are complete (${done.length}).`,
      because: [
        `${done.length} objective(s) on ${dayKey()}`,
        done.map((o) => o.title).slice(0, 3).join(" · ") || "—",
      ],
    });
  }

  items.push({
    claim: `Chain is ${rec.streak} day${rec.streak === 1 ? "" : "s"}.`,
    because: [
      `record.streak = ${rec.streak}`,
      `lastActiveDay = ${rec.lastActiveDay ?? "none"}`,
      `Longest consecutive active run in stored logs = ${insights.longestActiveRun}`,
    ],
  });

  items.push({
    claim: `${strong.name} leads; ${weak.name} is quieter on XP.`,
    because: [
      `Leading pillar from livePillars/command: ${strong.name} (Lv ${strong.level})`,
      `Needs attention: ${weak.name} (Lv ${weak.level})`,
      insights.strongest
        ? `pillarXp share leader: ${insights.strongest.name} ${insights.strongest.xp} XP (${insights.strongest.sharePct}%)`
        : "No pillar XP logged yet",
    ],
  });

  items.push({
    claim: `This week: ${weekHits}/7 days with recorded activity.`,
    because: [
      `weekHitCount from Mon–Sun bars = ${weekHits}`,
      `Last 14 days: ${insights.daysWithActivity}/${insights.windowDays} active (${insights.consistencyPct}%)`,
      log
        ? `Today log: checkIn=${Boolean(log.checkIn)} workout=${Boolean(log.workout)} objectives=${log.objectives?.length || 0}`
        : "No day log for today yet",
    ],
  });

  if (rec.lastWorkout) {
    items.push({
      claim: `Last logged session: ${rec.lastWorkout.name}.`,
      because: [
        `focus=${rec.lastWorkout.focus}`,
        `duration=${rec.lastWorkout.duration}`,
        `exercises=${rec.lastWorkout.exercises}`,
        `workoutsCompleted all-time=${rec.workoutsCompleted}`,
      ],
    });
  } else {
    items.push({
      claim: "No workout on record yet.",
      because: ["lastWorkout is null", `workoutsCompleted = ${rec.workoutsCompleted}`],
    });
  }

  items.push({
    claim: `Evolution title: ${evo.name} (level ${rec.level}).`,
    because: [
      `currentXp ${rec.currentXp} / ${rec.xpToNext} to next`,
      `goalsCompleted = ${rec.goalsCompleted}`,
    ],
  });

  const headline = open[0]
    ? `Open loop: ${open[0].title}. That is still on today's list.`
    : rec.streak > 0
      ? `Chain is alive at ${rec.streak} days. ${strong.name} leads. ${weak.name} is quieter.`
      : "No active chain. One logged action is enough to re-enter.";

  const snapshotLines = items.flatMap((it) => [
    it.claim,
    ...it.because.slice(0, 2).map((b) => `  - ${b}`),
  ]);

  return { headline, items, snapshotLines };
}
