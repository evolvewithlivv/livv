export function SkeletonScreen({ label = "Loading" }: { label?: string }) {
  return (
    <main className="livv-skel-screen" aria-busy="true" aria-label={label}>
      <span className="livv-skel livv-skel-k" />
      <span className="livv-skel livv-skel-title" />
      <span className="livv-skel livv-skel-line" />
      <span className="livv-skel livv-skel-line is-short" />
      <span className="livv-skel livv-skel-block" />
    </main>
  );
}
