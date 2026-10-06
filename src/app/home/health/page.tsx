"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import {
  blankDay,
  dayCompletion,
  lastNDays,
  loadHealthDays,
  todayKey,
  upsertHealthDay,
  WATER_TARGET,
  MEALS_TARGET,
  type HealthDay,
} from "@/lib/health";
import { feedback } from "@/lib/sensory";
import "./health-signal.css";

const TOOLS = [
  { href: "/home/health/sleep", label: "Sleep", detail: "Hours and quality" },
  { href: "/home/health/meditation", label: "Meditation", detail: "Short resets" },
  { href: "/home/health/recipes", label: "Recipes", detail: "Food you can cook" },
  { href: "/home/health/trails", label: "Walk · Run · Bike", detail: "Distance and time" },
  { href: "/home/health/dictionary", label: "Dictionary", detail: "Language that changes action" },
] as const;

function weekdayShort(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("en-US", { weekday: "narrow" }).format(dt);
}

export default function HealthPage() {
  const [days, setDays] = useState<HealthDay[]>([]);
  const today = todayKey();

  useEffect(() => {
    const refresh = () => setDays(loadHealthDays());
    refresh();
    window.addEventListener("livv-health", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("livv-health", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const current = useMemo(
    () => days.find((day) => day.date === today) ?? blankDay(today),
    [days, today],
  );
  const completion = useMemo(() => dayCompletion(current), [current]);
  const week = useMemo(() => lastNDays(days, 7), [days]);
  const trackedDays = days.filter(
    (day) => day.sleep > 0 || day.water > 0 || day.meals > 0 || day.movement,
  ).length;

  const dateLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }, []);

  function update(patch: Partial<HealthDay>) {
    setDays((prev) =>
      upsertHealthDay({ ...current, ...patch, date: today }, prev),
    );
    const hitWater =
      (patch.water ?? current.water) >= WATER_TARGET && current.water < WATER_TARGET;
    const hitMeals =
      (patch.meals ?? current.meals) >= MEALS_TARGET && current.meals < MEALS_TARGET;
    const hitMove = patch.movement === true && !current.movement;
    if (hitWater || hitMeals || hitMove) feedback("complete");
    else feedback("tick");
  }

  return (
    <main className="hz" aria-label="Health">
      <div className="hz-inner">
        <header className="hz-mast">
          <p className="hz-mast-k">Health</p>
          <p className="hz-mast-d">{dateLabel}</p>
        </header>

        <section className="hz-head">
          <h1 className="hz-title">Today</h1>
          <p className="hz-sub">
            Sleep, water, meals, movement. Log what you actually did.
          </p>
          <div className="hz-progress">
            <div className="hz-progress-meta">
              <span>
                {completion.count} of {completion.total} logged
              </span>
              <span>
                {trackedDays} day{trackedDays === 1 ? "" : "s"} tracked
              </span>
            </div>
            <div className="hz-bar" aria-hidden>
              <i style={{ width: `${completion.percent}%` }} />
            </div>
          </div>
        </section>

        <section className="hz-section" aria-label="Baseline log">
          <p className="hz-section-label">Baseline</p>
          <div className="hz-log">
            <div className="hz-row">
              <div className="hz-row-main">
                <p className="hz-row-name">Sleep</p>
                <p className="hz-row-detail">
                  {current.sleep ? `${current.sleep} hours` : "Not logged"}
                </p>
                <p className={"hz-row-value" + (current.sleep >= 7 ? " is-goal" : "")}>
                  {current.sleep ? `${current.sleep}h` : "—"}
                </p>
              </div>
              <div className="hz-ctrl">
                <button
                  type="button"
                  aria-label="Decrease sleep"
                  onClick={() =>
                    update({
                      sleep: Math.max(0, Math.round((current.sleep - 0.5) * 10) / 10),
                    })
                  }
                >
                  <Minus size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Increase sleep"
                  onClick={() =>
                    update({
                      sleep: Math.min(16, Math.round((current.sleep + 0.5) * 10) / 10),
                    })
                  }
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="hz-row">
              <div className="hz-row-main">
                <p className="hz-row-name">Water</p>
                <p className="hz-row-detail">Target {WATER_TARGET} cups</p>
                <p
                  className={
                    "hz-row-value" + (current.water >= WATER_TARGET ? " is-goal" : "")
                  }
                >
                  {current.water}
                  {current.water >= WATER_TARGET ? (
                    <Check
                      size={16}
                      style={{ display: "inline", marginLeft: 6, verticalAlign: -2 }}
                    />
                  ) : null}
                </p>
              </div>
              <div className="hz-ctrl">
                <button
                  type="button"
                  aria-label="Decrease water"
                  onClick={() => update({ water: Math.max(0, current.water - 1) })}
                >
                  <Minus size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Increase water"
                  onClick={() => update({ water: Math.min(20, current.water + 1) })}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="hz-row">
              <div className="hz-row-main">
                <p className="hz-row-name">Meals</p>
                <p className="hz-row-detail">Target {MEALS_TARGET}</p>
                <p
                  className={
                    "hz-row-value" + (current.meals >= MEALS_TARGET ? " is-goal" : "")
                  }
                >
                  {current.meals}
                  {current.meals >= MEALS_TARGET ? (
                    <Check
                      size={16}
                      style={{ display: "inline", marginLeft: 6, verticalAlign: -2 }}
                    />
                  ) : null}
                </p>
              </div>
              <div className="hz-ctrl">
                <button
                  type="button"
                  aria-label="Decrease meals"
                  onClick={() => update({ meals: Math.max(0, current.meals - 1) })}
                >
                  <Minus size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Increase meals"
                  onClick={() => update({ meals: Math.min(6, current.meals + 1) })}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="hz-row">
              <div className="hz-row-main">
                <p className="hz-row-name">Movement</p>
                <p className="hz-row-detail">Any intentional movement</p>
                <p className={"hz-row-value" + (current.movement ? " is-goal" : "")}>
                  {current.movement ? "Done" : "—"}
                </p>
              </div>
              <button
                type="button"
                className={"hz-mark" + (current.movement ? " on" : "")}
                onClick={() => update({ movement: !current.movement })}
              >
                {current.movement ? "Logged" : "Mark"}
              </button>
            </div>
          </div>
        </section>

        <section className="hz-section" aria-label="Health systems">
          <p className="hz-section-label">Systems</p>
          <div className="hz-tools">
            {TOOLS.map((t) => (
              <Link key={t.href} href={t.href} className="hz-tool">
                <span>
                  <p className="hz-tool-t">{t.label}</p>
                  <p className="hz-tool-s">{t.detail}</p>
                </span>
                <span className="hz-tool-go" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="hz-section" aria-label="This week">
          <p className="hz-section-label">This week</p>
          <div className="hz-week">
            {week.map((day) => {
              const c = dayCompletion(day);
              return (
                <div key={day.date} className="hz-day">
                  <div className="hz-day-bar" aria-label={`${c.count} of ${c.total}`}>
                    <i
                      style={{
                        height: `${Math.max(c.percent, c.percent > 0 ? 12 : 0)}%`,
                      }}
                    />
                  </div>
                  <span className="hz-day-lab">{weekdayShort(day.date)}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
