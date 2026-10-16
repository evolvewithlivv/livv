/**
 * Global route loading UI.
 * Signal rings + single line. No mark, so routes that never show this
 * screen do not preload a logo. Styles live with the root shell.
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
          <div className="ll-core" />
        </div>

        <p className="ll-line">Loading your world.</p>
      </div>
    </main>
  );
}
