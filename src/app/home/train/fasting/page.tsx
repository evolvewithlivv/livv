"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PROTOCOLS, cancelFast, elapsedMs, endFast, fastingStats, formatClock, getActiveFast, loadFastState, progressPct, startFast, type FastSession } from "@/lib/fasting";

export default function FastingPage() {
  const [state, setState] = useState(() => loadFastState());
  const [now, setNow] = useState(() => Date.now());
  const [protocol, setProtocol] = useState("16-8");
  const [customHours, setCustomHours] = useState(16);
  const active = useMemo(() => getActiveFast(state), [state]);
  const stats = useMemo(() => fastingStats(state), [state]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    const sync = () => setState(loadFastState());
    window.addEventListener("livv-fasting", sync);
    return () => { window.clearInterval(id); window.removeEventListener("livv-fasting", sync); };
  }, []);

  const selected = PROTOCOLS.find((p) => p.id === protocol) || PROTOCOLS[0];
  const begin = () => {
    startFast({ protocolId: protocol, targetHours: protocol === "custom" ? customHours : selected.hours });
    setState(loadFastState());
  };
  const finish = (broken = false) => {
    endFast({ broken });
    setState(loadFastState());
  };
  const activeMs = active ? elapsedMs(active as FastSession, now) : 0;

  return <main className="livv-page min-h-full pb-10 pt-5">
    <Container>
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Train · Recovery</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Fasting</h1><p className="mt-1 text-sm text-white/50">Track the fast. Keep the data. You decide the protocol.</p></div>
        <Link href="/home/train" className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/50">Train</Link>
      </div>

      {active ? <section className="mt-7 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-[0.24em] text-white/35">Currently fasting</span><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold text-emerald-300">ACTIVE</span></div>
        <p className="mt-7 text-center text-5xl font-semibold tabular-nums tracking-tight">{formatClock(activeMs)}</p>
        <p className="mt-2 text-center text-xs text-white/35">{active.protocolName} · target {active.targetHours}h</p>
        <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${progressPct(active, now)}%` }} /></div>
        <div className="mt-2 flex justify-between text-[10px] text-white/30"><span>{progressPct(active, now)}%</span><span>{Math.max(0, active.targetHours - activeMs / 3600000).toFixed(1)}h remaining</span></div>
        <div className="mt-7 grid grid-cols-2 gap-2.5"><button onClick={() => finish(false)} className="rounded-full bg-white py-3.5 text-sm font-semibold text-black">Finish fast</button><button onClick={() => finish(true)} className="rounded-full border border-white/10 bg-white/[0.04] py-3.5 text-sm text-white/55">End early</button></div>
        <button onClick={() => { cancelFast(); setState(loadFastState()); }} className="mt-3 w-full py-2 text-[10px] uppercase tracking-[0.18em] text-white/25">Cancel without logging</button>
      </section> : <>
        <section className="mt-7"><p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-white/30">Choose a protocol</p><div className="grid grid-cols-2 gap-2.5">{PROTOCOLS.map((p) => <button key={p.id} onClick={() => setProtocol(p.id)} className={`rounded-[22px] border p-4 text-left transition ${protocol === p.id ? "border-white/40 bg-white/[0.10]" : "border-white/10 bg-white/[0.035]"}`}><p className="font-semibold">{p.name}</p><p className="mt-1 text-[11px] leading-relaxed text-white/40">{p.blurb}</p></button>)}</div></section>
        {protocol === "custom" && <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.035] p-4"><div className="flex items-center justify-between"><span className="text-xs text-white/45">Target hours</span><span className="text-lg font-semibold">{customHours}h</span></div><input className="mt-4 w-full" type="range" min="1" max="72" value={customHours} onChange={(e) => setCustomHours(Number(e.target.value))} /></div>}
        <button onClick={begin} className="mt-6 w-full rounded-full bg-white py-4 text-sm font-semibold text-black">Start {selected.name} fast</button>
      </>}

      <section className="mt-7 grid grid-cols-3 gap-2.5"><div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4"><p className="text-[9px] uppercase tracking-[0.18em] text-white/30">Completed</p><p className="mt-2 text-2xl font-semibold">{stats.completed}</p></div><div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4"><p className="text-[9px] uppercase tracking-[0.18em] text-white/30">Hours</p><p className="mt-2 text-2xl font-semibold">{stats.totalHours}</p></div><div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4"><p className="text-[9px] uppercase tracking-[0.18em] text-white/30">Streak</p><p className="mt-2 text-2xl font-semibold">{stats.streak}d</p></div></section>

      <p className="mt-6 text-center text-[10px] leading-relaxed text-white/25">Fasting can affect people differently. LIVV is a tracker, not medical advice. Stop if you feel unwell and use appropriate professional guidance for your situation.</p>
    </Container>
  </main>;
}
