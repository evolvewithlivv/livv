"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
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

  const canGenerate = focus && location && duration;

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
      if (note.trim()) {
        try {
          const notes = JSON.parse(window.localStorage.getItem("livv-session-notes") || "[]");
          notes.unshift({ at: Date.now(), name: w.name, note: note.trim() });
          window.localStorage.setItem("livv-session-notes", JSON.stringify(notes.slice(0, 30)));
        } catch {
          // ignore
        }
      }
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
      <main className="pt-8 pb-4">
        <Container>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-livv-muted">Body</p>
          <h1 className="mt-2 text-[2.4rem] font-semibold leading-none tracking-tight">Train</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/45">
            Build a session. Finish it. It writes to your record.
          </p>

          {last && (
            <button
              type="button"
              onClick={repeatLast}
              className="mt-6 w-full rounded-2xl border border-livv-accent/30 bg-livv-accent/10 px-4 py-4 text-left"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-livv-accent-soft">
                Repeat last
              </p>
              <p className="mt-1 text-sm font-medium">
                {last.name} · {last.duration}
              </p>
            </button>
          )}

          <section className="mt-8">
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">Focus</p>
            <div className="grid grid-cols-2 gap-2">
              {FOCUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    feedback("tick");
                    setFocus(opt);
                  }}
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-left text-sm",
                    focus === opt
                      ? "border-livv-accent bg-livv-accent/15 text-white"
                      : "border-livv-border bg-livv-surface text-white/70"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-7">
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">Location</p>
            <div className="flex gap-2">
              {LOCATION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    feedback("tick");
                    setLocation(opt);
                  }}
                  className={cn(
                    "flex-1 rounded-2xl border py-3 text-sm",
                    location === opt
                      ? "border-livv-accent bg-livv-accent/15 text-white"
                      : "border-livv-border bg-livv-surface text-white/70"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-7">
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">Duration</p>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    feedback("tick");
                    setDuration(opt.value);
                  }}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm",
                    duration === opt.value
                      ? "border-livv-accent bg-livv-accent/15 text-white"
                      : "border-livv-border bg-livv-surface text-white/70"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <div className="mt-10">
            <Button variant="accent" size="lg" className="w-full" disabled={!canGenerate} onClick={handleGenerate}>
              Generate Workout
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  if (phase === "preview" && workout) {
    return (
      <main className="pt-8 pb-4">
        <Container>
          <button onClick={() => setPhase("select")} className="mb-6 text-sm text-livv-muted">
            ← Change selections
          </button>
          <div className="rounded-3xl border border-livv-border bg-livv-surface p-5">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">{workout.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-livv-muted">{workout.duration}</span>
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-livv-muted">{workout.difficulty}</span>
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-livv-muted">{workout.location}</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {workout.exercises.map((ex, i) => (
              <div key={ex.id} className="rounded-2xl border border-livv-border bg-livv-surface p-4">
                <p className="text-xs text-livv-muted">{i + 1}</p>
                <p className="font-medium">{ex.name}</p>
                <p className="mt-1 text-sm text-livv-muted">
                  {ex.sets && `${ex.sets} sets`}
                  {ex.reps && ` · ${ex.reps}`}
                  {ex.duration && ` · ${ex.duration}`}
                  {` · Rest ${ex.rest}`}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Button variant="accent" size="lg" className="w-full" onClick={handleStart}>
              Start Workout
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  if (phase === "rest" && workout) {
    return (
      <main className="flex min-h-[70dvh] flex-col items-center justify-center pt-6 pb-4">
        <Container>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-livv-muted">Rest</p>
            <p className="mt-4 text-[72px] font-semibold leading-none tracking-tight text-livv-accent">
              {restLeft}
            </p>
            <p className="mt-3 text-sm text-white/45">Next up in a few breaths</p>
            <Button
              variant="secondary"
              className="mt-10"
              onClick={() => {
                if (restRef.current) window.clearInterval(restRef.current);
                setPhase("session");
              }}
            >
              Skip rest
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  if (phase === "session" && workout) {
    const current = workout.exercises[currentIndex];
    const progress = (currentIndex / workout.exercises.length) * 100;
    return (
      <main className="flex min-h-[70dvh] flex-col pt-6 pb-4">
        <Container className="flex flex-1 flex-col">
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-xs text-livv-muted">
              <span>
                Exercise {currentIndex + 1} of {workout.exercises.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-livv-border">
              <div className="h-full bg-livv-accent transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <div className="rounded-3xl border border-livv-border bg-livv-surface p-6 text-center">
              <p className="text-[11px] uppercase tracking-[0.22em] text-livv-muted">Now</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">{current.name}</h2>
              <p className="mt-4 text-lg text-livv-accent-soft">
                {current.sets && `${current.sets} sets`}
                {current.reps && ` · ${current.reps}`}
                {current.duration && ` · ${current.duration}`}
              </p>
              <p className="mt-2 text-sm text-livv-muted">Rest {current.rest} after</p>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            <Button variant="accent" size="lg" className="w-full" onClick={() => handleCompleteExercise(current)}>
              Complete Exercise
            </Button>
            <Button variant="ghost" className="w-full" onClick={handleReset}>
              End Session
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="pt-8 pb-4">
      {showMoment && (
        <Moment
          title="Session complete"
          subtitle={workout ? `${workout.name} is on the record` : undefined}
          onDone={() => setShowMoment(false)}
        />
      )}
      <Container>
        <div className="pt-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-livv-accent/40 bg-livv-accent/10">
            ✓
          </div>
          <h1 className="text-4xl font-semibold leading-none tracking-tight">Session Complete</h1>
          <p className="mt-3 text-sm text-livv-muted">
            {workout?.name} · {completedExercises.length} exercises
          </p>

          <div className="mt-8 text-left">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Session note</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How did it feel. One line is enough."
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-livv-border bg-livv-surface px-4 py-3 text-sm outline-none"
            />
          </div>

          <div className="mt-8 space-y-3">
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
              See Progress
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
