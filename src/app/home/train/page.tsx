"use client";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/layout/page-hero";
import { LOCATION_OPTIONS, DURATION_OPTIONS, generateWorkout, type Focus, type Location, type Duration, type Workout, type Exercise } from "@/lib/train-data";
import { FOCUS_COLOR, LOCATION_COLOR, DURATION_COLOR, SPLITS, chipStyle, loadActiveSplit, saveActiveSplit, type SplitId } from "@/lib/train-colors";
import { activityFromWorkout } from "@/lib/activity";
import { completeWorkout, loadRecord, type LastWorkout } from "@/lib/record";
import { feedback } from "@/lib/sensory";

type Phase = "select" | "preview" | "session" | "complete";
type WorkoutHistoryItem = { name: string; focus: string; duration: string; exercises: number; at: number };
const FULL_KEY = "livv-last-workout-full";
const HISTORY_KEY = "livv-workout-history-v1";
function saveFullWorkout(w: Workout) { try { window.localStorage.setItem(FULL_KEY, JSON.stringify(w)); } catch {} }
function loadFullWorkout(): Workout | null { try { const raw = window.localStorage.getItem(FULL_KEY); return raw ? JSON.parse(raw) as Workout : null; } catch { return null; } }
function loadHistory(): WorkoutHistoryItem[] { try { const raw = window.localStorage.getItem(HISTORY_KEY); return raw ? JSON.parse(raw) as WorkoutHistoryItem[] : []; } catch { return []; } }
function todayCode() { return ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date().getDay()]; }
function exerciseCue(ex: Exercise) { const n = ex.name.toLowerCase(); if (n.includes("push-up") || n.includes("press")) return "Keep your ribs down, brace your core, and control the lowering phase."; if (n.includes("squat") || n.includes("lunge") || n.includes("thrust") || n.includes("bridge") || n.includes("deadlift")) return "Move with control, keep your knee tracking over your foot, and finish the rep fully."; if (n.includes("plank") || n.includes("hold") || n.includes("dead bug") || n.includes("twist")) return "Brace first. Breathe steadily. Stop the set if you lose clean control."; if (n.includes("row") || n.includes("pull") || n.includes("curl")) return "Keep your shoulders controlled and pull with the target muscles instead of swinging."; return "Use a controlled pace and clean range of motion. Quality reps beat rushed reps."; }

export default function TrainPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [focus, setFocus] = useState<Focus>("full");
  const [location, setLocation] = useState<Location>("home");
  const [duration, setDuration] = useState<Duration>("30");
  const [split, setSplit] = useState<SplitId>(() => loadActiveSplit());
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [idx, setIdx] = useState(0);
  const [rest, setRest] = useState(0);
  const [logged, setLogged] = useState(false);
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [last, setLast] = useState<LastWorkout | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    setLast(loadRecord().lastWorkout ?? null);
    const saved = loadFullWorkout();
    if (saved) setWorkout(saved);
  }, []);

  useEffect(() => {
    if (rest <= 0) {
      if (timer.current) window.clearInterval(timer.current);
      return;
    }
    timer.current = window.setInterval(() => setRest((r) => Math.max(0, r - 1)), 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [rest > 0]);

  const startPreview = () => {
    feedback("tick");
    const w = generateWorkout({ focus, location, duration, split });
    setWorkout(w);
    saveFullWorkout(w);
    setPhase("preview");
  };

  const beginSession = () => {
    feedback("tick");
    setIdx(0);
    setRest(0);
    setPhase("session");
  };

  const nextExercise = () => {
    if (!workout) return;
    feedback("tick");
    if (idx >= workout.exercises.length - 1) {
      finish();
      return;
    }
    setIdx((i) => i + 1);
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
      focus: workout.focus,
      duration: workout.duration,
      exercises: workout.exercises.length,
    });
    try {
      const item: WorkoutHistoryItem = {
        name: workout.name,
        focus: String(workout.focus),
        duration: String(workout.duration),
        exercises: workout.exercises.length,
        at: Date.now(),
      };
      const next = [item, ...loadHistory()].slice(0, 20);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      setHistory(next);
    } catch {}
    setLogged(true);
    setPhase("complete");
  };

  if (phase === "select") {
    return (
      <main className="livv-page min-h-full overflow-hidden pb-28 pt-5">
        <Container className="livv-stagger relative z-10">
          <PageHero eyebrow="Train" title="Build the session." subtitle="Pick focus, place, and time. Then execute." />
          <div className="mt-6 space-y-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">Focus</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["full", "push", "pull", "legs", "core"] as Focus[]).map((f) => (
                  <button key={f} type="button" onClick={() => { setFocus(f); feedback("tick"); }} className="livv-press rounded-full border px-4 py-2.5 text-[12px] font-semibold" style={chipStyle(FOCUS_COLOR[f], focus === f)}>{f}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">Location</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {LOCATION_OPTIONS.map((l) => (
                  <button key={l.id} type="button" onClick={() => { setLocation(l.id); feedback("tick"); }} className="livv-press rounded-full border px-4 py-2.5 text-[12px] font-semibold" style={chipStyle(LOCATION_COLOR[l.id], location === l.id)}>{l.label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">Duration</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button key={d.id} type="button" onClick={() => { setDuration(d.id); feedback("tick"); }} className="livv-press rounded-full border px-4 py-2.5 text-[12px] font-semibold" style={chipStyle(DURATION_COLOR[d.id], duration === d.id)}>{d.label}</button>
                ))}
              </div>
            </div>
            <button type="button" onClick={startPreview} className="livv-press mt-9 w-full rounded-full py-4 text-[14px] font-semibold" style={{ background: "rgb(var(--livv-ink))", color: "var(--livv-bg)" }}>Generate workout</button>
          </div>
        </Container>
      </main>
    );
  }

  if (phase === "preview" && workout) {
    return (
      <main className="livv-page min-h-full overflow-hidden pb-28 pt-5">
        <Container className="livv-stagger relative z-10">
          <PageHero eyebrow="Preview" title={workout.name} subtitle={`${workout.exercises.length} movements · ${workout.duration} min`} />
          <ul className="mt-6 space-y-3">
            {workout.exercises.map((ex, i) => (
              <li key={i} className="rounded-2xl border border-livv-border px-4 py-3">
                <p className="text-[14px] font-semibold">{ex.name}</p>
                <p className="mt-1 text-[12px] text-livv-muted">{ex.sets} × {ex.reps}</p>
              </li>
            ))}
          </ul>
          <button type="button" onClick={beginSession} className="livv-press mt-9 w-full rounded-full py-4 text-[14px] font-semibold" style={{ background: "rgb(var(--livv-ink))", color: "var(--livv-bg)" }}>Start session</button>
          <button type="button" onClick={() => setPhase("select")} className="livv-press mt-3 min-h-11 w-full rounded-full border border-livv-border px-4 text-[11px]">Back</button>
        </Container>
      </main>
    );
  }

  if (phase === "session" && workout) {
    const ex = workout.exercises[idx];
    const progress = ((idx + 1) / workout.exercises.length) * 100;
    return (
      <main className="livv-page min-h-full overflow-hidden pb-28 pt-5">
        <Container className="relative z-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">Exercise {idx + 1} / {workout.exercises.length}</p>
          <h1 className="font-display mt-2 text-[28px] font-semibold tracking-tight">{ex.name}</h1>
          <p className="mt-2 text-[14px] text-livv-muted">{ex.sets} sets · {ex.reps}</p>
          <p className="mt-4 text-[13px] leading-relaxed text-livv-muted">{exerciseCue(ex)}</p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,rgb(var(--livv-ink))_8%,transparent)]">
            <div className="h-full rounded-full bg-[#1769ff] transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
          {rest > 0 ? (
            <p className="mt-6 text-center text-[24px] font-semibold tabular-nums">Rest {rest}s</p>
          ) : (
            <button type="button" onClick={nextExercise} className="livv-press mt-9 w-full rounded-full py-4 text-[14px] font-semibold" style={{ background: "rgb(var(--livv-ink))", color: "var(--livv-bg)" }}>{idx >= workout.exercises.length - 1 ? "Finish" : "Next"}</button>
          )}
        </Container>
      </main>
    );
  }

  return (
    <main className="livv-page min-h-full overflow-hidden pb-10 pt-5">
      <Container>
        <div className="border-y border-livv-border py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1769ff]">Workout complete</p>
          <h1 className="font-display mt-2 text-[30px] font-semibold">Good work.</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-livv-muted">{workout?.name || "Your workout"} is logged.</p>
          <p className="mt-4 text-[11px] leading-relaxed text-livv-muted">The session is now part of your history. Keep the next session slightly better, not simply longer.</p>
        </div>
        <button type="button" onClick={() => { setPhase("select"); setWorkout(null); setLogged(false); setRest(0); }} className="livv-press mt-6 w-full rounded-full bg-[rgb(var(--livv-ink))] py-4 text-[14px] font-semibold text-[var(--livv-bg)]">Back to Train</button>
      </Container>
    </main>
  );
}
