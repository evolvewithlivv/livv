import { isCheckedInToday, loadRecord, todaysObjectives } from "./record";
import { dayKey } from "./dates";

export type Move = { title: string; reason: string; cta: string; href: string; pillar?: string };
export type DayPillar = { id: string; name: string; done: boolean };

export function contextGreeting(now = new Date(), rec = loadRecord()) {
  const me = require("./identity").loadIdentity();
  const first = (me.displayName || "there").split(" ")[0];
  const hour = now.getHours();
  const checked = isCheckedInToday(rec);
  const objs = todaysObjectives(rec);
  const done = objs.filter((o: { completed: boolean }) => o.completed).length;
  let salutation = `Hey, ${first}`;
  if (hour < 5) salutation = `Still up, ${first}`;
  else if (hour < 12) salutation = `Morning, ${first}`;
  else if (hour < 17) salutation = `Afternoon, ${first}`;
  else if (hour < 21) salutation = `Evening, ${first}`;
  else salutation = `Wind down, ${first}`;
  let line = "Here's what matters today.";
  if (rec.streak === 0 && rec.workoutsCompleted === 0 && done === 0) line = "Start with one thing today.";
  else if (!checked && hour >= 20) line = "Still time to log one action.";
  else if (checked && done >= Math.max(1, objs.length - 1)) line = "Solid day. Don't force more.";
  else if (rec.streak >= 6) line = `${rec.streak}-day streak. Keep it going.`;
  else if (rec.streak >= 2) line = "A few days in a row. Keep going.";
  else if (done === 0 && hour >= 14) line = "Nothing done yet. Still recoverable.";
  return { salutation, line };
}

export function nextMove(rec = loadRecord()): Move {
  const today = dayKey();
  const day = rec.days[today];
  const objs = todaysObjectives(rec);
  const incomplete = objs.find((o) => !o.completed);
  if (!day?.workout)
    return {
      title: "Train your body",
      reason: "You haven't trained yet today.",
      cta: "Train",
      href: "/home/train",
      pillar: "Body",
    };
  if (incomplete) {
    const map: Record<string, { title: string; cta: string; href: string }> = {
      Body: { title: "Train your body", cta: "Open Train", href: "/home/train" },
      Mind: { title: "Clear your mind", cta: "Open Daily", href: "/home/daily" },
      Career: { title: "Finish the priority", cta: "Open Daily", href: "/home/daily" },
      Finance: { title: "Protect your money", cta: "Open Daily", href: "/home/daily" },
      Social: { title: "Reach someone real", cta: "Open Daily", href: "/home/daily" },
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
  if (!isCheckedInToday(rec))
    return {
      title: "Check in",
      reason: "Close the day so it counts.",
      cta: "Check in",
      href: "/home",
      pillar: "Life",
    };
  return {
    title: "Day is done",
    reason: "Today is logged. Review your week if you want.",
    cta: "View progress",
    href: "/home/progress",
  };
}
