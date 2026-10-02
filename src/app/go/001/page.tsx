"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const pillars = [
  { word: "LONGEVITY", text: "Build a body and life that can carry you further." },
  { word: "INTEGRITY", text: "Make your actions line up with what you say matters." },
  { word: "VITALITY", text: "Protect the energy, health, and presence that make life feel alive." },
  { word: "VIGILANCE", text: "Stay aware, prepared, and capable when life gets real." },
];

export default function FieldNote001() {
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [revealed, setRevealed] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.dataset.livvRoute = "field-note-001";
    return () => {
      delete document.documentElement.dataset.livvRoute;
    };
  }, []);

  const advance = () => {
    setRevealed(null);
    setStage((current) => Math.min(current + 1, 2));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="field-note" aria-label="LIVV Field Note 001">
      <div className="field-note-grid" aria-hidden="true" />

      <header className="field-note-header">
        <div className="field-note-brand">LIVV</div>
        <div className="field-note-code">FIELD NOTE / 001</div>
      </header>

      <div className="field-note-stage">
        {stage === 0 && (
          <section className="field-note-screen field-note-screen--first">
            <div className="field-note-eyebrow">YOU FOUND IT</div>
            <h1>
              You found
              <span>LIVV.</span>
            </h1>
            <p className="field-note-lede">
              This is not a pitch. It is a doorway into a different way of
              thinking about your life.
            </p>
            <button className="field-note-button" onClick={advance}>
              <span>KEEP GOING</span>
              <span aria-hidden="true">↗</span>
            </button>
          </section>
        )}

        {stage === 1 && (
          <section className="field-note-screen">
            <div className="field-note-eyebrow">THE IDEA</div>
            <h2>
              You are not here
              <span>just to survive.</span>
            </h2>
            <p className="field-note-lede">
              LIVV is built around one question: what happens when becoming
              more capable becomes part of everyday life?
            </p>

            <div className="field-note-pillars" aria-label="The four LIVV pillars">
              {pillars.map((pillar, index) => {
                const isOpen = revealed === index;
                return (
                  <button
                    key={pillar.word}
                    className={"field-note-pillar" + (isOpen ? " is-open" : "")}
                    onClick={() => setRevealed(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span className="field-note-pillar-index">0{index + 1}</span>
                    <span className="field-note-pillar-copy">
                      <strong>{pillar.word}</strong>
                      {isOpen && <small>{pillar.text}</small>}
                    </span>
                    <span className="field-note-pillar-mark" aria-hidden="true">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>

            <button className="field-note-button" onClick={advance}>
              <span>SEE THE SYSTEM</span>
              <span aria-hidden="true">↗</span>
            </button>
          </section>
        )}

        {stage === 2 && (
          <section className="field-note-screen field-note-screen--final">
            <div className="field-note-eyebrow">WELCOME TO LIVV</div>
            <div className="field-note-monogram" aria-hidden="true">L</div>
            <h2>
              Evolve
              <span>with purpose.</span>
            </h2>
            <p className="field-note-lede">
              Training. Health. Knowledge. Practical capability. The small
              things that compound into a life you can actually live.
            </p>

            <div className="field-note-actions">
              <button className="field-note-button" onClick={() => router.push("/auth")}>
                <span>ENTER LIVV</span>
                <span aria-hidden="true">↗</span>
              </button>
              <button className="field-note-text-button" onClick={() => router.push("/")}>
                EXPLORE THE SITE
              </button>
            </div>

            <div className="field-note-signoff">
              <span>LIVV</span>
              <span>EVOLVE WITH PURPOSE.</span>
            </div>
          </section>
        )}
      </div>

      <footer className="field-note-footer">
        <div className="field-note-progress" aria-label={"Step " + (stage + 1) + " of 3"}>
          {[0, 1, 2].map((item) => (
            <span key={item} className={item === stage ? "is-active" : ""} />
          ))}
        </div>
        <span>TAP / SCAN / ENTER</span>
      </footer>

      <style jsx>{`
        .field-note {
          --fn-bg: #08090a;
          --fn-ink: #f4f3ef;
          --fn-muted: #8e918f;
          --fn-line: rgba(244,243,239,.13);
          --fn-accent: #0f7fff;
          position: relative;
          min-height: 100svh;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% -15%, rgba(15,127,255,.13), transparent 34%),
            radial-gradient(circle at 100% 80%, rgba(15,127,255,.045), transparent 28%),
            var(--fn-bg);
          color: var(--fn-ink);
          isolation: isolate;
          font-family: var(--font-body), sans-serif;
        }
        .field-note-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .18;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
        }
        .field-note-header,
        .field-note-footer {
          position: relative;
          z-index: 2;
          width: min(100% - 40px, 560px);
          margin-inline: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .field-note-header {
          padding-top: max(24px, env(safe-area-inset-top));
        }
        .field-note-brand {
          font-family: var(--font-display), sans-serif;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -.07em;
        }
        .field-note-code,
        .field-note-eyebrow,
        .field-note-footer {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .field-note-code,
        .field-note-footer { color: var(--fn-muted); }
        .field-note-stage {
          position: relative;
          z-index: 1;
          width: min(100% - 40px, 560px);
          min-height: calc(100svh - 124px);
          margin-inline: auto;
          display: flex;
          align-items: center;
          padding-block: 56px 72px;
          box-sizing: border-box;
        }
        .field-note-screen {
          width: 100%;
          animation: fn-in .55s cubic-bezier(.22,1,.36,1);
        }
        @keyframes fn-in {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .field-note-eyebrow {
          color: var(--fn-accent);
          margin-bottom: 20px;
        }
        h1, h2 {
          margin: 0;
          max-width: 9ch;
          font-family: var(--font-display), sans-serif;
          font-weight: 600;
          letter-spacing: -.055em;
          line-height: .94;
          font-size: clamp(54px, 15vw, 92px);
        }
        h1 span, h2 span {
          display: block;
          color: rgba(244,243,239,.42);
        }
        .field-note-lede {
          max-width: 470px;
          margin: 28px 0 0;
          color: var(--fn-muted);
          font-size: 15px;
          line-height: 1.65;
          letter-spacing: -.01em;
        }
        .field-note-button {
          width: 100%;
          min-height: 56px;
          margin-top: 38px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 0 18px 0 20px;
          border: 1px solid rgba(244,243,239,.18);
          border-radius: 16px;
          background: var(--fn-ink);
          color: #090a0b;
          font: 700 11px/1 var(--font-body), sans-serif;
          letter-spacing: .13em;
          cursor: pointer;
          transition: transform .18s ease, border-color .18s ease, background .18s ease;
        }
        .field-note-button:hover { transform: translateY(-2px); }
        .field-note-button:active { transform: scale(.985); }
        .field-note-button span:last-child {
          font-size: 18px;
          letter-spacing: 0;
        }
        .field-note-pillars {
          margin-top: 34px;
          border-top: 1px solid var(--fn-line);
        }
        .field-note-pillar {
          width: 100%;
          min-height: 64px;
          display: grid;
          grid-template-columns: 38px 1fr 24px;
          align-items: center;
          gap: 10px;
          padding: 0;
          border: 0;
          border-bottom: 1px solid var(--fn-line);
          background: transparent;
          color: var(--fn-ink);
          text-align: left;
          cursor: pointer;
        }
        .field-note-pillar-index {
          color: var(--fn-muted);
          font-size: 9px;
          letter-spacing: .08em;
        }
        .field-note-pillar-copy {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .field-note-pillar-copy strong {
          font-size: 12px;
          letter-spacing: .14em;
        }
        .field-note-pillar-copy small {
          max-width: 390px;
          color: var(--fn-muted);
          font-size: 11px;
          line-height: 1.45;
          letter-spacing: 0;
          animation: fn-in .25s ease;
        }
        .field-note-pillar-mark {
          color: var(--fn-muted);
          font-size: 18px;
          text-align: right;
        }
        .field-note-pillar.is-open .field-note-pillar-mark { color: var(--fn-accent); }
        .field-note-screen--final h2 { max-width: 8ch; }
        .field-note-monogram {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          margin-bottom: 24px;
          border: 1px solid var(--fn-line);
          border-radius: 18px;
          font-family: var(--font-display), sans-serif;
          font-size: 25px;
          font-weight: 700;
        }
        .field-note-actions { max-width: 420px; }
        .field-note-text-button {
          display: block;
          margin: 22px auto 0;
          border: 0;
          background: transparent;
          color: var(--fn-muted);
          font: 700 9px/1 var(--font-body), sans-serif;
          letter-spacing: .15em;
          cursor: pointer;
        }
        .field-note-signoff {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 420px;
          margin-top: 54px;
          padding-top: 16px;
          border-top: 1px solid var(--fn-line);
          color: var(--fn-muted);
          font-size: 8px;
          letter-spacing: .14em;
        }
        .field-note-signoff span:first-child {
          color: var(--fn-ink);
          font-family: var(--font-display), sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -.06em;
        }
        .field-note-footer {
          padding-bottom: max(18px, env(safe-area-inset-bottom));
        }
        .field-note-progress {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .field-note-progress span {
          width: 22px;
          height: 2px;
          background: var(--fn-line);
          transition: width .25s ease, background .25s ease;
        }
        .field-note-progress span.is-active {
          width: 36px;
          background: var(--fn-accent);
        }
        @media (min-width: 700px) {
          .field-note-header,
          .field-note-footer,
          .field-note-stage { width: min(100% - 72px, 620px); }
          .field-note-stage { min-height: calc(100svh - 140px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .field-note-screen { animation: none; }
          .field-note-button, .field-note-progress span { transition: none; }
        }
      `}</style>
    </main>
  );
}
