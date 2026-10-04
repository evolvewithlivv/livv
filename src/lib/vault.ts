import type { LivvTier } from "./identity";

export type VaultModule = {
  id: string;
  title: string;
  blurb: string;
  kind: "protocol" | "tool" | "program" | "series" | "lab";
  meta: string;
  downloadable?: boolean;
  steps?: string[];
  body?: string[];
};

export const VAULT_MODULES: VaultModule[] = [
  {
    id: "sleep-reset-7",
    title: "7-Day Sleep Reset",
    blurb: "One anchor time, less negotiation, better mornings.",
    kind: "protocol",
    meta: "7 days · printable",
    downloadable: true,
    steps: [
      "Pick a fixed wake time for all 7 days. Protect it like an appointment.",
      "Dim screens 45 minutes before bed. Charge the phone outside the room if you can.",
      "Same wind-down sequence every night: lights down, short stretch, one page of reading.",
      "No caffeine after 2pm for the full week.",
      "Log sleep quality each morning in Daily (1-5). Look for the pattern, not perfection.",
      "If you miss a night, keep the wake time. Do not sleep in to compensate.",
      "On day 7, keep the wake time that actually worked. That becomes your default.",
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
    body: ["Clarity beats complicated budgets. One week of honest observation is enough to start."],
  },
  {
    id: "discipline-stack-7",
    title: "7-Day Discipline Stack",
    blurb: "Three non-negotiables a day. Nothing heroic. Everything repeatable.",
    kind: "protocol",
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
    id: "water-baseline-7",
    title: "7-Day Water Baseline",
    blurb: "Know your need. Store what you rotate. Practice once.",
    kind: "protocol",
    meta: "7 days · printable",
    downloadable: true,
    steps: [
      "Write how much drinking and cooking water your household uses in a quiet day. Multiply by three.",
      "Inspect containers you already own. Clean, dry, and label with fill date.",
      "Fill toward your three-day number. Cool, dark storage. No garage extremes if you can avoid them.",
      "Learn one treatment or filtration method that fits your home. Read the instructions once while calm.",
      "Practice that method on a small volume once this week so the motion is familiar.",
      "Set a calendar reminder to rotate or use stored water within a sensible window for your containers.",
      "On day 7, confirm labels, location, and that every adult in the home knows where it is.",
    ],
    body: ["Water readiness is a number, clean storage, and one practiced method - not a pile of unused equipment."],
  },
  {
    id: "garden-start-7",
    title: "7-Day Garden Start",
    blurb: "One crop you eat. Light, soil, and a watering habit.",
    kind: "protocol",
    meta: "7 days · printable",
    downloadable: true,
    steps: [
      "Pick one food you already buy weekly. That is the crop.",
      "Find a spot with roughly six hours of light - bed, pot, or sill.",
      "Prepare soil or potting mix. Remove debris. Water until damp, not flooded.",
      "Plant according to the packet for your climate. Label the date.",
      "Set a simple watering cue tied to something you already do daily.",
      "Check once for pests or dryness. Adjust water; do not rebuild the whole plan.",
      "On day 7, ask whether the site and schedule are realistic. Change one variable only if needed.",
    ],
    body: ["Competence at one plant beats a decorative garden you abandon. Eat what you grow."],
  },
  {
    id: "home-ready-7",
    title: "7-Day Home Ready",
    blurb: "Entries, light, first aid, and a one-page plan.",
    kind: "protocol",
    meta: "7 days · printable",
    downloadable: true,
    steps: [
      "Walk every exterior door and ground-floor window. Note what does not latch cleanly.",
      "Fix or schedule the weakest entry point. One improvement this week is enough to start.",
      "Place working lights where you would need them in the dark. Test batteries.",
      "Locate first aid and important documents. Tell everyone in the home the same locations.",
      "Write a one-page plan: power loss, medical need, and if you must leave. Keep it short.",
      "Review smoke and carbon monoxide alarms. Replace what is dead.",
      "On day 7, re-read the one-page plan aloud once. Update one line that was unclear.",
    ],
    body: ["A home that holds is maintained and known - not staged for a movie."],
  },
  {
    id: "awareness-stack-7",
    title: "7-Day Awareness Stack",
    blurb: "Exits, distance, and a body that can move - without looking for a fight.",
    kind: "protocol",
    meta: "7 days · printable",
    downloadable: true,
    steps: [
      "On one daily route, name three exits and the best-lit path. Do it silently.",
      "Practice giving yourself distance in ordinary spaces - step aside early, do not narrate it.",
      "Add one session of movement that raises heart rate and asks for control (walk hills, carries, or Train).",
      "Write your personal rules: when you leave, when you call for help, when you protect. One sentence each.",
      "Learn the basic self-defense law where you live from a reputable public source. No forums as primary.",
      "If you train contact skills, do it with qualified instruction. This protocol does not replace that.",
      "On day 7, re-walk your main route once with the same checklist. Notice what became automatic.",
    ],
    body: ["Vigilance is awareness and capability under integrity - not aggression as identity."],
  },
  {
    id: "focus-block-tool",
    title: "Focus Block Planner",
    blurb: "Plan one protected hour. Decide the outcome before the hour starts.",
    kind: "tool",
    meta: "Tool · printable",
    downloadable: true,
    steps: [
      "Name the single outcome for the block (one sentence).",
      "Set a start time and end time. Put it on the calendar.",
      "Silence nonessential notifications for that window.",
      "Work only on the named outcome until the timer ends.",
      "Write what moved and what is left for tomorrow.",
    ],
    body: ["One quiet hour beats a scattered day. This tool exists to make that hour concrete."],
  },

  {
    id: "body-rebuild-28",
    title: "28-Day Body Rebuild",
    blurb: "Training, walking, and recovery in a plan that survives a normal month.",
    kind: "program",
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
    body: ["This is not a challenge that peaks on day 3 and dies on day 10. It is a month of showing up."],
  },
  {
    id: "deep-work-28",
    title: "28-Day Deep Work Program",
    blurb: "Build a reliable focus practice across four weeks.",
    kind: "program",
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
    meta: "Insights",
    body: [
      "Progress Lab turns your record into signal: which days slip, which rooms compound, where to simplify.",
      "Use it weekly. Adjust one behavior based on what the data shows - not on how motivated you feel today.",
    ],
  },
];


export type VaultGuide = {
  objective: string;
  why: string;
  before: string[];
  principles: string[];
  fieldNotes: string[];
  checkpoints: string[];
  review: string[];
};

export const VAULT_GUIDES: Record<string, VaultGuide> = {
  "sleep-reset-7": {
    objective: "Stabilize your wake time and build a repeatable evening that makes sleep easier without turning bedtime into a performance.",
    why: "Sleep quality is strongly affected by timing, light exposure, stimulation, and consistency. This week is designed to reduce variables so you can see what actually helps.",
    before: ["Choose a wake time you can keep on weekends.", "Decide where the phone will charge at night.", "Set one simple wind-down sequence and keep the same order each night."],
    principles: ["Protect wake time before chasing an earlier bedtime.", "Reduce stimulation before bed instead of relying on willpower once you are already tired.", "Judge the week by the pattern you create, not by one unusually good or bad night."],
    fieldNotes: ["Get outdoor light soon after waking when practical.", "Keep the bedroom dark, cool, and quiet when possible.", "If you cannot sleep, avoid turning the bed into a scrolling or work zone.", "Do not try to fix a bad night by radically changing the next day's schedule."],
    checkpoints: ["Day 1: record your starting sleep and wake pattern.", "Day 3: identify the biggest source of evening stimulation.", "Day 5: check whether the fixed wake time is becoming easier.", "Day 7: choose the schedule and wind-down habits worth keeping."],
    review: ["What made sleep easier?", "What repeatedly pushed bedtime later?", "Which habit is realistic enough to keep for another month?"]
  },
  "money-baseline-7": {
    objective: "Build a factual picture of your cash flow before trying to budget, invest, cut spending, or increase income.",
    why: "Most money plans fail when they are built from guesses. A short observation period exposes recurring charges, forgotten spending, and the categories that actually move your balance.",
    before: ["Gather your checking, savings, card, and payment app balances.", "List recurring bills and their due dates.", "Choose one spending category you suspect is leaking money."],
    principles: ["Measure first, optimize second.", "Separate fixed obligations from flexible spending.", "Use one clear rule instead of ten rules you will ignore."],
    fieldNotes: ["Record purchases the same day so small transactions do not disappear from memory.", "Mark subscriptions you would not buy again today.", "Watch timing as well as amount. A cash crunch can come from when bills hit, not only from total spending.", "Keep an emergency buffer separate from money meant for everyday spending."],
    checkpoints: ["Day 1: establish your starting balances and recurring charges.", "Day 3: identify the category with the most avoidable movement.", "Day 5: test one 24-hour pause rule.", "Day 7: write the single money rule you will carry forward."],
    review: ["What expense surprised you?", "Which recurring charge is no longer earning its place?", "What one rule would make next month easier?"]
  },
  "discipline-stack-7": {
    objective: "Prove that you can keep a small set of daily commitments without needing a perfect mood or schedule.",
    why: "Discipline becomes useful when it survives ordinary days. Three anchors create a small operating system that can be repeated before adding complexity.",
    before: ["Choose three anchors that matter to your current life.", "Define the minimum version of each anchor.", "Choose the time or trigger that will remind you to act."],
    principles: ["Minimum viable action beats zero.", "Do not add new commitments while the current stack is unstable.", "Entertainment comes after the anchors when possible."],
    fieldNotes: ["Make the first action physically easy to start.", "Track completion, not how motivated you felt.", "When a day goes wrong, shrink the task instead of abandoning it.", "Keep the same anchors long enough to discover whether they actually work."],
    checkpoints: ["Day 1: establish the exact three anchors.", "Day 3: find the anchor most likely to be skipped.", "Day 5: redesign only the weak trigger or minimum.", "Day 7: keep the two strongest anchors and improve the third."],
    review: ["Which commitment became automatic?", "Where did friction appear?", "What should become easier before you add anything else?"]
  },
  "water-baseline-7": {
    objective: "Know your household's basic water needs, improve storage, and practice one appropriate treatment method before you need it.",
    why: "Water readiness is not about buying a pile of gear. It is about knowing your baseline, keeping water stored appropriately, and knowing how your chosen method works.",
    before: ["Estimate daily drinking and cooking use for your household.", "Inspect the containers you already have.", "Choose a treatment method appropriate to the type of water and your situation."],
    principles: ["Use clean containers intended for water storage.", "Follow the instructions for your treatment or filtration method.", "Treat storage as a rotation system, not a one-time purchase.", "Keep emergency water separate from casual daily use when practical."],
    fieldNotes: ["Label stored containers with the fill or rotation date.", "Store water away from extreme heat and contamination.", "Know the difference between filtering and disinfecting. A method that removes particles may not address every microorganism or chemical contaminant.", "For an actual emergency, follow local public health guidance when available."],
    checkpoints: ["Day 1: calculate a practical three-day baseline.", "Day 3: finish cleaning and labeling storage.", "Day 5: practice the chosen treatment method with a small amount.", "Day 7: confirm every adult in the home knows the storage location and procedure."],
    review: ["How much water do you actually need?", "Which part of your setup is weakest?", "What would you need to replace or practice before relying on this plan?"]
  },
  "garden-start-7": {
    objective: "Grow one useful food successfully by matching the crop, light, container or bed, soil, and watering routine to your actual environment.",
    why: "A small productive garden teaches more than a large abandoned one. One crop gives you a manageable experiment with visible feedback.",
    before: ["Pick a crop you already eat.", "Observe the growing area for light and drainage.", "Choose a container or bed large enough for the crop's expected root system."],
    principles: ["Match the plant to the site instead of forcing the site to behave differently.", "Consistent moisture is different from constantly wet soil.", "Change one variable at a time so you know what caused an improvement or problem."],
    fieldNotes: ["Check soil moisture before watering instead of following a rigid clock.", "Label planting dates and varieties.", "Inspect leaves and stems regularly for pests, damage, and stress.", "Follow the seed packet or plant label for depth, spacing, and local timing."],
    checkpoints: ["Day 1: choose crop and site.", "Day 3: confirm moisture and light are behaving as expected.", "Day 5: inspect for stress or pests.", "Day 7: decide whether the setup is sustainable for the next few weeks."],
    review: ["What did the site teach you?", "What was harder than expected?", "Would you plant the same crop again in this exact location?"]
  },
  "home-ready-7": {
    objective: "Make the home easier to operate during common disruptions by fixing weak points, locating essentials, and agreeing on a simple response plan.",
    why: "Preparedness is most useful when it reduces confusion. A known light, known first-aid location, known documents, and a short plan are more valuable than an enormous checklist nobody remembers.",
    before: ["Walk the home in daylight.", "Gather the locations of first aid, lights, important documents, alarms, and emergency contacts.", "Choose a simple meeting or communication plan for household members."],
    principles: ["Fix the weakest practical point first.", "Keep critical information accessible when power or internet is unavailable.", "Everyone in the household should know the plan, not just the person who created it."],
    fieldNotes: ["Test flashlights instead of assuming the batteries work.", "Check smoke and carbon monoxide alarms according to manufacturer guidance.", "Know how to shut off essential utilities when appropriate and safe.", "Keep copies of important information in a secure place that remains accessible during a disruption."],
    checkpoints: ["Day 1: inspect entries and windows.", "Day 3: verify lights, alarms, and first-aid access.", "Day 5: write the one-page response plan.", "Day 7: walk through the plan with the household."],
    review: ["Where would confusion happen first?", "What single repair or purchase would improve readiness most?", "Who still does not know where the essentials are?"]
  },
  "awareness-stack-7": {
    objective: "Improve environmental awareness, movement, decision-making, and help-seeking without turning vigilance into aggression.",
    why: "Useful awareness is quiet. It helps you notice exits, distance, lighting, people, and changes in your environment early enough to make better decisions.",
    before: ["Choose one normal route to observe.", "Define your personal exit and help-seeking rules.", "If you want physical self-defense training, choose qualified instruction rather than learning from random clips."],
    principles: ["Avoidance and early exit are successful outcomes.", "Awareness should increase options, not paranoia.", "Physical skill should be trained safely and progressively.", "Know the laws and emergency resources relevant to where you live."],
    fieldNotes: ["Notice exits when entering unfamiliar places.", "Keep enough attention on your environment to notice changes around you.", "Create distance early when something feels wrong instead of waiting for certainty.", "If a situation becomes dangerous, prioritize getting to safety and contacting appropriate help."],
    checkpoints: ["Day 1: map exits and well-lit routes.", "Day 3: practice calm distance and positioning.", "Day 5: review your personal leave and help rules.", "Day 7: repeat the route and notice what became automatic."],
    review: ["What did you begin noticing earlier?", "Where do you become distracted?", "What skill would most improve your ability to leave safely?"]
  },
  "focus-block-tool": {
    objective: "Turn one hour of intention into one hour of measurable output.",
    why: "Focus improves when the outcome, time window, environment, and stopping point are decided before work begins.",
    before: ["Choose one outcome that can be described in one sentence.", "Remove or silence nonessential notifications.", "Put the materials for the task within reach before the block starts."],
    principles: ["One outcome per block.", "Protect the start time.", "Capture distractions instead of acting on them.", "End with a handoff so restarting is easy."],
    fieldNotes: ["Use a visible timer if it helps you stay inside the block.", "When a new task appears, write it down and return to the current outcome.", "If you finish early, improve or verify the result rather than automatically opening another task.", "Record what actually moved, not what you intended to move."],
    checkpoints: ["Start: write the outcome.", "Halfway: check whether you are still on the named task.", "End: record the result and next action.", "Weekly: compare blocks by useful output, not hours alone."],
    review: ["What interrupted you?", "Was the outcome specific enough?", "What environmental change would make the next block easier?"]
  },
  "body-rebuild-28": {
    objective: "Build a sustainable month of movement, strength work, walking, food structure, and recovery that can continue after day 28.",
    why: "A body changes through repeated exposure and recovery. The program is designed around consistency rather than a short burst of punishment.",
    before: ["Choose three realistic training days.", "Set a daily walking floor you can actually maintain.", "Decide how you will record sessions and basic recovery markers."],
    principles: ["Progress gradually.", "Technique and repeatability matter more than proving how hard you can suffer.", "Recovery is part of training.", "Do not make up missed sessions by doubling the workload."],
    fieldNotes: ["Use clean, controlled repetitions.", "Stop or modify an exercise when pain, dizziness, unusual shortness of breath, or other concerning symptoms appear.", "Keep protein and hydration consistent enough to support the routine.", "Compare performance under similar conditions when possible."],
    checkpoints: ["Week 1: establish schedule and baseline.", "Week 2: add a small progression only if recovery is good.", "Week 3: repeat the structure and clean up technique.", "Week 4: repeat a simple benchmark and decide what continues."],
    review: ["What improved?", "What created unnecessary fatigue?", "Which training structure can you maintain for the next three months?"]
  },
  "deep-work-28": {
    objective: "Build a repeatable concentration practice that produces meaningful work instead of simply increasing screen time.",
    why: "Deep work is a system of clear outcomes, protected time, reduced interruption, and deliberate recovery. More hours are not automatically better.",
    before: ["Choose the work that creates the most value.", "Block the times on your calendar.", "Prepare a simple distraction capture note."],
    principles: ["Define the result before starting.", "Protect attention instead of testing it constantly.", "Keep the environment stable long enough to learn what works.", "Measure finished work, not just time spent sitting."],
    fieldNotes: ["Put the phone out of reach when practical.", "Close unrelated tabs and apps.", "Use short breaks between blocks instead of turning every break into a long feed session.", "End with a one-line handoff that names the next action."],
    checkpoints: ["Week 1: prove one block five days.", "Week 2: add a second block only where useful.", "Week 3: reduce environmental friction.", "Week 4: review output and keep the schedule that produced real work."],
    review: ["What kind of work benefits most from uninterrupted time?", "What repeatedly steals attention?", "What is the minimum weekly practice that still creates meaningful output?"]
  },
  "meal-plan-builder": {
    objective: "Create a realistic seven-day food plan that reduces daily decisions, supports your goals, and produces a usable grocery list.",
    why: "Meal planning works when it reflects how you actually eat. Repetition is a feature because it reduces cost, waste, and decision fatigue.",
    before: ["Choose meals you already know you will eat.", "Check your pantry, refrigerator, and freezer first.", "Set a realistic grocery budget before building the list."],
    principles: ["Build around repeatable meals.", "Shop from the plan instead of shopping from impulse.", "Leave room for one flexible meal.", "Batch the parts that save the most time."],
    fieldNotes: ["Keep a simple protein source available.", "Use produce you can realistically finish before it spoils.", "Freeze extras when appropriate instead of letting them become waste.", "Adjust portions and ingredients to your actual needs rather than treating a sample plan as a prescription."],
    checkpoints: ["Plan: choose meals and quantities.", "Shop: buy only what supports the plan.", "Midweek: identify what is running low or going unused.", "End: record one meal worth repeating and one worth replacing."],
    review: ["Which meal was easiest?", "Where did waste occur?", "What should become a permanent part of your weekly rotation?"]
  }
};

export function modulesForTier(_tier: LivvTier): VaultModule[] { return VAULT_MODULES; }
export function lockedModules(_tier: LivvTier): VaultModule[] { return []; }
export function moduleById(id: string): (VaultModule & { guide?: VaultGuide }) | null { const mod = VAULT_MODULES.find((m) => m.id === id); return mod ? { ...mod, guide: VAULT_GUIDES[id] } : null; }
