"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AmbientField } from "@/components/layout/ambient-field";
import { activeVolume, loadCanon, minutesIn, shelf } from "@/lib/canon";
import { loadLab, lockedHunts, openHunts } from "@/lib/lab";

export default function MindPage() {
  const [ready, setReady] = useState(false);
  const [vol, setVol] = useState(activeVolume());
  const [closed, setClosed] = useState(0);
  const [open, setOpen] = useState(0);
  const [locked, setLocked] = useState(0);
  const [topHunt, setTopHunt] = useState("");

  useEffect(() => {
    const sync = () => {
      const c = loadCanon();
      const l = loadLab();
      setVol(activeVolume(c));
      setClosed(shelf(c).length);
      setOpen(openHunts(l).length);
      setLocked(lockedHunts(l).length);
      setTopHunt(openHunts(l)[0]?.question || lockedHunts(l)[0]?.question || "");
      setReady(true);
    };
    sync();
    window.addEventListener("livv-canon", sync);
    window.addEventListener("livv-lab", sync);
    return () => {
      window.removeEventListener("livv-canon", sync);
      window.removeEventListener("livv-lab", sync);
    };
  }, []);

  if (!ready) return <main className="min-h-dvh bg-[#050505]" />;

  return (
    <main className="relative min-h-full overflow-hidden pb-16">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div
          className="absolute left-1/2 top-[-120px] h-[520px] w-[520px] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgb(var(--livv-accent) / 0.18), transparent 68%)" }}
        />
        <AmbientField intensity="strong" />
      </div>
      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/30">Mind floor</p>
        <h1 className="font-display mt-2 text-[40px] font-semibold tracking-tight">Input that compounds.</h1>
        <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-white/40">
          Reading is not a list. Research is not notes. One open volume. Open hunts. Verdicts when you actually know.
        </p>

        <Link href="/home/canon" className="mt-8 block" >
          <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03] p-5 transition active:scale-[0.99]">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />
            <p className="text-[10px] uppercase tracking-[0.28em] text-amber-200/70">Canon</p>
            <p className="font-display mt-2 text-[26px] font-semibold">What you are ingesting</p>
            {vol ? (
              <>
                <p className="mt-4 text-[16px] text-white/80">{vol.title}</p>
                <p className="mt-1 text-[12px] text-white/35">{vol.author} · {minutesIn(vol)}m sat · {vol.sessions.length} sits</p>
              </>
            ) : (
              <p className="mt-4 text-[14px] text-white/40">Nothing open. A mind with no input just recycles itself.</p>
            )}
            <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-white/25">{closed} closed on the shelf · Enter →</p>
          </section>
        </Link>

        <Link href="/home/lab" className="mt-3 block">
          <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03] p-5 transition active:scale-[0.99]">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/45 to-transparent" />
            <p className="text-[10px] uppercase tracking-[0.28em] text-sky-300/70">Lab</p>
            <p className="font-display mt-2 text-[26px] font-semibold">What you are hunting</p>
            {topHunt ? (
              <p className="mt-4 text-[16px] leading-snug text-white/80">{topHunt}</p>
            ) : (
              <p className="mt-4 text-[14px] text-white/40">No live hunt. Pick a question worth bleeding time on.</p>
            )}
            <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-white/25">{open} open · {locked} locked · Enter →</p>
          </section>
        </Link>

        <p className="mt-10 text-center text-[11px] leading-relaxed text-white/25">
          Sits and signals write to the Mind pillar and pay Embers. Closing a book or locking a hunt is the expensive move — you have to say what it did.
        </p>
      </div>
    </main>
  );
}
