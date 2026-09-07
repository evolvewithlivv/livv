export type WikiDesk = "body" | "mind" | "career" | "finance" | "social" | "system";

export type WikiSource = {
  label: string;
  href: string;
};

export type WikiArticle = {
  slug: string;
  desk: WikiDesk;
  title: string;
  hook: string;
  readMins: number;
  body: string[];
  move: string;
  sources: WikiSource[];
};

export const DESKS: { id: WikiDesk; label: string; line: string }[] = [
  { id: "body", label: "Body", line: "The machine you train in." },
  { id: "mind", label: "Mind", line: "Attention, sleep, the loop." },
  { id: "career", label: "Career", line: "Work that compounds." },
  { id: "finance", label: "Finance", line: "Money as a system." },
  { id: "social", label: "Social", line: "People you actually keep." },
  { id: "system", label: "System", line: "How LIVV is meant to be used." },
];

export const WIKI: WikiArticle[] = [
  {
    slug: "sleep-is-the-first-lever",
    desk: "mind",
    title: "Sleep is the first lever",
    hook: "If the night is broken, every other protocol is theater.",
    readMins: 3,
    body: [
      "Most users try to fix energy with caffeine, a new program, or more willpower. The cheaper move is protecting the sleep window like it is a session.",
      "Adults who regularly get under seven hours lose reaction time, glucose control, and impulse control. That shows up in LIVV as skipped training, dead Daily drops, and a chain that looks like a personality problem when it is a recovery problem.",
      "You do not need a perfect stack. Same wind-down, dark room, same window. Treat 10:30 as a meeting you already accepted.",
    ],
    move: "Pick a lights-out time for the next 7 nights. Log it as a Mind action when you hit it.",
    sources: [
      { label: "CDC — How much sleep do I need?", href: "https://www.cdc.gov/sleep/about/index.html" },
      { label: "NIH — Sleep deprivation and deficiency", href: "https://www.nhlbi.nih.gov/health/sleep-deprivation" },
    ],
  },
  {
    slug: "implementation-intentions",
    desk: "mind",
    title: "If-then beats motivation",
    hook: "Motivation is weather. If-then is architecture.",
    readMins: 3,
    body: [
      "Peter Gollwitzer’s work on implementation intentions is simple: you decide the cue before the moment arrives. ‘If it is 7am, then I open Train.’ Not ‘I should work out more.’",
      "Vague goals die in the gap between identity and calendar. LIVV already gives you the calendar. Your job is to attach one action to one cue.",
      "Write one if-then for tomorrow only. If it survives three days, keep it. If it doesn’t, the cue was wrong — not you.",
    ],
    move: "Write one sentence: If [time or trigger], then I [one LIVV action]. Put it in Daily.",
    sources: [
      { label: "Gollwitzer — Implementation intentions (summary)", href: "https://www.apa.org/pubs/journals/releases/amp-54-7-493.pdf" },
      { label: "APA PsychNet record", href: "https://psycnet.apa.org/record/1999-05760-001" },
    ],
  },
  {
    slug: "progressive-overload",
    desk: "body",
    title: "Progressive overload or you are jogging in place",
    hook: "The body adapts to what you repeated last week. Not to what you intended.",
    readMins: 3,
    body: [
      "Strength, conditioning, even walking volume only moves if the demand creeps up. Same workout, same load, same time under tension — that is maintenance dressed as discipline.",
      "You do not need a new program every Monday. You need one more rep, one more minute, or a slightly heavier set than last session. That is the whole sport.",
      "In LIVV, the last session is already on record. Open Train, beat one number, close it. That is a Body signal. Redesigning the split is usually avoidance.",
    ],
    move: "Next session: keep the same workout. Add one rep or 2.5lb on one lift. Log it.",
    sources: [
      { label: "ACSM position stand — progression models", href: "https://journals.lww.com/acsm-msse/fulltext/2009/03000/progression_models_in_resistance_training_for.26.aspx" },
      { label: "CDC — Physical activity basics", href: "https://www.cdc.gov/physical-activity-basics/guidelines/index.html" },
    ],
  },
  {
    slug: "zone-2-is-not-optional",
    desk: "body",
    title: "Easy cardio is not a personality",
    hook: "If every session is a fight, your engine never gets built.",
    readMins: 3,
    body: [
      "Zone 2 — conversational pace, you can speak in sentences — is how mitochondria and work capacity actually grow. Sprinting every day is a mood, not a base.",
      "You can walk hills, cycle, row. 30–45 minutes where talking is possible. Heart rate roughly 60–70% of max if you track it. If you don’t, use the talk test and stop treating it as a waste of an hour.",
      "Pair it with one hard session a week. The mix is the point.",
    ],
    move: "Schedule one easy 30-minute piece this week. Log it as training, not as a walk you ‘don’t count.’",
    sources: [
      { label: "AHA — Target heart rates", href: "https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates" },
      { label: "CDC — Measuring physical activity intensity", href: "https://www.cdc.gov/physical-activity-basics/measuring/index.html" },
    ],
  },
  {
    slug: "protein-and-the-boring-plate",
    desk: "body",
    title: "The plate is not a vibe",
    hook: "You cannot out-program a week of snacks and skipped protein.",
    readMins: 2,
    body: [
      "Most people under-eat protein and over-negotiate dinner. A simple default: protein at every meal, plants on the plate, water before the second coffee.",
      "You do not need a cut protocol to start. You need a repeatable plate so training has something to rebuild with.",
    ],
    move: "Next three meals: write the protein source before you eat. That is the whole experiment.",
    sources: [
      { label: "Harvard Nutrition Source — Protein", href: "https://nutritionsource.hsph.harvard.edu/what-should-you-eat/protein/" },
      { label: "Dietary Guidelines for Americans", href: "https://www.dietaryguidelines.gov/" },
    ],
  },
  {
    slug: "deep-work-block",
    desk: "career",
    title: "One protected block beats a heroic day",
    hook: "A calendar full of meetings is not a career. It is a waiting room.",
    readMins: 3,
    body: [
      "Deep work — Cal Newport’s term for uninterrupted cognitive work — is how anything hard actually ships. Most jobs destroy it by default.",
      "You will not get four hours. You can get one. Phone in another room. Slack closed. One object on the page.",
      "LIVV is not your project manager. It is the proof you showed up to the block. Log the block as Career when it happens, not when you planned it.",
    ],
    move: "Put a 60-minute no-input block on tomorrow morning. Treat a miss as data, not drama.",
    sources: [
      { label: "Cal Newport — Deep Work (author)", href: "https://calnewport.com/deep-work-rules-for-focused-success-in-a-distracted-world/" },
      { label: "APA — Multitasking: Switching costs", href: "https://www.apa.org/topics/research/multitasking" },
    ],
  },
  {
    slug: "ship-ugly",
    desk: "career",
    title: "Ship the ugly version",
    hook: "Polish is how unfinished work stays unfinished.",
    readMins: 2,
    body: [
      "If the standard is ‘ready,’ nothing leaves the building. The LIVV bias is the same as the product bias: six days of contact beats six months of planning.",
      "Pick the smallest artifact someone else can react to. Send it. Then the next version has a real enemy — feedback — instead of your taste.",
    ],
    move: "Name the thing that has been ‘almost ready’ for two weeks. Cut it to a version you can send today.",
    sources: [
      { label: "SVPG — Product discovery basics", href: "https://www.svpg.com/product-discovery-basics/" },
    ],
  },
  {
    slug: "first-dollar-system",
    desk: "finance",
    title: "Automate the first dollar",
    hook: "Willpower is a terrible bill-pay system.",
    readMins: 3,
    body: [
      "The people who look ‘disciplined’ with money usually removed the decision. Pay yourself first is not a quote. It is an automatic transfer that happens before the lifestyle expands.",
      "Emergency cash, then retirement or brokerage, then whatever game you want to play. Order matters more than the app you use.",
      "Log the transfer in LIVV once. After that the system should run without a streak speech.",
    ],
    move: "Set one automatic transfer this week, even if it is $25. Screenshot it into your record as Finance.",
    sources: [
      { label: "CFPB — Saving and budgeting", href: "https://www.consumerfinance.gov/consumer-tools/savings-accounts/" },
      { label: "Investor.gov — Saving and investing", href: "https://www.investor.gov/introduction-investing/investing-basics/save-and-invest" },
    ],
  },
  {
    slug: "fee-drag",
    desk: "finance",
    title: "Fees are a silent workout you did not approve",
    hook: "A 1% fee does not feel like anything. That is the trick.",
    readMins: 2,
    body: [
      "Expense ratios and junk account fees compound against you the same way returns compound for you. Most people never open the statement long enough to see it.",
      "You do not need to become an allocator tonight. You need to know what you are paying and whether the thing earning it is a low-cost fund or a story.",
    ],
    move: "Open one account you already own. Write down the expense ratio. That is the research.",
    sources: [
      { label: "SEC — Mutual fund fees and expenses", href: "https://www.investor.gov/introduction-investing/investing-basics/glossary/mutual-fund-fees-and-expenses" },
      { label: "Investor.gov — Risk and return", href: "https://www.investor.gov/introduction-investing/investing-basics/investment-products" },
    ],
  },
  {
    slug: "loneliness-is-load",
    desk: "social",
    title: "Isolation is a training load",
    hook: "You can hit every workout and still rot if nobody knows you.",
    readMins: 3,
    body: [
      "Holt-Lunstad’s work put a number on what everyone already feels: weak social connection tracks with worse health outcomes, in the same neighborhood as better-known risks.",
      "LIVV Connect is not supposed to be a feed. It is supposed to create one person who notices if you disappear.",
      "One message that is specific beats ten likes. ‘Saw you trained. I’m going at 6.’ is a social action. ‘Hope you’re well’ is noise.",
    ],
    move: "Send one specific check-in today. Not a streak flex. A time, a place, or a question.",
    sources: [
      { label: "Holt-Lunstad et al. — Social relationships and mortality", href: "https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000316" },
      { label: "CDC — Social connectedness", href: "https://www.cdc.gov/emotional-wellbeing/social-connectedness/index.html" },
    ],
  },
  {
    slug: "pair-not-audience",
    desk: "social",
    title: "A pair beats an audience",
    hook: "Broadcasting your life is not the same as being known.",
    readMins: 2,
    body: [
      "Audience is leverage. Pair is accountability. Most people try to get the first and skip the second, then wonder why the chain dies in private.",
      "One partner on one pillar is enough. Body is the easiest to share because the proof is a session, not a feeling.",
    ],
    move: "Name one person. Tell them the pillar. Ask for a weekly ping, not a follow.",
    sources: [
      { label: "APA — The power of social support", href: "https://www.apa.org/topics/stress/manage" },
    ],
  },
  {
    slug: "how-livv-wants-to-be-used",
    desk: "system",
    title: "How LIVV wants to be used",
    hook: "This is not a dashboard you admire. It is a room you enter.",
    readMins: 3,
    body: [
      "Daily is the front door. Train is the body proof. Packs are the reward layer, not the point. Evala reads the record you actually made — it cannot invent a life you did not log.",
      "Embers are momentum made countable. They are not a substitute for the action. If you are farming them without a session, a sit, or a sent message, you are playing the wrong game.",
      "The wiki is here so you do not have to go hunt twelve tabs every time your energy dips. Read one piece. Do the move at the bottom. Come back.",
    ],
    move: "Do today’s Daily drop before you open anything else in the app.",
    sources: [
      { label: "LIVV Daily", href: "/home/daily" },
      { label: "LIVV Train", href: "/home/train" },
    ],
  },
  {
    slug: "streaks-are-not-identity",
    desk: "system",
    title: "The chain is data, not a self",
    hook: "A broken streak is information. Turning it into a verdict is how people quit.",
    readMins: 2,
    body: [
      "Streaks work because they make absence visible. They fail when a miss becomes a story about who you are.",
      "Miss yesterday, show up today. That is the entire repair. LIVV even has a repair path for a reason — the product expects contact with reality, not a perfect month.",
    ],
    move: "If the chain is dead, do the smallest action in the app in the next 10 minutes. Do not write a manifesto first.",
    sources: [
      { label: "BJ Fogg — Tiny Habits (method)", href: "https://www.tinyhabits.com/" },
    ],
  },
];

export function articleBySlug(slug: string) {
  return WIKI.find((a) => a.slug === slug) || null;
}

export function articlesByDesk(desk: WikiDesk) {
  return WIKI.filter((a) => a.desk === desk);
}
