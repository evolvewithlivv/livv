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
  beats: { k: string; t: string }[];
  move: string;
  sources: WikiSource[];
};

export const DESKS: { id: WikiDesk; label: string; line: string; hex: string; glow: string }[] = [
  { id: "body", label: "Body", line: "The machine you train in.", hex: "#3DDC97", glow: "rgba(61,220,151,0.28)" },
  { id: "mind", label: "Mind", line: "Sleep, focus, the loop.", hex: "#7C6BFF", glow: "rgba(124,107,255,0.32)" },
  { id: "career", label: "Career", line: "Work that actually ships.", hex: "#4C8DFF", glow: "rgba(76,141,255,0.32)" },
  { id: "finance", label: "Finance", line: "Money as a system.", hex: "#F5C542", glow: "rgba(245,197,66,0.28)" },
  { id: "social", label: "Social", line: "People you keep.", hex: "#FF5C8A", glow: "rgba(255,92,138,0.28)" },
  { id: "system", label: "System", line: "How to use LIVV.", hex: "#2EE0C0", glow: "rgba(46,224,192,0.28)" },
];

export function deskMeta(id: WikiDesk) {
  return DESKS.find((d) => d.id === id) || DESKS[1];
}

export const WIKI: WikiArticle[] = [
  {
    slug: "sleep-is-the-first-lever",
    desk: "mind",
    title: "Sleep first. Everything else waits.",
    hook: "If the night is trash, the day is theater.",
    readMins: 3,
    beats: [
      { k: "01", t: "People try to fix tired with more coffee, a new plan, or a pep talk. Cheaper move: protect the night like it is a workout." },
      { k: "02", t: "Under 7 hours, you get slower, hungrier, and worse at saying no. In LIVV that looks like skipped Train and a dead Daily. It feels like a you problem. It is usually a sleep problem." },
      { k: "03", t: "You do not need a 12-step routine. Same bedtime. Dark room. Phone out. Treat 10:30 like a meeting you already accepted." },
    ],
    move: "Pick a lights-out time for the next 7 nights. When you hit it, log a Mind action.",
    sources: [
      { label: "CDC: How much sleep do I need?", href: "https://www.cdc.gov/sleep/about/index.html" },
      { label: "NIH: Sleep deprivation", href: "https://www.nhlbi.nih.gov/health/sleep-deprivation" },
    ],
  },
  {
    slug: "implementation-intentions",
    desk: "mind",
    title: "If this, then that.",
    hook: "Motivation is weather. A plan is a door that already exists.",
    readMins: 3,
    beats: [
      { k: "01", t: "Researchers call these implementation intentions. Plain English: you decide the cue before the moment hits. If it is 7am, then I open Train. Not I should work out more." },
      { k: "02", t: "Vague goals die between who you think you are and what is on the calendar. LIVV already is the calendar. Attach one action to one cue." },
      { k: "03", t: "Write one if-then for tomorrow only. If it lasts 3 days, keep it. If it dies, the cue was wrong. You were not." },
    ],
    move: "Write this sentence tonight: If [time], then I [one LIVV action]. Put it in Daily.",
    sources: [
      { label: "Gollwitzer paper (APA PDF)", href: "https://www.apa.org/pubs/journals/releases/amp-54-7-493.pdf" },
      { label: "APA record", href: "https://psycnet.apa.org/record/1999-05760-001" },
    ],
  },
  {
    slug: "progressive-overload",
    desk: "body",
    title: "Add a little or stay the same.",
    hook: "Your body adapts to last week, not to your intentions.",
    readMins: 3,
    beats: [
      { k: "01", t: "Same workout, same weight, same time. That is maintenance wearing a hoodie that says discipline." },
      { k: "02", t: "You do not need a new program every Monday. You need one more rep, one more minute, or a slightly heavier set." },
      { k: "03", t: "LIVV already stored your last session. Open Train. Beat one number. Close it. Redesigning the split is usually stalling." },
    ],
    move: "Next session, keep the same workout. Add one rep or 2.5lb on one lift. Log it.",
    sources: [
      { label: "ACSM: progression models", href: "https://journals.lww.com/acsm-msse/fulltext/2009/03000/progression_models_in_resistance_training_for.26.aspx" },
      { label: "CDC: activity guidelines", href: "https://www.cdc.gov/physical-activity-basics/guidelines/index.html" },
    ],
  },
  {
    slug: "zone-2-is-not-optional",
    desk: "body",
    title: "Easy cardio still counts.",
    hook: "If every session is a fight, you never build the engine.",
    readMins: 3,
    beats: [
      { k: "01", t: "Zone 2 means you can talk in sentences. That easy pace is how your base actually grows. Sprinting every day is a mood." },
      { k: "02", t: "Walk hills, bike, row. 30 to 45 minutes. If you track heart rate, stay around 60 to 70 percent of max. If you do not, use the talk test." },
      { k: "03", t: "Keep one hard day. The mix is the point. Easy is not a personality. It is part of the work." },
    ],
    move: "Put one easy 30-minute piece on this week. Log it as training. Do not call it just a walk.",
    sources: [
      { label: "AHA: target heart rates", href: "https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates" },
      { label: "CDC: measuring intensity", href: "https://www.cdc.gov/physical-activity-basics/measuring/index.html" },
    ],
  },
  {
    slug: "protein-and-the-boring-plate",
    desk: "body",
    title: "Put protein on the plate.",
    hook: "You cannot out-program a week of snacks.",
    readMins: 2,
    beats: [
      { k: "01", t: "Most people under-eat protein and overthink dinner. Default: protein at every meal, plants on the plate, water before the second coffee." },
      { k: "02", t: "You do not need a cut plan to start. You need a plate you can repeat so training has something to rebuild with." },
    ],
    move: "Next three meals, name the protein before you eat. That is the experiment.",
    sources: [
      { label: "Harvard: protein", href: "https://nutritionsource.hsph.harvard.edu/what-should-you-eat/protein/" },
      { label: "Dietary Guidelines for Americans", href: "https://www.dietaryguidelines.gov/" },
    ],
  },
  {
    slug: "deep-work-block",
    desk: "career",
    title: "One quiet hour beats a heroic day.",
    hook: "A calendar full of meetings is a waiting room.",
    readMins: 3,
    beats: [
      { k: "01", t: "Deep work is Cal Newport's word for uninterrupted hard thinking. Most jobs destroy it by default." },
      { k: "02", t: "You will not get four hours. You can get one. Phone in another room. Chat closed. One thing on the page." },
      { k: "03", t: "LIVV is not your project manager. It is proof you showed up to the block. Log Career when it happens, not when you planned it." },
    ],
    move: "Put a 60-minute no-phone block on tomorrow morning. A miss is data. Not a speech." ,
    sources: [
      { label: "Cal Newport on Deep Work", href: "https://calnewport.com/deep-work-rules-for-focused-success-in-a-distracted-world/" },
      { label: "APA: switching costs", href: "https://www.apa.org/topics/research/multitasking" },
    ],
  },
  {
    slug: "ship-ugly",
    desk: "career",
    title: "Send the ugly version.",
    hook: "Polish is how unfinished work stays unfinished.",
    readMins: 2,
    beats: [
      { k: "01", t: "If the bar is ready, nothing leaves the building. Six days of contact beats six months of planning. That is LIVV's bias and it should be yours." },
      { k: "02", t: "Pick the smallest thing someone else can react to. Send it. Now you have feedback instead of taste." },
    ],
    move: "Name the thing that has been almost ready for two weeks. Cut it until you can send it today.",
    sources: [
      { label: "SVPG: product discovery", href: "https://www.svpg.com/product-discovery-basics/" },
    ],
  },
  {
    slug: "first-dollar-system",
    desk: "finance",
    title: "Move the first dollar on autopilot.",
    hook: "Willpower is a terrible bill-pay system.",
    readMins: 3,
    beats: [
      { k: "01", t: "People who look good with money usually removed the decision. The transfer happens before lifestyle expands." },
      { k: "02", t: "Cash buffer first. Then retirement or a simple brokerage. Then whatever game you want. Order matters more than the app." },
      { k: "03", t: "Log the transfer in LIVV once. After that the system should run without a pep talk." },
    ],
    move: "Set one automatic transfer this week, even $25. Log it as Finance.",
    sources: [
      { label: "CFPB: saving", href: "https://www.consumerfinance.gov/consumer-tools/savings-accounts/" },
      { label: "Investor.gov: save and invest", href: "https://www.investor.gov/introduction-investing/investing-basics/save-and-invest" },
    ],
  },
  {
    slug: "fee-drag",
    desk: "finance",
    title: "Fees eat you quietly.",
    hook: "A 1% fee does not feel like anything. That is the trick.",
    readMins: 2,
    beats: [
      { k: "01", t: "Expense ratios and junk fees compound against you the same way returns compound for you. Most people never open the statement long enough to see it." },
      { k: "02", t: "You do not need to become an investor tonight. You need to know what you pay, and whether the thing earning it is a cheap fund or a story." },
    ],
    move: "Open one account you already own. Write down the fee. That is the research.",
    sources: [
      { label: "SEC: fund fees", href: "https://www.investor.gov/introduction-investing/investing-basics/glossary/mutual-fund-fees-and-expenses" },
      { label: "Investor.gov: products", href: "https://www.investor.gov/introduction-investing/investing-basics/investment-products" },
    ],
  },
  {
    slug: "loneliness-is-load",
    desk: "social",
    title: "Being alone is a load too.",
    hook: "You can hit every workout and still rot if nobody knows you.",
    readMins: 3,
    beats: [
      { k: "01", t: "Holt-Lunstad's research put a number on it. Weak connection tracks with worse health, in the same neighborhood as risks people already take seriously." },
      { k: "02", t: "Connect in LIVV is not supposed to be a feed. It is supposed to create one person who notices if you disappear." },
      { k: "03", t: "One specific message beats ten likes. Saw you trained. I am going at 6. That is a social action. Hope you are well is noise." },
    ],
    move: "Send one specific check-in today. A time, a place, or a real question.",
    sources: [
      { label: "Holt-Lunstad, PLOS Medicine", href: "https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000316" },
      { label: "CDC: social connectedness", href: "https://www.cdc.gov/emotional-wellbeing/social-connectedness/index.html" },
    ],
  },
  {
    slug: "pair-not-audience",
    desk: "social",
    title: "One pair beats an audience.",
    hook: "Posting your life is not the same as being known.",
    readMins: 2,
    beats: [
      { k: "01", t: "Audience is leverage. A pair is accountability. Most people chase the first and skip the second, then wonder why the chain dies in private." },
      { k: "02", t: "One person on one pillar is enough. Body is easiest because the proof is a session, not a feeling." },
    ],
    move: "Name one person. Tell them the pillar. Ask for a weekly ping, not a follow.",
    sources: [
      { label: "APA: stress and support", href: "https://www.apa.org/topics/stress/manage" },
    ],
  },
  {
    slug: "how-livv-wants-to-be-used",
    desk: "system",
    title: "How to actually use LIVV.",
    hook: "This is a room you enter, not a dashboard you stare at.",
    readMins: 3,
    beats: [
      { k: "01", t: "Daily is the front door. Train is proof for the body. Packs are the reward layer, not the point. Evala can only read what you logged." },
      { k: "02", t: "Embers count momentum. They are not a substitute for the action. If you farm them with no session, no sit, and no message, you are playing the wrong game." },
      { k: "03", t: "This wiki exists so you do not have to open 12 tabs when energy dips. Read one page. Do the move. Come back." },
    ],
    move: "Do today's Daily drop before you open anything else in the app.",
    sources: [
      { label: "Open Daily in LIVV", href: "/home/daily" },
      { label: "Open Train in LIVV", href: "/home/train" },
    ],
  },
  {
    slug: "streaks-are-not-identity",
    desk: "system",
    title: "A streak is data, not your name.",
    hook: "A miss is information. Making it a verdict is how people quit.",
    readMins: 2,
    beats: [
      { k: "01", t: "Streaks work because absence gets visible. They fail when a miss becomes a story about who you are." },
      { k: "02", t: "Missed yesterday? Show up today. That is the whole repair. LIVV even has a repair path because the product expects contact with reality, not a perfect month." },
    ],
    move: "If the chain is dead, do the smallest action in the app in the next 10 minutes. No manifesto first.",
    sources: [
      { label: "BJ Fogg: Tiny Habits", href: "https://www.tinyhabits.com/" },
    ],
  },
];

export function articleBySlug(slug: string) {
  return WIKI.find((a) => a.slug === slug) || null;
}

export function nextArticle(slug: string) {
  const i = WIKI.findIndex((a) => a.slug === slug);
  if (i < 0) return WIKI[0];
  return WIKI[(i + 1) % WIKI.length];
}
