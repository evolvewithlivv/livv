"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  ExternalLink,
  Download,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import { getFieldGuide } from "@/lib/field-guides";
import "./field-guide.css";

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

function readProgress(): AllProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AllProgress) : {};
  } catch {
    return {};
  }
}

function normalizeProgress(value?: Partial<GuideProgress>): GuideProgress {
  return {
    ...EMPTY_PROGRESS,
    ...value,
    completedSteps: Array.isArray(value?.completedSteps) ? value.completedSteps : [],
    completedChecks: Array.isArray(value?.completedChecks) ? value.completedChecks : [],
    observation: typeof value?.observation === "string" ? value.observation : "",
  };
}

export default function FieldGuidePage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const guide = getFieldGuide(slug);
  const [progress, setProgress] = useState<GuideProgress>(EMPTY_PROGRESS);
  const [expandedSteps, setExpandedSteps] = useState<string[]>(["choose"]);
  const [offlineStatus, setOfflineStatus] = useState<"idle" | "saving" | "saved" | "unavailable">("idle");

  useEffect(() => {
    if (!guide) return;
    const hydrate = () => setProgress(normalizeProgress(readProgress()[guide.slug]));
    hydrate();
    window.addEventListener("livv-field-progress", hydrate);
    window.addEventListener("livv-record", hydrate);
    window.addEventListener("storage", hydrate);
    return () => {
      window.removeEventListener("livv-field-progress", hydrate);
      window.removeEventListener("livv-record", hydrate);
      window.removeEventListener("storage", hydrate);
    };
  }, [guide]);

  useEffect(() => {
    if (!guide) return;
    const url = `/field-offline/${guide.slug}`;
    const onMessage = (event: MessageEvent<{ type?: string; url?: string }>) => {
      if (event.data?.url !== url) return;
      if (event.data.type === "FIELD_GUIDE_CACHED") setOfflineStatus("saved");
      if (event.data.type === "FIELD_GUIDE_CACHE_FAILED") setOfflineStatus("unavailable");
    };
    navigator.serviceWorker?.addEventListener("message", onMessage);
    if ("caches" in window) {
      void caches.open("livv-field-guides-v1")
        .then((cache) => cache.match(url))
        .then((response) => { if (response) setOfflineStatus("saved"); })
        .catch(() => undefined);
    }
    return () => navigator.serviceWorker?.removeEventListener("message", onMessage);
  }, [guide]);

  const saveForOffline = useCallback(() => {
    if (!guide) return;
    if (!("serviceWorker" in navigator)) {
      setOfflineStatus("unavailable");
      return;
    }
    setOfflineStatus("saving");
    window.setTimeout(() => {
      setOfflineStatus((current) => current === "saving" ? "unavailable" : current);
    }, 20000);
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(async (registration) => {
      await registration.update().catch(() => undefined);
      const worker = registration.waiting ?? registration.installing ?? registration.active ?? navigator.serviceWorker.controller;
      if (!worker) {
        setOfflineStatus("unavailable");
        return;
      }
      worker.postMessage({ type: "CACHE_FIELD_GUIDE", url: `/field-offline/${guide.slug}` });
    }).catch(() => setOfflineStatus("unavailable"));
  }, [guide]);

  const completedCount = progress.completedSteps.length;
  const progressPercent = guide ? Math.round((completedCount / guide.steps.length) * 100) : 0;
  const currentStage = useMemo(() => {
    if (progress.completedSteps.length === 0) return "Learn";
    if (progress.completedSteps.length < (guide?.steps.length ?? 0)) return "Follow";
    if (!progress.observation.trim()) return "Practice";
    if (progress.completedChecks.length >= (guide?.verification.length ?? 0) && (guide?.verification.length ?? 0) > 0) return "Maintain";
    return "Verify";
  }, [guide, progress.completedChecks.length, progress.completedSteps.length, progress.observation]);

  const updateProgress = useCallback((next: GuideProgress) => {
    if (!guide) return;
    const value = {
      ...next,
      startedAt: next.startedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      const all = readProgress();
      all[guide.slug] = value;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      setProgress(value);
      window.dispatchEvent(new Event("livv-field-progress"));
    } catch {
      setProgress(value);
    }
  }, [guide]);

  const toggleStep = (id: string) => {
    const completedSteps = progress.completedSteps.includes(id)
      ? progress.completedSteps.filter((item) => item !== id)
      : [...progress.completedSteps, id];
    updateProgress({ ...progress, completedSteps });
  };

  const toggleCheck = (id: string) => {
    const completedChecks = progress.completedChecks.includes(id)
      ? progress.completedChecks.filter((item) => item !== id)
      : [...progress.completedChecks, id];
    updateProgress({ ...progress, completedChecks });
  };

  if (!guide) {
    return (
      <main className="field-guide">
        <div className="field-guide-inner">
          <Link href="/home/field" className="field-guide-back"><ArrowLeft size={14} /> Field</Link>
          <p className="field-guide-k">LIVV / FIELD</p>
          <h1 className="field-guide-title">Guide not found.</h1>
          <p className="field-guide-intro">This guide is not available yet. We will add topics when their instructions and sources are ready.</p>
          <Link href="/home/field" className="field-guide-primary">Return to Field</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="field-guide" aria-label={guide.title}>
      <div className="field-guide-inner">
        <Link href="/home/field" className="field-guide-back"><ArrowLeft size={14} /> Field</Link>

        <header className="field-guide-hero">
          <p className="field-guide-k">{guide.eyebrow}</p>
          <div className="field-guide-title-row">
            <h1 className="field-guide-title">{guide.title}.</h1>
            <span className="field-guide-mark" aria-hidden="true"><Leaf size={23} /></span>
          </div>
          <p className="field-guide-intro">{guide.summary}</p>
          <div className="field-guide-meta">
            <span><Clock3 size={13} /> {guide.duration}</span>
            <span>{guide.level}</span>
            <span><ShieldCheck size={13} /> Sources included</span>
          </div>
          <button type="button" className={`field-guide-save ${offlineStatus === "saved" ? "is-saved" : ""}`} onClick={saveForOffline} disabled={offlineStatus === "saving"}>
            <Download size={15} />
            {offlineStatus === "saving" ? "Saving offline copy…" : offlineStatus === "saved" ? "Saved for offline access" : "Save for offline access"}
          </button>
          <p className="field-guide-save-note" role="status">
            {offlineStatus === "saved"
              ? "The guide and its checklist are saved on this device. You can reopen LIVV offline to return to the last saved Field guide. Source links need a connection."
              : offlineStatus === "unavailable"
                ? "Could not save the offline copy. Check your connection and try again."
                : "Save the complete instructions, checklist, and field notes for when you have no connection."}
          </p>
          {offlineStatus === "saved" && <Link href={`/field-offline/${guide.slug}`} className="field-guide-open-offline">Open saved offline copy <ExternalLink size={13} /></Link>}
        </header>

        <section className="field-guide-progress" aria-label="Guide progress">
          <div className="field-guide-progress-top">
            <div><span className="field-guide-overline">Your field record</span><strong>{progressPercent}%</strong></div>
            <span>{completedCount} of {guide.steps.length} steps complete</span>
          </div>
          <div className="field-guide-progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Guide steps completed">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="field-guide-stages" aria-label={`Current stage: ${currentStage}`}>
            {["Learn", "Follow", "Practice", "Verify", "Maintain"].map((stage, index) => (
              <span key={stage} className={stage === currentStage ? "active" : ""}><i>{index + 1}</i>{stage}</span>
            ))}
          </div>
        </section>

        <section className="field-guide-section">
          <p className="field-guide-overline">01 / Understand</p>
          <h2>Before you begin</h2>
          <p className="field-guide-body">{guide.overview}</p>
          <div className="field-guide-budget"><span>Starter budget</span><p>{guide.budgetEstimate}</p></div>
          <h3>Before you start</h3>
          <ul className="field-guide-prerequisites">{guide.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3>What you need</h3>
          <ul className="field-guide-supplies">
            {guide.supplies.map((supply) => <li key={supply.item}><span>{supply.item}{supply.optional ? " · optional" : ""}</span><small>{supply.amount}</small></li>)}
          </ul>
          <div className="field-guide-safety">
            <ShieldCheck size={17} />
            <div><h3>Safety first</h3><ul>{guide.safety.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>
        </section>

        <section className="field-guide-section">
          <p className="field-guide-overline">02 / Do the work</p>
          <h2>Step by step</h2>
          <p className="field-guide-body">Open each step as you work. Mark it complete only after you have done it, not just read it.</p>
          <div className="field-guide-steps">
            {guide.steps.map((step, index) => {
              const done = progress.completedSteps.includes(step.id);
              const expanded = expandedSteps.includes(step.id);
              return (
                <article key={step.id} className={`field-guide-step ${done ? "is-done" : ""}`}>
                  <button type="button" className="field-guide-step-toggle" aria-expanded={expanded} onClick={() => setExpandedSteps((current) => current.includes(step.id) ? current.filter((id) => id !== step.id) : [...current, step.id])}>
                    <span className="field-guide-step-number">{done ? <Check size={15} /> : String(index + 1).padStart(2, "0")}</span>
                    <span className="field-guide-step-heading"><strong>{step.title}</strong>{step.timing && <small>{step.timing}</small>}</span>
                    {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                  </button>
                  {expanded && <div className="field-guide-step-content">
                    <p>{step.instruction}</p>
                    <p className="field-guide-step-detail">{step.detail}</p>
                    <div className="field-guide-checkpoint"><strong>Checkpoint</strong><span>{step.checkpoint}</span></div>
                    <label className="field-guide-complete"><input type="checkbox" checked={done} onChange={() => toggleStep(step.id)} /><span>{done ? "Step completed" : "I completed this step"}</span></label>
                  </div>}
                </article>
              );
            })}
          </div>
        </section>

        <section className="field-guide-section">
          <p className="field-guide-overline">03 / Learn from the result</p>
          <h2>When something goes wrong</h2>
          <div className="field-guide-troubleshooting">
            {guide.troubleshoot.map((item) => <article key={item.problem}><h3>{item.problem}</h3><p><strong>Possible cause:</strong> {item.cause}</p><p><strong>What to do:</strong> {item.response}</p></article>)}
          </div>
        </section>

        <section className="field-guide-section">
          <p className="field-guide-overline">04 / Verify</p>
          <h2>Can you do it?</h2>
          <p className="field-guide-body">Use this checklist to assess what you can actually perform. Your progress is saved on this device and can sync through LIVV's existing account-state system when available.</p>
          <div className="field-guide-verification">
            {guide.verification.map((item, index) => <label key={item} className={progress.completedChecks.includes(item) ? "is-checked" : ""}><input type="checkbox" checked={progress.completedChecks.includes(item)} onChange={() => toggleCheck(item)} /><span>{item}</span></label>)}
          </div>
          <label className="field-guide-observation">Field notes
            <textarea value={progress.observation} onChange={(event) => updateProgress({ ...progress, observation: event.target.value })} rows={4} placeholder="What did you observe? What worked? What would you change next time?" />
          </label>
          <p className="field-guide-saved-status" role="status">{progress.updatedAt ? `Last updated ${new Date(progress.updatedAt).toLocaleString()}` : "Your record will appear here when you begin."}</p>
        </section>

        <section className="field-guide-section">
          <p className="field-guide-overline">05 / Maintain</p>
          <h2>Keep the skill alive</h2>
          <ul className="field-guide-maintenance">{guide.maintenance.map((item) => <li key={item}><CheckCircle2 size={16} /><span>{item}</span></li>)}</ul>
        </section>

        <section className="field-guide-section field-guide-sources">
          <p className="field-guide-overline">Reference / Content integrity</p>
          <h2>Sources and review</h2>
          <p className="field-guide-body">This guide was checked against the sources below. Local conditions and variety instructions still matter.</p>
          {guide.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span><strong>{source.title}</strong><small>{source.publisher} · checked {source.checked}</small></span><ExternalLink size={15} /></a>)}
          <p className="field-guide-review">Guide review date: {guide.reviewedAt}. Content status: {guide.reviewStatus === "reviewed" ? "source-checked instructional guide" : "draft awaiting review"}.</p>
        </section>

        <footer className="field-guide-footer">
          <Link href="/home/field" className="field-guide-primary"><ArrowLeft size={15} /> Return to Field</Link>
          <p>Capability is built by doing, observing, and repeating.</p>
        </footer>
      </div>
    </main>
  );
}
