"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Brain, ChevronLeft, Pause, Play, RotateCcw, Wind } from "lucide-react";

const S = [
  ["Reset", 3, "Slow down and return to the next thing."],
  ["Focus", 5, "A short practice before work, study, or training."],
  ["Night", 10, "A quiet landing before sleep."],
] as const;
const STEPS = [
  "Settle your posture.",
  "Breathe in slowly through your nose.",
  "Exhale longer than you inhale.",
  "Notice one thing you can control next.",
];

export default function MeditationPage() {
  const [idx, setIdx] = useState(0), [sec, setSec] = useState(180), [run, setRun] = useState(false), [done, setDone] = useState(0);
  const item = S[idx];

  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setSec((v) => {
      if (v <= 1) { setRun(false); setDone((n) => n + 1); return 0; }
      return v - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [run]);

  function choose(i: number) { setIdx(i); setSec(S[i][1] * 60); setRun(false); }
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  return (
    <main className="livv-page min-h-full">
      <div className="mx-auto w-full max-w-xl px-5 pb-12 sm:px-6">
        <header className="pt-6 sm:pt-9">
          <Link href="/home/health" className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
            <ChevronLeft size={13} /> Health
          </Link>
          <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-livv-accent">
            <Brain size={13} /> Mind
          </div>
          <h1 className="mt-2 text-[38px] font-semibold leading-[.98] tracking-[-.06em] sm:text-[46px]">Take a minute.</h1>
          <p className="mt-4 max-w-[39ch] text-[13px] leading-6 text-livv-muted">
            Make space between the noise and the next decision. No streak pressure.
          </p>
        </header>

        <div className="mt-8 flex gap-2 overflow-x-auto border-b border-livv-border pb-5">
          {S.map((x, i) => (
            <button key={x[0]} type="button" onClick={() => choose(i)}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[.13em] transition ${idx === i ? "border-livv-accent bg-livv-accent-soft text-livv-accent" : "border-livv-border text-livv-muted"}`}>
              {x[0]} · {x[1]}m
            </button>
          ))}
        </div>

        <section className="mt-8 border-y border-livv-border py-9 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-livv-border text-livv-muted">
            <Wind size={19} />
          </div>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">{item[2]}</p>
          <p className="mt-3 text-[clamp(4rem,20vw,7rem)] font-semibold leading-none tracking-[-.08em] tabular-nums">{mm}:{ss}</p>
          <div className="mt-7 flex justify-center gap-2">
            <button type="button" onClick={() => setRun((v) => !v)}
              className="inline-flex min-w-28 items-center justify-center gap-2 rounded-full bg-livv-ink px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[.14em] text-livv-bg">
              {run ? <Pause size={14} /> : <Play size={14} />} {run ? "Pause" : sec === 0 ? "Done" : "Start"}
            </button>
            <button type="button" onClick={() => { setSec(item[1] * 60); setRun(false); }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-livv-border px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[.14em] text-livv-muted">
              <RotateCcw size={14} /> Reset
            </button>
          </div>
          <p className="mt-4 text-[10px] text-livv-muted">Completed sessions: {done}</p>
        </section>

        <section className="mt-9">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.19em] text-livv-muted">Practice</p>
              <h2 className="mt-1 text-[24px] font-semibold tracking-[-.045em]">Stay with it.</h2>
            </div>
            <span className="text-[10px] uppercase tracking-[.14em] text-livv-muted">4 steps</span>
          </div>
          <div className="mt-4 divide-y divide-livv-border border-y border-livv-border">
            {STEPS.map((x, i) => (
              <div key={x} className="flex gap-4 py-4">
                <span className="w-6 shrink-0 text-[10px] font-semibold tabular-nums text-livv-accent">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-[13px] leading-6">{x}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
