import { dayKey } from "./dates";
import { worldState } from "./daily";
import { loadIdentity } from "./identity";
import {
  isCheckedInToday,
  loadRecord,
  livePillars,
  todaysObjectives,
} from "./record";

export type Move = {
  title: string;
  reason: string;
  cta: string;
  href: string;
  pillar?: string;
};

export type DayPillar = {
  id: string;
  name: string;
  done: boolean;
};

const CORE_PILLARS = ["body", "mind", "career", "finance", "social"] as const;

export function contextGreeting(now = new Date(), rec = loadRecord()) {
  const me = loadIdentity();
  const first = (me.displayName || "there").split(" ")[0];
  const hour = now.getHours();
  const checked = isCheckedInToday(rec);
  const objs = todaysObjectives(rec);
  const done = objs.filter((o) => o.completed).length;

  let salutation = `Hey, ${first}`;
  if (hour < 5) salutation = `Still up, ${first}`;
  else if (hour < 12) salutation = `Morning, ${first}`;
  else if (hour < 17) salutation = `Afternoon, ${first}`;
  else if (hour < 21) salutation = `Evening, ${first}`;
  else salutation = `Wind down, ${first}`;

  let line: string;
  if (rec.streak === 0 && rec.workoutsCompleted === 0 && done === 0) {
    line = "Your evolution starts with one honest action.";
  } else if (!checked && hour >= 20) {
    line = "The day is almost gone. One action still counts.";
  } else if (checked && done >= Math.max(1, objs.length - 1)) {
    line = "You already moved the needle. Protect the rest of the day.";
  } else if (rec.streak >= 6) {
    line = `${rec.streak} days. Do not break the chain casually.`;
  } else if (rec.streak >= 2) {
    line = "Momentum is built here. Keep the line.";
  } else if (done === 0 && hour >= 14) {
    line = "Nothing on the record yet. That is still fixable.";
  } else {
    line = "Your life is in motion.";
  }

  return { salutation, line };
}

export function nextMove(rec = loadRecord()): Move {
  const today = dayKey();
  const day = rec.days[today];
  const objs = todaysObjectives(rec);
  const incomplete = objs.find((o) => !o.completed);

  if (!day?.workout) {
    return {
      title: "Train your body",
      reason: "No session on the record today.",
      cta: "Start training",
      href: "/home/train",
      pillar: "Body",
    };
  }

  if (incomplete) {
    const map: Record<string, { title: string; cta: string; href: string }> = {
      Body: { title: "Train your body", cta: "Open Train", href: "/home/train" },
      Mind: { title: "Clear your mind", cta: "Open Evala", href: "/home/evala" },
      Career: { title: "Finish the priority", cta: "Log deep work", href: "/home/evala" },
      Finance: { title: "Protect your money", cta: "Log today", href: "/home/evala" },
      Social: { title: "Reach someone real", cta: "Open Connect", href: "/home/connect" },
    };
    const m = map[incomplete.pillar] || {
      title: incomplete.title,
      cta: "Open Evala",
      href: "/home/evala",
    };
    return {
      title: m.title,
      reason: incomplete.title,
      cta: m.cta,
      href: m.href,
      pillar: incomplete.pillar,
    };
  }

  if (!isCheckedInToday(rec)) {
    return {
      title: "Mark the day",
      reason: "You did the work. Put it on the record.",
      cta: "Check in",
      href: "/home",
      pillar: "Life",
    };
  }

  return {
    title: "See what is changing",
    reason: "Today is logged. Review the shape of your week.",
    cta: "Open Progress",
    href: "/home/progress",
  };
}

export function dailyPillarStatus(rec = loadRecord()): DayPillar[] {
  const today = dayKey();
  const day = rec.days[today];
  const objs = todaysObjectives(rec);

  return CORE_PILLARS.map((id) => {
    const name = id[0].toUpperCase() + id.slice(1);
    let done = false;
    if (id === "body")
      done = Boolean(day?.workout) || objs.some((o) => o.pillar === "Body" && o.completed);
    else done = objs.some((o) => o.pillar.toLowerCase() === id && o.completed);
    return { id, name, done };
  });
}

export function strongestPillar(rec = loadRecord()) {
  const pillars = livePillars(rec);
  return [...pillars].sort((a, b) => b.level - a.level || b.progress - a.progress)[0];
}

export function needsAttention(rec = loadRecord()) {
  const pillars = livePillars(rec);
  return [...pillars].sort((a, b) => a.level - b.level || a.progress - b.progress)[0];
}

/** Daily world focus for Evala / surfaces that still call focusCard. */
export function focusCard(date = new Date()) {
  const w = worldState(date);
  return {
    theme: w.title,
    principle: w.line,
    detail: w.focus,
  };
}

export function actionsCompletedCount(rec = loadRecord()) {
  const pillars = dailyPillarStatus(rec);
  const checked = isCheckedInToday(rec) ? 1 : 0;
  const pillarDone = pillars.filter((p) => p.done).length;
  return { done: Math.min(6, pillarDone + checked), total: 6, pillars };
}
