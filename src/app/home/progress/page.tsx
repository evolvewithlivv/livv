"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
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
      <div className="mx-auto w-full max-w-[42rem] px-5 pt-5">
        <PageHero eyebrow="Progress" title="Your progress" subtitle="See the evidence of what you have actually been doing." accent="#1769ff" />

        <section className="mt-7 border-y border-black/[0.08] py-6 dark:border-white/[0.08]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Current evolution</p>
              <h2 className="font-display mt-1 text-[28px] font-semibold tracking-tight">{evo.name}</h2>
              <p className="mt-1 max-w-[32rem] text-[12px] leading-relaxed text-livv-muted">{evo.line}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-livv-muted">Level</p>
              <p className="font-display text-[28px] font-semibold text-[var(--livv-pro-accent)]">{rec.level}</p>
            </div>
          </div>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/[0.08]">
            <div className="h-full rounded-full bg-[var(--livv-pro-accent)] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-right text-[10px] text-livv-muted">{rec.currentXp} / {rec.xpToNext} XP</p>
        </section>

        <section className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.08] dark:border-white/[0.08] dark:bg-white/[0.08]">
          <Stat value={`${insights.consistencyPct}%`} label="14d active" />
          <Stat value={`${insights.longestActiveRun}d`} label="best run" />
          <Stat value={`${insights.objectivesCompletedInWindow}`} label="actions" />
          <Stat value={`${insights.balancePct}%`} label="life areas active" />
        </section>

        <section className="mt-9">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-livv-muted">This week</p><h2 className="font-display mt-1 text-[23px] font-semibold">Consistency</h2></div>
            <span className="text-[10px] text-livv-muted">{weekHitCount(rec)}/7 active</span>
          </div>
          <div className="mt-5 flex items-end gap-2 border-b border-black/[0.08] pb-3 dark:border-white/[0.08]">
            {week.map(d => <div key={d.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="relative h-20 w-full overflow-hidden rounded-lg bg-black/[0.05] dark:bg-white/[0.05]"><div className="absolute inset-x-0 bottom-0 rounded-lg bg-[var(--livv-pro-accent)]" style={{ height: `${Math.max(8, d.v)}%`, opacity: d.v ? .82 : .15 }} /></div>
              <span className="text-[9px] font-medium text-livv-muted">{d.d}</span>
            </div>)}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Six areas</p>
          <h2 className="font-display mt-1 text-[23px] font-semibold">Where your life is moving.</h2>
          <div className="mt-4 divide-y divide-black/[0.08] border-y border-black/[0.08] dark:divide-white/[0.08] dark:border-white/[0.08]">
            {pillars.map(p => <div key={p.id} className="py-4">
              <div className="flex items-center justify-between gap-4">
                <div><p className="text-[14px] font-semibold">{p.name}</p><p className="mt-1 text-[10px] text-livv-muted">Level {p.level} · {p.xp} XP</p></div>
                <span className="text-[11px] font-semibold text-livv-muted">{p.progress}%</span>
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/[0.08]"><div className="h-full rounded-full bg-[var(--livv-pro-accent)]" style={{ width: `${p.progress}%` }} /></div>
            </div>)}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-livv-muted">What the evidence says</p>
          <div className="mt-4 divide-y divide-black/[0.08] border-y border-black/[0.08] dark:divide-white/[0.08] dark:border-white/[0.08]">
            {insights.bullets.map(b => <div key={b.title} className="py-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--livv-pro-accent)]">{b.title}</p>
              <p className="mt-2 text-[15px] font-medium leading-snug">{b.detail}</p>
              <p className="mt-2 text-[10px] leading-relaxed text-livv-muted">{b.evidence.facts.slice(0, 3).join(" · ")}</p>
            </div>)}
          </div>
        </section>

        <Link href="/home/evala" className="mt-9 flex items-center justify-between border-y border-black/[0.08] py-5 dark:border-white/[0.08]">
          <div><p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--livv-pro-accent)]">Next step</p><p className="mt-1 text-[15px] font-semibold">Ask Evala what to improve next.</p></div>
          <span className="text-livv-muted">→</span>
        </Link>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <div className="bg-[var(--livv-pro-surface)] p-4"><p className="font-display text-[20px] font-semibold">{value}</p><p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-livv-muted">{label}</p></div>;
}
