import "./loading-screen.css";

/**
 * Global route loading UI — first paint of every navigation suspend.
 * Matches Field Note 001 signal language: dark void, rings, mark.
 * Forced graphite so we never flash system white/gray.
 */
export default function Loading() {
  return (
    <main className="ll" aria-busy="true" aria-label="Loading LIVV">
      <div className="ll-void" aria-hidden />
      <div className="ll-grid" aria-hidden />
      <div className="ll-pulse" aria-hidden />

      <div className="ll-stage">
        <div className="ll-signal" aria-hidden>
          <div className="ll-ring r1" />
          <div className="ll-ring r2" />
          <div className="ll-ring r3" />
          <div className="ll-core">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/livv-logo.png" alt="" width={40} height={40} />
          </div>
        </div>

        <p className="ll-mark">LIVV</p>
        <p className="ll-line">Loading your world.</p>
        <div className="ll-bar" aria-hidden>
          <span className="ll-bar-fill" />
        </div>
      </div>
    </main>
  );
}
