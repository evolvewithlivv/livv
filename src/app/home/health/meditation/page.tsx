"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import "../health-systems.css";

const PRACTICES = [
  {
    name: "Reset",
    minutes: 3,
    purpose: "Downshift when the mind is noisy.",
    steps: [
      "Sit. Let the shoulders drop.",
      "Breathe in through the nose.",
      "Let the exhale be slow.",
      "Notice without fixing.",
      "Choose one next action.",
    ],
  },
  {
    name: "Focus",
    minutes: 5,
    purpose: "Clean transition into work or training.",
    steps: [
      "Sit upright. Phone away.",
      "Five slow breaths.",
      "When attention wanders, return.",
      "Name the single task.",
      "Begin without checking anything else.",
    ],
  },
  {
    name: "Night",
    minutes: 10,
    purpose: "Quieter landing before sleep.",
    steps: [
      "Dim the room.",
      "Relax face, jaw, shoulders, hands.",
      "Let breathing become natural.",
      "Notice sensations without judgment.",
      "Return to the next breath.",
    ],
  },
] as const;

export default function MeditationPage() {
  const [idx, setIdx] = useState(0);
  const [sec, setSec] = useState(PRACTICES[0].minutes * 60);
  const [run, setRun] = useState(false);
  const [done, setDone] = useState(0);
  const item = PRACTICES[idx];

  useEffect(() => {
    if (!run) return;
    const id = setInterval(
      () =>
        setSec((v) => {
          if (v <= 1) {
            setRun(false);
            setDone((n) => n + 1);
            return 0;
          }
          return v - 1;
        }),
      1000,
    );
    return () => clearInterval(id);
  }, [run]);

  function choose(i: number) {
    setIdx(i);
    setSec(PRACTICES[i].minutes * 60);
    setRun(false);
  }

  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  return (
    <main className="hsys" aria-label="Meditation">
      <div className="hsys-inner">
        <Link href="/home/health" className="hsys-back">
          <ChevronLeft size={13} /> Health
        </Link>
        <header className="hsys-mast">
          <p className="hsys-k">Mind</p>
          <h1 className="hsys-title">Meditation</h1>
          <p className="hsys-sub">Practice attention. Then act.</p>
        </header>

        <section className="hsys-section">
          <p className="hsys-label">Practice</p>
          <div className="hsys-chips">
            {PRACTICES.map((p, i) => (
              <button
                key={p.name}
                type="button"
                className={"hsys-chip" + (idx === i ? " on" : "")}
                onClick={() => choose(i)}
              >
                {p.name} · {p.minutes}m
              </button>
            ))}
          </div>
          <p className="hsys-sub" style={{ marginTop: "0.85rem" }}>
            {item.purpose}
          </p>
        </section>

        <div className="hsys-timer">
          <p className="hsys-timer-v">
            {mm}
            <span style={{ opacity: 0.45 }}>:</span>
            {ss}
          </p>
          <p className="hsys-timer-s">
            {run ? "Running" : sec === 0 ? "Complete" : "Ready"} · {done} done
          </p>
        </div>

        <div className="hsys-actions">
          <button
            type="button"
            className="hsys-btn"
            style={{ marginTop: 0 }}
            onClick={() => setRun((v) => !v)}
          >
            {run ? "Pause" : sec === 0 ? "Done" : "Start"}
          </button>
          <button
            type="button"
            className="hsys-btn ghost"
            style={{ marginTop: 0 }}
            onClick={() => {
              setSec(item.minutes * 60);
              setRun(false);
            }}
          >
            Reset
          </button>
        </div>

        <section className="hsys-section">
          <p className="hsys-label">Steps</p>
          <div className="hsys-list">
            {item.steps.map((s, i) => (
              <div key={s} className="hsys-item">
                <div>
                  <p className="hsys-item-t">{String(i + 1).padStart(2, "0")}</p>
                  <p className="hsys-item-s">{s}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
