import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[var(--livv-bg)] px-6 text-white">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] border border-white/10 bg-white/[0.04] text-xl text-white/60">↗</div>
        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.34em] text-white/30">LIVV</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Nothing here yet.</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/40">That path does not belong to your current LIVV world.</p>
        <Link href="/home" className="mt-7 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">Return home</Link>
      </div>
    </main>
  );
}
