"use client";

import { useEffect, useMemo, useState } from "react";
import { blankDay, dayCompletion, lastNDays, loadHealthDays, todayKey, upsertHealthDay, WATER_TARGET, MEALS_TARGET, type HealthDay } from "@/lib/health";

const TOOLS = [
  { href: "/home/health/sleep", label: "Sleep", title: "Track your nights", detail: "Bedtime, wake time, quality, and patterns." },
  { href: "/home/health/meditation", label: "Mind", title: "Meditation", detail: "Short guided practices with a built-in timer." },
  { href: "/home/health/recipes", label: "Food", title: "Recipes", detail: "Simple meals built for real life." },
  { href: "/home/health/trails", label: "Move", title: "Walk / Run / Bike", detail: "Log distance, time, and trail notes." },
  { href: "/home/health/dictionary", label: "LIVV", title: "Dictionary", detail: "Words and principles that fit the LIVV way." },
];

export default function HealthPage() {
  const [days,setDays]=useState<HealthDay[]>([]);
  const today=todayKey();
  useEffect(()=>{setDays(loadHealthDays());const sync=()=>setDays(loadHealthDays());window.addEventListener("livv-health",sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener("livv-health",sync);window.removeEventListener("storage",sync)}},[]);
  const current=useMemo(()=>days.find(d=>d.date===today)||blankDay(today),[days,today]);
  const history=useMemo(()=>lastNDays(days,7),[days]);
  const completion=dayCompletion(current);
  function update(patch:Partial<HealthDay>){setDays(prev=>upsertHealthDay({...current,...patch,date:today},prev))}
  return <main className="livv-page min-h-full"><div className="mx-auto max-w-xl px-5 pb-14 pt-6">
    <header className="border-b border-livv-line pb-7 text-center"><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-livv-muted">Health</p><h1 className="mt-2 text-[clamp(1.8rem,8vw,2.5rem)] font-semibold tracking-[-.05em]">Build the baseline.</h1><p className="mx-auto mt-3 max-w-[36ch] text-sm leading-6 text-livv-muted">One place for the habits, movement, food, recovery, and knowledge that keep you capable.</p></header>

    <section className="border-b border-livv-line py-7"><div className="flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[.2em] text-livv-muted">Today</p><p className="mt-1 text-2xl font-semibold">{completion.count} / 4 basics tracked</p></div><span className="text-sm font-semibold text-livv-muted">{completion.percent}%</span></div><div className="mt-4 h-1 overflow-hidden rounded-full bg-livv-line"><div className="h-full rounded-full bg-livv-ink" style={{width:completion.percent+"%"}}/></div>
    <div className="mt-5 grid grid-cols-4 gap-2"><Mini label="Sleep" value={current.sleep?current.sleep+"h":"—"}/><Mini label="Water" value={String(current.water)}/><Mini label="Meals" value={String(current.meals)}/><Mini label="Move" value={current.movement?"✓":"—"}/></div></section>

    <section className="border-b border-livv-line py-7"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-livv-muted">Check in</p><h2 className="mt-1 text-xl font-semibold">The basics.</h2><div className="mt-4 divide-y divide-livv-line border-y border-livv-line">
      <Row label="Sleep" detail={current.sleep?current.sleep+" hours":"Not logged"}><Adjust minus={()=>update({sleep:Math.max(0,Math.round((current.sleep-.5)*10)/10)})} plus={()=>update({sleep:Math.min(16,Math.round((current.sleep+.5)*10)/10)})}/></Row>
      <Row label="Water" detail={current.water+" / "+WATER_TARGET+" cups"}><Adjust minus={()=>update({water:Math.max(0,current.water-1)})} plus={()=>update({water:Math.min(20,current.water+1)})}/></Row>
      <Row label="Meals" detail={current.meals+" / "+MEALS_TARGET}><Adjust minus={()=>update({meals:Math.max(0,current.meals-1)})} plus={()=>update({meals:Math.min(6,current.meals+1)})}/></Row>
      <div className="flex items-center justify-between gap-3 py-4"><div><p className="text-sm font-semibold">Movement</p><p className="mt-1 text-xs text-livv-muted">Any intentional movement counts.</p></div><button type="button" onClick={()=>update({movement:!current.movement})} className={"rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[.14em] "+(current.movement?"bg-livv-ink text-livv-bg":"border border-livv-line text-livv-muted")}>{current.movement?"Done":"Log"}</button></div>
    </div></section>

    <section className="py-7"><div className="flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[.2em] text-livv-muted">Health tools</p><h2 className="mt-1 text-xl font-semibold">Go deeper.</h2></div><span className="text-[10px] uppercase tracking-[.15em] text-livv-muted">5 tools</span></div>
      <div className="mt-4 divide-y divide-livv-line border-y border-livv-line">{TOOLS.map(t=><a key={t.href} href={t.href} className="flex items-center gap-4 py-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-line text-[10px] font-semibold">{t.label.slice(0,1)}</span><span className="min-w-0 flex-1"><span className="block text-[16px] font-semibold">{t.title}</span><span className="mt-1 block text-xs leading-5 text-livv-muted">{t.detail}</span></span><span className="text-livv-muted">→</span></a>)}</div>
    </section>

    <section className="border-t border-livv-line pt-7"><p className="text-[10px] uppercase tracking-[.2em] text-livv-muted">7-day signal</p><div className="mt-4 flex items-end gap-2">{history.map(d=><div key={d.date} className="flex flex-1 flex-col items-center gap-2"><div className="flex h-20 w-full items-end"><div className="w-full rounded-t bg-livv-ink" style={{height:Math.max(8,dayCompletion(d).percent)+"%"}}/></div><span className="text-[9px] text-livv-muted">{d.date.slice(5)}</span></div>)}</div></section>
    <p className="mt-8 text-center text-[9px] leading-5 text-livv-muted">LIVV Health is a personal wellness and organization tool. It is not medical advice or a substitute for professional care.</p>
  </div></main>
}

function Mini(p:{label:string;value:string}){return <div className="rounded-xl py-3 text-center"><p className="text-[9px] uppercase tracking-[.14em] text-livv-muted">{p.label}</p><p className="mt-1 text-[13px] font-semibold">{p.value}</p></div>}
function Row(p:{label:string;detail:string;children:React.ReactNode}){return <div className="flex items-center justify-between gap-3 py-4"><div><p className="text-sm font-semibold">{p.label}</p><p className="mt-1 text-xs text-livv-muted">{p.detail}</p></div>{p.children}</div>}
function Adjust(p:{minus:()=>void;plus:()=>void}){return <div className="flex gap-2"><button type="button" onClick={p.minus} className="grid h-9 w-9 place-items-center rounded-full border border-livv-line text-lg text-livv-muted">−</button><button type="button" onClick={p.plus} className="grid h-9 w-9 place-items-center rounded-full border border-livv-line text-lg text-livv-muted">+</button></div>}
