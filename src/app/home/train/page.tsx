"use client";

import { useState } from "react";
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

type Phase = "select" | "preview" | "session" | "complete";

export default function TrainPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [focus, setFocus] = useState<Focus | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [activityLogged, setActivityLogged] = useState(false);

  const canGenerate = focus && location && duration;

  const handleGenerate = () => {
    if (!focus || !location || !duration) return;
    const w = generateWorkout(focus, location, duration);
    setWorkout(w);
    setPhase("preview");
  };

  const handleStart = () => {
    setCurrentIndex(0);
    setCompletedExercises([]);
    setActivityLogged(false);
    setPhase("session");
  };

  const handleCompleteExercise = (exercise: Exercise) => {
    setCompletedExercises((prev) => [...prev, exercise.id]);
    if (workout && currentIndex < workout.exercises.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      if (workout && !activityLogged) {
        activityFromWorkout({
          workoutName: workout.name,
          focus: workout.focus,
          location: workout.location,
          duration: workout.duration,
          difficulty: workout.difficulty,
          exerciseCount: workout.exercises.length,
        });
        setActivityLogged(true);
      }
      setPhase("complete");
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
    setActivityLogged(false);
  };

  if (phase === "select") {
    return (
      <main className="pt-8 pb-4">
        <Container>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-livv-muted">
            Body
          </p>
          <h1 className="mt-2 font-display text-[2.4rem] leading-none">Train</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/45">
            Build a session that fits your day.
          </p>

          <section className="mt-8">
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">
              Focus
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FOCUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFocus(opt)}
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-left text-sm transition-all",
                    focus === opt
                      ? "border-livv-accent bg-livv-accent/15 text-white"
                      : "border-livv-border bg-livv-surface text-white/70 hover:border-white/20"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-7">
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">
              Location
            </p>
            <div className="flex gap-2">
              {LOCATION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLocation(opt)}
                  className={cn(
                    "flex-1 rounded-2xl border py-3 text-sm transition-all",
                    location === opt
                      ? "border-livv-accent bg-livv-accent/15 text-white"
                      : "border-livv-border bg-livv-surface text-white/70 hover:border-white/20"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-7">
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">
              Duration
            </p>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-all",
                    duration === opt.value
                      ? "border-livv-accent bg-livv-accent/15 text-white"
                      : "border-livv-border bg-livv-surface text-white/70 hover:border-white/20"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <div className="mt-10">
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              disabled={!canGenerate}
              onClick={handleGenerate}
            >
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
          <button
            onClick={() => setPhase("select")}
            className="mb-6 text-sm text-livv-muted hover:text-white"
          >
            ← Change selections
          </button>

          <div className="rounded-3xl border border-livv-border bg-livv-surface p-5">
            <h1 className="font-display text-3xl leading-tight tracking-tight">{workout.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-livv-muted">
                {workout.duration}
              </span>
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-livv-muted">
                {workout.difficulty}
              </span>
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-livv-muted">
                {workout.location}
              </span>
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-livv-muted">
                {workout.focus}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-livv-muted">
              Exercises
            </p>
            {workout.exercises.map((ex, i) => (
              <div
                key={ex.id}
                className="rounded-2xl border border-livv-border bg-livv-surface p-4"
              >
                <p className="mb-0.5 text-xs text-livv-muted">{i + 1}. Exercise</p>
                <p className="font-medium">{ex.name}</p>
                <p className="mt-1 text-sm text-livv-muted">
                  {ex.sets && `${ex.sets} sets`}
                  {ex.reps && ` · ${ex.reps} reps`}
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
              <div
                className="h-full bg-livv-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center">
            <div className="rounded-3xl border border-livv-border bg-livv-surface p-6 text-center">
              <p className="text-[11px] uppercase tracking-[0.22em] text-livv-muted">
                Current
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight">
                {current.name}
              </h2>
              <p className="mt-4 text-lg text-livv-accent-soft">
                {current.sets && `${current.sets} sets`}
                {current.reps && ` · ${current.reps}`}
                {current.duration && ` · ${current.duration}`}
              </p>
              <p className="mt-2 text-sm text-livv-muted">
                Rest {current.rest} after
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={() => handleCompleteExercise(current)}
            >
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
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="font-display text-4xl leading-none">Session Complete</h1>
          <p className="mt-3 text-sm text-livv-muted">
            {workout?.name} · {completedExercises.length} exercises
          </p>
          <p className="mt-3 text-xs text-livv-accent-soft">
            Activity logged to your profile
          </p>

          <div className="mt-10 space-y-3">
            <Button variant="accent" size="lg" className="w-full" onClick={handleReset}>
              Train Again
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => (window.location.href = "/home/profile")}
            >
              View Activity
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
