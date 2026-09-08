"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/page-hero";
import { LOCATION_OPTIONS, DURATION_OPTIONS, generateWorkout, type Focus, type Location, type Duration, type Workout, type Exercise } from "@/lib/train-data";
import { FOCUS_COLOR, LOCATION_COLOR, DURATION_COLOR, chipStyle, SPLITS, loadActiveSplit, saveActiveSplit, type SplitId, type SplitDay } from "@/lib/train-colors";
import { activityFromWorkout } from "@/lib/activity";
import { completeWorkout, loadRecord, type LastWorkout } from "@/lib/record";
import { feedback } from "@/lib/sensory";
import { Moment } from "@/components/ui/moment";

type Phase = "select" | "preview" | "session" | "rest" | "complete";
const FULL_KEY = "livv-last-workout-full";

function saveFullWorkout(w: Workout) {
  try { window.localStorage.setItem(FULL_KEY, JSON.stringify(w)); } catch {}
}

function loadFullWorkout(): Workout | null {
  try {
    const raw = window.localStorage.getItem(FULL_KEY);
    return raw ? JSON.parse(raw) as Workout : null;
  } catch { return null; }
}

function parseRestSeconds(rest: string) {
  const n = parseInt(rest, 10);
  return Number.isFinite(n) ? Math.min(120, Math.max(15, n)) : 40;
}

function todayCode() {
  return ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date().getDay()];
}

export default function TrainPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [splitId, setSplitId] = useState<SplitId | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
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
    const saved = loadActiveSplit();
    if (saved) {
      const next = SPLITS.find((s) => s.id === saved);
      if (next) {
        setSplitId(saved);
        const code = todayCode();
        const today = next.days.find((d) => d.day === code && !d.rest);
        setSelectedDayId(today?.id || next.days.find((d) => !d.rest)?.id || null);
      }
    }
    return () => { if (restRef.current) window.clearInterval(restRef.current); };
  }, []);

  const split = SPLITS.find((s) => s.id === splitId) || null;
  const selectedDay = split?.days.find((d) => d.id === selectedDayId) || null;
  const focus: Focus | null = selectedDay?.focus || null;
  const canGenerate = Boolean(split && selectedDay && !selectedDay.rest && focus && location && duration);

  const chooseSplit = (id: SplitId) => {
    const next = SPLITS.find((s) => s.id === id);
    if (!next) return;
    feedback("tick");
    setSplitId(id);
    saveActiveSplit(id);
    const code = todayCode();
    const today = next.days.find((d) => d.day === code && !d.rest);
    setSelectedDayId(today?.id || next.days.find((d) => !d.rest)?.id || null);
  };

  const handleGenerate = () => {
    if (!selectedDay || !focus || !location || !duration) return;
    feedback("tick");
    const generated = generateWorkout(focus, location, duration);
    generated.name = `${selectedDay.label} · ${generated.name}`;
    setWorkout(generated);
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
      activityFromWorkout({ workoutName: w.name, focus: w.focus, location: w.location, duration: w.duration, difficulty: w.difficulty, exerciseCount: w.exercises.length });
      completeWorkout({ name: w.name, focus: w.focus, duration: w.duration, exercises: w.exercises.length });
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
    setSplitId(null);
    setSelectedDayId(null);
    setLocation(null);
    setDuration(null);
    setWorkout(null);
    setCurrentIndex(0);
    setCompletedExercises([]);
    setLogged(false);
    setNote("");
    setLast(loadRecord().lastWorkout);
  };

  if (phase === "select") return (
    <main className="livv-page relative min-h-full overflow-hidden pb-10 pt-5">
      <Container className="relative z-10">
        <PageHero
          eyebrow="Physical capability"
          title="Train"
          subtitle="Build the week first. Then run the session."
          accent="#ff6b91"
        />

        <section className="livv-glass relative mt-7 overflow-hidden rounded-[32px] p-6">
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-livv-accent/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Training chamber</p>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-accent">Build your week</span>
            </div>
            <h2 className="mt-5 max-w-[320px] text-[2rem] font-medium leading-[1.02] tracking-tight">Your workout is one session. Your split is the system.</h2>
            <p className="mt-4 max-w-[330px] text-sm leading-relaxed text-white/45">Choose how your week is divided first. Then pick the day, place, and time. LIVV builds the workout inside that structure.</p>
            {last && <button type="button" onClick={repeatLast} className="mt-6 flex w-full items-center justify-between rounded-2xl border border-livv-accent/20 bg-livv-accent/[0.08] px-4 py-3.5 text-left">
              <div><p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-livv-accent-soft">Continue rhythm</p><p className="mt-1 text-sm font-medium text-white/85">{last.name} · {last.duration}</p></div>
              <span className="text-xl text-livv-accent">↗</span>
            </button>}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <div><p className="text-[10px] uppercase tracking-[0.28em] text-white/35">01 / Choose your split</p><p className="mt-1 text-sm text-white/65">The split decides what gets trained each day.</p></div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">{split ? "ACTIVE" : "SELECT"}</span>
          </div>
          <div className="space-y-2.5">
            {SPLITS.map((s) => {
              const on = splitId === s.id;
              return <button key={s.id} type="button" onClick={() => chooseSplit(s.id)} className="w-full rounded-[22px] border p-4 text-left transition-all duration-300" style={chipStyle(s.color, on)}>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: s.color, boxShadow: `0 0 16px ${s.color}` }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{s.name}</p><span className="text-[9px] uppercase tracking-[0.18em] opacity-40">{s.days.filter((d) => !d.rest).length} training days</span></div>
                    <p className="mt-1 text-[12px] leading-relaxed opacity-65">{s.line}</p>
                  </div>
                </div>
                {on && <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-white/55">{s.detail}</p>}
              </button>;
            })}
          </div>
        </section>

        {split && <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <div><p className="text-[10px] uppercase tracking-[0.28em] text-white/35">02 / Your week</p><p className="mt-1 text-sm text-white/65">Tap a day. The exercises come later.</p></div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-white/35">Reusable</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {split.days.map((day) => {
              const on = selectedDayId === day.id;
              const hex = day.rest ? "#6B7280" : (day.focus ? FOCUS_COLOR[day.focus] : split.color);
              return <button key={day.id} type="button" onClick={() => { feedback("tick"); setSelectedDayId(day.id); }} className="relative min-h-[116px] overflow-hidden rounded-[22px] border p-4 text-left transition-all duration-300" style={chipStyle(hex, on)}>
                <div className="flex items-center justify-between"><span className="text-[9px] font-semibold uppercase tracking-[0.24em] opacity-45">{day.day}</span><span className="h-2 w-2 rounded-full" style={{ background: hex, boxShadow: `0 0 12px ${hex}` }} /></div>
                <p className="mt-4 text-base font-semibold">{day.label}</p>
                <p className="mt-1 text-[10px] leading-relaxed opacity-55">{day.muscles}</p>
                {on && <span className="absolute bottom-3 right-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/65">Selected</span>}
              </button>;
            })}
          </div>
          {selectedDay && <div className="mt-3 rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center justify-between"><p className="text-[9px] uppercase tracking-[0.24em] text-white/30">Selected mission</p><p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: split.color }}>{selectedDay.day}</p></div>
            <p className="mt-2 text-lg font-medium">{selectedDay.label}</p>
            <p className="mt-1 text-xs text-white/40">{selectedDay.muscles}</p>
            {selectedDay.rest && <p className="mt-3 text-xs text-white/35">Recovery is part of the split. Choose a training day when you are ready to build a session.</p>}
          </div>}
        </section>}

        {split && selectedDay && !selectedDay.rest && <>
          <section className="mt-8">
            <div className="mb-4"><p className="text-[10px] uppercase tracking-[0.28em] text-white/35">03 / Place</p><p className="mt-1 text-sm text-white/65">Where are you training?</p></div>
            <div className="flex gap-2.5">{LOCATION_OPTIONS.map((opt) => { const hex = LOCATION_COLOR[opt]; const on = location === opt; return <button key={opt} type="button" onClick={() => { feedback("tick"); setLocation(opt); }} className="flex-1 rounded-2xl border px-3 py-4 text-left transition-all duration-300" style={chipStyle(hex, on)}><span className="text-sm font-semibold">{opt}</span></button>; })}</div>
          </section>
          <section className="mt-7">
            <div className="mb-4"><p className="text-[10px] uppercase tracking-[0.28em] text-white/35">04 / Time</p><p className="mt-1 text-sm text-white/65">How long do you have?</p></div>
            <div className="flex flex-wrap gap-2">{DURATION_OPTIONS.map((opt) => { const hex = DURATION_COLOR[opt.value]; const on = duration === opt.value; return <button key={opt.value} type="button" onClick={() => { feedback("tick"); setDuration(opt.value); }} className="rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-300" style={chipStyle(hex, on)}>{opt.label}</button>; })}</div>
          </section>
        </>}

        <div className="mt-9">
          <button type="button" disabled={!canGenerate} onClick={handleGenerate} className={"w-full rounded-full py-4 text-sm font-semibold transition " + (canGenerate ? "livv-breathe bg-white text-black" : "bg-white/10 text-white/30")} style={canGenerate ? { boxShadow: "0 0 36px rgba(255,255,255,0.45), 0 0 80px rgb(var(--livv-accent) / 0.35)" } : undefined}>
            {canGenerate ? `Build ${selectedDay?.label} workout` : split ? "Choose a training day" : "Choose a split to begin"}
          </button>
        </div>
      </Container>
    </main>
  );

  if (phase === "preview" && workout) return (
    <main className="relative min-h-full overflow-hidden pb-10 pt-5"><Container className="relative z-10">
      <button type="button" onClick={() => setPhase("select")} className="mb-5 text-[10px] uppercase tracking-[0.22em] text-white/35">← Reconfigure week</button>
      <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.28em] text-livv-accent-soft">Session assembled</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">{workout.name}</h1>
        {split && selectedDay && <p className="mt-2 text-sm text-white/40">{split.name} · {selectedDay.day} · {selectedDay.muscles}</p>}
        <div className="mt-4 flex flex-wrap gap-2">{[workout.duration, workout.difficulty, workout.location].map((item) => <span key={item} className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/45">{item}</span>)}</div>
      </div>
      <div className="mt-7 space-y-2.5">{workout.exercises.map((ex, i) => <div key={ex.id} className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-[10px] text-white/30">{String(i + 1).padStart(2, "0")}</div><div className="min-w-0 flex-1"><p className="font-medium text-white/85">{ex.name}</p><p className="mt-1 text-xs text-white/35">{ex.sets && `${ex.sets} sets`}{ex.reps && ` · ${ex.reps}`}{ex.duration && ` · ${ex.duration}`}</p></div><span className="text-[10px] text-white/25">{ex.rest} rest</span></div>)}</div>
      <div className="mt-8"><Button variant="accent" size="lg" className="w-full" onClick={handleStart}>Enter Training Mode</Button></div>
    </Container></main>
  );

  if (phase === "rest" && workout) {
    const maxRest = 120;
    const pct = Math.round((restLeft / maxRest) * 100);
    return <main className="relative flex min-h-full flex-col items-center justify-center overflow-hidden pb-10"><Container className="relative z-10"><div className="text-center"><p className="text-[10px] uppercase tracking-[0.32em] text-livv-accent-soft">Recovery window</p><div className="mx-auto mt-7 flex h-56 w-56 items-center justify-center rounded-full border border-white/10 bg-white/[0.025]" style={{ background: `conic-gradient(rgb(255 255 255 / .8) ${pct}%, rgb(255 255 255 / .05) ${pct}%)` }}><div className="flex h-48 w-48 flex-col items-center justify-center rounded-full bg-[#090909]"><span className="text-6xl font-semibold tracking-tight">{restLeft}</span><span className="mt-1 text-[9px] uppercase tracking-[0.3em] text-white/30">seconds</span></div></div><p className="mt-7 text-lg font-medium">Breathe. Reset. Go again.</p><p className="mt-2 text-sm text-white/35">Next movement is waiting.</p><Button variant="secondary" className="mt-8" onClick={() => { if (restRef.current) window.clearInterval(restRef.current); setPhase("session"); }}>Skip recovery</Button></div></Container></main>;
  }

  if (phase === "session" && workout) {
    const current = workout.exercises[currentIndex];
    const progress = ((currentIndex + 1) / workout.exercises.length) * 100;
    return <main className="relative flex min-h-full flex-col overflow-hidden pb-8 pt-5"><Container className="relative z-10 flex flex-1 flex-col"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Training mode</p><p className="mt-1 text-xs text-white/45">{workout.name}</p></div><span className="text-[10px] uppercase tracking-[0.2em] text-livv-accent">{currentIndex + 1}/{workout.exercises.length}</span></div><div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-livv-accent transition-all duration-500" style={{ width: `${progress}%` }} /></div><div className="flex flex-1 flex-col justify-center py-8"><div className="text-center"><p className="text-[10px] uppercase tracking-[0.35em] text-livv-accent-soft">Now</p><h1 className="mt-4 text-[2.7rem] font-semibold leading-[.98] tracking-[-0.05em]">{current.name}</h1><div className="mx-auto mt-7 h-px w-16 bg-white/15" /><p className="mt-6 text-lg text-white/60">{current.sets && `${current.sets} sets`}{current.reps && ` · ${current.reps}`}{current.duration && ` · ${current.duration}`}</p><p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/25">Rest {current.rest} after</p></div></div><div className="space-y-3"><Button variant="accent" size="lg" className="h-14 w-full text-base" onClick={() => handleCompleteExercise(current)}>Mark Exercise Complete ✓</Button><Button variant="ghost" className="w-full" onClick={handleReset}>End Training</Button></div></Container></main>;
  }

  return <main className="relative min-h-full overflow-hidden pb-10 pt-5">{showMoment && <Moment title="Training complete" subtitle={workout ? `${workout.name} added to your evolution record` : undefined} onDone={() => setShowMoment(false)} />}<Container className="relative z-10"><div className="pt-6 text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-livv-accent/40 bg-livv-accent/10 text-2xl shadow-[0_0_45px_rgba(255,255,255,0.08)]">✓</div><p className="mt-7 text-[10px] uppercase tracking-[0.32em] text-livv-accent-soft">Proof added</p><h1 className="mt-3 text-[2.7rem] font-semibold leading-none tracking-[-0.05em]">Session complete.</h1><p className="mt-4 text-sm text-white/40">{workout?.name} · {completedExercises.length} exercises</p><div className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 text-left"><p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Session note</p><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="How did it feel?" className="mt-2 min-h-[80px] w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none placeholder:text-white/25" /></div><div className="mt-8 space-y-3"><Button variant="accent" size="lg" className="w-full" onClick={() => { handleReset(); }}>Train Again</Button><Button variant="secondary" className="w-full" onClick={() => window.location.href = "/home/progress"}>View Evolution ↗</Button></div></div></Container></main>;
}
