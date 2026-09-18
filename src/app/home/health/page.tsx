"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  HEALTH_KEY,
  MEALS_TARGET,
  WATER_TARGET,
  blankDay,
  dayCompletion,
  lastNDays,
  loadHealthDays,
  todayKey,
  upsertHealthDay,
  weekAverages,
  weekdayLabel,
  type HealthDay,
} from "@/lib/health";

export default function HealthPage() {
  const [days, setDays] = useState<HealthDay[]>([]);
  const [loaded, setLoaded] = useState(false);
  const today = todayKey();

  const current = useMemo(() => days.find((d) => d.date === today) ?? blankDay(today), [days, today]);
  const history = useMemo(() => lastNDays(days, 7), [days]);
  const averages = useMemo(() => weekAverages(history), [history]);
  const completion = useMemo(() => dayCompletion(current), [current]);
  const recentNotes = useMemo(
    () =>
      days
        .filter((d) => d.note.trim() || d.movementNote.trim())
        .slice(-8)
        .reverse(),
    [days],
  );

  useEffect(() => {
    setDays(loadHealthDays());
    setLoaded(true);
    const sync = () => setDays(loadHealthDays());
    window.addEventListener("livv-health", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("livv-health", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback(
    (patch: Partial<HealthDay>) => {
      setDays((prev) => {
        const base = prev.find((d) => d.date === today) ?? blankDay(today);
        return upsertHealthDay({ ...base, ...patch, date: today }, prev);
      });
    },
    [today],
  );

  if (!loaded) {
    return (
      <main className="livv-page min-h-full">
        <div className="mx-auto max-w-xl px-5 pt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-livv-muted">Health</p>
        </div>
      </main>
    );
  }

  return (
    <main className="livv-page min-h-full text-livv-ink">
      <div className="mx-auto w-full max-w-xl px-5 pb-12 pt-6 sm:px-6">
        <header className="border-b border-livv-line pb-7 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-livv-muted">Health</p>
          <h1 className="mt-2 text-[clamp(1.75rem,7vw,2.35rem)] font-semibold tracking-[-0.04em]">
            Know your baseline.
          </h1>
          <p className="mx-auto mt-3 max-w-[36ch] text-sm leading-6 text-livv-muted">
            Keep track of the things that help you feel and perform well.
          </p>
        </header>

        {/* TODAY */}
        <section className="border-b border-livv-line py-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Today</p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
                {completion.count} / {completion.total} tracked
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-livv-muted">{completion.percent}%</p>
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-livv-line">
            <div
              className="h-full rounded-full bg-livv-ink transition-all duration-500"
              style={{ width: `${completion.percent}%` }}
            />
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2">
            <TodayChip label="Sleep" value={current.sleep > 0 ? `${fmtSleep(current.sleep)}h` : "—"} done={current.sleep > 0} />
            <TodayChip label="Water" value={`${current.water}/${WATER_TARGET}`} done={current.water > 0} />
            <TodayChip label="Meals" value={`${current.meals}/${MEALS_TARGET}`} done={current.meals > 0} />
            <TodayChip label="Move" value={current.movement ? "Done" : "—"} done={current.movement} />
          </div>
        </section>

        {/* CHECK-IN TRACKERS */}
        <section className="border-b border-livv-line py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Check in</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">The basics.</h2>
          <p className="mt-1 text-[13px] text-livv-muted">Log whenever you want. No prescribed schedule.</p>

          <div className="mt-5 divide-y divide-livv-line border-y border-livv-line">
            <TrackerRow
              label="Sleep"
              detail={current.sleep > 0 ? `${fmtSleep(current.sleep)} hours` : "Not logged"}
            >
              <AdjustButtons
                onMinus={() => update({ sleep: Math.max(0, Math.round((current.sleep - 0.5) * 10) / 10) })}
                onPlus={() => update({ sleep: Math.min(16, Math.round((current.sleep + 0.5) * 10) / 10) })}
              />
            </TrackerRow>

            <TrackerRow label="Water" detail={`${current.water} / ${WATER_TARGET} cups`}>
              <AdjustButtons
                onMinus={() => update({ water: Math.max(0, current.water - 1) })}
                onPlus={() => update({ water: Math.min(20, current.water + 1) })}
              />
            </TrackerRow>

            <TrackerRow label="Meals" detail={`${current.meals} / ${MEALS_TARGET}`}>
              <AdjustButtons
                onMinus={() => update({ meals: Math.max(0, current.meals - 1) })}
                onPlus={() => update({ meals: Math.min(6, current.meals + 1) })}
              />
            </TrackerRow>

            <div className="py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold">Movement</p>
                  <p className="mt-0.5 text-[11px] text-livv-muted">
                    {current.movement
                      ? current.movementNote.trim() || "Logged"
                      : "Any intentional movement counts"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => update({ movement: !current.movement, movementNote: current.movement ? "" : current.movementNote })}
                  className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition active:scale-[0.98] ${
                    current.movement
                      ? "bg-livv-ink text-livv-bg"
                      : "border border-livv-line text-livv-muted"
                  }`}
                >
                  {current.movement ? "Done" : "Log"}
                </button>
              </div>
              {current.movement && (
                <input
                  value={current.movementNote}
                  onChange={(e) => update({ movementNote: e.target.value })}
                  placeholder='Optional note — e.g. "30 min walk"'
                  maxLength={80}
                  className="mt-3 w-full border-b border-livv-line bg-transparent py-2 text-[13px] outline-none placeholder:text-livv-muted focus:border-livv-ink"
                  aria-label="Movement note"
                />
              )}
            </div>
          </div>
        </section>

        {/* BODY */}
        <section className="border-b border-livv-line py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Body</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">Measurements.</h2>
          <p className="mt-1 text-[13px] text-livv-muted">Optional. Track only what is useful to you.</p>
          <div className="mt-5 divide-y divide-livv-line border-y border-livv-line">
            <label className="flex items-center gap-4 py-4">
              <span className="w-20 shrink-0 text-[14px] font-semibold">Weight</span>
              <input
                value={current.weight}
                onChange={(e) => update({ weight: e.target.value })}
                inputMode="decimal"
                placeholder="—"
                aria-label="Weight"
                className="min-w-0 flex-1 border-b border-livv-line bg-transparent py-2 text-[18px] outline-none focus:border-livv-ink"
              />
              <span className="text-[10px] uppercase tracking-[0.12em] text-livv-muted">lb</span>
            </label>
            <label className="flex items-start gap-4 py-4">
              <span className="w-20 shrink-0 pt-2 text-[14px] font-semibold">Note</span>
              <input
                value={current.note}
                onChange={(e) => update({ note: e.target.value })}
                placeholder="Anything worth remembering"
                maxLength={280}
                aria-label="Health note"
                className="min-w-0 flex-1 border-b border-livv-line bg-transparent py-2 text-[13px] outline-none placeholder:text-livv-muted focus:border-livv-ink"
              />
            </label>
          </div>
        </section>

        {/* 7-DAY TRENDS */}
        <section className="border-b border-livv-line py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">7-day trends</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">Recent patterns.</h2>
          <div className="mt-5 divide-y divide-livv-line border-y border-livv-line">
            <TrendRow
              label="Sleep"
              value={averages.trackedDays ? `${averages.sleep.toFixed(1)} hr average` : "No data"}
              percent={averages.sleep / 8 * 100}
            />
            <TrendRow
              label="Water"
              value={averages.trackedDays ? `${averages.water.toFixed(1)} / ${WATER_TARGET} cups average` : "No data"}
              percent={(averages.water / WATER_TARGET) * 100}
            />
            <TrendRow
              label="Meals"
              value={averages.trackedDays ? `${averages.meals.toFixed(1)} / ${MEALS_TARGET} average` : "No data"}
              percent={(averages.meals / MEALS_TARGET) * 100}
            />
            <TrendRow
              label="Movement"
              value={`${averages.movementDays} / 7 days`}
              percent={(averages.movementDays / 7) * 100}
            />
          </div>

          {/* Compact 7-day history dots */}
          <div className="mt-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-livv-muted">
              History · sleep · water · meals · move
            </p>
            <div className="mt-3 space-y-2.5">
              {history.map((d) => {
                const dots = [d.sleep > 0, d.water > 0, d.meals > 0, d.movement];
                return (
                  <div key={d.date} className="flex items-center gap-3">
                    <span className="w-9 shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-livv-muted">
                      {weekdayLabel(d.date)}
                    </span>
                    <div className="flex gap-1.5">
                      {dots.map((on, i) => (
                        <span
                          key={i}
                          className={`h-2.5 w-2.5 rounded-full ${on ? "bg-livv-ink" : "bg-livv-line"}`}
                          aria-hidden
                        />
                      ))}
                    </div>
                    <span className="ml-auto text-[10px] tabular-nums text-livv-muted">
                      {dayCompletion(d).count}/4
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* NOTES */}
        <section className="py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Health record</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">Recent notes.</h2>
          <div className="mt-5 divide-y divide-livv-line border-y border-livv-line">
            {recentNotes.length === 0 && (
              <p className="py-5 text-[13px] text-livv-muted">Your notes will appear here as you add them.</p>
            )}
            {recentNotes.map((d) => (
              <div key={d.date} className="py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-livv-muted">{d.date}</p>
                {d.note.trim() && <p className="mt-2 text-[13px] leading-relaxed">{d.note}</p>}
                {d.movementNote.trim() && (
                  <p className="mt-1 text-[12px] text-livv-muted">Movement · {d.movementNote}</p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-[9px] leading-5 text-livv-muted">
            LIVV Health is for personal tracking and wellness organization. It isn&apos;t medical advice or a
            substitute for professional care.
          </p>
          <p className="mt-2 text-center text-[9px] text-livv-muted/70">Stored on this device · {HEALTH_KEY}</p>
        </section>
      </div>
    </main>
  );
}

function fmtSleep(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function TodayChip({ label, value, done }: { label: string; value: string; done: boolean }) {
  return (
    <div className={`rounded-xl px-2 py-3 text-center ${done ? "bg-livv-ink/[0.06]" : ""}`}>
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-livv-muted">{label}</p>
      <p className="mt-1 text-[13px] font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function TrackerRow({
  label,
  detail,
  children,
}: {
  label: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold">{label}</p>
        <p className="mt-0.5 text-[11px] text-livv-muted">{detail}</p>
      </div>
      {children}
    </div>
  );
}

function AdjustButtons({ onMinus, onPlus }: { onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={onMinus}
        aria-label="Decrease"
        className="grid h-10 w-10 place-items-center rounded-full border border-livv-line text-[16px] text-livv-muted transition active:scale-[0.96]"
      >
        −
      </button>
      <button
        type="button"
        onClick={onPlus}
        aria-label="Increase"
        className="grid h-10 w-10 place-items-center rounded-full border border-livv-line text-[16px] text-livv-muted transition active:scale-[0.96]"
      >
        +
      </button>
    </div>
  );
}

function TrendRow({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[14px] font-semibold">{label}</span>
        <span className="text-[11px] text-livv-muted">{value}</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-livv-line">
        <div
          className="h-full rounded-full bg-livv-ink transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
    </div>
  );
}
