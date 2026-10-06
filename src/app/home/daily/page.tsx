"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  claimDailyDrop,
  completeDailyTask,
  dailyQuestion,
  dailySummary,
  dailyTasks,
  loadDailyState,
  saveDailyJournal,
  type DailyTask,
} from "@/lib/daily";
import { feedback } from "@/lib/sensory";
import "./daily.css";

export default function DailyPage() {
  const [now] = useState(() => new Date());
  const [completed, setCompleted] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [status, setStatus] = useState("");
  const [dropClaimed, setDropClaimed] = useState(false);
  const [dropName, setDropName] = useState<string | null>(null);

  const question = useMemo(() => dailyQuestion(now), [now]);
  const tasks = useMemo(() => dailyTasks(now), [now]);
  const summary = useMemo(() => dailySummary(now), [now, completed, savedNote, dropClaimed]);

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
    setDropClaimed(state.dropClaimed);
    const todayJournal = state.journal.find((j) => j.key === state.key);
    if (todayJournal?.answer) {
      setAnswer(todayJournal.answer);
      setSavedNote(todayJournal.answer);
    }
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
    const next = saveDailyJournal(clean, now);
    setCompleted(next.completed);
    setSavedNote(clean);
    setStatus("Saved.");
    feedback("complete");
    window.dispatchEvent(new Event("livv-daily"));
    window.setTimeout(() => setStatus(""), 1800);
  }

  function claimDrop() {
    const result = claimDailyDrop(now);
    if (result.claimed) {
      setDropClaimed(true);
      setDropName(result.drop.name);
      feedback("complete");
      window.dispatchEvent(new Event("livv-daily"));
    }
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

        <section id="daily-reflect" className="dy-section" aria-label="Reflect">
          <p className="dy-section-k">Reflect</p>
          {!hasActed ? (
            <p className="dy-action-s">
              Take an action first. Then write what changed.
            </p>
          ) : null}
          <div className="dy-reflect-box">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={
                hasActed
                  ? "What changed? What did you learn?"
                  : "Your private note for today…"
              }
              aria-label="Daily reflection"
            />
            <div className="dy-reflect-row">
              <span className="dy-reflect-hint">
                {savedNote ? "Saved to your record" : "Private · stays with you"}
              </span>
              <button
                type="button"
                className="dy-btn"
                onClick={saveAnswer}
                disabled={!answer.trim()}
              >
                {savedNote && answer.trim() === savedNote ? "Saved" : "Save"}
              </button>
            </div>
            {status ? <p className="dy-status">{status}</p> : null}
          </div>
        </section>

        {allDone ? (
          <section className="dy-drop" aria-label="Day complete">
            <p className="dy-section-k">Day complete</p>
            {dropClaimed ? (
              <>
                <p className="dy-drop-t">{dropName || "Claimed"}</p>
                <p className="dy-drop-s">Today is logged. Come back tomorrow.</p>
              </>
            ) : (
              <>
                <p className="dy-drop-t">You finished today&apos;s three.</p>
                <p className="dy-drop-s">
                  Claim what the day returns — then rest the system.
                </p>
                <button
                  type="button"
                  className="dy-btn"
                  style={{ marginTop: "0.85rem" }}
                  onClick={claimDrop}
                >
                  Claim
                </button>
              </>
            )}
          </section>
        ) : null}

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
