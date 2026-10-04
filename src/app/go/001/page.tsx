"use client";

import "./field-note-001.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { haptic } from "@/lib/sensory";

type Act = 0 | 1 | 2 | 3;

const PILLARS = [
  { id: "longevity", label: "LONGEVITY", coord: "01", line: "A body and life that can carry you further." },
  { id: "integrity", label: "INTEGRITY", coord: "02", line: "Actions that match what you say matters." },
  { id: "vitality", label: "VITALITY", coord: "03", line: "Energy, health, and presence that stay online." },
  { id: "vigilance", label: "VIGILANCE", coord: "04", line: "Aware. Prepared. Harder to break." },
] as const;

const FOOT_META = ["SIGNAL LIVE", "PRINCIPLE", "MAPPED", "THRESHOLD"] as const;

export default function Signal001() {
  const router = useRouter();
  const [act, setAct] = useState<Act>(0);
  const [awake, setAwake] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [ctaReady, setCtaReady] = useState(false);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const bootRef = useRef(false);
  const lockRef = useRef(false);
  const actRef = useRef<Act>(0);

  useEffect(() => { actRef.current = act; }, [act]);
  useEffect(() => {
    document.documentElement.dataset.livvRoute = "field-note-001";
    return () => { delete document.documentElement.dataset.livvRoute; };
  }, []);
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setAwake(true), reduced ? 80 : 900);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    if (act !== 3) { setCtaReady(false); return; }
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setCtaReady(true), reduced ? 100 : 1400);
    return () => window.clearTimeout(t);
  }, [act]);

  const go = useCallback((next: Act) => {
    if (lockRef.current || next === actRef.current) return;
    lockRef.current = true;
    haptic("light");
    setSelected(null);
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setAct(next); setPhase("in"); lockRef.current = false;
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    setPhase("out");
    window.setTimeout(() => {
      setAct(next); setPhase("in");
      window.scrollTo({ top: 0, behavior: "auto" });
      window.setTimeout(() => { lockRef.current = false; }, 700);
    }, 480);
  }, []);

  const activePillar = PILLARS.find((p) => p.id === selected) ?? null;
  const actCls = (n: Act, extra = "") =>
    "fn-act fn-act" + n + (phase === "in" && (n !== 0 || awake) ? " on" : "") + (phase === "out" ? " out" : "") + extra;

  return (
    <main className={"fn act-" + act + (awake ? " awake" : "")} aria-label="LIVV Signal 001">
      <div className="fn-void" aria-hidden />
      <div className="fn-grid" aria-hidden />
      <div className={"fn-pulse" + (awake ? " on" : "")} aria-hidden />
      <div className="fn-scan" aria-hidden />
      <div className="fn-particles" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => <span key={i} className={"fn-p p" + i} />)}
      </div>
      <div className="fn-amb fn-amb3" aria-hidden>
        <span className="fn-portal r1" /><span className="fn-portal r2" /><span className="fn-portal r3" />
        <span className="fn-portal-core" />
      </div>

      <header className={"fn-top" + (awake ? " on" : "")}>
        <div className="fn-top-l">
          <span className="fn-mark">LIVV</span>
          <span className="fn-sep" />
          <span className="fn-id">SIGNAL / 001</span>
        </div>
        <div className="fn-top-r">
          <span className="fn-loc">PENNSYLVANIA</span>
          <span className={"fn-status" + (awake ? " live" : "")}>{awake ? "DISCOVERED" : "— — —"}</span>
        </div>
      </header>

      <div className="fn-body">
        {act === 0 && (
          <section className={actCls(0)} aria-live="polite">
            <div className="fn-signal" aria-hidden>
              <div className="fn-ring r1" /><div className="fn-ring r2" /><div className="fn-ring r3" />
              <div className="fn-core"><img src="/livv-logo.png" alt="" width={48} height={48} /></div>
            </div>
            <p className="fn-micro-label">SIGNAL</p>
            <h1 className="fn-title stack center">
              <span className="fn-line dim">You found</span>
              <span className="fn-line">LIVV.</span>
            </h1>
            <p className="fn-sub">
              An operating system for becoming more capable in real life.
            </p>
            <button type="button" className="fn-ghost" onClick={() => go(1)}>
              <span>CONTINUE</span><span className="fn-arrow" aria-hidden>→</span>
            </button>
          </section>
        )}

        {act === 1 && (
          <section className={actCls(1)} aria-live="polite">
            <p className="fn-micro-label">PRINCIPLE</p>
            <h1 className="fn-title stack">
              <span className="fn-line">You are not</span>
              <span className="fn-line">here just to</span>
              <span className="fn-line dim">survive.</span>
            </h1>
            <p className="fn-sub left">
              Most lives follow a default path.
              <br />
              This is the alternative.
            </p>
            <div className="fn-cta-row">
              <button type="button" className="fn-back" onClick={() => go(0)} aria-label="Go back">
                <span className="fn-back-icon" aria-hidden>←</span>
              </button>
              <button type="button" className="fn-ghost solid" onClick={() => go(2)}>
                <span>OPEN SYSTEM</span><span className="fn-arrow" aria-hidden>→</span>
              </button>
            </div>
          </section>
        )}

        {act === 2 && (
          <section className={actCls(2)} aria-live="polite">
            <div className="fn-act2-head">
              <p className="fn-micro-label">INSIDE THE SIGNAL</p>
              <p className="fn-hint">Select a node</p>
            </div>
            <div className="fn-orbit" role="list">
              <div className="fn-orbit-plane" aria-hidden>
                <div className="fn-orbit-ring o1" /><div className="fn-orbit-ring o2" /><div className="fn-orbit-ring o3" />
              </div>
              <div className="fn-orbit-hub" aria-hidden>
                <img src="/livv-logo.png" alt="" width={28} height={28} />
              </div>
              {PILLARS.map((p, i) => {
                const active = selected === p.id;
                return (
                  <button key={p.id} type="button" role="listitem"
                    className={"fn-orbit-node n" + i + (active ? " active" : "")}
                    onClick={() => { haptic(active ? "light" : "medium"); setSelected(active ? null : p.id); }}
                    aria-expanded={active} aria-label={p.label}>
                    <span className="fn-orbit-dot" aria-hidden />
                    <span className="fn-orbit-meta">
                      <span className="fn-orbit-coord">{p.coord}</span>
                      <span className="fn-orbit-name">{p.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className={"fn-readout" + (activePillar ? " show" : "")} aria-live="polite">
              {activePillar ? (
                <>
                  <p className="fn-readout-coord">{activePillar.coord} · {activePillar.label}</p>
                  <p className="fn-readout-line">{activePillar.line}</p>
                </>
              ) : (
                <p className="fn-readout-idle">Select a node to continue.</p>
              )}
            </div>
            <div className="fn-cta-row">
              <button type="button" className="fn-back" onClick={() => go(1)} aria-label="Go back">
                <span className="fn-back-icon" aria-hidden>←</span>
              </button>
              <button type="button" className="fn-ghost solid" onClick={() => go(3)}>
                <span>CROSS THRESHOLD</span><span className="fn-arrow" aria-hidden>→</span>
              </button>
            </div>
          </section>
        )}

        {act === 3 && (
          <section className={actCls(3, ctaReady ? " ready" : "")} aria-live="polite">
            <div className="fn-threshold-mark" aria-hidden>
              <img src="/livv-logo.png" alt="" width={56} height={56} />
            </div>
            <p className="fn-micro-label">THRESHOLD</p>
            <h1 className="fn-title stack">
              <span className="fn-line">Leave the</span>
              <span className="fn-line">default.</span>
              <span className="fn-line dim">Enter LIVV.</span>
            </h1>
            <p className="fn-sub left">
              Training. Health. Knowledge. Capability.
              A different operating system for real life.
            </p>
            <button type="button" className={"fn-enter" + (ctaReady ? " show" : "")}
              onClick={() => { haptic("success"); router.push("/auth"); }} disabled={!ctaReady}>
              <span className="fn-enter-label">ENTER LIVV</span>
              <span className="fn-enter-icon" aria-hidden>→</span>
            </button>
            <div className={"fn-act3-secondary" + (ctaReady ? " show" : "")}>
              <button type="button" className="fn-back-text" onClick={() => go(2)}>← Back</button>
              <button type="button" className="fn-secondary" onClick={() => router.push("/")}>EXPLORE THE SITE</button>
            </div>
          </section>
        )}
      </div>

      <footer className={"fn-foot" + (awake ? " on" : "")}>
        <div className="fn-ticks" role="navigation" aria-label="Progress">
          {([0, 1, 2, 3] as Act[]).map((n) => (
            <button key={n} type="button"
              className={"fn-tick" + (n === act ? " on" : "") + (n < act ? " done" : "")}
              onClick={() => { if (n < actRef.current) go(n); }}
              disabled={n >= act}
              aria-label={n === act ? `Step ${n + 1}, current` : n < act ? `Go back to step ${n + 1}` : `Step ${n + 1}, locked`}
              aria-current={n === act ? "step" : undefined}
            />
          ))}
        </div>
        <span className="fn-foot-meta">{FOOT_META[act]}</span>
      </footer>
    </main>
  );
}
