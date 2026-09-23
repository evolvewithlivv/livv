"use client";

import { useEffect, useMemo, useState } from "react";
import { livePillars, loadRecord, weekBars, weekHitCount, type LivvRecord } from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { buildProgressInsights } from "@/lib/progress-insights";

export default function ProgressPage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);

  useEffect(() => {
    const sync = () => setRec(loadRecord());
    sync();
    for (const e of ["livv-record", "livv-daily", "livv-identity"]) window.addEventListener(e, sync);
    return () => { for (const e of ["livv-record", "livv-daily", "livv-identity"]) window.removeEventListener(e, sync); };
  }, []);

  const insights = useMemo(() => rec ? buildProgressInsights(rec, 14) : null, [rec]);
  if (!rec || !insights) return <main className="min-h-dvh" />;

  const week = weekBars(rec);
  const pillars = livePillars(rec);
  const evo = evolutionTitle(rec.level);
  const pct = Math.min(100, Math.round(rec.currentXp / Math.max(1, rec.xpToNext) * 100));

  return (
    <main className="livv-page min-h-full overflow-hidden pb-14">
      <div className="mx-auto w-full max-w-[42rem] px-5 pt-6 sm:px-6">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-livv-muted">Progress</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div><h1 className="text-[34px] font-semibold leading-none tracking-[-.055em]">Your record.</h1><p className="mt-2 max-w-[32rem] text-[12px] leading-relaxed text-livv-muted">A simple view of the work you have actually put in.</p></div>
            <span className="shrink-0 text-[11px] font-medium text-livv-muted">Level {rec.level}</span>
          </div>
        </header>

        <section className="mt-8 border-y border-livv-border py-6">
          <div className="flex items-start justify-between gap-5">
            <div><p className="text-[9px] font-semibold uppercase tracking-[.2em] text-livv-muted">Current evolution</p><h2 className="mt-1 text-[27px] font-semibold tracking-[-.045em]">{evo.name}</h2><p className="mt-1 max-w-[32rem] text-[12px] leading-relaxed text-livv-muted">{evo.line}</p></div>
            <div className="shrink-0 text-right"><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-livv-muted">XP</p><p className="mt-1 text-[17px] font-semibold">{rec.currentXp}</p></div>
          </div>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-livv-border"><div className="h-full rounded-full bg-livv-accent transition-all" style={{ width: `${pct}%` }} /></div>
          <p className="mt-2 text-right text-[10px] text-livv-muted">{pct}% toward next level · {rec.xpToNext} needed</p>
        </section>

        <section className="mt-7 grid grid-cols-2 gap-x-6 border-b border-livv-border pb-5 sm:grid-cols-4">
          <Stat value={`${insights.consistencyPct}%`} label="14d active" />
          <Stat value={`${insights.longestActiveRun}d`} label="best run" />
          <Stat value={`${insights.objectivesCompletedInWindow}`} label="actions" />
          <Stat value={`${insights.balancePct}%`} label="areas active" />
        </section>

        <section className="mt-9">
          <div className="flex items-end justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[.2em] text-livv-muted">This week</p><h2 className="mt-1 text-[23px] font-semibold tracking-[-.035em]">Consistency</h2></div><span className="text-[10px] text-livv-muted">{weekHitCount(rec)}/7 active</span></div>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {week.map(d => <div key={d.key} className="min-w-0"><div className="relative h-24 overflow-hidden rounded-md bg-livv-surface-2"><div className="absolute inset-x-0 bottom-0 rounded-md bg-livv-accent" style={{ height: `${Math.max(7, d.v)}%`, opacity: d.v ? .85 : .14 }} /></div><p className="mt-2 text-center text-[9px] font-medium text-livv-muted">{d.d}</p></div>)}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-livv-muted">Six areas</p>
          <h2 className="mt-1 text-[23px] font-semibold tracking-[-.035em]">Where your life is moving.</h2>
          <div className="mt-4 divide-y divide-livv-border border-y border-livv-border">
            {pillars.map(p => <div key={p.id} className="py-4"><div className="flex items-center justify-between gap-4"><div><p className="text-[14px] font-semibold">{p.name}</p><p className="mt-1 text-[10px] text-livv-muted">Level {p.level} · {p.xp} XP</p></div><span className="text-[11px] font-semibold text-livv-muted">{p.progress}%</span></div><div className="mt-3 h-1 overflow-hidden rounded-full bg-livv-border"><div className="h-full rounded-full bg-livv-accent" style={{ width: `${p.progress}%` }} /></div></div>)}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-livv-muted">Evidence</p>
          <div className="mt-4 divide-y divide-livv-border border-y border-livv-border">
            {insights.bullets.map(b => <div key={b.title} className="py-5"><p className="text-[9px] font-semibold uppercase tracking-[.18em] text-livv-accent">{b.title}</p><p className="mt-2 text-[15px] font-medium leading-snug">{b.detail}</p><p className="mt-2 text-[10px] leading-relaxed text-livv-muted">{b.evidence.facts.slice(0, 3).join(" · ")}</p></div>)}
          </div>
        </section>

      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <div className="py-3"><p className="text-[20px] font-semibold tracking-[-.03em]">{value}</p><p className="mt-1 text-[9px] font-semibold uppercase tracking-[.16em] text-livv-muted">{label}</p></div>;
}
