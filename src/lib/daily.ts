import { addEmbers } from "./identity";
import { logCustomAction } from "./record";

export type DailyCard = {
  theme: string;
  line: string;
  mission: string;
  missionHref: "/home/train" | "/home/evolve" | "/home/connect";
  missionCta: string;
  note: string;
};

export type DailyTask = {
  id: "mind" | "body" | "life";
  label: string;
  title: string;
  description: string;
  pillar: string;
  xpSize: "small" | "standard" | "major";
};

export type DailyJournalEntry = {
  key: string;
  question: string;
  answer: string;
  savedAt: number;
};

export type DailyDrop = {
  id: string;
  name: string;
  description: string;
  amount: number;
  icon: string;
};

export const DAILY_KEY = "livv-daily-v1";
export const SEASON_START = "2026-09-01";

const QUESTIONS = [
  "What are you avoiding that you already know you need to do?",
  "What would the strongest version of you do next?",
  "Where are you making your life harder than it needs to be?",
  "What deserves your attention more than your phone does today?",
  "What truth would make today's decision easier?",
  "What are you tolerating that you should change?",
  "If nobody could judge you, what would you start?",
  "What did yesterday teach you that you can actually use today?",
  "What would make you proud of today tonight?",
  "Where are you waiting for permission you do not need?",
];

const DAILY_SETS = [
  [
    ["Mind", "Clear the noise", "Write one sentence about the decision you have been postponing.", "mind", "small"],
    ["Body", "Move for 10 minutes", "Walk, stretch, or train. No optimization required. Just move.", "body", "standard"],
    ["Life", "Fix one friction point", "Clean, organize, repair, cancel, or handle one small thing you keep stepping around.", "life", "standard"],
  ],
  [
    ["Mind", "Choose the hard truth", "Name one thing you know is true but keep negotiating with.", "mind", "small"],
    ["Body", "20 squats + 10 push-ups", "Complete the circuit once. Scale the reps if needed, but finish it.", "body", "standard"],
    ["Life", "Make one useful move", "Do one action that makes tomorrow easier before you do anything optional.", "life", "standard"],
  ],
  [
    ["Mind", "Five minutes of silence", "Put the phone down and sit without consuming anything for five minutes.", "mind", "small"],
    ["Body", "Get outside", "Spend at least 15 minutes outside and let your body change environments.", "body", "standard"],
    ["Life", "Upgrade your space", "Improve one visible part of your environment. Small change, immediate proof.", "life", "standard"],
  ],
  [
    ["Mind", "Write the next move", "Turn one vague goal into a single physical action you can do today.", "mind", "small"],
    ["Body", "Train the basics", "Do 3 rounds of a simple bodyweight circuit at your own pace.", "body", "major"],
    ["Life", "Create before consuming", "Finish one useful task before entertainment, scrolling, or passive content.", "life", "standard"],
  ],
] as const;

const DROPS: DailyDrop[] = [
  { id: "ember-cache", name: "Ember Cache", description: "A warm reserve for your evolution run.", amount: 40, icon: "✦" },
  { id: "ember-surge", name: "Ember Surge", description: "A bigger hit of fuel for today's momentum.", amount: 75, icon: "✧" },
  { id: "rare-cache", name: "Rare Cache", description: "A rare daily reward. Your consistency is becoming visible.", amount: 120, icon: "◇" },
  { id: "foundry-drop", name: "Foundry Drop", description: "A premium-feeling reward for finishing the full Daily.", amount: 60, icon: "⬡" },
  { id: "golden-drop", name: "Golden Drop", description: "The uncommon pull. You earned this one.", amount: 150, icon: "✹" },
];

const DAYS: DailyCard[] = [
  { theme: "Show up", line: "You do not need a perfect day. You need this one.", mission: "Complete one training session, even if it is short.", missionHref: "/home/train", missionCta: "Train now", note: "Most people wait to feel ready. Ready is after the first set." },
  { theme: "Quiet work", line: "Nobody is watching. That is the advantage.", mission: "Check off every objective on Evolve.", missionHref: "/home/evolve", missionCta: "Do the work", note: "The version of you that you want is built on days that look boring." },
  { theme: "One more", line: "Stop at good and you stay the same. Add one more.", mission: "Generate a workout and finish it.", missionHref: "/home/train", missionCta: "Start session", note: "The extra rep is where identity actually changes." },
  { theme: "Protect the streak", line: "Today is not about growth. It is about not disappearing.", mission: "Mark one objective complete so the chain stays alive.", missionHref: "/home/evolve", missionCta: "Keep the chain", note: "Missing once is human. Missing twice is a new personality." },
  { theme: "Move first", line: "Think later. Body first. Mind follows.", mission: "Train before you scroll anything else.", missionHref: "/home/train", missionCta: "Move", note: "A body in motion makes better decisions than a body on a couch." },
  { theme: "Stay close", line: "You get sharper around people who are also building.", mission: "Open Connect and leave one real reaction.", missionHref: "/home/connect", missionCta: "Check the room", note: "Isolation feels focused until it turns into quitting in private." },
  { theme: "Standard", line: "Today you are not chasing motivation. You are keeping a standard.", mission: "Finish a session that matches your actual day, not your fantasy day.", missionHref: "/home/train", missionCta: "Match the day", note: "Twenty minutes done beats a two hour plan you never start." },
  { theme: "Clean inputs", line: "What you let in today becomes who you are next month.", mission: "Clear today's Evolve list before midnight.", missionHref: "/home/evolve", missionCta: "Clear the list", note: "Discipline is just choosing the same thing when it is inconvenient." },
  { theme: "No theater", line: "Skip the announcement. Do the thing.", mission: "Start training without building the perfect plan first.", missionHref: "/home/train", missionCta: "Skip the speech", note: "Talking about the work is the easiest way to avoid it." },
  { theme: "Return", line: "If you drifted, this is the door back in. Use it.", mission: "One objective. One session. That is a full reset.", missionHref: "/home/evolve", missionCta: "Come back", note: "You do not need a new Monday. You need the next hour." },
  { theme: "Heat", line: "Comfort is the tax you pay for staying average.", mission: "Pick a harder focus than you feel like and train it.", missionHref: "/home/train", missionCta: "Go harder", note: "Easy days are fine. Easy weeks are how people stall." },
  { theme: "Proof", line: "Feelings lie. Completed work does not.", mission: "Log something real in Evolve so today exists.", missionHref: "/home/evolve", missionCta: "Make it real", note: "If it is not on the record, your brain will rewrite it by tonight." },
  { theme: "Keep the line", line: "You already started. Do not negotiate with the version of you that wants out.", mission: "Open Train and finish whatever you generate.", missionHref: "/home/train", missionCta: "Finish it", note: "The argument in your head is not wisdom. It is just resistance." },
  { theme: "Presence", line: "Be here long enough to become someone worth being.", mission: "Spend five minutes in Connect. See who showed up.", missionHref: "/home/connect", missionCta: "Look around", note: "You do not have to be loud. You have to be consistent in public." },
];

function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function storage(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(DAILY_KEY) || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

function save(value: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DAILY_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event("livv-daily"));
}

export function dayNumber(date = new Date()) {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const now = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((now - start) / 86400000);
}

export function getDailyCard(date = new Date()): DailyCard {
  return DAYS[dayNumber(date) % DAYS.length];
}

export function seasonDay(date = new Date()) {
  const start = new Date(`${SEASON_START}T00:00:00`);
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.max(1, Math.floor((current.getTime() - start.getTime()) / 86400000) + 1);
}

export function seasonState(date = new Date()) {
  const day = seasonDay(date);
  const dayInSeason = ((day - 1) % 28) + 1;
  const chapter = Math.floor((dayInSeason - 1) / 7) + 1;
  const chapterNames = ["Ignition", "Pressure", "Momentum", "Ascent"];
  return {
    name: "THE ASCENT",
    day,
    dayInSeason,
    chapter,
    chapterName: chapterNames[chapter - 1],
    remaining: 28 - dayInSeason,
    progress: Math.round((dayInSeason / 28) * 100),
  };
}

export function worldState(date = new Date()) {
  const phases = [
    ["THE IGNITION", "Start before you feel ready."],
    ["THE PRESSURE", "Do the thing that has been waiting on you."],
    ["THE CLEARING", "Remove noise. Keep what matters."],
    ["THE ASCENT", "Stack proof. Let momentum compound."],
    ["THE EDGE", "Comfort is not the objective."],
    ["THE RETURN", "Come back to what you said mattered."],
    ["THE FORGE", "Make today's version harder to break."],
  ] as const;
  return phases[(seasonDay(date) - 1) % phases.length];
}

export function dailyQuestion(date = new Date()) {
  return QUESTIONS[hash(dateKey(date)) % QUESTIONS.length];
}

export function dailyTasks(date = new Date()): DailyTask[] {
  const set = DAILY_SETS[hash(dateKey(date)) % DAILY_SETS.length];
  return set.map(([label, title, description, pillar, xpSize], index) => ({
    id: ["mind", "body", "life"][index] as DailyTask["id"],
    label,
    title,
    description,
    pillar,
    xpSize,
  }));
}

export function dailyDrop(date = new Date()) {
  return DROPS[hash(`${dateKey(date)}-drop`) % DROPS.length];
}

export function loadDailyState(date = new Date()) {
  const data = storage();
  const key = dateKey(date);
  const completed = Array.isArray(data.completed) ? data.completed.filter((x): x is string => typeof x === "string") : [];
  const journal = Array.isArray(data.journal)
    ? data.journal.filter((x): x is DailyJournalEntry => Boolean(x && typeof x === "object" && typeof (x as DailyJournalEntry).key === "string"))
    : [];
  const claimed = data.claimed && typeof data.claimed === "object" ? data.claimed as Record<string, boolean> : {};
  return {
    completed: completed.filter((id) => id.startsWith(`${key}:`)).map((id) => id.slice(key.length + 1)),
    journal,
    dropClaimed: Boolean(claimed[key]),
  };
}

export function completeDailyTask(id: DailyTask["id"], date = new Date()) {
  const data = storage();
  const key = dateKey(date);
  const completed = Array.isArray(data.completed) ? data.completed.filter((x): x is string => typeof x === "string") : [];
  const token = `${key}:${id}`;
  if (!completed.includes(token)) {
    const task = dailyTasks(date).find((item) => item.id === id);
    if (task) logCustomAction({ title: `Daily · ${task.title}`, pillar: task.pillar, size: task.xpSize });
    completed.push(token);
    data.completed = completed.slice(-120);
    save(data);
  }
  return loadDailyState(date);
}

export function saveDailyJournal(answer: string, date = new Date()) {
  const clean = answer.trim();
  if (!clean) return loadDailyState(date);
  const data = storage();
  const key = dateKey(date);
  const journal = Array.isArray(data.journal) ? data.journal.filter((x): x is DailyJournalEntry => Boolean(x && typeof x === "object" && typeof (x as DailyJournalEntry).key === "string")) : [];
  const entry: DailyJournalEntry = { key, question: dailyQuestion(date), answer: clean, savedAt: Date.now() };
  data.journal = [...journal.filter((item) => item.key !== key), entry].slice(-90);
  save(data);
  return loadDailyState(date);
}

export function claimDailyDrop(date = new Date()) {
  const data = storage();
  const key = dateKey(date);
  const claimed = data.claimed && typeof data.claimed === "object" ? { ...(data.claimed as Record<string, boolean>) } : {};
  const state = loadDailyState(date);
  if (state.completed.length < 3 || claimed[key]) return { claimed: false, drop: dailyDrop(date) };
  const drop = dailyDrop(date);
  claimed[key] = true;
  data.claimed = claimed;
  save(data);
  addEmbers(drop.amount);
  return { claimed: true, drop };
}

export function journalHistory() {
  return loadDailyState().journal.slice().sort((a, b) => b.key.localeCompare(a.key));
}
