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
    line = "Start with one thing today.";
  } else if (!checked && hour >= 20) {
    line = "Still time to log one action.";
  } else if (checked && done >= Math.max(1, objs.length - 1)) {
    line = "Solid day. Don't force more.";
  } else if (rec.streak >= 6) {
    line = `${rec.streak}-day streak. Keep it going.`;
  } else if (rec.streak >= 2) {
    line = `${rec.streak} days in a row.`;
  } else if (done === 0 && hour >= 14) {
    line = "Nothing done yet — still recoverable.";
  } else {
    line = "Here's what matters today.";
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
      reason: "You haven't trained yet today.",
      cta: "Train",
      href: "/home/train",
      pillar: "Body",
    };
  }

  if (incomplete) {
    const map: Record<string, { title: string; cta: string; href: string }> = {
      Body: { title: "Train your body", cta: "Open Train", href: "/home/train" },
      Mind: { title: "Clear your mind", cta: "Open Mind", href: "/home/mind" },
      Career: { title: "Move your work", cta: "Open Daily", href: "/home/daily" },
      Finance: { title: "Look at the money", cta: "Open Daily", href: "/home/daily" },
      Social: { title: "Reach someone real", cta: "Open Connect", href: "/home/connect" },
      Life: { title: "Finish the daily", cta: "Open Daily", href: "/home/daily" },
    };
    const m = map[incomplete.pillar] || {
      title: incomplete.title,
      cta: "Open Daily",
      href: "/home/daily",
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
      title: "Check in",
      reason: "Close the day so it counts.",
      cta: "Check in",
      href: "/home",
      pillar: "Self",
    };
  }

  return {
    title: "Day is locked",
    reason: "Everything on the board is done.",
    cta: "View progress",
    href: "/home/progress",
  };
}

export function actionsCompletedCount(rec = loadRecord()) {
  const objs = todaysObjectives(rec);
  const done = objs.filter((o) => o.completed).length;
  const pillars = CORE_PILLARS.map((id) => {
    const name = id[0].toUpperCase() + id.slice(1);
    const hit = objs.some((o) => o.pillar.toLowerCase() === id && o.completed);
    return { id, name, done: hit } satisfies DayPillar;
  });
  return { done, total: objs.length || CORE_PILLARS.length, pillars };
}

export function strongestPillar(rec = loadRecord()) {
  const live = livePillars(rec);
  return live.slice().sort((a, b) => b.level - a.level)[0] || live[0];
}

export function needsAttention(rec = loadRecord()) {
  const live = livePillars(rec);
  return live.slice().sort((a, b) => a.level - b.level)[0] || live[0];
}

export function missedYesterday(rec = loadRecord()) {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const key = dayKey(d);
  const y = rec.days[key];
  if (!y) return true;
  return !y.checkIn && !y.workout;
}

export function worldLine(now = new Date()) {
  return worldState(now).title;
}
