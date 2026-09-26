"use client";

import { useEffect, useMemo, useState } from "react";
import { feedback } from "@/lib/sensory";
import { PageHero } from "@/components/layout/page-hero";
import {
  completeDailyTask,
  dailyQuestion,
  dailySummary,
  dailyTasks,
  journalHistory,
  loadBuffs,
  loadDailyState,
  saveDailyJournal,
  type DailyJournalEntry,
} from "@/lib/daily";

const TRACKER_KEY = "livv-daily-trackers-v1";

type Trackers = { water: number; meals: number; movement: boolean; reset: boolean };

const DEFAULT_TRACKERS: Trackers = { water: 0, meals: 0, movement: false, reset: false };

export default function DailyPage() {
  const [now] = useState(() => new Date());
  const [completed, setCompleted] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [journal, setJournal] = useState<DailyJournalEntry[]>([]);
  const [doubleXp, setDoubleXp] = useState(false);
  const [trackers, setTrackers] = useState<Trackers>(DEFAULT_TRACKERS);

  const tasks = useMemo(() => dailyTasks(now), [now]);
  const question = useMemo(() => dailyQuestion(now), [now]);
  const summary = useMemo(() => dailySummary(now), [now]);

  const refresh = () => {
    const state = loadDailyState(now);
    setCompleted(state.completed);
    setJournal(state.journal);
    const today = state.journal.find((item) => item.key === state.key);
    if (today) setAnswer(today.answer);
    setDoubleXp(Boolean(loadBuffs().doubleXpUntil));
  };

  useEffect(() => {
    refresh();
    try {
      const raw = window.localStorage.getItem(TRACKER_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Trackers>;
        setTrackers({ ...DEFAULT_TRACKERS, ...saved });
      }
    } catch {}
    for (const event of ["livv-daily", "livv-record", "livv-buffs"])
      window.addEventListener(event, refresh);
    return () => {
      for (const event of ["livv-daily", "livv-record", "livv-buffs"])
        window.removeEventListener(event, refresh);
    };
  }, []);

  const saveTrackers = (next: Trackers) => {
    setTrackers(next);
    try {
      window.localStorage.setItem(TRACKER_KEY, JSON.stringify(next));
    } catch {}
  };

  const doneCount = completed.length;
  const archive = journalHistory().slice(0, 8);

  const saveAnswer = () => {
    if (!answer.trim()) return;
    feedback("complete");
    saveDailyJournal(answer, now);
    refresh();
  };

  const complete = (id: "body" | "life") => {
    if (completed.includes(id)) return;
    feedback("tick");
    completeDailyTask(id, now);
    refresh();
  };

  const toggle = (key: "movement" | "reset") => {
    const next = { ...trackers, [key]: !trackers[key] };
    saveTrackers(next);
    feedback("tick");
  };

  const step = (key: "water" | "meals", max: number) => {
    const next = { ...trackers, [key]: Math.min(max, trackers[key] + 1) };
    saveTrackers(next);
    feedback("tick");
  };

  return (
    <main className="livv-page min-h-full pb-20">
      <div className="mx-auto max-w-xl px-5 pt-5 pb-8">
        <PageHero
          eyebrow="Daily"
          title="Daily."
          subtitle={
            <>
              {now.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
              · Three actions. Your schedule.
            </>
          }
        />

        {/* Actions progress — distinct from Home life areas & Health baseline */}
        <section className="mt-8 rounded-[22px] border border-[var(--livv-pro-line)] bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)] px-5 py-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[var(--livv-pro-accent)]">
                Today&apos;s actions
              </p>
              <p className="mt-1.5 text-[28px] font-semibold tracking-tight">
                {doneCount} of 3 complete
              </p>
              <p className="mt-1 text-[11px] text-[var(--livv-pro-muted)]">
                Body · Life · Mind — the Daily challenge
              </p>
            </div>
            {doubleXp && (
              <span className="rounded-full border border-[var(--livv-pro-line)] bg-[var(--livv-pro-accent-soft)] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.15em] text-[var(--livv-pro-accent)]">
                2× XP active
              </span>
            )}
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--livv-pro-surface-2)]">
            <div
              className="h-full rounded-full bg-[var(--livv-pro-accent)] transition-all"
              style={{ width: `${Math.min(100, (doneCount / 3) * 100)}%` }}
            />
          </div>
        </section>

        <section className="mt-12">
          <SectionHead
            label="Quick trackers"
            title="Keep tabs on the basics."
            sub="Not tied to a clock. Check in whenever it fits."
          />
          <div className="mt-5 overflow-hidden rounded-[22px] border border-[var(--livv-pro-line)]">
            <TrackerRow
              label="Water"
              value={`${trackers.water} / 8`}
              detail="glasses"
              action={trackers.water >= 8 ? "Complete" : "+ 1 glass"}
              done={trackers.water >= 8}
              onClick={() => step("water", 8)}
              last={false}
            />
            <TrackerRow
              label="Meals"
              value={`${trackers.meals} / 3`}
              detail="logged"
              action={trackers.meals >= 3 ? "Complete" : "+ 1 meal"}
              done={trackers.meals >= 3}
              onClick={() => step("meals", 3)}
              last={false}
            />
            <TrackerRow
              label="Movement"
              value={trackers.movement ? "Done" : "Open"}
              detail="move your body"
              action={trackers.movement ? "Complete" : "Mark done"}
              done={trackers.movement}
              onClick={() => toggle("movement")}
              last={false}
            />
            <TrackerRow
              label="Reset"
              value={trackers.reset ? "Done" : "Open"}
              detail="tidy, plan, or reset your space"
              action={trackers.reset ? "Complete" : "Mark done"}
              done={trackers.reset}
              onClick={() => toggle("reset")}
              last
            />
          </div>
        </section>

        <section className="mt-12">
          <SectionHead
            label="Act"
            title="Three things worth doing."
            sub="The core Daily challenge. Do it on your schedule."
          />
          <div className="mt-5 overflow-hidden rounded-[22px] border border-[var(--livv-pro-line)]">
            {tasks.map((task, index) => {
              const done = completed.includes(task.id);
              const isMind = task.id === "mind";
              const last = index === tasks.length - 1;
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => {
                    if (done) return;
                    if (isMind)
                      document.getElementById("daily-question")?.scrollIntoView({
                        behavior: "smooth",
                      });
                    else complete(task.id as "body" | "life");
                  }}
                  className={
                    "group flex w-full items-start gap-4 px-4 py-5 text-left " +
                    (last ? "" : "border-b border-[var(--livv-pro-line)]")
                  }
                >
                  <span
                    className={
                      "grid h-10 w-10 shrink-0 place-items-center rounded-full border text-[10px] font-bold " +
                      (done
                        ? "border-[var(--livv-pro-accent)] bg-[var(--livv-pro-accent-soft)] text-[var(--livv-pro-accent)]"
                        : "border-[var(--livv-pro-line)] text-[var(--livv-pro-muted)]")
                    }
                  >
                    {done ? "✓" : String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[9px] font-semibold uppercase tracking-[.18em] text-[var(--livv-pro-muted)]">
                      {task.label}
                    </span>
                    <span
                      className={
                        "mt-1.5 block text-[18px] font-semibold " +
                        (done
                          ? "text-[var(--livv-pro-muted)] line-through"
                          : "text-[var(--livv-pro-ink)]")
                      }
                    >
                      {task.title}
                    </span>
                    <span className="mt-1.5 block text-[12px] leading-relaxed text-[var(--livv-pro-muted)]">
                      {task.description}
                      {isMind && !done ? " Write your answer below to finish this step." : ""}
                    </span>
                  </span>
                  <span className="pt-2 text-[var(--livv-pro-muted)] transition group-hover:translate-x-1">
                    →
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="daily-question" className="mt-12">
          <SectionHead label="Reflect" title="One honest question." />
          <p className="mt-5 max-w-[34ch] text-[18px] font-medium leading-snug">{question}</p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your answer here. It stays in your LIVV journal."
            aria-label="Daily reflection"
            className="mt-5 min-h-36 w-full resize-none rounded-2xl border border-[var(--livv-pro-line)] bg-[var(--livv-pro-surface-2)] p-4 text-[13px] leading-relaxed text-[var(--livv-pro-ink)] outline-none placeholder:text-[var(--livv-pro-muted)] focus:border-[var(--livv-pro-accent)]"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[10px] uppercase tracking-[.16em] text-[var(--livv-pro-muted)]">
              Private journal
            </span>
            <button
              type="button"
              onClick={saveAnswer}
              disabled={!answer.trim()}
              className="rounded-full bg-[var(--livv-pro-ink)] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[.14em] text-[var(--livv-pro-bg)] disabled:opacity-30"
            >
              {completed.includes("mind") ? "Save changes" : "Save and complete"}
            </button>
          </div>
        </section>

        {summary.callback && (
          <section className="mt-12">
            <p className="text-[10px] uppercase tracking-[.2em] text-[var(--livv-pro-muted)]">
              A month ago
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-[.14em] text-[var(--livv-pro-muted)]">
              You wrote
            </p>
            <p className="mt-2 text-[18px] leading-snug">“{summary.callback.answer}”</p>
            <p className="mt-3 text-[12px] text-[var(--livv-pro-muted)]">
              Look at the evidence, not the story you tell yourself.
            </p>
          </section>
        )}

        <section className="mt-12 pb-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[var(--livv-pro-muted)]">
                Archive
              </p>
              <h2 className="mt-1.5 text-[26px] font-semibold tracking-tight">Your days live here.</h2>
            </div>
            <span className="text-[10px] text-[var(--livv-pro-muted)]">{archive.length} recent</span>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-[var(--livv-pro-muted)]">
            Past answers are evidence you can return to.
          </p>
          <div className="mt-5 overflow-hidden rounded-[22px] border border-[var(--livv-pro-line)]">
            {archive.map((entry, index) => (
              <div
                key={entry.key}
                className={
                  "px-4 py-4 " +
                  (index < archive.length - 1 ? "border-b border-[var(--livv-pro-line)]" : "")
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9px] font-semibold uppercase tracking-[.16em] text-[var(--livv-pro-muted)]">
                    Entry {archive.length - index}
                  </span>
                  <span className="text-[10px] text-[var(--livv-pro-muted)]">{entry.key}</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--livv-pro-muted)]">
                  {entry.answer}
                </p>
              </div>
            ))}
            {!archive.length && (
              <p className="px-4 py-8 text-center text-[13px] text-[var(--livv-pro-muted)]">
                No journal entries yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionHead({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[var(--livv-pro-muted)]">
        {label}
      </p>
      <h2 className="mt-1.5 text-[26px] font-semibold tracking-tight">{title}</h2>
      {sub && <p className="mt-1.5 text-[12px] text-[var(--livv-pro-muted)]">{sub}</p>}
    </div>
  );
}

function TrackerRow({
  label,
  value,
  detail,
  action,
  done,
  onClick,
  last,
}: {
  label: string;
  value: string;
  detail: string;
  action: string;
  done: boolean;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex w-full items-center gap-4 px-4 py-4 text-left " +
        (last ? "" : "border-b border-[var(--livv-pro-line)]")
      }
    >
      <span
        className={
          "grid h-9 w-9 shrink-0 place-items-center rounded-full border text-[11px] font-semibold " +
          (done
            ? "border-[var(--livv-pro-accent)] bg-[var(--livv-pro-accent-soft)] text-[var(--livv-pro-accent)]"
            : "border-[var(--livv-pro-line)] text-[var(--livv-pro-muted)]")
        }
      >
        {done ? "✓" : "+"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold">{label}</span>
        <span className="mt-0.5 block text-[10px] text-[var(--livv-pro-muted)]">
          {value} · {detail}
        </span>
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--livv-pro-muted)]">
        {action}
      </span>
    </button>
  );
}
