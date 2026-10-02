"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

  // Act 0: system wakes after a beat — feels discovered, not presented
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t1 = window.setTimeout(() => setAwake(true), reduced ? 80 : 900);
    return () => window.clearTimeout(t1);
  }, []);

  // Act 3: hold the quiet before CTA appears
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
    setSelected(null);
    setAct(next);
    window.scrollTo({ top: 0, behavior: "instant" in window ? ("instant" as ScrollBehavior) : "auto" });
  }, []);

  return (
    <main className="fn" aria-label="LIVV Field Note 001">
      {/* Atmospheric layers — light as information, not decoration */}
      <div className="fn-void" aria-hidden />
      <div className="fn-grid" aria-hidden />
      <div className={`fn-pulse ${awake ? "on" : ""}`} aria-hidden />
      <div className="fn-scan" aria-hidden />

      {/* Persistent micro-identity */}
      <header className={`fn-top ${awake ? "on" : ""}`}>
        <div className="fn-top-l">
          <span className="fn-mark">LIVV</span>
          <span className="fn-sep" />
          <span className="fn-id">FIELD NOTE / 001</span>
        </div>
        <div className="fn-top-r">
          <span className="fn-loc">PHILADELPHIA</span>
          <span className={`fn-status ${awake ? "live" : ""}`}>
            {awake ? "DISCOVERED" : "— — —"}
          </span>
        </div>
      </header>

      <div className="fn-body">
        {/* ACT 0 — Dormant signal */}
        {act === 0 && (
          <section className={`fn-act fn-act0 ${awake ? "on" : ""}`} aria-live="polite">
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
              Not a pitch. A doorway into a different way of thinking about your
              life.
            </p>

            <button type="button" className="fn-ghost" onClick={() => go(1)}>
              <span>KEEP GOING</span>
              <span className="fn-arrow" aria-hidden>
                →
              </span>
            </button>
          </section>
        )}

        {/* ACT 1 — The question / worldview */}
        {act === 1 && (
          <section className="fn-act fn-act1 on" aria-live="polite">
            <p className="fn-micro-label">THE IDEA</p>
            <h1 className="fn-title stack">
              <span className="fn-line">You are not</span>
              <span className="fn-line">here just to</span>
              <span className="fn-line dim">survive.</span>
            </h1>
            <p className="fn-sub left">
              What happens when becoming more capable becomes part of everyday
              life?
            </p>

            <button type="button" className="fn-ghost solid" onClick={() => go(2)}>
              <span>INSPECT THE SYSTEM</span>
              <span className="fn-arrow" aria-hidden>
                →
              </span>
            </button>
          </section>
        )}

        {/* ACT 2 — Pillars as coordinates, not cards */}
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
                    className={`fn-node n${i} ${active ? "active" : ""}`}
                    onClick={() => setSelected(active ? null : p.id)}
                    aria-expanded={active}
                    aria-label={p.label}
                  >
                    <span className="fn-node-coord">{p.coord}</span>
                    <span className="fn-node-label">{p.label}</span>
                    <span className={`fn-node-detail ${active ? "show" : ""}`}>
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

        {/* ACT 3 — Threshold */}
        {act === 3 && (
          <section className={`fn-act fn-act3 on ${ctaReady ? "ready" : ""}`} aria-live="polite">
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
              Training. Health. Knowledge. Practical capability. The small things
              that compound into a life you can actually live.
            </p>

            <button
              type="button"
              className={`fn-enter ${ctaReady ? "show" : ""}`}
              onClick={() => router.push("/auth")}
              disabled={!ctaReady}
            >
              <span className="fn-enter-label">ENTER LIVV</span>
              <span className="fn-enter-icon" aria-hidden>
                →
              </span>
            </button>

            <button
              type="button"
              className={`fn-secondary ${ctaReady ? "show" : ""}`}
              onClick={() => router.push("/")}
            >
              EXPLORE THE SITE
            </button>
          </section>
        )}
      </div>

      <footer className={`fn-foot ${awake ? "on" : ""}`}>
        <div className="fn-ticks" aria-hidden>
          {[0, 1, 2, 3].map((n) => (
            <span key={n} className={n === act ? "on" : n < act ? "done" : ""} />
          ))}
        </div>
        <span className="fn-foot-meta">
          {act === 0 && "TAP / SCAN / ENTER"}
          {act === 1 && "FIELD NOTE / 001"}
          {act === 2 && "NODES ONLINE"}
          {act === 3 && "EVOLVE WITH PURPOSE"}
        </span>
      </footer>

      <style jsx>{`
        .fn {
          --bg: #030405;
          --ink: #f2f0eb;
          --muted: rgba(242, 240, 235, 0.48);
          --line: rgba(242, 240, 235, 0.1);
          --accent: #7eb0ff;
          position: relative;
          min-height: 100svh;
          min-height: 100dvh;
          overflow-x: hidden;
          isolation: isolate;
          background: var(--bg);
          color: var(--ink);
          font-family: var(--font-body), system-ui, sans-serif;
        }

        .fn-void {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(80, 120, 180, 0.07), transparent 55%),
            radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255, 255, 255, 0.03), transparent 50%);
          z-index: 0;
        }

        .fn-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.07;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.35) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%);
          z-index: 0;
        }

        .fn-pulse {
          position: absolute;
          width: min(90vw, 480px);
          aspect-ratio: 1;
          left: 50%;
          top: 38%;
          transform: translate(-50%, -50%) scale(0.6);
          border-radius: 50%;
          background: rgba(100, 150, 220, 0.06);
          filter: blur(48px);
          opacity: 0;
          transition: opacity 1.8s ease, transform 2.4s ease;
          pointer-events: none;
          z-index: 0;
        }
        .fn-pulse.on {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        .fn-scan {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(126, 176, 255, 0.03) 50%,
            transparent 100%
          );
          background-size: 100% 200%;
          animation: fn-scan 9s linear infinite;
          opacity: 0.4;
          z-index: 1;
        }
        @keyframes fn-scan {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 0% 100%;
          }
        }

        .fn-top,
        .fn-foot {
          position: relative;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: min(100% - 2rem, 28rem);
          margin: 0 auto;
          opacity: 0;
          transform: translateY(-6px);
          transition: opacity 1s ease 0.4s, transform 1s ease 0.4s;
        }
        .fn-top.on,
        .fn-foot.on {
          opacity: 1;
          transform: none;
        }
        .fn-top {
          padding-top: max(1rem, env(safe-area-inset-top));
          padding-bottom: 0.5rem;
        }
        .fn-top-l,
        .fn-top-r {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .fn-mark {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }
        .fn-sep {
          width: 12px;
          height: 1px;
          background: var(--line);
        }
        .fn-id,
        .fn-loc,
        .fn-status,
        .fn-foot-meta {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: var(--muted);
          text-transform: uppercase;
        }
        .fn-status.live {
          color: var(--accent);
        }

        .fn-body {
          position: relative;
          z-index: 10;
          width: min(100% - 2rem, 28rem);
          min-height: calc(100svh - 7.5rem);
          min-height: calc(100dvh - 7.5rem);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 1.5rem 0 2rem;
        }

        .fn-act {
          width: 100%;
          opacity: 0;
          transform: translateY(16px);
          filter: blur(6px);
          transition: opacity 0.9s cubic-bezier(0.2, 0.85, 0.2, 1),
            transform 0.9s cubic-bezier(0.2, 0.85, 0.2, 1),
            filter 0.9s ease;
        }
        .fn-act.on {
          opacity: 1;
          transform: none;
          filter: none;
        }

        .fn-signal {
          position: relative;
          width: min(56vw, 200px);
          aspect-ratio: 1;
          margin: 0 auto 2rem;
          display: grid;
          place-items: center;
        }
        .fn-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(200, 220, 255, 0.12);
        }
        .fn-ring.r1 {
          border-top-color: rgba(200, 220, 255, 0.55);
          animation: fn-spin 18s linear infinite;
        }
        .fn-ring.r2 {
          inset: 14%;
          border-style: dashed;
          border-color: rgba(200, 220, 255, 0.18);
          animation: fn-spin-rev 26s linear infinite;
        }
        .fn-ring.r3 {
          inset: 28%;
          border-color: rgba(200, 220, 255, 0.08);
        }
        .fn-core {
          width: 42%;
          aspect-ratio: 1;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.03);
          box-shadow: 0 0 40px rgba(100, 150, 220, 0.12);
        }
        .fn-core img {
          width: 58%;
          height: auto;
          filter: brightness(0) invert(1);
          opacity: 0.92;
        }
        @keyframes fn-spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fn-spin-rev {
          to {
            transform: rotate(-360deg);
          }
        }

        .fn-micro-label {
          margin: 0 0 1rem;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.22em;
          color: var(--accent);
          text-transform: uppercase;
        }
        .fn-act0 .fn-micro-label {
          text-align: center;
        }

        .fn-title {
          margin: 0;
          font-family: var(--font-display), var(--font-body), sans-serif;
          font-weight: 600;
          font-size: clamp(2.75rem, 12vw, 4.25rem);
          line-height: 0.95;
          letter-spacing: -0.055em;
        }
        .fn-title.stack .fn-line {
          display: block;
        }
        .fn-act0 .fn-title {
          text-align: center;
        }
        .fn-line.dim {
          color: rgba(242, 240, 235, 0.38);
        }

        .fn-sub {
          margin: 1.25rem auto 0;
          max-width: 28ch;
          font-size: 0.9375rem;
          line-height: 1.65;
          color: var(--muted);
        }
        .fn-act0 .fn-sub {
          text-align: center;
        }
        .fn-sub.left {
          margin-left: 0;
          max-width: 34ch;
        }

        .fn-ghost {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-top: 2.25rem;
          min-height: 3.5rem;
          padding: 0 1.25rem;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          background: transparent;
          color: var(--ink);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.16em;
          cursor: pointer;
          transition: background 0.25s, border-color 0.25s, transform 0.2s;
        }
        .fn-ghost.solid {
          background: #f1efe9;
          color: #070809;
          border-color: transparent;
        }
        .fn-ghost:active {
          transform: scale(0.98);
        }
        .fn-arrow {
          font-size: 1rem;
          font-weight: 400;
        }

        /* Constellation */
        .fn-act2-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .fn-act2-head .fn-micro-label {
          margin: 0;
        }
        .fn-hint {
          margin: 0;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--muted);
          text-transform: uppercase;
        }

        .fn-constellation {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.65rem;
          margin-bottom: 1.5rem;
          padding: 0.5rem 0 0.75rem;
        }
        .fn-constellation-hub {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 2.5rem;
          height: 2.5rem;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: grid;
          place-items: center;
          background: rgba(3, 4, 5, 0.85);
          pointer-events: none;
          z-index: 2;
        }
        .fn-constellation-hub img {
          width: 55%;
          filter: brightness(0) invert(1);
          opacity: 0.7;
        }

        .fn-node {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.35rem;
          min-height: 5.5rem;
          padding: 0.9rem 0.85rem;
          border: 1px solid var(--line);
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.02);
          color: var(--ink);
          text-align: left;
          cursor: pointer;
          transition: border-color 0.3s, background 0.3s, min-height 0.35s ease;
        }
        .fn-node.active {
          border-color: rgba(126, 176, 255, 0.35);
          background: rgba(126, 176, 255, 0.06);
          min-height: 7.25rem;
        }
        .fn-node-coord {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: var(--muted);
        }
        .fn-node-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }
        .fn-node-detail {
          font-size: 12px;
          line-height: 1.45;
          color: var(--muted);
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height 0.35s ease, opacity 0.3s ease;
        }
        .fn-node-detail.show {
          max-height: 4rem;
          opacity: 1;
        }

        /* Threshold */
        .fn-threshold-mark {
          width: 4rem;
          height: 4rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 1rem;
          display: grid;
          place-items: center;
          background: rgba(255, 255, 255, 0.03);
        }
        .fn-threshold-mark img {
          width: 52%;
          filter: brightness(0) invert(1);
        }

        .fn-enter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-top: 2rem;
          min-height: 3.75rem;
          padding: 0 0.35rem 0 1.35rem;
          border: none;
          border-radius: 999px;
          background: #f1efe9;
          color: #070809;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
          cursor: pointer;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .fn-enter.show {
          opacity: 1;
          transform: none;
        }
        .fn-enter:disabled {
          cursor: default;
        }
        .fn-enter-icon {
          display: grid;
          place-items: center;
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 50%;
          background: #070809;
          color: #f1efe9;
          font-size: 1rem;
        }

        .fn-secondary {
          display: block;
          width: 100%;
          margin-top: 1rem;
          padding: 0.75rem;
          border: none;
          background: transparent;
          color: var(--muted);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.16em;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.8s ease 0.15s;
        }
        .fn-secondary.show {
          opacity: 1;
        }

        .fn-foot {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
        .fn-ticks {
          display: flex;
          gap: 4px;
        }
        .fn-ticks span {
          width: 1rem;
          height: 2px;
          background: var(--line);
          transition: width 0.35s, background 0.35s;
        }
        .fn-ticks span.on {
          width: 1.75rem;
          background: var(--ink);
        }
        .fn-ticks span.done {
          background: rgba(242, 240, 235, 0.35);
        }

        @media (min-width: 700px) {
          .fn-top,
          .fn-foot,
          .fn-body {
            width: min(100% - 3.5rem, 30rem);
          }
          .fn-title {
            font-size: clamp(3rem, 6vw, 4.5rem);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .fn-scan,
          .fn-ring.r1,
          .fn-ring.r2 {
            animation: none;
          }
          .fn-act,
          .fn-top,
          .fn-foot,
          .fn-pulse,
          .fn-enter,
          .fn-secondary {
            transition-duration: 0.01ms !important;
          }
          .fn-act {
            filter: none;
          }
        }
      `}</style>
    </main>
  );
}
