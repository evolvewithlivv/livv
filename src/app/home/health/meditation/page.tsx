"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, Play, RotateCcw } from "lucide-react";
import { feedback } from "@/lib/sensory";
import "../health-systems.css";

const PRACTICES = [
  { name: "Reset", minutes: 3, purpose: "Downshift when the mind is noisy.", steps: ["Sit and let the shoulders drop.", "Breathe slowly through the nose.", "Notice thoughts without solving them.", "Return attention to the breath.", "Choose one next action."] },
  { name: "Focus", minutes: 5, purpose: "Create a clean transition into work or training.", steps: ["Sit upright and put the phone away.", "Take five slow breaths.", "Notice when attention wanders.", "Return without judging yourself.", "Name the one task you are about to do."] },
  { name: "Night", minutes: 10, purpose: "Make the landing into sleep quieter.", steps: ["Dim the room.", "Relax the face, jaw, shoulders, and hands.", "Let breathing become natural.", "Notice sensations without chasing them.", "Return to the next breath."] },
] as const;

export default function MeditationPage() {
  const [idx, setIdx] = useState(0);
  const [sec, setSec] = useState(PRACTICES[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const item = PRACTICES[idx];

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSec((v) => {
      if (v <= 1) {
        setRunning(false);
        setDone((n) => n + 1);
        feedback("complete");
        return 0;
      }
      return v - 1;
    }), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const choose = (i: number) => { setIdx(i); setSec(PRACTICES[i].minutes * 60); setRunning(false); };
  const reset = () => { setSec(item.minutes * 60); setRunning(false); };
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  return (
    <main className="hsys" aria-label="Meditation">
      <div className="hsys-inner">
        <Link href="/home/health" className="hsys-back"><ChevronLeft size={13} /> Health</Link>
        <header className="hsys-mast">
          <p className="hsys-k">02 / Mind</p>
          <h1 className="hsys-title">Meditation</h1>
          <p className="hsys-sub">Attention is a skill. Practice it in minutes, then carry it into the rest of the day.</p>
        </header>

        <section className="hsys-section">
          <p className="hsys-label">Choose a practice</p>
          <div className="hsys-chips">{PRACTICES.map((p, i) => <button key={p.name} type="button" className={"hsys-chip" + (idx === i ? " on" : "")} onClick={() => choose(i)}>{p.name} · {p.minutes}m</button>)}</div>
          <div className="hsys-note">{item.purpose}</div>
        </section>

        <div className="hsys-timer">
          <p className="hsys-timer-v">{mm}<span style={{ opacity: .3 }}>:</span>{ss}</p>
          <p className="hsys-timer-s">{running ? "In practice" : sec === 0 ? "Complete" : "Ready"} · {done} completed</p>
        </div>

        <div className="hsys-actions">
          <button type="button" className="hsys-btn" style={{ marginTop: 0 }} onClick={() => { setRunning((v) => !v); feedback("tick"); }}>{running ? "Pause" : sec === 0 ? "Complete" : <><Play size={12} style={{ verticalAlign: -2, marginRight: 5 }} /> Start</>}</button>
          <button type="button" className="hsys-btn ghost" style={{ marginTop: 0 }} onClick={reset}><RotateCcw size={12} style={{ verticalAlign: -2, marginRight: 5 }} /> Reset</button>
        </div>

        <section className="hsys-section">
          <p className="hsys-label">The practice</p>
          <div className="hsys-list">{item.steps.map((step, i) => <div key={step} className="hsys-item"><div><p className="hsys-item-t">{String(i + 1).padStart(2, "0")}</p><p className="hsys-item-s">{step}</p></div></div>)}</div>
        </section>
      </div>
    </main>
  );
}