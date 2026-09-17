"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { feedback } from "@/lib/sensory";
import { claimDailyDrop, completeDailyTask, dailyDrop, dailyQuestion, dailySummary, dailyTasks, journalHistory, loadBuffs, loadDailyState, saveDailyJournal, type DailyDrop, type DailyJournalEntry } from "@/lib/daily";

export default function DailyPage() {
  const [now] = useState(() => new Date());
  const [completed, setCompleted] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [journal, setJournal] = useState<DailyJournalEntry[]>([]);
  const [claimed, setClaimed] = useState(false);
  const [lastDrop, setLastDrop] = useState<DailyDrop | null>(null);
  const [doubleXp, setDoubleXp] = useState(false);
  const tasks = useMemo(() => dailyTasks(now), [now]);
  const question = useMemo(() => dailyQuestion(now), [now]);
  const summary = useMemo(() => dailySummary(now), [now]);
  const drop = useMemo(() => dailyDrop(now), [now]);

  const refresh = () => {
    const state = loadDailyState(now);
    setCompleted(state.completed);
    setJournal(state.journal);
    setClaimed(state.dropClaimed);
    const today = state.journal.find((item) => item.key === state.key);
    if (today) setAnswer(today.answer);
    setDoubleXp(Boolean(loadBuffs().doubleXpUntil));
  };

  useEffect(() => {
    refresh();
    for (const event of ["livv-daily", "livv-record", "livv-buffs"]) window.addEventListener(event, refresh);
    return () => { for (const event of ["livv-daily", "livv-record", "livv-buffs"]) window.removeEventListener(event, refresh); };
  }, []);

  const doneCount = completed.length;
  const allDone = doneCount >= 3;
  const archive = journalHistory().slice(0, 8);

  const saveAnswer = () => { if (!answer.trim()) return; feedback("complete"); saveDailyJournal(answer, now); refresh(); };
  const complete = (id: "body" | "life") => { if (completed.includes(id)) return; feedback("tick"); completeDailyTask(id, now); refresh(); };
  const claim = () => { if (!allDone || claimed) return; feedback("unlock"); const result = claimDailyDrop(now); if (result.claimed) { setLastDrop(result.drop); setClaimed(true); refresh(); } };

  return (
    <main className="livv-page relative min-h-full overflow-hidden pb-16 text-white">
      <div className="relative z-10 mx-auto max-w-xl px-5 pt-5">
        <PageHero eyebrow="Daily" title={<span className="whitespace-nowrap text-[clamp(1.65rem,7vw,2rem)]">{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>} subtitle="A simple operating rhythm: decide, act, reflect, close." accent="#FCF927" />

        <section className="mt-5 border-b border-white/[0.08] pb-5">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FCF927]">Today</p><p className="font-display mt-1 text-[27px] font-semibold">{doneCount} of 3 complete</p></div>
            {doubleXp && <span className="rounded-full border border-[#FCF927]/25 bg-[#FCF927]/[0.06] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#FCF927]">2× XP active</span>}
          </div>
          <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.08] border-y border-white/[0.08] py-3">
            <Rhythm label="Morning" text="Choose the one thing that matters." />
            <Rhythm label="Day" text="Finish the three small actions." />
            <Rhythm label="Night" text="Write the honest answer and close." />
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-4"><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0F7FFF]">01 · Act</p><h2 className="font-display mt-1 text-[26px] font-semibold">Three things before midnight.</h2><p className="mt-1 text-[12px] text-white/55">Small actions. Clear proof. No complicated system.</p></div>
          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {tasks.map((task, index) => {
              const done = completed.includes(task.id);
              const isMind = task.id === "mind";
              return <button key={task.id} type="button" onClick={() => { if (done) return; if (isMind) document.getElementById("daily-question")?.scrollIntoView({ behavior: "smooth" }); else complete(task.id as "body" | "life"); }} className="group flex w-full items-start gap-4 py-5 text-left">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${done ? "border-[#0F7FFF]/35 bg-[#0F7FFF]/[0.06] text-[#0F7FFF]" : "border-white/10 text-white/45"}`}>{done ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1"><span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#0F7FFF]">{task.label}</span><span className={`font-display mt-1.5 block text-[18px] font-semibold ${done ? "text-white/50 line-through" : "text-white"}`}>{task.title}</span><span className="mt-1.5 block text-[12px] leading-relaxed text-white/55">{task.description}{isMind && !done ? " Write your answer below to finish this step." : ""}</span></span>
                <span className="pt-2 text-white/25 transition group-hover:translate-x-0.5">→</span>
              </button>;
            })}
          </div>
        </section>

        <section id="daily-question" className="mt-8 border-y border-white/[0.08] py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0F7FFF]">02 · Reflect</p><h2 className="font-display mt-1 text-[24px] font-semibold">One honest question.</h2><p className="mt-4 max-w-[34ch] text-[17px] font-medium leading-snug text-white/90">{question}</p>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write your answer here. It stays in your LIVV journal." aria-label="Daily reflection" className="mt-4 min-h-36 w-full resize-none rounded-xl border border-white/10 bg-white/[0.025] p-4 text-[13px] leading-relaxed text-white outline-none placeholder:text-white/30 focus:border-[#0F7FFF]/45" />
          <div className="mt-3 flex items-center justify-between gap-3"><span className="text-[10px] uppercase tracking-[0.16em] text-white/45">Private journal</span><button type="button" onClick={saveAnswer} disabled={!answer.trim()} className="rounded-full bg-white px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-black disabled:opacity-30">{completed.includes("mind") ? "Save changes" : "Save and complete"}</button></div>
        </section>

        <section className="mt-8 border-b border-white/[0.08] pb-6">
          <div className="flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FCF927]">03 · Earn</p><h2 className="font-display mt-1 text-[25px] font-semibold">Daily Drop</h2></div><span className="text-[10px] uppercase tracking-[0.16em] text-white/40">{claimed ? "Claimed" : allDone ? "Ready" : `${3 - doneCount} left`}</span></div>
          <div className="mt-5 flex items-center gap-4"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.025] text-xl text-[#FCF927]">{allDone || claimed ? drop.icon : "?"}</div><div className="min-w-0 flex-1"><p className="text-[16px] font-semibold">{allDone || claimed ? drop.name : "Locked"}</p><p className="mt-1 text-[11px] leading-relaxed text-white/55">{allDone || claimed ? drop.description : "Complete all three actions first."}</p></div></div>
          <button type="button" onClick={claim} disabled={!allDone || claimed} className="mt-5 w-full rounded-full bg-white py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-black disabled:bg-white/10 disabled:text-white/35">{claimed ? "Claimed" : allDone ? "Open Drop" : "Locked"}</button>
          {lastDrop && claimed && <p className="mt-3 text-[11px] font-medium text-[#FCF927]">Unlocked: {lastDrop.name}. Your reward has been added.</p>}
        </section>

        {summary.callback && <section className="mt-7 border-b border-white/[0.08] pb-6"><p className="text-[10px] uppercase tracking-[0.2em] text-white/45">A month ago</p><p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-white/40">You wrote</p><p className="mt-2 font-display text-[18px] leading-snug text-white/85">“{summary.callback.answer}”</p><p className="mt-3 text-[12px] text-white/55">Look at the evidence, not the story you tell yourself.</p></section>}

        <section className="mt-8 pb-8"><div className="flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0F7FFF]">Archive</p><h2 className="font-display mt-1 text-[26px] font-semibold">Your days live here.</h2></div><span className="text-[10px] text-white/40">{archive.length} recent</span></div><p className="mt-2 text-[12px] leading-relaxed text-white/55">Past answers are evidence you can return to.</p><div className="mt-4 divide-y divide-white/[0.08] border-y border-white/[0.08]">{archive.map((entry, index) => <div key={entry.key} className="py-4"><div className="flex items-center justify-between gap-3"><span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#0F7FFF]">Entry {archive.length - index}</span><span className="text-[10px] text-white/35">{entry.key}</span></div><p className="mt-2 text-[13px] leading-relaxed text-white/65">{entry.answer}</p></div>)}</div></section>
      </div>
    </main>
  );
}

function Rhythm({ label, text }: { label: string; text: string }) {
  return <div className="px-3 first:pl-0 last:pr-0"><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#FCF927]">{label}</p><p className="mt-1.5 text-[10px] leading-relaxed text-white/55">{text}</p></div>;
}
