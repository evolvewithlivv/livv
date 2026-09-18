"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bike, ChevronLeft, Footprints, MapPin, Play, Square, Timer, Wind } from "lucide-react";

type Activity="Walk"|"Run"|"Bike";
type Log={id:string;date:string;activity:Activity;distance:number;duration:number;note:string};
const KEY="livv-trails-v1";

function miles(a:GeolocationCoordinates,b:GeolocationCoordinates){
 const R=3958.8,dLat=(b.latitude-a.latitude)*Math.PI/180,dLon=(b.longitude-a.longitude)*Math.PI/180;
 const x=Math.sin(dLat/2)**2+Math.cos(a.latitude*Math.PI/180)*Math.cos(b.latitude*Math.PI/180)*Math.sin(dLon/2)**2;
 return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
function iconFor(a:Activity){return a==="Bike"?<Bike size={16}/>:a==="Run"?<Wind size={16}/>:<Footprints size={16}/>}

export default function TrailsPage(){
 const [a,setA]=useState<Activity>("Walk"),[run,setRun]=useState(false),[sec,setSec]=useState(0),[dist,setDist]=useState(0),[logs,setLogs]=useState<Log[]>([]),[note,setNote]=useState("");
 const watch=useRef<number|null>(null),last=useRef<GeolocationCoordinates|null>(null);
 useEffect(()=>{try{const r=localStorage.getItem(KEY);if(r)setLogs(JSON.parse(r))}catch{}return()=>{if(watch.current!==null)navigator.geolocation?.clearWatch(watch.current)}},[]);
 useEffect(()=>{if(!run)return;const id=setInterval(()=>setSec(s=>s+1),1000);return()=>clearInterval(id)},[run]);
 function start(){setRun(true);setSec(0);setDist(0);last.current=null;if(navigator.geolocation)watch.current=navigator.geolocation.watchPosition(p=>{if(last.current)setDist(d=>d+miles(last.current!,p.coords));last.current=p.coords},()=>{}, {enableHighAccuracy:true,maximumAge:5000})}
 function stop(){setRun(false);if(watch.current!==null){navigator.geolocation?.clearWatch(watch.current);watch.current=null}}
 function save(){if(!dist)return;const e:Log={id:String(Date.now()),date:new Date().toLocaleDateString(),activity:a,distance:Math.round(dist*100)/100,duration:sec,note:note.trim()},next=[...logs,e].slice(-100);setLogs(next);localStorage.setItem(KEY,JSON.stringify(next));setNote("")}
 const total=useMemo(()=>logs.reduce((s,x)=>s+x.distance,0),[logs]);
 const time=String(Math.floor(sec/3600)).padStart(2,"0")+":"+String(Math.floor(sec/60)%60).padStart(2,"0")+":"+String(sec%60).padStart(2,"0");

 return <main className="livv-page min-h-full">
  <div className="mx-auto w-full max-w-xl px-5 pb-12 sm:px-6">
   <header className="pt-6 sm:pt-9">
    <Link href="/home/health" className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted"><ChevronLeft size={13}/> Health</Link>
    <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-livv-accent"><Footprints size={13}/> Movement</div>
    <h1 className="mt-2 text-[38px] font-semibold leading-[.98] tracking-[-.06em] sm:text-[46px]">Go outside.</h1>
    <p className="mt-4 max-w-[39ch] text-[13px] leading-6 text-livv-muted">Track walks, runs, and rides. Your location is used in the browser only while tracking.</p>
   </header>

   <div className="mt-8 flex gap-2 border-b border-livv-border pb-5">
    {(["Walk","Run","Bike"] as Activity[]).map(x=><button key={x} type="button" onClick={()=>setA(x)} disabled={run}
      className={`flex-1 rounded-full border py-3 text-[10px] font-semibold uppercase tracking-[.14em] transition ${a===x?"border-livv-accent bg-livv-accent-soft text-livv-accent":"border-livv-border text-livv-muted"} disabled:opacity-40`}>
      {x}
    </button>)}
   </div>

   <section className="mt-8 border-y border-livv-border py-8 text-center">
    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-livv-border text-livv-muted">{iconFor(a)}</div>
    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">{a}</p>
    <p className="mt-2 text-[clamp(3.5rem,18vw,5.5rem)] font-semibold leading-none tracking-[-.07em] tabular-nums">{dist.toFixed(2)} <span className="text-base tracking-normal text-livv-muted">mi</span></p>
    <p className="mt-3 flex items-center justify-center gap-2 text-[13px] tabular-nums text-livv-muted"><Timer size={14}/>{time}</p>
    <button type="button" onClick={run?stop:start} className={`mt-7 inline-flex min-w-36 items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[.14em] ${run?"border border-livv-border text-livv-ink":"bg-livv-ink text-livv-bg"}`}>
      {run?<><Square size={13}/> Stop</>:<><Play size={13}/> Start tracking</>}
    </button>
   </section>

   <section className="mt-8 border-y border-livv-border">
    <div className="flex items-center gap-3 border-b border-livv-border py-4"><MapPin size={15} className="text-livv-muted"/><p className="text-[11px] leading-5 text-livv-muted">GPS distance updates automatically when permission is available. You can also enter distance manually.</p></div>
    <div className="grid gap-3 py-5">
     <label className="text-[10px] font-semibold uppercase tracking-[.16em] text-livv-muted">Distance override · miles<input type="number" min="0" step="0.01" value={dist||""} onChange={e=>setDist(Number(e.target.value)||0)} disabled={run} className="mt-2 w-full bg-transparent text-[14px] outline-none disabled:opacity-40" /></label>
     <label className="text-[10px] font-semibold uppercase tracking-[.16em] text-livv-muted">Note<input value={note} onChange={e=>setNote(e.target.value)} disabled={run} placeholder="Optional trail note..." className="mt-2 w-full bg-transparent text-[13px] outline-none placeholder:text-livv-muted disabled:opacity-40"/></label>
     <button type="button" onClick={save} disabled={!dist||run} className="rounded-full border border-livv-border py-3.5 text-[10px] font-semibold uppercase tracking-[.14em] text-livv-ink disabled:opacity-30">Save activity</button>
    </div>
   </section>

   <section className="mt-9">
    <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.19em] text-livv-muted">Record</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-.045em]">Movement logged.</h2></div><span className="text-[10px] uppercase tracking-[.14em] text-livv-muted">{logs.length} activities</span></div>
    <p className="mt-2 text-[11px] text-livv-muted">{total.toFixed(1)} total miles</p>
    <div className="mt-4 divide-y divide-livv-border border-y border-livv-border">{logs.slice(-8).reverse().map(x=><div key={x.id} className="flex items-center gap-4 py-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-livv-border text-livv-muted">{iconFor(x.activity)}</span><div className="min-w-0 flex-1"><p className="text-[14px] font-semibold">{x.activity} · {x.distance.toFixed(2)} mi</p><p className="mt-1 text-[11px] text-livv-muted">{x.date}{x.note?" · "+x.note:""}</p></div><span className="text-[11px] tabular-nums text-livv-muted">{Math.round(x.duration/60)}m</span></div>)}</div>
   </section>
  </div>
 </main>;
}
