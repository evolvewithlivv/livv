"use client";

import { useEffect, useMemo, useState } from "react";
import {
  livePillars,
  loadRecord,
  weekBars,
  weekHitCount,
  type LivvRecord,
} from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { buildProgressInsights } from "@/lib/progress-insights";

export default function ProgressPage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);

  useEffect(() => {
    const sync = () => setRec(loadRecord());
    sync();
    for (const e of ["livv-record", "livv-daily", "livv-identity"]) {
      window.addEventListener(e, sync);
    }
    return () => {
      for (const e of ["livv-record", "livv-daily", "livv-identity"]) {
        window.removeEventListener(e, sync);
      }
    };
  }, []);

  const insights = useMemo(() => (rec ? buildProgressInsights(rec, 14) : null), [rec]);
  if (!rec || !insights) return <main className="livv-page min-h-full" />;

  const week = weekBars(rec);
  const pillars = livePillars(rec);
  const evo = evolutionTitle(rec.level);
  const pct = Math.min(100, Math.round((rec.currentXp / Math.max(1, rec.xpToNext)) * 100));
  const bestRun =
    insights.longestActiveRun <= 0
      ? "0d"
      : `${insights.longestActiveRun}d`;
  const actions =
    insights.objectivesCompletedInWindow +
    insights.checkInDays +
    insights.workoutDays;

  return (
    <main className="livv-page min-h-full pb-14">
      <div className="mx-auto w-full max-w-xl px-5 pt-6 sm:px-6">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-livv-muted">
            Progress
          </p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[34px] font-semibold leading-[.96] tracking-[-.055em] sm:text-[40px]">
                Your record.
              </h1>
              <p className="mt-3 max-w-[36ch] text-[13px] leading-6 text-livv-muted">
                A clear view of the work you have actually put in.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-livv-border px-3 py-1.5 text-[11px] font-semibold text-livv-muted">
              Level {rec.level}
            </span>
          </div>
        </header>

        <section className="mt-8 overflow-hidden rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
                Current evolution
              </p>
              <h2 className="mt-2 text-[26px] font-semibold tracking-[-.04em] sm:text-[28px]">
                {evo.name}
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-livv-muted">{evo.line}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-livv-muted">XP</p>
              <p className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-.03em]">
                {rec.currentXp}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <div className="h-1.5 overflow-hidden rounded-full bg-livv-border">
              <div
                className="h-full rounded-full bg-livv-accent transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2.5 text-[11px] text-livv-muted">
              {pct}% toward next level · {rec.xpToNext} needed
            </p>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3">
          <Stat value={`${insights.consistencyPct}%`} label="14d active" />
          <Stat value={bestRun} label="Best run" />
          <Stat value={String(actions)} label="Actions" />
          <Stat value={`${insights.balancePct}%`} label="Areas active" />
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
                This week
              </p>
              <h2 className="mt-1 text-[24px] font-semibold tracking-[-.04em]">Consistency</h2>
            </div>
            <span className="text-[11px] text-livv-muted">{weekHitCount(rec)}/7 active</span>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {week.map((d) => (
              <div key={d.key} className="min-w-0">
                <div className="relative h-20 overflow-hidden rounded-lg bg-livv-surface-2 sm:h-24">
                  <div
                    className="absolute inset-x-0 bottom-0 rounded-lg bg-livv-accent"
                    style={{
                      height: `${Math.max(d.v ? 12 : 6, d.v)}%`,
                      opacity: d.v ? 0.9 : 0.18,
                    }}
                  />
                </div>
                <p className="mt-2 text-center text-[10px] font-medium text-livv-muted">{d.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
            Six areas
          </p>
          <h2 className="mt-1 text-[24px] font-semibold tracking-[-.04em]">
            Where your life is moving.
          </h2>
          <div className="mt-5 space-y-3">
            {pillars.map((p) => (
              <div
                key={p.id}
                className="rounded-[18px] border border-livv-border px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold tracking-[-.02em]">{p.name}</p>
                    <p className="mt-0.5 text-[11px] text-livv-muted">
                      Level {p.level} · {p.xp} XP
                    </p>
                  </div>
                  <span className="shrink-0 text-[12px] font-semibold tabular-nums text-livv-muted">
                    {p.progress}%
                  </span>
                </div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-livv-border">
                  <div
                    className="h-full rounded-full bg-livv-accent"
                    style={{ width: `${Math.min(100, p.progress)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {insights.bullets.length > 0 && (
          <section className="mt-10 pb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
              Evidence
            </p>
            <div className="mt-4 space-y-4">
              {insights.bullets.map((b) => (
                <div
                  key={b.title}
                  className="rounded-[18px] border border-livv-border px-4 py-4"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-livv-accent">
                    {b.title}
                  </p>
                  <p className="mt-2 text-[15px] font-medium leading-snug tracking-[-.02em]">
                    {b.detail}
                  </p>
                  {b.evidence.facts.length > 0 && (
                    <p className="mt-2 text-[11px] leading-5 text-livv-muted">
                      {b.evidence.facts.slice(0, 3).join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[18px] border border-livv-border px-4 py-4">
      <p className="text-[22px] font-semibold tracking-[-.03em] tabular-nums">{value}</p>
      <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-livv-muted">
        {label}
      </p>
    </div>
  );
}
