"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  completeDailyTask,
  dailySummary,
  dailyTasks,
  loadDailyState,
  saveDailyAnswer,
  saveDailyNote,
  type DailyTask,
} from "@/lib/daily";
import { feedback } from "@/lib/sensory";
import "./daily.css";

export default function DailyPage() {
  const [now, setNow] = useState(() => new Date());
  const [completed, setCompleted] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [note, setNote] = useState("");
  const [savedAnswer, setSavedAnswer] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [status, setStatus] = useState("");

  const question = useMemo(() => dailySummary(now).question, [now]);
  const tasks = useMemo(() => dailyTasks(now), [now]);
  const summary = useMemo(() => dailySummary(now), [now, completed, savedAnswer, savedNote]);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(now),
    [now],
  );

  const sync = useCallback(() => {
    const state = loadDailyState(now);
    setCompleted(state.completed);
    const todayJournal = state.journal.find((j) => j.key === state.key);
    setAnswer(todayJournal?.answer || "");
    setSavedAnswer(todayJournal?.answer || "");
    setNote(todayJournal?.note || "");
    setSavedNote(todayJournal?.note || "");
  }, [now]);

  useEffect(() => {
    sync();
    window.addEventListener("livv-daily", sync);
    window.addEventListener("livv-record", sync);
    return () => {
      window.removeEventListener("livv-daily", sync);
      window.removeEventListener("livv-record", sync);
    };
  }, [sync]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = new Date();
      setNow((current) => next.getDate() !== current.getDate() || next.getMonth() !== current.getMonth() || next.getFullYear() !== current.getFullYear() ? next : current);
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const doneCount = completed.length;
  const allDone = doneCount >= 3;
  const hasActed = doneCount > 0 || Boolean(savedNote);

  function complete(id: DailyTask["id"]) {
    if (completed.includes(id)) return;
    if (id === "mind") {
      document.getElementById("daily-reflect")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    const next = completeDailyTask(id, now);
    setCompleted(next.completed);
    feedback("complete");
    window.dispatchEvent(new Event("livv-daily"));
  }

  function saveAnswer() {
    const clean = answer.trim();
    if (!clean) return;
    const next = saveDailyAnswer(clean, now);
    setCompleted(next.completed);
    setSavedAnswer(clean);
    setStatus("Answer saved.");
    feedback("complete");
    window.dispatchEvent(new Event("livv-daily"));
    window.setTimeout(() => setStatus(""), 1800);
  }

  function saveNote() {
    const clean = note.trim();
    if (!clean) return;
    saveDailyNote(clean, now);
    setSavedNote(clean);
    setStatus("Reflection saved.");
    feedback("complete");
    window.dispatchEvent(new Event("livv-daily"));
    window.setTimeout(() => setStatus(""), 1800);
  }

  return (
    <main className="dy" aria-label="Daily">
      <div className="dy-inner">
        <header>
          <p className="dy-k">Today</p>
          <p className="dy-date">{dateLabel}</p>
          <h1 className="dy-question">{question}</h1>
          <div
            className="dy-progress"
            aria-label={`${doneCount} of 3 actions complete`}
          >
            <div className="dy-progress-bar">
              <div
                className="dy-progress-fill"
                style={{ width: `${Math.min(100, (doneCount / 3) * 100)}%` }}
              />
            </div>
            <span className="dy-progress-n">{doneCount}/3</span>
          </div>
        </header>

        <section className="dy-section" aria-label="Today's actions">
          <p className="dy-section-k">Today&apos;s actions</p>
          {tasks.map((task, index) => {
            const done = completed.includes(task.id);
            return (
              <button
                key={task.id}
                type="button"
                className={"dy-action" + (done ? " is-done" : "")}
                onClick={() => complete(task.id)}
                disabled={done}
                aria-pressed={done}
              >
                <span className="dy-mark" aria-hidden>
                  {done ? "✓" : String(index + 1)}
                </span>
                <span className="dy-action-main">
                  <p className="dy-action-label">{task.label}</p>
                  <p className="dy-action-t">{task.title}</p>
                  <p className="dy-action-s">
                    {task.description}
                    {task.id === "mind" && !done
                      ? " Write your reflection below to complete this."
                      : ""}
                  </p>
                </span>
              </button>
            );
          })}
        </section>

        <section className="dy-question-answer" aria-label="Answer today's question">
          <p className="dy-section-k">Your answer</p>
          <p className="dy-answer-prompt">{question}</p>
          <div className="dy-reflect-box">
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer the question in your own words…" aria-label="Answer today's question" />
            <div className="dy-reflect-row">
              <span className="dy-reflect-hint">{savedAnswer ? "Saved to your record" : "Private · stays with you"}</span>
              <button type="button" className="dy-btn" onClick={saveAnswer} disabled={!answer.trim()}>
                {savedAnswer && answer.trim() === savedAnswer ? "Saved" : "Save answer"}
              </button>
            </div>
          </div>
        </section>

        <section id="daily-reflect" className="dy-section" aria-label="Reflection note">
          <p className="dy-section-k">Reflection note</p>
          <p className="dy-action-s">Separate from the question. Write whatever you want to remember about today.</p>
          <div className="dy-reflect-box">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What changed? What did you learn? What do you want to remember?" aria-label="Reflection note" />
            <div className="dy-reflect-row">
              <span className="dy-reflect-hint">{savedNote ? "Saved to your record" : "Private · stays with you"}</span>
              <button type="button" className="dy-btn" onClick={saveNote} disabled={!note.trim()}>
                {savedNote && note.trim() === savedNote ? "Saved" : "Save note"}
              </button>
            </div>
            {status ? <p className="dy-status">{status}</p> : null}
          </div>
        </section>

        {summary.callback ? (
          <section className="dy-callback" aria-label="One month ago">
            <p className="dy-k">One month ago</p>
            {summary.callback.question ? (
              <p className="dy-callback-q">{summary.callback.question}</p>
            ) : null}
            <p className="dy-callback-a">“{summary.callback.answer}”</p>
            <p className="dy-callback-foot">Look at the distance.</p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
