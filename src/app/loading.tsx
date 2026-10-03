import "./loading-screen.css";

/**
 * Global route loading UI.
 * Signal rings + single line. No mark, no progress bar.
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
            <img src="/livv-logo.png" alt="" width={48} height={48} />
          </div>
        </div>

        <p className="ll-line">Loading your world.</p>
      </div>
    </main>
  );
}
