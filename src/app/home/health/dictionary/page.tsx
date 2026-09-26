"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronLeft, Search, X } from "lucide-react";

type Entry = { word: string; meaning: string; practice: string; why: string };

const WORDS: Entry[] = [
  {
    word: "Agency",
    meaning: "The ability to choose and act deliberately instead of simply reacting.",
    practice: "Before a decision, ask: what part of this is actually mine to influence?",
    why: "LIVV is about turning intention into action.",
  },
  {
    word: "Adaptation",
    meaning: "Changing your approach when reality gives you new information.",
    practice: "Keep the goal when it matters; change the method when the method stops working.",
    why: "Rigid systems break when life changes.",
  },
  {
    word: "Capability",
    meaning: "Practical ability you can rely on when something needs to get done.",
    practice: "Learn one skill that reduces your dependence on someone else.",
    why: "Capability turns confidence into something concrete.",
  },
  {
    word: "Discipline",
    meaning: "The ability to keep acting on what matters when motivation changes.",
    practice: "Make the useful action smaller until it is easy to repeat, then raise the standard.",
    why: "Consistency compounds.",
  },
  {
    word: "Integrity",
    meaning: "Alignment between what you believe, what you say, and what you actually do.",
    practice: "Keep one promise to yourself today without negotiating with it.",
    why: "Trust starts with your own behavior.",
  },
  {
    word: "Longevity",
    meaning: "Building a life and body that can keep functioning well over time.",
    practice: "Choose the habit that is sustainable for years, not the shortcut that looks impressive for a week.",
    why: "LIVV is built for the long game.",
  },
  {
    word: "Presence",
    meaning: "Giving your attention to what is actually happening instead of living entirely in anticipation or memory.",
    practice: "For one task, remove every competing input and stay with it.",
    why: "Attention is a finite resource.",
  },
  {
    word: "Recovery",
    meaning: "Restoring physical and mental capacity after effort, stress, or strain.",
    practice: "Treat sleep, food, quiet, and easy movement as part of training rather than the absence of training.",
    why: "Capacity grows when effort and recovery work together.",
  },
  {
    word: "Resilience",
    meaning: "The ability to recover, adapt, and continue after difficulty.",
    practice: "After a setback, name what happened, what it taught you, and the next controllable action.",
    why: "Resilience is response, not invulnerability.",
  },
  {
    word: "Resourcefulness",
    meaning: "Finding workable paths with the time, tools, knowledge, and materials you actually have.",
    practice: "Before buying or outsourcing, ask what you could repair, learn, substitute, or build.",
    why: "Self-sufficiency begins with resourcefulness.",
  },
  {
    word: "Self-sufficiency",
    meaning: "Meeting more of your own needs through knowledge, skills, preparation, and responsible systems.",
    practice: "Pick one practical domain—food, money, home, health, or tools—and become more capable in it.",
    why: "Freedom grows when your capabilities grow.",
  },
  {
    word: "Temperance",
    meaning: "Using enough without letting excess run the system.",
    practice: "Notice where more has stopped producing better and start practicing enough.",
    why: "A life with no limits is not automatically a free life.",
  },
  {
    word: "Vitality",
    meaning: "The energy and capacity to participate fully in life.",
    practice: "Protect the basics that give you usable energy: movement, food, sleep, sunlight, and meaningful activity.",
    why: "Vitality is capacity you can feel.",
  },
  {
    word: "Vigilance",
    meaning: "Paying attention to what matters and acting early when something is drifting.",
    practice: "Check the small signal before it becomes the large problem.",
    why: "Prepared people notice.",
  },
  {
    word: "Evolution",
    meaning: "A deliberate process of becoming more capable through learning, practice, reflection, and change.",
    practice: "Ask what version of you your current habits are training.",
    why: "LIVV is about evolution with purpose.",
  },
  {
    word: "Mastery",
    meaning: "Deep competence built through repeated, deliberate practice.",
    practice: "Pick fewer skills and stay with them long enough to become genuinely useful.",
    why: "Depth creates leverage.",
  },
  {
    word: "Purpose",
    meaning: "A meaningful direction that gives your choices a reason.",
    practice: "Translate a vague ambition into one action you can take this week.",
    why: "Purpose becomes real when it changes behavior.",
  },
  {
    word: "Sustainability",
    meaning: "A way of living or building that can continue without constantly exhausting the person or system.",
    practice: "If your plan only works on your best day, redesign the plan.",
    why: "The best system is one you can actually keep.",
  },
  {
    word: "LIVV",
    meaning: "Longevity, Integrity, Vitality, and Vigilance.",
    practice: "Use the four pillars as a filter: does this help me last, align, function, and stay ready?",
    why: "The name is the philosophy in compact form.",
  },
];

export default function DictionaryPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const list = useMemo(
    () => WORDS.filter((x) => (x.word + " " + x.meaning + " " + x.practice).toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  const active = WORDS.find((x) => x.word === selected) || null;

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  return (
    <main className="livv-page min-h-full">
      <div className="mx-auto w-full max-w-xl px-5 pb-14 sm:px-6">
        <header className="pt-6 sm:pt-9">
          <Link
            href="/home/health"
            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted"
          >
            <ChevronLeft size={13} /> Health
          </Link>
          <div className="mt-7 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-livv-accent">
            <BookOpen size={13} /> LIVV Dictionary
          </div>
          <h1 className="mt-2 text-[40px] font-semibold leading-[.96] tracking-[-.06em] sm:text-[48px]">
            Learn the language.
          </h1>
          <p className="mt-4 max-w-[42ch] text-[13px] leading-6 text-livv-muted">
            A working vocabulary for capability, character, health, and evolution. Tap a word to go deeper.
          </p>
        </header>

        <div className="relative mt-9 rounded-2xl border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_3%,transparent)] px-3">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-livv-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the dictionary..."
            className="w-full bg-transparent py-3.5 pl-7 pr-2 text-[13px] outline-none placeholder:text-livv-muted"
            aria-label="Search dictionary"
          />
        </div>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.19em] text-livv-muted">Vocabulary</p>
              <h2 className="mt-1 text-[27px] font-semibold tracking-[-.045em]">Words that change how you act.</h2>
            </div>
            <span className="text-[10px] uppercase tracking-[.14em] text-livv-muted">{list.length} words</span>
          </div>
          <div className="mt-5 divide-y divide-livv-border border-y border-livv-border">
            {list.map((x, i) => (
              <button
                key={x.word}
                type="button"
                onClick={() => setSelected(x.word)}
                className="flex w-full items-start gap-4 py-5 text-left"
              >
                <span className="w-7 shrink-0 pt-1 text-[9px] font-semibold tabular-nums text-livv-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold">{x.word}</span>
                  <span className="mt-1.5 block text-[12px] leading-5 text-livv-muted">{x.meaning}</span>
                </span>
                <span className="pt-1 text-[11px] text-livv-muted">Open</span>
              </button>
            ))}
          </div>
          {!list.length && <p className="py-10 text-center text-[13px] text-livv-muted">No word matched that search.</p>}
        </section>

        <section className="mt-10 border-y border-livv-border py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">The foundation</p>
          <h2 className="mt-2 text-[24px] font-semibold tracking-[-.04em]">Longevity · Integrity · Vitality · Vigilance</h2>
          <p className="mt-3 text-[12px] leading-5 text-livv-muted">
            The dictionary exists to make the philosophy usable. A word matters when it gives you a clearer choice in real
            life.
          </p>
        </section>
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 px-0 sm:items-center sm:px-4"
          role="dialog"
          aria-modal="true"
          aria-label={active.word}
          onClick={() => setSelected(null)}
        >
          <div
            className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] border border-livv-border bg-[var(--livv-bg)] shadow-2xl sm:max-h-[88dvh] sm:rounded-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-livv-border px-5 pb-4 pt-5">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-accent">Definition</p>
                <h2 className="mt-2 text-[28px] font-semibold tracking-[-.04em] sm:text-[32px]">{active.word}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-border text-livv-muted"
                aria-label="Close definition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 pb-10 pt-6">
              <p className="text-[16px] leading-7">{active.meaning}</p>
              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">Put it into practice</p>
                  <p className="mt-2 text-[13px] leading-6">{active.practice}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">Why LIVV cares</p>
                  <p className="mt-2 text-[13px] leading-6 text-livv-muted">{active.why}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
