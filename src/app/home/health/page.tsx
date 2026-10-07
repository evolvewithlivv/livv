"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Brain,
  Check,
  ChevronRight,
  CircleDot,
  Footprints,
  Moon,
  Salad,
  Waves,
  Timer,
  Sprout,
} from "lucide-react";
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

const SLEEP_TARGET = 8;

const SYSTEMS = [
  { href: "/home/health/sleep", label: "Sleep", kicker: "RECOVERY", detail: "See the night as a pattern, not a guess.", Icon: Moon },
  { href: "/home/health/meditation", label: "Meditation", kicker: "MIND", detail: "Short practices for attention and reset.", Icon: Brain },
  { href: "/home/health/recipes", label: "Recipes", kicker: "FOOD", detail: "Real meals built around ingredients you can use.", Icon: Salad },
  { href: "/home/health/trails", label: "Move", kicker: "MOVEMENT", detail: "Walk, run, or ride. Keep the record.", Icon: Footprints },
  { href: "/home/train/fasting", label: "Fasting", kicker: "METABOLIC RHYTHM", detail: "Track your fasting window without turning it into a religion.", Icon: Timer },
  { href: "/home/field", label: "Field", kicker: "SELF-SUFFICIENCY", detail: "Grow, keep, preserve, and build practical capability.", Icon: Sprout },
  { href: "/home/health/dictionary", label: "Dictionary", kicker: "KNOWLEDGE", detail: "Language that turns information into action.", Icon: CircleDot },
] as const;

function weekdayShort(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { weekday: "narrow" }).format(new Date(y, m - 1, d));
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

  const current = useMemo(() => days.find((day) => day.date === today) ?? blankDay(today), [days, today]);
  const completion = useMemo(() => dayCompletion(current), [current]);
  const week = useMemo(() => lastNDays(days, 7), [days]);
  const trackedDays = days.filter((day) => day.sleep > 0 || day.water > 0 || day.meals > 0 || day.movement).length;

  const averages = useMemo(() => {
    const tracked = week.filter((d) => d.sleep > 0 || d.water > 0 || d.meals > 0 || d.movement);
    if (!tracked.length) return { sleep: 0, water: 0, meals: 0, movement: 0 };
    return {
      sleep: tracked.reduce((s, d) => s + d.sleep, 0) / tracked.length,
      water: tracked.reduce((s, d) => s + d.water, 0) / tracked.length,
      meals: tracked.reduce((s, d) => s + d.meals, 0) / tracked.length,
      movement: tracked.filter((d) => d.movement).length,
    };
  }, [week]);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  function update(patch: Partial<HealthDay>) {
    setDays((prev) => upsertHealthDay({ ...current, ...patch, date: today }, prev));
    const nextSleep = patch.sleep ?? current.sleep;
    const hitSleep = nextSleep >= SLEEP_TARGET && current.sleep < SLEEP_TARGET;
    const hitWater = (patch.water ?? current.water) >= WATER_TARGET && current.water < WATER_TARGET;
    const hitMeals = (patch.meals ?? current.meals) >= MEALS_TARGET && current.meals < MEALS_TARGET;
    const hitMove = patch.movement === true && !current.movement;
    feedback(hitSleep || hitWater || hitMeals || hitMove ? "complete" : "tick");
  }

  return (
    <main className="health-home" aria-label="Health">
      <div className="health-shell">
        <header className="health-mast">
          <div>
            <p className="health-eyebrow">LIVV / HEALTH</p>
            <p className="health-date">{dateLabel}</p>
          </div>
          
        </header>

        <section className="health-hero">
          <div>
            <p className="health-kicker">THE BODY IS THE BASELINE</p>
            <h1>Know what is happening.<br />Then change it.</h1>
            <p className="health-lede">
              Health in LIVV is not a score to chase. It is a clear record of how you sleep, eat, move, recover, and think.
            </p>
          </div>
          <div className="health-readout">
            <div className="health-readout-top">
              <span>TODAY</span>
              <strong>{completion.percent}%</strong>
            </div>
            <div className="health-rule"><i style={{ width: completion.percent + "%" }} /></div>
            <p>{completion.count} of {completion.total} baseline signals logged</p>
          </div>
        </section>

        <section className="health-baseline" aria-label="Today's baseline">
          <div className="health-section-head">
            <div>
              <p className="health-label">01 / BASELINE</p>
              <h2>Today</h2>
            </div>
            <span>{trackedDays} day{trackedDays === 1 ? "" : "s"} recorded</span>
          </div>

          <div className="health-metrics">
            <div className="health-metric">
              <div className="health-metric-head"><Moon size={15} /><span>SLEEP</span></div>
              <strong>{current.sleep ? current.sleep + "h" : "00"}</strong>
              <p>{current.sleep >= SLEEP_TARGET ? "8h baseline reached" : current.sleep ? "Logged" : "Suggested: 8h"}</p>
              <div className="health-stepper">
                <button type="button" aria-label="Decrease sleep" onClick={() => update({ sleep: Math.max(0, Math.round((current.sleep - 0.5) * 10) / 10) })}>−</button>
                <button type="button" aria-label="Increase sleep" onClick={() => update({ sleep: Math.min(16, Math.round((current.sleep + 0.5) * 10) / 10) })}>+</button>
              </div>
            </div>

            <div className="health-metric">
              <div className="health-metric-head"><Waves size={15} /><span>WATER</span></div>
              <strong>{current.water}<small> / {WATER_TARGET}</small></strong>
              <p>{current.water >= WATER_TARGET ? "Baseline reached" : "Cups today"}</p>
              <div className="health-stepper">
                <button type="button" aria-label="Decrease water" onClick={() => update({ water: Math.max(0, current.water - 1) })}>−</button>
                <button type="button" aria-label="Increase water" onClick={() => update({ water: Math.min(20, current.water + 1) })}>+</button>
              </div>
            </div>

            <div className="health-metric">
              <div className="health-metric-head"><Salad size={15} /><span>MEALS</span></div>
              <strong>{current.meals}<small> / {MEALS_TARGET}</small></strong>
              <p>{current.meals >= MEALS_TARGET ? "Baseline reached" : "Meals today"}</p>
              <div className="health-stepper">
                <button type="button" aria-label="Decrease meals" onClick={() => update({ meals: Math.max(0, current.meals - 1) })}>−</button>
                <button type="button" aria-label="Increase meals" onClick={() => update({ meals: Math.min(6, current.meals + 1) })}>+</button>
              </div>
            </div>

            <div className="health-metric">
              <div className="health-metric-head"><Footprints size={15} /><span>MOVEMENT</span></div>
              <strong>{current.movement ? "ON" : "00"}</strong>
              <p>{current.movement ? "Intentional movement" : "Nothing logged"}</p>
              <button type="button" className={"health-mark " + (current.movement ? "on" : "")} onClick={() => update({ movement: !current.movement })}>
                {current.movement ? <><Check size={13} /> Logged</> : "Mark movement"}
              </button>
            </div>
          </div>
        </section>

        <section className="health-systems" aria-label="Health systems">
          <div className="health-section-head">
            <div>
              <p className="health-label">02 / SYSTEMS</p>
              <h2>Go deeper</h2>
            </div>
            <span>Five ways in</span>
          </div>
          <div className="health-system-list">
            {SYSTEMS.map(({ href, label, kicker, detail, Icon }, index) => (
              <Link key={href} href={href} className="health-system">
                <span className="health-system-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="health-system-icon"><Icon size={17} strokeWidth={1.6} /></span>
                <span className="health-system-copy">
                  <span className="health-system-k">{kicker}</span>
                  <strong>{label}</strong>
                  <small>{detail}</small>
                </span>
                <ArrowUpRight className="health-system-arrow" size={18} strokeWidth={1.5} />
              </Link>
            ))}
          </div>
        </section>

        <section className="health-week" aria-label="Seven day health signal">
          <div className="health-section-head">
            <div>
              <p className="health-label">03 / SIGNAL</p>
              <h2>This week</h2>
            </div>
            <span>{averages.sleep ? averages.sleep.toFixed(1) + "h avg sleep" : "Start building the record"}</span>
          </div>
          <div className="health-week-grid">
            {week.map((day) => {
              const c = dayCompletion(day);
              return (
                <div key={day.date} className="health-day">
                  <div className="health-day-track"><i style={{ height: Math.max(c.percent, c.percent > 0 ? 10 : 0) + "%" }} /></div>
                  <span>{weekdayShort(day.date)}</span>
                  <strong>{c.percent}%</strong>
                </div>
              );
            })}
          </div>
          <div className="health-week-note">
            <span>{averages.water ? averages.water.toFixed(1) + " cups avg" : "No water baseline yet"}</span>
            <span>{averages.meals ? averages.meals.toFixed(1) + " meals avg" : "No meal baseline yet"}</span>
            <span>{averages.movement} movement day{averages.movement === 1 ? "" : "s"}</span>
          </div>
        </section>

        <p className="health-footnote">LIVV Health is a lifestyle tracking system, not medical care.</p>
      </div>
    </main>
  );
}