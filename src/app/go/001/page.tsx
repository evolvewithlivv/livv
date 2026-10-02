"use client";

import "./field-note-001.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { haptic } from "@/lib/sensory";

/**
 * FIELD NOTE 001
 * Physical sticker → NFC/QR → this page.
 * Not a landing page. A digital artifact being inspected.
 */

type Act = 0 | 1 | 2 | 3;

const PILLARS = [
  {
    id: "longevity",
    label: "LONGEVITY",
    coord: "01",
    line: "A body and life that can carry you further.",
  },
  {
    id: "integrity",
    label: "INTEGRITY",
    coord: "02",
    line: "Actions that match what you say matters.",
  },
  {
    id: "vitality",
    label: "VITALITY",
    coord: "03",
    line: "Energy, health, and presence that stay online.",
  },
  {
    id: "vigilance",
    label: "VIGILANCE",
    coord: "04",
    line: "Aware. Prepared. Harder to break.",
  },
] as const;

export default function FieldNote001() {
  const router = useRouter();
  const [act, setAct] = useState<Act>(0);
  const [awake, setAwake] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [ctaReady, setCtaReady] = useState(false);
  const bootRef = useRef(false);

  useEffect(() => {
    document.documentElement.dataset.livvRoute = "field-note-001";
    return () => {
      delete document.documentElement.dataset.livvRoute;
    };
  }, []);

  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t1 = window.setTimeout(() => setAwake(true), reduced ? 80 : 900);
    return () => window.clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (act !== 3) {
      setCtaReady(false);
      return;
    }
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setCtaReady(true), reduced ? 100 : 1400);
    return () => window.clearTimeout(t);
  }, [act]);

  const go = useCallback((next: Act) => {
    haptic("light");
    setSelected(null);
    setAct(next);
    window.scrollTo({
      top: 0,
      behavior: "instant" in window ? ("instant" as ScrollBehavior) : "auto",
    });
  }, []);

  return (
    <main className="fn" aria-label="LIVV Field Note 001">
      <div className="fn-void" aria-hidden />
      <div className="fn-grid" aria-hidden />
      <div className={"fn-pulse" + (awake ? " on" : "")} aria-hidden />
      <div className="fn-scan" aria-hidden />
      <div className="fn-particles" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className={"fn-p p" + i} />
        ))}
      </div>

      <header className={"fn-top" + (awake ? " on" : "")}>
        <div className="fn-top-l">
          <span className="fn-mark">LIVV</span>
          <span className="fn-sep" />
          <span className="fn-id">FIELD NOTE / 001</span>
        </div>
        <div className="fn-top-r">
          <span className="fn-loc">PHILADELPHIA</span>
          <span className={"fn-status" + (awake ? " live" : "")}>
            {awake ? "DISCOVERED" : "— — —"}
          </span>
        </div>
      </header>

      <div className="fn-body">
        {act === 0 && (
          <section className={"fn-act fn-act0" + (awake ? " on" : "")} aria-live="polite">
            <div className="fn-signal" aria-hidden>
              <div className="fn-ring r1" />
              <div className="fn-ring r2" />
              <div className="fn-ring r3" />
              <div className="fn-core">
                <img src="/livv-logo.png" alt="" width={48} height={48} />
              </div>
            </div>

            <p className="fn-micro-label">SIGNAL</p>
            <h1 className="fn-title">
              <span className="fn-line dim">You found</span>
              <span className="fn-line">LIVV.</span>
            </h1>
            <p className="fn-sub">
              Not a pitch. A doorway into a different way of thinking about your life.
            </p>

            <button type="button" className="fn-ghost" onClick={() => go(1)}>
              <span>KEEP GOING</span>
              <span className="fn-arrow" aria-hidden>
                →
              </span>
            </button>
          </section>
        )}

        {act === 1 && (
          <section className="fn-act fn-act1 on" aria-live="polite">
            <p className="fn-micro-label">THE IDEA</p>
            <h1 className="fn-title stack">
              <span className="fn-line">You are not</span>
              <span className="fn-line">here just to</span>
              <span className="fn-line dim">survive.</span>
            </h1>
            <p className="fn-sub left">
              What happens when becoming more capable becomes part of everyday life?
            </p>

            <button type="button" className="fn-ghost solid" onClick={() => go(2)}>
              <span>INSPECT THE SYSTEM</span>
              <span className="fn-arrow" aria-hidden>
                →
              </span>
            </button>
          </section>
        )}

        {act === 2 && (
          <section className="fn-act fn-act2 on" aria-live="polite">
            <div className="fn-act2-head">
              <p className="fn-micro-label">SYSTEM / 4 NODES</p>
              <p className="fn-hint">Tap a node.</p>
            </div>

            <div className="fn-constellation" role="list">
              {PILLARS.map((p, i) => {
                const active = selected === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="listitem"
                    className={"fn-node n" + i + (active ? " active" : "")}
                    onClick={() => {
                      haptic(active ? "light" : "medium");
                      setSelected(active ? null : p.id);
                    }}
                    aria-expanded={active}
                    aria-label={p.label}
                  >
                    <span className="fn-node-coord">{p.coord}</span>
                    <span className="fn-node-label">{p.label}</span>
                    <span className={"fn-node-detail" + (active ? " show" : "")}>
                      {p.line}
                    </span>
                  </button>
                );
              })}
              <div className="fn-constellation-hub" aria-hidden>
                <img src="/livv-logo.png" alt="" width={28} height={28} />
              </div>
            </div>

            <button type="button" className="fn-ghost solid" onClick={() => go(3)}>
              <span>CONTINUE</span>
              <span className="fn-arrow" aria-hidden>
                →
              </span>
            </button>
          </section>
        )}

        {act === 3 && (
          <section
            className={"fn-act fn-act3 on" + (ctaReady ? " ready" : "")}
            aria-live="polite"
          >
            <div className="fn-threshold-mark" aria-hidden>
              <img src="/livv-logo.png" alt="" width={56} height={56} />
            </div>
            <p className="fn-micro-label">THRESHOLD</p>
            <h1 className="fn-title stack">
              <span className="fn-line">Evolve</span>
              <span className="fn-line">with</span>
              <span className="fn-line dim">purpose.</span>
            </h1>
            <p className="fn-sub left">
              Training. Health. Knowledge. Practical capability. The small things that compound into a life you can actually live.
            </p>

            <button
              type="button"
              className={"fn-enter" + (ctaReady ? " show" : "")}
              onClick={() => {
                haptic("success");
                router.push("/auth");
              }}
              disabled={!ctaReady}
            >
              <span className="fn-enter-label">ENTER LIVV</span>
              <span className="fn-enter-icon" aria-hidden>
                →
              </span>
            </button>

            <button
              type="button"
              className={"fn-secondary" + (ctaReady ? " show" : "")}
              onClick={() => router.push("/")}
            >
              EXPLORE THE SITE
            </button>
          </section>
        )}
      </div>

      <footer className={"fn-foot" + (awake ? " on" : "")}>
        <div className="fn-ticks" aria-hidden>
          {[0, 1, 2, 3].map((n) => (
            <span
              key={n}
              className={n === act ? "on" : n < act ? "done" : ""}
            />
          ))}
        </div>
        <span className="fn-foot-meta">
          {act === 0 && "TAP / SCAN / ENTER"}
          {act === 1 && "FIELD NOTE / 001"}
          {act === 2 && "NODES ONLINE"}
          {act === 3 && "EVOLVE WITH PURPOSE"}
        </span>
      </footer>
    </main>
  );
}
