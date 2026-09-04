"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { AmbientField } from "@/components/layout/ambient-field";
import { cn } from "@/lib/utils";
import {
  FOCUS_OPTIONS,
  LOCATION_OPTIONS,
  DURATION_OPTIONS,
  generateWorkout,
  type Focus,
  type Location,
  type Duration,
  type Workout,
  type Exercise,
} from "@/lib/train-data";
import { activityFromWorkout } from "@/lib/activity";
import { completeWorkout, loadRecord, type LastWorkout } from "@/lib/record";
import { feedback } from "@/lib/sensory";
import { Moment } from "@/components/ui/moment";

type Phase = "select" | "preview" | "session" | "rest" | "complete";

const FULL_KEY = "livv-last-workout-full";

function saveFullWorkout(w: Workout) {
  try {
    window.localStorage.setItem(FULL_KEY, JSON.stringify(w));
  } catch {
    // quota
  }
}

function loadFullWorkout(): Workout | null {
  try {
    const raw = window.localStorage.getItem(FULL_KEY);
    return raw ? (JSON.parse(raw) as Workout) : null;
  } catch {
    return null;
  }
}

function parseRestSeconds(rest: string) {
  const n = parseInt(rest, 10);
  if (Number.isFinite(n)) return Math.min(120, Math.max(15, n));
  return 40;
}

function choiceLabel(value: string) {
  return value.replace(/-/g, " ");
}

export default function TrainPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [focus, setFocus] = useState<Focus | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [logged, setLogged] = useState(false);
  const [last, setLast] = useState<LastWorkout | null>(null);
  const [restLeft, setRestLeft] = useState(0);
  const [note, setNote] = useState("");
  const [showMoment, setShowMoment] = useState(false);
  const restRef = useRef<number | null>(null);

  useEffect(() => {
    setLast(loadRecord().lastWorkout);
    return () => {
      if (restRef.current) window.clearInterval(restRef.current);
    };
  }, []);

  const canGenerate = Boolean(focus && location && duration);

  const handleGenerate = () => {
    if (!focus || !location || !duration) return;
    feedback("tick");
    setWorkout(generateWorkout(focus, location, duration));
    setPhase("preview");
  };

  const repeatLast = () => {
    const full = loadFullWorkout();
    if (!full) return;
    feedback("tick");
    setWorkout(full);
    setPhase("preview");
  };

  const handleStart = () => {
    feedback("tick");
    setCurrentIndex(0);
    setCompletedExercises([]);
    setLogged(false);
    setNote("");
    setPhase("session");
  };

  const finishSession = (w: Workout) => {
    if (!logged) {
      activityFromWorkout({
        workoutName: w.name,
        focus: w.focus,
        location: w.location,
        duration: w.duration,
        difficulty: w.difficulty,
        exerciseCount: w.exercises.length,
      });
      completeWorkout({
        name: w.name,
        focus: w.focus,
        duration: w.duration,
        exercises: w.exercises.length,
      });
      saveFullWorkout(w);
      setLogged(true);
      feedback("complete");
      setShowMoment(true);
    }
    setPhase("complete");
  };

  const startRest = (seconds: number) => {
    setRestLeft(seconds);
    setPhase("rest");
    if (restRef.current) window.clearInterval(restRef.current);
    restRef.current = window.setInterval(() => {
      setRestLeft((s) => {
        if (s <= 1) {
          if (restRef.current) window.clearInterval(restRef.current);
          feedback("rest");
          setPhase("session");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleCompleteExercise = (exercise: Exercise) => {
    feedback("tick");
    setCompletedExercises((prev) => [...prev, exercise.id]);
    if (workout && currentIndex < workout.exercises.length - 1) {
      setCurrentIndex((i) => i + 1);
      startRest(parseRestSeconds(exercise.rest));
    } else if (workout) {
      finishSession(workout);
    }
  };

  const handleReset = () => {
    if (restRef.current) window.clearInterval(restRef.current);
    setPhase("select");
    setFocus(null);
    setLocation(null);
    setDuration(null);
    setWorkout(null);
    setCurrentIndex(0);
    setCompletedExercises([]);
    setLogged(false);
    setNote("");
    setLast(loadRecord().lastWorkout);
  };

  if (phase === "select") {
    return (
      <main className="relative min-h-full overflow-hidden pb-8 pt-5">
        <AmbientField intensity="strong" />
        <Container className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-livv-accent-soft">Physical capability</p>
              <h1 className="mt-2 text-[2.7rem] font-semibold leading-none tracking-[-0.04em]">Train</h1>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/45">
              Body // 01
            </div>
          </div>

          <section className="relative mt-7 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl">
            <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-livv-accent/10 blur-3xl" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Today&apos;s chamber</p>
              <h2 className="mt-3 max-w-[290px] text-2xl font-medium leading-tight tracking-tight">
                Put the body to work. Leave with proof.
              </h2>
              <p className="mt-3 max-w-[310px] text-sm leading-relaxed text-white/45">
                Choose the intent. LIVV builds the session, tracks the finish, and adds it to your evolution record.
              </p>

              {last && (
                <button
                  type="button"
                  onClick={repeatLast}
                  className="mt-6 flex w-full items-center justify-between rounded-2xl border border-livv-accent/20 bg-livv-accent/[0.08] px-4 py-3.5 text-left transition hover:bg-livv-accent/[0.12]"
                >
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-livv-accent-soft">Continue your rhythm</p>
                    <p className="mt-1 text-sm font-medium text-white/85">{last.name}</p>
                  </div>
                  <span className="text-lg text-livv-accent">↗</span>
                </button>
              )}
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">01 / Intent</p>
                <p className="mt-1 text-sm text-white/65">What are we building?</p>
              </div>
              <span className="text-[10px] text-white/25">{focus ? "LOCKED" : "SELECT ONE"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {FOCUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    feedback("tick");
                    setFocus(opt);
                  }}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
                    focus === opt
                      ? "border-livv-accent/60 bg-livv-accent/[0.13] shadow-[0_0_32px_rgba(255,255,255,0.05)]"
                      : "border-white/[0.08] bg-white/[0.035] hover:border-white/15 hover:bg-white/[0.055]"
                  )}
                >
                  {focus === opt && <span className="absolute right-3 top-3 text-xs text-livv-accent">●</span>}
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/30">Focus</span>
                  <span className="mt-2 block text-sm font-medium capitalize text-white/80">{choiceLabel(opt)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-7">
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">02 / Environment</p>
              <p className="mt-1 text-sm text-white/65">Where does the work happen?</p>
            </div>
            <div className="flex gap-2.5">
              {LOCATION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    feedback("tick");
                    setLocation(opt);
                  }}
                  className={cn(
                    "flex-1 rounded-2xl border px-3 py-4 text-left transition-all duration-300",
                    location === opt
                      ? "border-livv-accent/60 bg-livv-accent/[0.13]"
                      : "border-white/[0.08] bg-white/[0.035] hover:border-white/15"
                  )}
                >
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/30">Space</span>
                  <span className="mt-2 block text-sm font-medium capitalize text-white/80">{choiceLabel(opt)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-7">
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">03 / Time</p>
              <p className="mt-1 text-sm text-white/65">How much do you have?</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    feedback("tick");
                    setDuration(opt.value);
                  }}
                  className={cn(
                    "rounded-full border px-4 py-2.5 text-xs font-medium transition-all duration-300",
                    duration === opt.value
                      ? "border-livv-accent/60 bg-livv-accent/[0.13] text-white"
                      : "border-white/[0.08] bg-white/[0.035] text-white/55 hover:border-white/15"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <div className="mt-9">
            <Button
              variant="accent"
              size="lg"
              className="w-full shadow-[0_0_38px_rgba(255,255,255,0.08)]"
              disabled={!canGenerate}
              onClick={handleGenerate}
            >
              {canGenerate ? "Build My Session ↗" : "Complete the setup"}
            </Button>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-white/20">No equipment required</p>
          </div>
        </Container>
      </main>
    );
  }

  if (phase === "preview" && workout) {
    return (
      <main className="relative min-h-full overflow-hidden pb-8 pt-5">
        <AmbientField intensity="strong" />
        <Container className="relative z-10">
          <button onClick={() => setPhase("select")} className="mb-5 text-[11px] uppercase tracking-[0.2em] text-white/35 transition hover:text-white/70">
            ← Reconfigure
          </button>

          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.28em] text-livv-accent-soft">Session assembled</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">{workout.name}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {[workout.duration, workout.difficulty, workout.location].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/45">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-7 space-y-2.5">
            {workout.exercises.map((ex, i) => (
              <div key={ex.id} className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition hover:bg-white/[0.05]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-[10px] text-white/35">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white/85">{ex.name}</p>
                  <p className="mt-1 text-xs text-white/35">
                    {ex.sets && `${ex.sets} sets`}
                    {ex.reps && ` · ${ex.reps}`}
                    {ex.duration && ` · ${ex.duration}`}
                  </p>
                </div>
                <span className="text-[10px] text-white/25">{ex.rest} rest</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button variant="accent" size="lg" className="w-full" onClick={handleStart}>
              Enter Training Mode
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  if (phase === "rest" && workout) {
    const ratio = Math.max(0, Math.min(1, restLeft / 120));
    return (
      <main className="relative flex min-h-full flex-col items-center justify-center overflow-hidden pb-8 pt-5">
        <AmbientField intensity="strong" />
        <Container className="relative z-10">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.32em] text-livv-accent-soft">Recovery window</p>
            <div className="relative mx-auto mt-8 flex h-64 w-64 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.025] shadow-[0_0_100px_rgba(255,255,255,0.04)]">
              <div className="absolute inset-4 rounded-full border border-livv-accent/20" style={{ transform: `scale(${0.78 + ratio * 0.22})` }} />
              <div>
                <p className="text-[76px] font-semibold leading-none tracking-[-0.06em] text-white">{restLeft}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-white/30">seconds</p>
              </div>
            </div>
            <p className="mt-7 text-sm text-white/45">Breathe. Recover. The next rep is waiting.</p>
            <Button
              variant="secondary"
              className="mt-8"
              onClick={() => {
                if (restRef.current) window.clearInterval(restRef.current);
                setPhase("session");
              }}
            >
              Skip Recovery
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  if (phase === "session" && workout) {
    const current = workout.exercises[currentIndex];
    const progress = ((currentIndex + 1) / workout.exercises.length) * 100;
    const done = completedExercises.length;

    return (
      <main className="relative flex min-h-full flex-col overflow-hidden pb-8 pt-5">
        <AmbientField intensity="strong" />
        <Container className="relative z-10 flex flex-1 flex-col">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-livv-accent-soft">Training mode</p>
              <p className="mt-1 text-sm text-white/55">{workout.name}</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] text-white/35">{done} complete</span>
          </div>

          <div className="mt-7">
            <div className="mb-2 flex justify-between text-[10px] uppercase tracking-[0.18em] text-white/30">
              <span>Exercise {String(currentIndex + 1).padStart(2, "0")}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="h-full rounded-full bg-livv-accent transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center py-10">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.32em] text-white/25">Now</p>
              <h1 className="mt-5 text-[2.8rem] font-semibold leading-[0.95] tracking-[-0.045em] text-white">{current.name}</h1>
              <div className="mt-7 flex justify-center gap-2">
                {current.sets && <span className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">{current.sets} sets</span>}
                {current.reps && <span className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">{current.reps}</span>}
                {current.duration && <span className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">{current.duration}</span>}
              </div>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-white/25">Rest {current.rest} after</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="accent" size="lg" className="w-full shadow-[0_0_42px_rgba(255,255,255,0.08)]" onClick={() => handleCompleteExercise(current)}>
              Complete Exercise
            </Button>
            <Button variant="ghost" className="w-full text-white/30" onClick={handleReset}>
              End Session
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="relative min-h-full overflow-hidden pb-8 pt-5">
      <AmbientField intensity="strong" />
      {showMoment && (
        <Moment
          title="Session complete"
          subtitle={workout ? `${workout.name} is on the record` : undefined}
          onDone={() => setShowMoment(false)}
        />
      )}
      <Container className="relative z-10">
        <div className="pt-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-livv-accent/30 bg-livv-accent/[0.08] text-2xl text-livv-accent shadow-[0_0_50px_rgba(255,255,255,0.07)]">
            ✓
          </div>
          <p className="mt-7 text-[10px] uppercase tracking-[0.32em] text-livv-accent-soft">Proof added</p>
          <h1 className="mt-3 text-4xl font-semibold leading-none tracking-[-0.04em]">Session Complete</h1>
          <p className="mt-3 text-sm text-white/40">{workout?.name} · {completedExercises.length} exercises</p>

          <div className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 text-left backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/25">Leave a trace</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How did it feel? One line is enough."
              rows={3}
              className="mt-3 w-full resize-none rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-livv-accent/30"
            />
          </div>

          <div className="mt-7 space-y-3">
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={() => {
                if (note.trim() && workout) {
                  try {
                    const notes = JSON.parse(window.localStorage.getItem("livv-session-notes") || "[]");
                    notes.unshift({ at: Date.now(), name: workout.name, note: note.trim() });
                    window.localStorage.setItem("livv-session-notes", JSON.stringify(notes.slice(0, 30)));
                  } catch {
                    // ignore
                  }
                }
                handleReset();
              }}
            >
              Train Again
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => (window.location.href = "/home/progress")}>
              See Your Evolution
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
