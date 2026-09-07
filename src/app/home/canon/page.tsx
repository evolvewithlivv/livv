"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AmbientField } from "@/components/layout/ambient-field";
import {
  activeVolume,
  closeVolume,
  loadCanon,
  minutesIn,
  openVolume,
  shelf,
  sitWithVolume,
  type Volume,
} from "@/lib/canon";
import { feedback } from "@/lib/sensory";

export default function CanonPage() {
  const [vol, setVol] = useState<Volume | null>(null);
  const [closed, setClosed] = useState<Volume[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [mins, setMins] = useState("25");
  const [stolen, setStolen] = useState("");
  const [scar, setScar] = useState("");
  const [sitOpen, setSitOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  const sync = () => {
    const c = loadCanon();
    setVol(activeVolume(c));
    setClosed(shelf(c));
  };

  useEffect(() => {
    sync();
    window.addEventListener("livv-canon", sync);
    return () => window.removeEventListener("livv-canon", sync);
  }, []);

  return (
    <main className="relative min-h-full overflow-hidden pb-16">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute left-[-20%] top-[-80px] h-[420px] w-[420px] rounded-full" style={{ background: "radial-gradient(circle, rgba(245,197,24,0.12), transparent 68%)" }} />
        <AmbientField />
      </div>
      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <Link href="/home/mind" className="text-[10px] uppercase tracking-[0.28em] text-white/30">Mind → Canon</Link>
            <h1 className="font-display mt-2 text-[36px] font-semibold tracking-tight">Canon</h1>
            <p className="mt-2 max-w-[30ch] text-[13px] leading-relaxed text-white/40">One book at a time. Steal a line or it didn’t happen.</p>
          </div>
          <Link href="/home/lab" className="text-[11px] text-sky-300/70">Lab →</Link>
        </div>

        {vol ? (
          <section className="mt-8 overflow-hidden rounded-[30px] border border-amber-200/20 bg-gradient-to-br from-amber-200/[0.08] to-white/[0.02] p-5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-amber-200/70">Open volume</p>
            <p className="font-display mt-3 text-[28px] leading-tight">{vol.title}</p>
            <p className="mt-1 text-[13px] text-white/40">{vol.author}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-black/25 py-3 ring-1 ring-white/8"><p className="font-display text-[18px]">{minutesIn(vol)}</p><p className="text-[9px] uppercase tracking-[0.14em] text-white/30">minutes</p></div>
              <div className="rounded-2xl bg-black/25 py-3 ring-1 ring-white/8"><p className="font-display text-[18px]">{vol.sessions.length}</p><p className="text-[9px] uppercase tracking-[0.14em] text-white/30">sits</p></div>
              <div className="rounded-2xl bg-black/25 py-3 ring-1 ring-white/8"><p className="font-display text-[18px]">{Math.max(1, Math.ceil((Date.now() - vol.openedAt) / 86400000))}</p><p className="text-[9px] uppercase tracking-[0.14em] text-white/30">days open</p></div>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setSitOpen(true)} className="flex-1 rounded-full bg-white py-3 text-[13px] font-semibold text-black">Sit with it</button>
              <button type="button" onClick={() => setCloseOpen(true)} className="rounded-full border border-white/15 px-4 py-3 text-[13px] text-white/60">Close</button>
            </div>
          </section>
        ) : (
          <section className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">Open a volume</p>
            <p className="mt-2 text-[13px] text-white/40">Only one. Finish or drop it before you start another.</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="mt-5 w-full border-b border-white/10 bg-transparent pb-2 text-[18px] outline-none placeholder:text-white/20" />
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Who wrote it" className="mt-4 w-full border-b border-white/10 bg-transparent pb-2 text-[15px] outline-none placeholder:text-white/20" />
            <button
              type="button"
              onClick={() => {
                if (title.trim().length < 2) return;
                openVolume(title, author || "Unknown");
                feedback("unlock");
                setTitle("");
                setAuthor("");
                sync();
              }}
              className="mt-6 w-full rounded-full bg-white py-3 text-[13px] font-semibold text-black"
            >
              Open it
            </button>
          </section>
        )}

        {vol && vol.sessions.length > 0 && (
          <section className="mt-10">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Stolen lines</p>
            <div className="mt-3 space-y-2">
              {vol.sessions.slice(0, 6).map((s) => (
                <div key={s.id} className="rounded-2xl border border-white/7 bg-white/[0.025] px-4 py-3">
                  <p className="text-[14px] leading-relaxed text-white/75">{s.stolen || `${s.minutes} silent minutes. No line taken.`}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/25">{s.minutes}m · {new Date(s.at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {closed.length > 0 && (
          <section className="mt-12">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Shelf</p>
            <div className="mt-3 space-y-2">
              {closed.map((v) => (
                <div key={v.id} className="rounded-2xl border border-white/7 bg-white/[0.02] px-4 py-3">
                  <p className="text-[14px] font-medium">{v.title}</p>
                  <p className="text-[11px] text-white/30">{v.author} · {minutesIn(v)}m</p>
                  {v.scar && <p className="mt-2 text-[13px] leading-relaxed text-amber-100/70">“{v.scar}”</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {sitOpen && (
        <Sheet onClose={() => setSitOpen(false)} label="Sit">
          <p className="text-[13px] text-white/40">Time in the chair, then the sentence you are not allowed to forget.</p>
          <input value={mins} onChange={(e) => setMins(e.target.value)} inputMode="numeric" className="mt-5 w-full border-b border-white/10 bg-transparent pb-2 text-[28px] outline-none" />
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/25">minutes</p>
          <textarea value={stolen} onChange={(e) => setStolen(e.target.value)} placeholder="The line you stole" rows={3} className="mt-5 w-full resize-none rounded-2xl bg-white/[0.04] p-3 text-[14px] outline-none ring-1 ring-white/10 placeholder:text-white/20" />
          <button
            type="button"
            onClick={() => {
              sitWithVolume(Number(mins) || 1, stolen);
              feedback("complete");
              setStolen("");
              setSitOpen(false);
              sync();
            }}
            className="mt-5 w-full rounded-full bg-white py-3.5 text-sm font-semibold text-black"
          >
            Log the sit · Embers
          </button>
        </Sheet>
      )}

      {closeOpen && (
        <Sheet onClose={() => setCloseOpen(false)} label="Close volume">
          <p className="text-[13px] text-white/40">You don’t get to shelve it without a scar. One sentence. What did it do to you.</p>
          <textarea value={scar} onChange={(e) => setScar(e.target.value)} placeholder="It made me…" rows={4} className="mt-5 w-full resize-none rounded-2xl bg-white/[0.04] p-3 text-[14px] outline-none ring-1 ring-white/10 placeholder:text-white/20" />
          <button
            type="button"
            disabled={scar.trim().length < 8}
            onClick={() => {
              closeVolume(scar);
              feedback("unlock");
              setScar("");
              setCloseOpen(false);
              sync();
            }}
            className="mt-5 w-full rounded-full bg-white py-3.5 text-sm font-semibold text-black disabled:opacity-40"
          >
            Shelve it
          </button>
        </Sheet>
      )}
    </main>
  );
}

function Sheet({ children, onClose, label }: { children: React.ReactNode; onClose: () => void; label: string }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div className="w-full rounded-t-[32px] border-t border-white/10 bg-[#0b0d11] p-5 pb-10" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
        <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">{label}</p>
        {children}
      </div>
    </div>
  );
}
