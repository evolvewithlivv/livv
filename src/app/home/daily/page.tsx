"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AmbientField } from "@/components/layout/ambient-field";
import { ArrowRight, Check, Flame, LockKeyhole, Sparkles } from "lucide-react";
import { feedback } from "@/lib/sensory";
import {
  claimDailyDrop,
  completeDailyTask,
  dailyDrop,
  dailyQuestion,
  dailyTasks,
  loadDailyState,
  saveDailyJournal,
  seasonState,
  worldState,
  type DailyJournalEntry,
} from "@/lib/daily";

export default function DailyPage() {
  const [now] = useState(() => new Date());
  const [completed, setCompleted] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [journal, setJournal] = useState<DailyJournalEntry[]>([]);
  const [claimed, setClaimed] = useState(false);
  const [dropMessage, setDropMessage] = useState("");

  const tasks = useMemo(() => dailyTasks(now), [now]);
  const question = useMemo(() => dailyQuestion(now), [now]);
  const season = useMemo(() => seasonState(now), [now]);
  const world = useMemo(() => worldState(now), [now]);
  const drop = useMemo(() => dailyDrop(now), [now]);
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const doneCount = completed.length;
  const allDone = doneCount === tasks.length;

  const refresh = () => {
    const state = loadDailyState(now);
    setCompleted(state.completed);
    setJournal(state.journal);
    setClaimed(state.dropClaimed);
    const todayEntry = state.journal.find((item) => item.key === key);
    if (todayEntry) setAnswer(todayEntry.answer);
  };

  useEffect(() => {
    refresh();
    window.addEventListener("livv-daily", refresh);
    window.addEventListener("livv-record", refresh);
    return () => {
      window.removeEventListener("livv-daily", refresh);
      window.removeEventListener("livv-record", refresh);
    };
  }, []);

  const callback = useMemo(() => {
    const target = new Date(now);
    target.setDate(target.getDate() - 30);
    const targetKey = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;
    return journal.find((entry) => entry.key === targetKey) || null;
  }, [journal, now]);

  const complete = (id: "mind" | "body" | "life") => {
    feedback("tick");
    const state = completeDailyTask(id, now);
    setCompleted(state.completed);
  };

  const saveAnswer = () => {
    if (!answer.trim()) return;
    feedback("complete");
    saveDailyJournal(answer, now);
    const state = completeDailyTask("mind", now);
    setCompleted(state.completed);
    setJournal(state.journal);
  };

  const claim = () => {
    if (!allDone || claimed) return;
    feedback("unlock");
    const result = claimDailyDrop(now);
    if (result.claimed) {
      setClaimed(true);
      setDropMessage(`+${result.drop.amount} EMBERS added to your run.`);
    }
  };

  return (
    <main className="relative min-h-full overflow-hidden bg-[#050505] pb-10 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-15rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-livv-accent/10 blur-3xl" />
        <AmbientField intensity="strong" />
        <div className="livv-grain opacity-[0.045]" />
      </div>

      <div className="relative z-10 mx-auto max-w-xl px-5 pb-8 pt-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-livv-accent-soft">LIVV DAILY</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/25">{now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          <Link href="/home" className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[9px] uppercase tracking-[0.18em] text-white/40 backdrop-blur-xl">Exit</Link>
        </header>

        <section className="relative mt-8 overflow-hidden rounded-[36px] border border-white/[0.09] bg-white/[0.025] p-6 shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-livv-accent/70 to-transparent" />
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-livv-accent/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-livv-accent-soft">{world[0]}</p>
                <h1 className="font-display mt-3 text-[42px] font-semibold leading-[0.9] tracking-[-0.055em]">Your day has a mission.</h1>
                <p className="mt-4 max-w-[34ch] text-[13px] leading-relaxed text-white/45">{world[1]} Three actions. One reflection. Finish the run and open today&apos;s Drop.</p>
              </div>
              <div className="shrink-0 text-right"><p className="text-[9px] uppercase tracking-[0.2em] text-white/25">DAY</p><p className="font-display mt-1 text-3xl font-semibold">{season.dayInSeason}</p><p className="text-[8px] uppercase tracking-[0.18em] text-white/20">OF 28</p></div>
            </div>
            <div className="mt-7 h-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-livv-accent shadow-[0_0_18px_rgb(var(--livv-accent)/0.7)] transition-all" style={{ width: `${season.progress}%` }} /></div>
            <div className="mt-3 flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-white/25"><span>{season.name} · {season.chapterName}</span><span>{season.remaining} days remain</span></div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-2">
          <Metric value={`${doneCount}/${tasks.length}`} label="Daily" />
          <Metric value={`CH ${season.chapter}`} label={season.chapterName} />
          <Metric value={claimed ? "OPEN" : allDone ? "READY" : "LOCKED"} label="Drop" />
        </section>

        <section className="mt-8">
          <SectionLabel eyebrow="01 — THE RUN" title="Three things before midnight." />
          <div className="mt-4 space-y-3">
            {tasks.map((task, index) => {
              const done = completed.includes(task.id);
              return <button key={task.id} type="button" onClick={() => !done && complete(task.id)} className={`group relative w-full overflow-hidden rounded-[28px] border p-5 text-left transition active:scale-[0.99] ${done ? "border-livv-accent/25 bg-livv-accent/[0.07]" : "border-white/[0.08] bg-white/[0.025]"}`}>
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-livv-accent/10 blur-3xl opacity-0 transition group-hover:opacity-100" />
                <div className="relative flex items-start gap-4">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${done ? "border-livv-accent/30 bg-livv-accent/15" : "border-white/10 bg-white/[0.035]"}`}>{done ? <Check size={18} /> : <span className="text-[10px] font-semibold text-white/25">0{index + 1}</span>}</span>
                  <span className="min-w-0 flex-1"><span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-livv-accent-soft">{task.label}</span><span className={`font-display mt-1 block text-[21px] font-semibold tracking-tight ${done ? "text-white/70 line-through decoration-white/20" : "text-white"}`}>{task.title}</span><span className="mt-2 block text-[12px] leading-relaxed text-white/35">{task.description}</span></span>
                  <ArrowRight size={17} className={`mt-1 shrink-0 text-white/20 transition ${done ? "rotate-90 text-livv-accent" : "group-hover:translate-x-1"}`} />
                </div>
              </button>;
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[30px] border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-xl">
          <SectionLabel eyebrow="02 — THE QUESTION" title="Talk to yourself without performing." />
          <p className="font-display mt-5 text-[22px] font-medium leading-tight tracking-tight text-white/85">{question}</p>
          <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Write the honest answer. Nobody else needs to see it." className="mt-4 min-h-32 w-full resize-none rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-[13px] leading-relaxed text-white outline-none placeholder:text-white/20 focus:border-livv-accent/30" />
          <div className="mt-3 flex items-center justify-between gap-3"><span className="text-[9px] uppercase tracking-[0.18em] text-white/20">Private evolution journal</span><button type="button" onClick={saveAnswer} disabled={!answer.trim()} className="rounded-full bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black disabled:opacity-30">Save reflection</button></div>
        </section>

        {callback && <section className="mt-5 rounded-[30px] border border-livv-accent/15 bg-livv-accent/[0.045] p-5"><div className="flex items-center gap-2 text-livv-accent-soft"><Sparkles size={14} /><span className="text-[9px] font-semibold uppercase tracking-[0.24em]">30-day callback</span></div><p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-white/25">You wrote this 30 days ago:</p><p className="font-display mt-2 text-[18px] leading-snug text-white/75">“{callback.answer}”</p><p className="mt-3 text-[11px] text-white/30">Same person. Different evidence. Keep going.</p></section>}

        <section className="mt-8 overflow-hidden rounded-[34px] border border-white/[0.09] bg-white/[0.025] p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-5"><div><div className="flex items-center gap-2"><Flame size={14} className="text-livv-accent" /><p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-livv-accent-soft">03 — DAILY DROP</p></div><h2 className="font-display mt-3 text-[30px] font-semibold tracking-[-0.04em]">{drop.name}</h2><p className="mt-2 max-w-[30ch] text-[12px] leading-relaxed text-white/35">{drop.description}</p></div><div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border ${allDone ? "border-livv-accent/35 bg-livv-accent/10" : "border-white/10 bg-black/20"}`}>{allDone || claimed ? <span className="font-display text-2xl text-livv-accent">{drop.icon}</span> : <LockKeyhole size={19} className="text-white/20" />}</div></div>
          <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-5"><div><p className="font-display text-2xl font-semibold">+{drop.amount}</p><p className="text-[8px] uppercase tracking-[0.2em] text-white/20">Embers</p></div><button type="button" onClick={claim} disabled={!allDone || claimed} className="rounded-full bg-white px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black disabled:bg-white/[0.08] disabled:text-white/20">{claimed ? "Claimed" : allDone ? "Open Drop" : `${tasks.length - doneCount} left`}</button></div>
          {dropMessage && <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-livv-accent-soft">{dropMessage}</p>}
        </section>

        {journal.length > 0 && <section className="mt-8"><SectionLabel eyebrow="THE ARCHIVE" title="Proof you were here." /><div className="mt-4 space-y-2">{journal.slice(0, 5).map((entry) => <div key={entry.key} className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4"><p className="text-[9px] uppercase tracking-[0.2em] text-white/20">{entry.key}</p><p className="mt-2 text-[12px] leading-relaxed text-white/45">{entry.answer}</p></div>)}</div></section>}

        <p className="mt-10 text-center text-[9px] uppercase tracking-[0.28em] text-white/15">Come back tomorrow. The world changes.</p>
      </div>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.02] p-4 text-center"><p className="font-display text-xl font-semibold">{value}</p><p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-white/20">{label}</p></div>;
}

function SectionLabel({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/25">{eyebrow}</p><p className="mt-1 text-[14px] font-medium text-white/70">{title}</p></div>;
}
