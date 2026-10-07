"use client";

import { useEffect, useRef, useState } from "react";
import {
  LOCATION_OPTIONS,
  DURATION_OPTIONS,
  generateWorkout,
  type Focus,
  type Location,
  type Duration,
  type Workout,
  type Exercise,
} from "@/lib/train-data";
import {
  SPLITS,
  FOCUS_OPTIONS,
  loadActiveSplit,
  loadCustomSplit,
  saveActiveSplit,
  saveCustomSplit,
  type CustomSplit,
  type SplitId,
} from "@/lib/train-colors";
import { completeWorkout } from "@/lib/record";
import { feedback } from "@/lib/sensory";
import "./train.css";

type Phase = "select" | "preview" | "session" | "complete";

const FULL_KEY = "livv-last-workout-full";

function saveFullWorkout(w: Workout) {
  try {
    window.localStorage.setItem(FULL_KEY, JSON.stringify(w));
  } catch {
    /* ignore */
  }
}

function dayName(code: string) {
  return (
    {
      MON: "Monday",
      TUE: "Tuesday",
      WED: "Wednesday",
      THU: "Thursday",
      FRI: "Friday",
      SAT: "Saturday",
      SUN: "Sunday",
    } as Record<string, string>
  )[code] || code;
}

function todayCode() {
  return ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date().getDay()];
}

function exerciseCue(ex: Exercise) {
  const n = ex.name.toLowerCase();
  if (n.includes("push-up") || n.includes("press"))
    return "Ribs down. Brace. Control the lower.";
  if (
    n.includes("squat") ||
    n.includes("lunge") ||
    n.includes("thrust") ||
    n.includes("bridge") ||
    n.includes("deadlift")
  )
    return "Knee tracks over foot. Finish every rep.";
  if (n.includes("plank") || n.includes("hold") || n.includes("dead bug") || n.includes("twist"))
    return "Brace first. Breathe. Stop if form breaks.";
  if (n.includes("row") || n.includes("pull") || n.includes("curl"))
    return "Shoulders quiet. Pull with the muscle, not momentum.";
  return "Controlled pace. Clean range. Quality over rush.";
}

function metaLine(ex: Exercise) {
  const parts: string[] = [];
  if (ex.sets) parts.push(`${ex.sets} sets`);
  if (ex.reps) parts.push(ex.reps);
  if (ex.duration) parts.push(ex.duration);
  if (ex.rest) parts.push(`${ex.rest} rest`);
  return parts.join(" · ");
}

export default function TrainPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [splitId, setSplitId] = useState<SplitId | "custom" | null>(null);
  const [customSplit, setCustomSplit] = useState<CustomSplit | null>(null);
  const [editingCustom, setEditingCustom] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [logged, setLogged] = useState(false);
  const [rest, setRest] = useState(0);
  const restRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = loadActiveSplit();
    const custom = loadCustomSplit();
    setCustomSplit(custom);
    if (saved === "custom" && custom) {
      setSplitId("custom");
      const today = custom.days.find((d) => d.day === todayCode());
      setSelectedDayId(today?.id || custom.days.find((d) => !d.rest)?.id || null);
    } else if (saved) {
      const s = SPLITS.find((x) => x.id === saved);
      if (s) {
        setSplitId(saved);
        const today = s.days.find((d) => d.day === todayCode());
        setSelectedDayId(today?.id || s.days.find((d) => !d.rest)?.id || null);
      }
    }
    return () => {
      if (restRef.current) window.clearInterval(restRef.current);
    };
  }, []);

  useEffect(() => {
    if (rest <= 0) {
      if (restRef.current) window.clearInterval(restRef.current);
      return;
    }
    restRef.current = window.setInterval(() => setRest((r) => Math.max(0, r - 1)), 1000);
    return () => {
      if (restRef.current) window.clearInterval(restRef.current);
    };
  }, [rest > 0]);

  const split = splitId === "custom" ? customSplit : SPLITS.find((s) => s.id === splitId) || null;
  const selectedDay = split?.days.find((d) => d.id === selectedDayId) || null;
  const focus: Focus | null = selectedDay?.focus || null;
  const canGenerate = Boolean(split && selectedDay && !selectedDay.rest && focus && location && duration);

  const chooseSplit = (id: SplitId | "custom") => {
    if (id === "custom") {
      const existing = customSplit || {
        id: "custom" as const,
        name: "My Weekly Split",
        line: "Your week. Your structure.",
        detail: "Set a focus for every day and LIVV builds the session.",
        color: "#0F7FFF",
        days: ["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => ({
          id: `custom-${day}`, day, label: i === 6 ? "Rest" : "Full Body",
          focus: i === 6 ? null : "Full Body" as Focus,
          muscles: i === 6 ? "Off." : "Whole body",
          rest: i === 6,
        })),
      };
      setCustomSplit(existing);
      setSplitId("custom");
      saveActiveSplit("custom" as SplitId);
      setEditingCustom(true);
      feedback("tick");
      return;
    }

    const s = SPLITS.find((x) => x.id === id);
    if (!s) return;
    feedback("tick");
    setSplitId(id);
    saveActiveSplit(id);
    setEditingCustom(false);
    const today = s.days.find((d) => d.day === todayCode());
    setSelectedDayId(today?.id || s.days.find((d) => !d.rest)?.id || null);
  };

  const updateCustomDay = (index: number, patch: Partial<CustomSplit["days"][number]>) => {
    if (!customSplit) return;
    const days = customSplit.days.map((day, i) => i === index ? { ...day, ...patch, rest: patch.focus === null ? true : false, muscles: patch.focus === null ? "Off." : (patch.muscles || day.muscles) } : day);
    const next = { ...customSplit, days };
    setCustomSplit(next);
    saveCustomSplit(next);
    if (next.days[selectedDayId ? next.days.findIndex(d => d.id === selectedDayId) : -1]?.rest) setSelectedDayId(null);
  };

  const build = () => {
    if (!selectedDay || !focus || !location || !duration) return;
    const w = generateWorkout(focus, location, duration);
    w.name = selectedDay.label + " · " + w.name;
    setWorkout(w);
    saveFullWorkout(w);
    setPhase("preview");
    feedback("tick");
  };

  const start = () => {
    if (!workout) return;
    setCurrentIndex(0);
    setLogged(false);
    setPhase("session");
    feedback("tick");
  };

  const next = () => {
    if (!workout) return;
    feedback("tick");
    if (currentIndex >= workout.exercises.length - 1) {
      finish();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setRest(45);
  };

  const finish = () => {
    if (!workout || logged) {
      setPhase("complete");
      return;
    }
    feedback("complete");
    completeWorkout({
      name: workout.name,
      focus: String(workout.focus),
      duration: String(workout.duration),
      exercises: workout.exercises.length,
    });
    setLogged(true);
    setPhase("complete");
  };

  const reset = () => {
    setPhase("select");
    setWorkout(null);
    setCurrentIndex(0);
    setLogged(false);
    setRest(0);
  };

  if (phase === "session" && workout) {
    const ex = workout.exercises[currentIndex];
    return (
      <main className="tr" aria-label="Session">
        <div className="tr-inner">
          <div className="tr-session-top">
            <p className="tr-k">{workout.name}</p>
            <p className="tr-session-count">
              {currentIndex + 1}/{workout.exercises.length}
            </p>
          </div>
          <div className="tr-ex-hero">
            <p className="tr-k">Now</p>
            <h1 className="tr-ex-hero-name">{ex.name}</h1>
            <p className="tr-ex-hero-meta">{metaLine(ex)}</p>
            <p className="tr-ex-hero-cue">{exerciseCue(ex)}</p>
          </div>
          {rest > 0 ? (
            <div className="tr-rest">
              <p className="tr-k">Rest</p>
              <p className="tr-rest-n">{rest}s</p>
            </div>
          ) : null}
          <div className="tr-session-actions">
            <button type="button" className="tr-primary" onClick={next}>
              {currentIndex >= workout.exercises.length - 1 ? "Finish session" : "Next exercise"}
            </button>
            <button type="button" className="tr-ghost" onClick={finish}>
              End early
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "complete" && workout) {
    return (
      <main className="tr" aria-label="Session complete">
        <div className="tr-inner">
          <p className="tr-k">Done</p>
          <h1 className="tr-done-title">Session logged.</h1>
          <p className="tr-done-sub">
            {workout.name} · {workout.exercises.length} movements · {workout.duration} min
          </p>
          <p className="tr-done-sub">Evidence is on your record.</p>
          <button type="button" className="tr-primary" onClick={reset}>
            Build another
          </button>
        </div>
      </main>
    );
  }

  if (phase === "preview" && workout) {
    return (
      <main className="tr" aria-label="Session preview">
        <div className="tr-inner">
          <p className="tr-k">Session</p>
          <h1 className="tr-title">{workout.name}</h1>
          <p className="tr-sub">
            {workout.exercises.length} movements · {workout.duration} min · {workout.location}
          </p>
          <section className="tr-section">
            <p className="tr-section-k">Work</p>
            {workout.exercises.map((ex) => (
              <div key={ex.id} className="tr-ex">
                <p className="tr-ex-n">{ex.name}</p>
                <p className="tr-ex-m">{metaLine(ex)}</p>
              </div>
            ))}
          </section>
          <button type="button" className="tr-primary" onClick={start}>
            Start session
          </button>
          <button type="button" className="tr-ghost" onClick={() => setPhase("select")}>
            Change setup
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="tr" aria-label="Train">
      <div className="tr-inner">
        <p className="tr-k">Train</p>
        <h1 className="tr-title">Build the session.</h1>
        <p className="tr-sub">Pick split, place, and time. Then execute.</p>

        <section className="tr-section">
          <div className="tr-section-head">
            <div><p className="tr-section-k">Weekly split</p><p className="tr-section-note">Choose a system or build your own.</p></div>
          </div>
          <div className="tr-chips">
            {SPLITS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={"tr-chip" + (splitId === s.id ? " on" : "")}
                onClick={() => chooseSplit(s.id)}
              >
                {s.name}
              </button>
            ))}
            <button
              type="button"
              className={"tr-chip tr-chip-custom" + (splitId === "custom" ? " on" : "")}
              onClick={() => chooseSplit("custom")}
            >
              {customSplit ? "My split" : "Build your split"}
            </button>
          </div>
        </section>

        {splitId === "custom" && customSplit && editingCustom ? (
          <section className="tr-section tr-custom-editor">
            <div className="tr-custom-head">
              <div><p className="tr-section-k">Your week</p><p className="tr-section-note">Set the focus. You can change it later.</p></div>
              <button type="button" className="tr-ghost-inline" onClick={() => setEditingCustom(false)}>Done</button>
            </div>
            <label className="tr-custom-name">Name<input value={customSplit.name} maxLength={32} onChange={e => { const next={...customSplit,name:e.target.value}; setCustomSplit(next); saveCustomSplit(next); }} /></label>
            <div className="tr-custom-days">
              {customSplit.days.map((day,index) => (
                <div key={day.id} className="tr-custom-day">
                  <span className="tr-custom-day-name">{dayName(day.day)}</span>
                  <select value={day.rest ? "" : day.focus || ""} onChange={e => {
                    const value=e.target.value as Focus | "";
                    updateCustomDay(index, value ? { focus:value, label:value, muscles:value } : { focus:null, label:"Rest", muscles:"Off." });
                  }}>
                    <option value="">Rest</option>
                    {FOCUS_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {split ? (
          <section className="tr-section">
            <p className="tr-section-k">Day</p>
            <div className="tr-day-list" role="listbox" aria-label="Training day">
              {split.days.map((d) => {
                const active = selectedDayId === d.id;
                const label = d.rest ? "Rest" : d.label;
                return (
                  <button
                    key={d.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={
                      "tr-day-row" +
                      (active ? " on" : "") +
                      (d.rest ? " rest" : "")
                    }
                    onClick={() => {
                      if (d.rest) return;
                      setSelectedDayId(d.id);
                      feedback("tick");
                    }}
                    disabled={d.rest}
                  >
                    <span className="tr-day-name">{dayName(d.day)}</span>
                    <span className="tr-day-focus">{label}</span>
                  </button>
                );
              })}
            </div>
            {selectedDay && !selectedDay.rest ? (
              <p className="tr-day-hint">{selectedDay.muscles}</p>
            ) : null}
          </section>
        ) : null}

        <section className="tr-section">
          <p className="tr-section-k">Where</p>
          <div className="tr-chips">
            {LOCATION_OPTIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                className={"tr-chip" + (location === loc ? " on" : "")}
                onClick={() => {
                  setLocation(loc);
                  feedback("tick");
                }}
              >
                {loc}
              </button>
            ))}
          </div>
        </section>

        <section className="tr-section">
          <p className="tr-section-k">Time</p>
          <div className="tr-chips">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                className={"tr-chip" + (duration === d.value ? " on" : "")}
                onClick={() => {
                  setDuration(d.value);
                  feedback("tick");
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {splitId === "custom" && customSplit && !editingCustom ? (
          <button type="button" className="tr-secondary" onClick={() => setEditingCustom(true)}>Edit my weekly split</button>
        ) : null}

        <button type="button" className="tr-primary" disabled={!canGenerate} onClick={build}>
          Build session
        </button>
      </div>
    </main>
  );
}
