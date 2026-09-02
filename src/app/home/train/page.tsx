"use client";

import { useEffect, useState } from "react";
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

type Phase = "select" | "preview" | "session" | "complete";

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

  useEffect(() => {
    setLast(loadRecord().lastWorkout);
  }, []);

  const canGenerate = focus && location && duration;

  const handleGenerate = () => {
    if (!focus || !location || !duration) return;
    setWorkout(generateWorkout(focus, location, duration));
    setPhase("preview");
  };

  const handleStart = () => {
    setCurrentIndex(0);
    setCompletedExercises([]);
    setLogged(false);
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
      setLogged(true);
    }
    setPhase("complete");
  };

  const handleCompleteExercise = (exercise: Exercise) => {
    setCompletedExercises((prev) => [...prev, exercise.id]);
    if (workout && currentIndex < workout.exercises.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (workout) {
      finishSession(workout);
    }
  };

  const handleReset = () => {
    setPhase("select");
    setFocus(null);
    setLocation(null);
    setDuration(null);
    setWorkout(null);
    setCurrentIndex(0);
    setCompletedExercises([]);
    setLogged(false);
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
            <div className="mt-6 rounded-2xl border border-livv-border bg-livv-surface px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Last session</p>
              <p className="mt-1 text-sm font-medium">
                {last.name} · {last.duration}
              </p>
            </div>
          )}

          <section className="mt-8">
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">Focus</p>
            <div className="grid grid-cols-2 gap-2">
              {FOCUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFocus(opt)}
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
                  onClick={() => setLocation(opt)}
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
                  onClick={() => setDuration(opt.value)}
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
              <div className="h-full bg-livv-accent transition-all" style={{ width: `${progress}%` }} />
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
      <Container>
        <div className="pt-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-livv-accent/40 bg-livv-accent/10">
            ✓
          </div>
          <h1 className="text-4xl font-semibold leading-none tracking-tight">Session Complete</h1>
          <p className="mt-3 text-sm text-livv-muted">
            {workout?.name} · {completedExercises.length} exercises
          </p>
          <p className="mt-3 text-xs text-livv-accent-soft">Written to your record</p>
          <div className="mt-10 space-y-3">
            <Button variant="accent" size="lg" className="w-full" onClick={handleReset}>
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
