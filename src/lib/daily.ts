import { dayKey as dateKey } from "./dates";

export { dayKey } from "./dates";

export type DailyCard = {
  theme: string;
  line: string;
  mission: string;
  missionHref: "/home/train" | "/home/evolve" | "/home/connect";
  missionCta: string;
  note: string;
};

const DAYS: DailyCard[] = [
  {
    theme: "Show up",
    line: "You do not need a perfect day. You need this one.",
    mission: "Complete one training session, even if it is short.",
    missionHref: "/home/train",
    missionCta: "Train now",
    note: "Most people wait to feel ready. Ready is after the first set.",
  },
  {
    theme: "Quiet work",
    line: "Nobody is watching. That is the advantage.",
    mission: "Check off every objective on Evolve.",
    missionHref: "/home/evolve",
    missionCta: "Do the work",
    note: "The version of you that you want is built on days that look boring.",
  },
  {
    theme: "One more",
    line: "Stop at good and you stay the same. Add one more.",
    mission: "Generate a workout and finish it.",
    missionHref: "/home/train",
    missionCta: "Start session",
    note: "The extra rep is where identity actually changes.",
  },
  {
    theme: "Protect the streak",
    line: "Today is not about growth. It is about not disappearing.",
    mission: "Mark one objective complete so the chain stays alive.",
    missionHref: "/home/evolve",
    missionCta: "Keep the chain",
    note: "Missing once is human. Missing twice is a new personality.",
  },
  {
    theme: "Move first",
    line: "Think later. Body first. Mind follows.",
    mission: "Train before you scroll anything else.",
    missionHref: "/home/train",
    missionCta: "Move",
    note: "A body in motion makes better decisions than a body on a couch.",
  },
  {
    theme: "Stay close",
    line: "You get sharper around people who are also building.",
    mission: "Open Connect and leave one real reaction.",
    missionHref: "/home/connect",
    missionCta: "Check the room",
    note: "Isolation feels focused until it turns into quitting in private.",
  },
  {
    theme: "Standard",
    line: "Today you are not chasing motivation. You are keeping a standard.",
    mission: "Finish a session that matches your actual day, not your fantasy day.",
    missionHref: "/home/train",
    missionCta: "Match the day",
    note: "Twenty minutes done beats a two hour plan you never start.",
  },
  {
    theme: "Clean inputs",
    line: "What you let in today becomes who you are next month.",
    mission: "Clear today's Evolve list before midnight.",
    missionHref: "/home/evolve",
    missionCta: "Clear the list",
    note: "Discipline is just choosing the same thing when it is inconvenient.",
  },
  {
    theme: "No theater",
    line: "Skip the announcement. Do the thing.",
    mission: "Start training without building the perfect plan first.",
    missionHref: "/home/train",
    missionCta: "Skip the speech",
    note: "Talking about the work is the easiest way to avoid it.",
  },
  {
    theme: "Return",
    line: "If you drifted, this is the door back in. Use it.",
    mission: "One objective. One session. That is a full reset.",
    missionHref: "/home/evolve",
    missionCta: "Come back",
    note: "You do not need a new Monday. You need the next hour.",
  },
  {
    theme: "Heat",
    line: "Comfort is the tax you pay for staying average.",
    mission: "Pick a harder focus than you feel like and train it.",
    missionHref: "/home/train",
    missionCta: "Go harder",
    note: "Easy days are fine. Easy weeks are how people stall.",
  },
  {
    theme: "Proof",
    line: "Feelings lie. Completed work does not.",
    mission: "Log something real in Evolve so today exists.",
    missionHref: "/home/evolve",
    missionCta: "Make it real",
    note: "If it is not on the record, your brain will rewrite it by tonight.",
  },
  {
    theme: "Keep the line",
    line: "You already started. Do not negotiate with the version of you that wants out.",
    mission: "Open Train and finish whatever you generate.",
    missionHref: "/home/train",
    missionCta: "Finish it",
    note: "The argument in your head is not wisdom. It is just resistance.",
  },
  {
    theme: "Presence",
    line: "Be here long enough to become someone worth being.",
    mission: "Spend five minutes in Connect. See who showed up.",
    missionHref: "/home/connect",
    missionCta: "Look around",
    note: "You do not have to be loud. You have to be consistent in public.",
  },
];

export function dayNumber(date = new Date()) {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const now = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((now - start) / 86400000);
}

export function getDailyCard(date = new Date()): DailyCard {
  return DAYS[dayNumber(date) % DAYS.length];
}

void dateKey;
