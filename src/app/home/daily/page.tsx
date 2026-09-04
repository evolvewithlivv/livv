"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AmbientField } from "@/components/layout/ambient-field";
import { feedback } from "@/lib/sensory";
import {
  claimDailyDrop,
  completeDailyTask,
  dailyDrop,
  dailyQuestion,
  dailySummary,
  dailyTasks,
  journalHistory,
  loadBuffs,
  loadDailyState,
  saveDailyJournal,
  type DailyDrop,
  type DailyJournalEntry,
} from "@/lib/daily";

export default function DailyPage() {
  const [now] = useState(() => new Date());
  const [completed, setCompleted] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [journal, setJournal] = useState<DailyJournalEntry[]>([]);
  const [claimed, setClaimed] = useState(false);
  const [lastDrop, setLastDrop] = useState<DailyDrop | null>(null);
  const [tickets, setTickets] = useState(0);
  const [doubleXp, setDoubleXp] = useState(false);

  const tasks = useMemo(() => dailyTasks(now), [now]);
  const question = useMemo(() => dailyQuestion(now), [now]);
  const summary = useMemo(() => dailySummary(now), [now]);
  const drop = useMemo(() => dailyDrop(now), [now]);
  const key = summary.season ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}` : "";

  const refresh = () => {
    const state = loadDailyState(now);
    setCompleted(state.completed);
    setJournal(state.journal);
    setClaimed(state.dropClaimed);
    const todayEntry = state.journal.find((item) => item.key === state.key);
    if (todayEntry) setAnswer(todayEntry.answer);
    const buffs = loadBuffs();
    setTickets(buffs.packTickets);
    setDoubleXp(Boolean(buffs.doubleXpUntil));
  };

  useEffect(() => {
    refresh();
    window.addEventListener("livv-daily", refresh);
    window.addEventListener("livv-record", refresh);
    window.addEventListener("livv-buffs", refresh);
    return () => {
      window.removeEventListener("livv-daily", refresh);
      window.removeEventListener("livv-record", refresh);
      window.removeEventListener("livv-buffs", refresh);
    };
  }, []);

  const doneCount = completed.length;
  const allDone = doneCount >= 3;
  const mindDone = completed.includes("mind");
  const hasAnswer = answer.trim().length > 0;

  const completeBodyOrLife = (id: "body" | "life") => {
    if (completed.includes(id)) return;
    feedback("tick");
    completeDailyTask(id, now);
    refresh();
  };

  const saveAnswer = () => {
    if (!answer.trim()) return;
    feedback("complete");
    saveDailyJournal(answer, now);
    refresh();
  };

  const claim = () => {
    if (!allDone || claimed) return;
    feedback("unlock");
    const result = claimDailyDrop(now);
    if (result.claimed) {
      setClaimed(true);
      setLastDrop(result.drop);
      refresh();
    }
  };

  const archive = journalHistory().slice(0, 6);

  return (
    <main className="relative min-h-full overflow-hidden bg-[#050505] pb-10 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[-15rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgb(var(--livv-accent) / 0.16), transparent 68%)" }}
        />
        <AmbientField intensity="strong" />
        <div className="livv-grain opacity-[0.045]" />
      </div>

      <div className="relative z-10 mx-auto max-w-xl px-5 pb-8 pt-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-livv-accent-soft">LIVV Daily</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/25">
              {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link
            href="/home"
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[9px] uppercase tracking-[0.18em] text-white/40"
          >
            Home
          </Link>
        </header>

        {/* World state hero */}
        <section className="relative mt-8 overflow-hidden rounded-[36px] border border-white/[0.09] bg-white/[0.025] p-6 shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-livv-accent/70 to-transparent" />
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-livv-accent/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-livv-accent-soft">
                  {summary.world.title}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/30">{summary.world.focus}</p>
                <h1 className="font-display mt-3 text-[36px] font-semibold leading-[0.95] tracking-[-0.04em]">
                  Three things. One truth. One Drop.
                </h1>
                <p className="mt-4 max-w-[34ch] text-[13px] leading-relaxed text-white/45">
                  {summary.world.line}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">Day</p>
                <p className="font-display mt-1 text-3xl font-semibold">{summary.season.dayInSeason}</p>
                <p className="text-[8px] uppercase tracking-[0.18em] text-white/20">of 28</p>
              </div>
            </div>
            <div className="mt-7 h-1 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-livv-accent transition-all"
                style={{
                  width: `${summary.season.progress}%`,
                  boxShadow: "0 0 18px rgb(var(--livv-accent) / 0.7)",
                }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-white/25">
              <span>
                {summary.season.name} · {summary.season.chapterName}
              </span>
              <span>{summary.season.remaining} days remain</span>
            </div>
            {(doubleXp || tickets > 0) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {doubleXp && (
                  <span className="rounded-full bg-livv-accent/15 px-3 py-1 text-[10px] text-livv-accent-soft">
                    2× XP active
                  </span>
                )}
                {tickets > 0 && (
                  <Link
                    href="/home/packs"
                    className="rounded-full bg-white/10 px-3 py-1 text-[10px] text-white/60"
                  >
                    {tickets} pack ticket{tickets === 1 ? "" : "s"} →
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-2">
          <Metric value={`${doneCount}/3`} label="Daily" />
          <Metric value={`Ch ${summary.season.chapter}`} label={summary.season.chapterName} />
          <Metric value={claimed ? "Open" : allDone ? "Ready" : "Locked"} label="Drop" />
        </section>

        {/* Tasks */}
        <section className="mt-8">
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/25">01 — The run</p>
          <p className="mt-1 text-[14px] font-medium text-white/70">Three things before midnight.</p>
          <div className="mt-4 space-y-3">
            {tasks.map((task, index) => {
              const done = completed.includes(task.id);
              const isMind = task.id === "mind";
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => {
                    if (done) return;
                    if (isMind) {
                      document.getElementById("daily-question")?.scrollIntoView({ behavior: "smooth" });
                      return;
                    }
                    completeBodyOrLife(task.id as "body" | "life");
                  }}
                  className={`group relative w-full overflow-hidden rounded-[28px] border p-5 text-left transition active:scale-[0.99] ${
                    done
                      ? "border-livv-accent/25 bg-livv-accent/[0.07]"
                      : "border-white/[0.08] bg-white/[0.025]"
                  }`}
                >
                  <div className="relative flex items-start gap-4">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-[12px] font-semibold ${
                        done
                          ? "border-livv-accent/30 bg-livv-accent/15 text-livv-accent"
                          : "border-white/10 bg-white/[0.035] text-white/25"
                      }`}
                    >
                      {done ? "✓" : `0${index + 1}`}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-livv-accent-soft">
                        {task.label}
                      </span>
                      <span
                        className={`font-display mt-1 block text-[20px] font-semibold tracking-tight ${
                          done ? "text-white/50 line-through decoration-white/20" : "text-white"
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="mt-2 block text-[12px] leading-relaxed text-white/35">
                        {task.description}
                        {isMind && !done ? " · Answer below to complete." : ""}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Question */}
        <section
          id="daily-question"
          className="mt-8 rounded-[30px] border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-xl"
        >
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/25">02 — The question</p>
          <p className="mt-1 text-[14px] font-medium text-white/70">Saved to your Evolution Journal.</p>
          <p className="font-display mt-5 text-[22px] font-medium leading-tight tracking-tight text-white/85">
            {question}
          </p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write the honest answer. Nobody else needs to see it."
            className="mt-4 min-h-32 w-full resize-none rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-[13px] leading-relaxed text-white outline-none placeholder:text-white/20 focus:border-livv-accent/30"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[9px] uppercase tracking-[0.18em] text-white/20">
              {mindDone ? "Mind complete" : "Private journal"}
            </span>
            <button
              type="button"
              onClick={saveAnswer}
              disabled={!hasAnswer}
              className="rounded-full bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black disabled:opacity-30"
            >
              {mindDone ? "Update" : "Save · complete Mind"}
            </button>
          </div>
        </section>

        {/* 30-day callback */}
        {summary.callback && (
          <section className="mt-5 rounded-[30px] border border-livv-accent/15 bg-livv-accent/[0.045] p-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-livv-accent-soft">
              30 days ago
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-white/25">You wrote:</p>
            <p className="font-display mt-2 text-[18px] leading-snug text-white/80">
              “{summary.callback.answer}”
            </p>
            <p className="mt-3 text-[12px] text-white/35">Did you change? Same person. Different evidence.</p>
          </section>
        )}

        {/* Drop */}
        <section className="mt-8 overflow-hidden rounded-[34px] border border-white/[0.09] bg-white/[0.025] p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-livv-accent-soft">
                03 — Daily Drop
              </p>
              <h2 className="font-display mt-3 text-[28px] font-semibold tracking-[-0.03em]">
                {allDone || claimed ? drop.name : "Sealed until complete"}
              </h2>
              <p className="mt-2 max-w-[30ch] text-[12px] leading-relaxed text-white/35">
                {allDone || claimed
                  ? drop.description
                  : "Finish Mind, Body, and Life to open today’s Drop."}
              </p>
              {(allDone || claimed) && (
                <p className="mt-3 text-[11px] text-white/40">
                  {drop.embers > 0 ? `+${drop.embers} Embers` : ""}
                  {drop.embers > 0 && drop.xp > 0 ? " · " : ""}
                  {drop.xp > 0 ? `+XP` : ""}
                  {drop.kind !== "embers" ? ` · ${drop.kind.replace(/_/g, " ")}` : ""}
                </p>
              )}
            </div>
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border text-2xl ${
                allDone || claimed
                  ? "border-livv-accent/35 bg-livv-accent/10 text-livv-accent"
                  : "border-white/10 bg-black/20 text-white/20"
              }`}
            >
              {allDone || claimed ? drop.icon : "?"}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-5">
            <div>
              <p className="text-[11px] text-white/35">
                {claimed ? "Claimed today" : allDone ? "Ready to open" : `${3 - doneCount} left`}
              </p>
            </div>
            <button
              type="button"
              onClick={claim}
              disabled={!allDone || claimed}
              className="rounded-full bg-white px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black disabled:bg-white/[0.08] disabled:text-white/20"
            >
              {claimed ? "Claimed" : allDone ? "Open Drop" : "Locked"}
            </button>
          </div>
          {lastDrop && claimed && (
            <p className="mt-4 text-[12px] text-livv-accent-soft">
              Unlocked: {lastDrop.name}. {lastDrop.description}
            </p>
          )}
        </section>

        {archive.length > 0 && (
          <section className="mt-8">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/25">The archive</p>
            <p className="mt-1 text-[14px] font-medium text-white/70">Proof you were here.</p>
            <div className="mt-4 space-y-2">
              {archive.map((entry) => (
                <div key={entry.key} className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/20">{entry.key}</p>
                  <p className="mt-1 text-[11px] text-white/30">{entry.question}</p>
                  <p className="mt-2 text-[12px] leading-relaxed text-white/50">{entry.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="mt-10 text-center text-[9px] uppercase tracking-[0.28em] text-white/15">
          Come back tomorrow. The world changes.
        </p>
      </div>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.02] p-4 text-center">
      <p className="font-display text-xl font-semibold">{value}</p>
      <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-white/20">{label}</p>
    </div>
  );
}
