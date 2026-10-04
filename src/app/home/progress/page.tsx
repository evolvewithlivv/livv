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
import "./progress-signal.css";

export default function ProgressPage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    const sync = () => setRec(loadRecord());
    sync();
    for (const e of ["livv-record", "livv-daily", "livv-identity"]) {
      window.addEventListener(e, sync);
    }
    const t = window.setTimeout(() => setAwake(true), 80);
    return () => {
      for (const e of ["livv-record", "livv-daily", "livv-identity"]) {
        window.removeEventListener(e, sync);
      }
      window.clearTimeout(t);
    };
  }, []);

  const insights = useMemo(() => (rec ? buildProgressInsights(rec, 14) : null), [rec]);
  if (!rec || !insights) return <main className="rec min-h-[70dvh]" aria-hidden />;

  const week = weekBars(rec);
  const pillars = livePillars(rec);
  const evo = evolutionTitle(rec.level);
  const pct = Math.min(100, Math.round((rec.currentXp / Math.max(1, rec.xpToNext)) * 100));
  const weekHits = weekHitCount(rec);
  const bestRun =
    insights.longestActiveRun <= 0 ? "0" : String(insights.longestActiveRun);
  const actions =
    insights.objectivesCompletedInWindow + insights.checkInDays + insights.workoutDays;

  const r = 54;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <main className={"rec" + (awake ? " awake" : "")} aria-label="Your record">
      <div className="rec-void" aria-hidden />

      <div className="rec-inner">
        <header className="rec-top">
          <p className="rec-eyebrow">Record</p>
          <span className="rec-level">Level {rec.level}</span>
        </header>

        <section className="rec-hero">
          <div className="rec-ring-wrap" aria-hidden>
            <svg className="rec-ring" viewBox="0 0 128 128">
              <circle className="rec-ring-track" cx="64" cy="64" r={r} />
              <circle
                className="rec-ring-fill"
                cx="64"
                cy="64"
                r={r}
                strokeDasharray={`${dash} ${c}`}
                transform="rotate(-90 64 64)"
              />
            </svg>
            <div className="rec-ring-core">
              <p className="rec-xp">{rec.currentXp}</p>
              <p className="rec-xp-label">XP</p>
            </div>
          </div>

          <p className="rec-evo-label">Current evolution</p>
          <h1 className="rec-evo-name">{evo.name}</h1>
          <p className="rec-evo-line">{evo.line}</p>
          <p className="rec-evo-meta">
            {pct}% toward next · {rec.xpToNext} XP needed
          </p>
        </section>

        <section className="rec-metrics" aria-label="Key metrics">
          <div className="rec-metric">
            <p className="rec-metric-v">{insights.consistencyPct}%</p>
            <p className="rec-metric-l">14-day active</p>
          </div>
          <div className="rec-metric">
            <p className="rec-metric-v">
              {bestRun}
              <span className="rec-metric-unit">d</span>
            </p>
            <p className="rec-metric-l">Best run</p>
          </div>
          <div className="rec-metric">
            <p className="rec-metric-v">{actions}</p>
            <p className="rec-metric-l">Actions</p>
          </div>
          <div className="rec-metric">
            <p className="rec-metric-v">{insights.balancePct}%</p>
            <p className="rec-metric-l">Areas live</p>
          </div>
        </section>

        <section className="rec-week">
          <div className="rec-week-head">
            <p className="rec-section-label">This week</p>
            <p className="rec-week-count">{weekHits}/7 present</p>
          </div>
          <div className="rec-week-bars">
            {week.map((d) => (
              <div key={d.key} className={"rec-day" + (d.active ? " is-on" : "")}>
                <div className="rec-day-bar" style={{ height: `${Math.max(12, d.v)}%` }} />
                <span className="rec-day-label">{d.d}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rec-pillars">
          <p className="rec-section-label">Pillars</p>
          <div className="rec-pillar-list">
            {pillars.map((p) => (
              <div key={p.id} className="rec-pillar">
                <div className="rec-pillar-row">
                  <div>
                    <p className="rec-pillar-name">{p.name}</p>
                    <p className="rec-pillar-meta">
                      Lvl {p.level} · {p.xp} XP
                    </p>
                  </div>
                  <span className="rec-pillar-pct">{p.progress}%</span>
                </div>
                <div className="rec-pillar-track">
                  <div
                    className="rec-pillar-fill"
                    style={{ width: `${Math.min(100, p.progress)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {insights.bullets.length > 0 && (
          <section className="rec-evidence">
            <p className="rec-section-label">Evidence</p>
            <div className="rec-evidence-list">
              {insights.bullets.map((b) => (
                <article key={b.title} className="rec-evidence-card">
                  <p className="rec-evidence-title">{b.title}</p>
                  <p className="rec-evidence-detail">{b.detail}</p>
                  {b.evidence.facts.length > 0 && (
                    <p className="rec-evidence-facts">
                      {b.evidence.facts.slice(0, 3).join(" · ")}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
