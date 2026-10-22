"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  completeDailyTask,
  dailySummary,
  ensureDailyBoard,
  loadDailyState,
  saveDailyAnswer,
  saveDailyNote,
  uncompleteDailyTask,
  type DailyTask,
} from "@/lib/daily";
import { feedback } from "@/lib/sensory";
import { PageHeader } from "@/components/layout/page-header";
import "./daily.css";

export default function DailyPage() {
  const [now, setNow] = useState(() => new Date());
  const [completed, setCompleted] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [note, setNote] = useState("");
  const [savedAnswer, setSavedAnswer] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [status, setStatus] = useState("");
  const [emberNote, setEmberNote] = useState("");
  const [tasks, setTasks] = useState<DailyTask[]>([]);

  const question = useMemo(() => dailySummary(now).question, [now]);
  const summary = useMemo(() => dailySummary(now), [now, completed, savedAnswer, savedNote, tasks]);

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
    setTasks(ensureDailyBoard(now));
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
    const onAward = (event: Event) => {
      const detail = (event as CustomEvent<{ ok?: boolean; error?: string }>).detail;
      if (detail && detail.ok === false) setEmberNote(detail.error || "Embers could not be awarded.");
    };
    window.addEventListener("livv-ember-award", onAward);
    return () => {
      window.removeEventListener("livv-daily", sync);
      window.removeEventListener("livv-record", sync);
      window.removeEventListener("livv-ember-award", onAward);
    };
  }, [sync]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = new Date();
      setNow((current) => next.getDate() !== current.getDate() || next.getMonth() !== current.getMonth() || next.getFullYear() !== current.getFullYear() ? next : current);
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const doneCount = tasks.filter((task) => completed.includes(task.id)).length;
  const total = tasks.length || 3;

  function scrollToAnswer() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("daily-answer")?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
  }

  function toggle(task: DailyTask) {
    if (completed.includes(task.id)) {
      const next = uncompleteDailyTask(task.id, now);
      setCompleted(next.completed);
      setStatus("Marked not done.");
      feedback("tick");
      window.dispatchEvent(new Event("livv-daily"));
      window.setTimeout(() => setStatus(""), 1800);
      return;
    }
    const mind = task.pillar === "mind" || task.label === "Mind";
    // A saved answer already satisfies the reflection. Re-tick completes now.
    if (mind && !savedAnswer.trim()) {
      scrollToAnswer();
      return;
    }
    const next = completeDailyTask(task.id, now);
    setCompleted(next.completed);
    if (mind && !next.completed.includes(task.id)) {
      scrollToAnswer();
      return;
    }
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
        <PageHeader eyebrow="Daily">
          <p className="dy-date">{dateLabel}</p>
          <h1 className="dy-question">{question}</h1>
          <div
            className="dy-progress"
            aria-label={`${doneCount} of ${total} actions complete`}
          >
            <div className="dy-progress-bar">
              <div
                className="dy-progress-fill"
                style={{ width: `${Math.min(100, (doneCount / total) * 100)}%` }}
              />
            </div>
            <span className="dy-progress-n">{doneCount}/{total}</span>
          </div>
        </PageHeader>

        <section className="dy-section" aria-label="Today's actions">
          <p className="dy-section-k">Today&apos;s actions</p>
          {tasks.map((task, index) => {
            const done = completed.includes(task.id);
            const mind = task.pillar === "mind" || task.label === "Mind";
            return (
              <button
                key={task.id}
                type="button"
                className={"dy-action" + (done ? " is-done" : "")}
                onClick={() => toggle(task)}
                aria-pressed={done}
                aria-label={
                  done
                    ? `Undo ${task.title}`
                    : mind && !savedAnswer.trim()
                      ? `Write a reflection to complete ${task.title}`
                      : `Complete ${task.title}`
                }
              >
                <span className="dy-mark" aria-hidden>
                  {done ? "✓" : String(index + 1)}
                </span>
                <span className="dy-action-main">
                  <p className="dy-action-label">{task.label}</p>
                  <p className="dy-action-t">{task.title}</p>
                  <p className="dy-action-s">
                    {task.description}
                    {mind && !done && !savedAnswer.trim() ? " Write your reflection below to complete this. " : ""}
                    {done ? " Tap again to undo." : ""}
                  </p>
                </span>
              </button>
            );
          })}
        </section>

        <section id="daily-answer" className="dy-question-answer" aria-label="Answer today's question">
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
            {emberNote ? <p className="dy-status" role="status">{emberNote}</p> : null}
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
