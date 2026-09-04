"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AmbientField } from "@/components/layout/ambient-field";
import { livePillars, loadRecord, weekBars, weekHitCount, type LivvRecord } from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { needsAttention, strongestPillar } from "@/lib/command";
import { feedback } from "@/lib/sensory";
import { advanceSeason, claimSeasonComplete, seasonProgress } from "@/lib/seasons";
import { claimWeeklyClear, setWeeklyTarget, weeklyClearStatus } from "@/lib/weekly-clear";
import { applyStreakRepair, getRepairOffer } from "@/lib/streak-repair";
import { setProgress as vaultSetProgress } from "@/lib/vault-sets";
import { clearPair, loadPair, setPair, type PairChain } from "@/lib/pair-chain";
import { addEmbers } from "@/lib/identity";

export default function ProgressPage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [season, setSeason] = useState<any>(null);
  const [weekly, setWeekly] = useState<any>(null);
  const [repair, setRepair] = useState<any>(null);
  const [sets, setSets] = useState<any[]>([]);
  const [pair, setPairState] = useState<PairChain | null>(null);
  const [pairName, setPairName] = useState("");

  const sync = () => {
    setRec(loadRecord()); setSeason(seasonProgress()); setWeekly(weeklyClearStatus());
    setRepair(getRepairOffer()); setSets(vaultSetProgress()); setPairState(loadPair());
  };
  useEffect(() => {
    sync();
    const events = ["livv-record", "livv-season", "livv-weekly", "livv-packs", "livv-pair"];
    events.forEach((e) => window.addEventListener(e, sync));
    return () => events.forEach((e) => window.removeEventListener(e, sync));
  }, []);

  if (!rec || !season || !weekly) return <main className="min-h-dvh bg-[#030405]" />;
  const week = weekBars(rec), hits = weekHitCount(rec), pillars = livePillars(rec);
  const evo = evolutionTitle(rec.level), strong = strongestPillar(rec), weak = needsAttention(rec);
  const totalXp = pillars.reduce((n, p) => n + (typeof p.xp === "number" ? p.xp : 0), 0);

  return (
    <main className="relative min-h-full overflow-hidden pb-14">
      <div className="pointer-events-none absolute inset-0"><div className="absolute inset-0 bg-[#030405]" /><div className="absolute right-[-25%] top-0 h-[480px] w-[480px] rounded-full" style={{ background: "radial-gradient(circle, rgb(var(--livv-accent)/.14), transparent 68%)" }} /><AmbientField intensity="strong" /></div>
      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <p className="text-[10px] uppercase tracking-[.34em] text-white/30">Long view</p>
        <div className="flex items-end justify-between"><h1 className="font-display mt-2 text-[36px] font-semibold tracking-tight">Progress</h1><span className="mb-1 text-[10px] uppercase tracking-[.2em] text-livv-accent-soft">Evolution</span></div>
        <section className="livv-card-glow-strong livv-glow-sweep mt-8 rounded-[28px] border border-livv-accent/20 bg-white/[.035] p-5">
          <div className="flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[.26em] text-white/30">Current state</p><p className="font-display mt-2 text-[27px]">{evo.name}</p></div><div className="text-right"><p className="text-[9px] uppercase tracking-[.2em] text-white/25">Level</p><p className="font-display text-[30px] text-livv-accent-soft">{rec.level}</p></div></div>
          <div className="mt-6 grid grid-cols-3 gap-2"><Stat value={`${rec.streak}d`} label="Chain" /><Stat value={`${rec.workoutsCompleted}`} label="Sessions" /><Stat value={`${rec.goalsCompleted}`} label="Actions" /></div>
          <p className="mt-5 text-[13px] leading-relaxed text-white/40">{hits >= 5 ? "You showed up more than most weeks. Keep the line." : hits >= 3 ? "Momentum is forming. Do not treat the rest of the week casually." : hits >= 1 ? "Signal exists. Stack another day." : "Empty board. One action changes that."}</p>
        </section>
        {repair && <section className="mt-7 rounded-[24px] border border-livv-accent/25 bg-livv-accent/[.07] p-5"><p className="text-[10px] uppercase tracking-[.24em] text-livv-accent-soft">Chain recovery</p><p className="mt-2 text-[17px] font-semibold">Restore {repair.restored} of your {repair.previous}-day chain.</p><p className="mt-1 text-[12px] text-white/35">Half returns. The rest gets earned again.</p><button type="button" onClick={() => { applyStreakRepair(); feedback("unlock"); sync(); }} className="mt-4 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-black">Repair chain</button></section>}
        <section className="mt-10">
          <div className="flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[.28em] text-white/30">Chapter</p><p className="font-display mt-2 text-[25px]">{season.def.name}</p><p className="mt-1 text-[13px] text-white/35">{season.def.line}</p></div><span className="text-[12px] text-white/25">{season.remaining}d left</span></div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[.08]"><div className="h-full rounded-full bg-livv-accent shadow-[0_0_14px_rgb(var(--livv-accent)/.5)] transition-all" style={{ width: `${season.pct}%` }} /></div>
          <div className="mt-5 space-y-2">{season.objectives.map((o: any) => <div key={o.id} className="flex items-center gap-3 rounded-2xl border border-white/[.06] bg-white/[.02] px-4 py-3"><span className={o.done ? "flex h-7 w-7 items-center justify-center rounded-full bg-livv-accent text-xs" : "h-7 w-7 rounded-full ring-1 ring-white/10"}>{o.done ? "✓" : ""}</span><span className={o.done ? "flex-1 text-[13px] text-white/35 line-through" : "flex-1 text-[13px] text-white/65"}>{o.title}</span><span className="text-[11px] text-white/25">{o.current}/{o.target}</span></div>)}</div>
          {season.allDone && !season.state.claimed && <button type="button" onClick={() => { claimSeasonComplete(); addEmbers(50); feedback("unlock"); advanceSeason(); sync(); }} className="mt-4 w-full rounded-2xl bg-white py-3 text-[13px] font-semibold text-black">Complete chapter · +50 Embers</button>}
        </section>
        <section className="mt-11 rounded-[26px] border border-white/[.07] bg-white/[.025] p-5">
          <div className="flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[.28em] text-white/30">Weekly clear</p><p className="mt-2 font-display text-[46px] leading-none">{weekly.hits}<span className="text-[21px] text-white/25"> / {weekly.target}</span></p></div><p className="max-w-[15ch] text-right text-[11px] leading-relaxed text-white/25">{weekly.met ? "Target hit. Claim your clear." : `${weekly.remaining} active day${weekly.remaining === 1 ? "" : "s"} remaining`}</p></div>
          <div className="mt-5 flex gap-2">{[3,4,5,6,7].map((n) => <button key={n} type="button" onClick={() => { setWeeklyTarget(n); feedback("tick"); sync(); }} className={weekly.target === n ? "h-9 w-9 rounded-full bg-white text-[12px] font-semibold text-black" : "h-9 w-9 rounded-full text-[12px] text-white/35 ring-1 ring-white/10"}>{n}</button>)}</div>
          {weekly.met && !weekly.claimed && <button type="button" onClick={() => { claimWeeklyClear(); addEmbers(25); feedback("complete"); sync(); }} className="mt-4 rounded-full bg-livv-accent px-4 py-2 text-[12px] font-semibold">Claim clear · +25</button>}
          <div className="mt-7 flex h-24 items-end gap-2">{week.map((d: any) => <div key={d.key} className="flex h-full flex-1 flex-col justify-end"><div className="rounded-t-lg" style={{ height: `${Math.max(d.v, d.active ? 14 : 4)}%`, background: d.active ? "linear-gradient(to top, rgb(var(--livv-accent)), rgb(var(--livv-accent)/.45))" : "rgba(255,255,255,.08)" }} /><span className="mt-2 text-center text-[9px] text-white/25">{d.d}</span></div>)}</div>
        </section>
        <section className="mt-11"><p className="text-[10px] uppercase tracking-[.28em] text-white/30">Energy map</p><div className="mt-4 grid grid-cols-2 gap-2">{pillars.map((p: any) => <div key={p.id} className="rounded-2xl border border-white/[.06] bg-white/[.02] p-4"><div className="flex items-center justify-between"><span className="text-[12px] text-white/55">{p.name}</span><span className="text-[11px] text-livv-accent-soft">Lv {p.level}</span></div><div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-livv-accent" style={{ width: `${p.progress}%` }} /></div><p className="mt-2 text-[10px] text-white/20">{typeof p.xp === "number" ? p.xp : 0} XP · {p.progress}%</p></div>)}</div></section>
        <section className="mt-11 grid grid-cols-2 gap-2"><Insight title="Leading" value={strong.name} sub={`Level ${strong.level}`} /><Insight title="Needs weight" value={weak.name} sub={`Level ${weak.level}`} /></section>
        <section className="mt-11"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.28em] text-white/30">Vault sets</p><Link href="/home/vault" className="text-[12px] text-livv-accent-soft">Open vault →</Link></div><div className="mt-4 space-y-2">{sets.map((s) => <div key={s.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 ring-1 ring-white/[.05]"><span className={s.complete ? "text-[12px] text-livv-accent-soft" : "text-[12px] text-white/45"}>{s.name}</span><span className="text-[11px] text-white/25">{s.have}/{s.total}</span></div>)}</div></section>
        <section className="mt-11"><p className="text-[10px] uppercase tracking-[.28em] text-white/30">Pair chain</p><p className="mt-1 text-[12px] text-white/25">Private accountability, one person, one shared pillar.</p>{pair ? <div className="mt-4 rounded-2xl border border-white/[.07] bg-white/[.025] p-4"><p className="text-[15px] font-semibold">{pair.partnerName}</p><p className="mt-1 text-[12px] text-white/35">{pair.pillar} · {pair.sharedDays} shared days</p><button onClick={() => { clearPair(); sync(); }} className="mt-3 text-[11px] text-white/25">End pair</button></div> : <div className="mt-4 flex gap-2"><input value={pairName} onChange={(e) => setPairName(e.target.value)} placeholder="Partner name" className="h-11 min-w-0 flex-1 rounded-xl bg-white/[.035] px-3 text-sm outline-none ring-1 ring-white/10" /><button onClick={() => { if(pairName.trim().length<2)return; setPair({partnerName:pairName.trim(),partnerUsername:pairName.trim().toLowerCase().replace(/\s/g,""),pillar:"Body"}); feedback("tick"); setPairName(""); sync(); }} className="rounded-xl bg-white px-4 text-xs font-semibold text-black">Link</button></div>}</section>
        <p className="mt-12 text-center text-[10px] tracking-[.18em] text-white/15">{totalXp.toLocaleString()} TOTAL PILLAR XP · KEEP EVOLVING</p>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) { return <div className="rounded-2xl bg-black/20 px-3 py-3 ring-1 ring-white/[.06]"><p className="font-display text-[18px]">{value}</p><p className="mt-1 text-[9px] uppercase tracking-[.16em] text-white/25">{label}</p></div>; }
function Insight({ title, value, sub }: { title: string; value: string; sub: string }) { return <div className="rounded-[22px] border border-white/[.07] bg-white/[.025] p-4"><p className="text-[9px] uppercase tracking-[.2em] text-white/25">{title}</p><p className="mt-3 text-[18px] font-semibold">{value}</p><p className="mt-1 text-[11px] text-white/25">{sub}</p></div>; }
