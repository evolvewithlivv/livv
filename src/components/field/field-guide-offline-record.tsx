"use client";

import { useCallback, useEffect, useState } from "react";
import type { FieldGuide } from "@/lib/field-guides";

type GuideProgress = {
  completedSteps: string[];
  completedChecks: string[];
  observation: string;
  startedAt: string | null;
  updatedAt: string | null;
};

type AllProgress = Record<string, GuideProgress>;

const STORAGE_KEY = "livv-field-progress-v1";
const EMPTY_PROGRESS: GuideProgress = {
  completedSteps: [],
  completedChecks: [],
  observation: "",
  startedAt: null,
  updatedAt: null,
};

function readAllProgress(): AllProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AllProgress) : {};
  } catch {
    return {};
  }
}

function normalize(value?: Partial<GuideProgress>): GuideProgress {
  return {
    ...EMPTY_PROGRESS,
    ...value,
    completedSteps: Array.isArray(value?.completedSteps) ? value.completedSteps : [],
    completedChecks: Array.isArray(value?.completedChecks) ? value.completedChecks : [],
    observation: typeof value?.observation === "string" ? value.observation : "",
  };
}

export function FieldGuideOfflineRecord({ guide }: { guide: FieldGuide }) {
  const [progress, setProgress] = useState<GuideProgress>(EMPTY_PROGRESS);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const hydrate = () => setProgress(normalize(readAllProgress()[guide.slug]));
    hydrate();
    window.addEventListener("livv-field-progress", hydrate);
    window.addEventListener("livv-record", hydrate);
    window.addEventListener("storage", hydrate);
    return () => {
      window.removeEventListener("livv-field-progress", hydrate);
      window.removeEventListener("livv-record", hydrate);
      window.removeEventListener("storage", hydrate);
    };
  }, [guide.slug]);

  const save = useCallback((next: GuideProgress) => {
    const value: GuideProgress = {
      ...next,
      startedAt: next.startedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      const all = readAllProgress();
      all[guide.slug] = value;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      setProgress(value);
      setSaveError(false);
      window.dispatchEvent(new Event("livv-field-progress"));
    } catch {
      setProgress(value);
      setSaveError(true);
    }
  }, [guide.slug]);

  const toggleStep = (id: string) => {
    const completedSteps = progress.completedSteps.includes(id)
      ? progress.completedSteps.filter((item) => item !== id)
      : [...progress.completedSteps, id];
    save({ ...progress, completedSteps });
  };

  const toggleCheck = (item: string) => {
    const completedChecks = progress.completedChecks.includes(item)
      ? progress.completedChecks.filter((value) => value !== item)
      : [...progress.completedChecks, item];
    save({ ...progress, completedChecks });
  };

  const completedCount = guide.steps.filter((step) => progress.completedSteps.includes(step.id)).length;

  return (
    <section className="field-guide-section" aria-label="Offline field record">
      <p className="field-guide-overline">Field record / Works offline</p>
      <h2>Record the work</h2>
      <p className="field-guide-body">Mark a step after you do it. This record saves on this device without a connection. When you return to LIVV online, the regular account sync can carry it over.</p>
      <div className="field-guide-progress-top">
        <div><span className="field-guide-overline">Steps complete</span><strong>{completedCount} / {guide.steps.length}</strong></div>
        <span>{Math.round((completedCount / guide.steps.length) * 100)}%</span>
      </div>
      <div className="field-guide-progress-track" role="progressbar" aria-valuenow={Math.round((completedCount / guide.steps.length) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Offline guide steps completed">
        <span style={{ width: `${Math.round((completedCount / guide.steps.length) * 100)}%` }} />
      </div>
      <div className="field-guide-verification">
        {guide.steps.map((step, index) => (
          <label key={step.id} className={progress.completedSteps.includes(step.id) ? "is-checked" : ""}>
            <input type="checkbox" checked={progress.completedSteps.includes(step.id)} onChange={() => toggleStep(step.id)} />
            <span>{String(index + 1).padStart(2, "0")} / {step.title}</span>
          </label>
        ))}
      </div>
      <h3>Can you do it?</h3>
      <div className="field-guide-verification">
        {guide.verification.map((item) => (
          <label key={item} className={progress.completedChecks.includes(item) ? "is-checked" : ""}>
            <input type="checkbox" checked={progress.completedChecks.includes(item)} onChange={() => toggleCheck(item)} />
            <span>{item}</span>
          </label>
        ))}
      </div>
      <label className="field-guide-observation">Field notes
        <textarea value={progress.observation} onChange={(event) => save({ ...progress, observation: event.target.value })} rows={4} placeholder="What did you observe? What worked? What would you change next time?" />
      </label>
      <p className="field-guide-saved-status" role="status">{saveError ? "Could not save on this device. Free up storage and try again." : progress.updatedAt ? `Saved on this device · ${new Date(progress.updatedAt).toLocaleString()}` : "Your record will appear here when you begin."}</p>
    </section>
  );
}
