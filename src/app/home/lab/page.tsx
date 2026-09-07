"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AmbientField } from "@/components/layout/ambient-field";
import {
  addSignal,
  loadLab,
  lockHunt,
  lockedHunts,
  openHunts,
  startHunt,
  type Hunt,
} from "@/lib/lab";
import { feedback } from "@/lib/sensory";

export default function LabPage() {
  const [open, setOpen] = useState<Hunt[]>([]);
  const [locked, setLocked] = useState<Hunt[]>([]);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState<Hunt | null>(null);
  const [source, setSource] = useState("");
  const [proof, setProof] = useState("");
  const [verdict, setVerdict] = useState("");
  const [mode, setMode] = useState<"signal" | "lock" | null>(null);

  const sync = () => {
    const l = loadLab();
    setOpen(openHunts(l));
    setLocked(lockedHunts(l));
  };

  useEffect(() => {
    sync();
    window.addEventListener("livv-lab", sync);
    return () => window.removeEventListener("livv-lab", sync);
  }, []);

  return (
    <main className="relative min-h-full overflow-hidden pb-16">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute right-[-20%] top-[-60px] h-[420px] w-[420px] rounded-full" style={{ background: "radial-gradient(circle, rgba(125,211,252,0.12), transparent 68%)" }} />
        <AmbientField />
      </div>
      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <Link href="/home/mind" className="text-[10px] uppercase tracking-[0.28em] text-white/30">Mind → Lab</Link>
            <h1 className="font-display mt-2 text-[36px] font-semibold tracking-tight">Lab</h1>
            <p className="mt-2 max-w-[32ch] text-[13px] leading-relaxed text-white/40">Hunts, not notes. A question. Signals. A verdict when you stop pretending you’re still researching.</p>
          </div>
          <Link href="/home/canon" className="text-[11px] text-amber-200/70">Canon →</Link>
        </div>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-sky-300/70">Open a hunt</p>
          <textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="What are you actually trying to find out?" rows={2} className="mt-4 w-full resize-none bg-transparent text-[17px] outline-none placeholder:text-white/20" />
          <button
            type="button"
            onClick={() => {
              if (q.trim().length < 8) return;
              startHunt(q);
              feedback("tick");
              setQ("");
              sync();
            }}
            className="mt-3 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-black"
          >
            Start hunt
          </button>
        </section>

        <section className="mt-10">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Live hunts</p>
          {open.length === 0 && <p className="mt-3 text-[13px] text-white/35">Quiet lab. That is either focus or avoidance.</p>}
          <div className="mt-3 space-y-3">
            {open.map((h) => (
              <div key={h.id} className="rounded-[24px] border border-white/8 bg-white/[0.025] p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[15px] leading-snug text-white/85">{h.question}</p>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-sky-200/70 ring-1 ring-sky-200/20">{h.status}</span>
                </div>
                <p className="mt-2 text-[11px] text-white/30">{h.signals.length} signal{h.signals.length === 1 ? "" : "s"}</p>
                <div className="mt-3 space-y-2">
                  {h.signals.slice(0, 3).map((s) => (
                    <div key={s.id} className="border-l border-sky-300/30 pl-3">
                      <p className="text-[12px] text-white/60">{s.proof}</p>
                      <p className="mt-0.5 text-[10px] text-white/25">{s.source}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => { setFocus(h); setMode("signal"); }} className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-black">Add signal</button>
                  <button type="button" onClick={() => { setFocus(h); setMode("lock"); }} className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/55">Lock verdict</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {locked.length > 0 && (
          <section className="mt-12">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Locked</p>
            <div className="mt-3 space-y-2">
              {locked.map((h) => (
                <div key={h.id} className="rounded-2xl border border-white/7 px-4 py-3">
                  <p className="text-[13px] text-white/45">{h.question}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-sky-100/80">{h.verdict}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {focus && mode && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/80 backdrop-blur-md" onClick={() => { setFocus(null); setMode(null); }}>
          <div className="w-full rounded-t-[32px] border-t border-white/10 bg-[#0b0d11] p-5 pb-10" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">{mode === "signal" ? "Signal" : "Verdict"}</p>
            <p className="mt-2 text-[15px] text-white/70">{focus.question}</p>
            {mode === "signal" ? (
              <>
                <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Where did this come from" className="mt-5 w-full border-b border-white/10 bg-transparent pb-2 text-[14px] outline-none placeholder:text-white/20" />
                <textarea value={proof} onChange={(e) => setProof(e.target.value)} placeholder="What did it actually show" rows={3} className="mt-4 w-full resize-none rounded-2xl bg-white/[0.04] p-3 text-[14px] outline-none ring-1 ring-white/10 placeholder:text-white/20" />
                <button
                  type="button"
                  disabled={proof.trim().length < 4}
                  onClick={() => {
                    addSignal(focus.id, source || "Unsourced", proof);
                    feedback("complete");
                    setSource("");
                    setProof("");
                    setFocus(null);
                    setMode(null);
                    sync();
                  }}
                  className="mt-5 w-full rounded-full bg-white py-3.5 text-sm font-semibold text-black disabled:opacity-40"
                >
                  File signal · +4 Embers
                </button>
              </>
            ) : (
              <>
                <textarea value={verdict} onChange={(e) => setVerdict(e.target.value)} placeholder="So what is true now" rows={4} className="mt-5 w-full resize-none rounded-2xl bg-white/[0.04] p-3 text-[14px] outline-none ring-1 ring-white/10 placeholder:text-white/20" />
                <button
                  type="button"
                  disabled={verdict.trim().length < 8}
                  onClick={() => {
                    lockHunt(focus.id, verdict);
                    feedback("unlock");
                    setVerdict("");
                    setFocus(null);
                    setMode(null);
                    sync();
                  }}
                  className="mt-5 w-full rounded-full bg-white py-3.5 text-sm font-semibold text-black disabled:opacity-40"
                >
                  Lock it · +10 Embers
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
