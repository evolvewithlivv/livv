export default function Loading() {
  return <main className="grid min-h-[100dvh] place-items-center bg-[var(--livv-bg)] px-6 text-center text-white" aria-busy="true" aria-label="Loading LIVV"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] border border-white/10 bg-white/[0.04]"><div className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-[#0F7FFF]" /></div><p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.36em] text-white/50">LIVV</p><p className="mt-2 text-sm text-white/55">Loading your world.</p></div></main>;
}
