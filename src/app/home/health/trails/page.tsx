"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, MapPin, Play, Square } from "lucide-react";
import "../health-systems.css";
import { blankDay, loadHealthDays, todayKey, upsertHealthDay } from "@/lib/health";

type Activity="Walk"|"Run"|"Bike";
type Log={id:string;date:string;activity:Activity;distance:number;duration:number;note:string};
const KEY="livv-trails-v2";
function miles(a:GeolocationCoordinates,b:GeolocationCoordinates){const R=3958.8,dLat=((b.latitude-a.latitude)*Math.PI)/180,dLon=((b.longitude-a.longitude)*Math.PI)/180,x=Math.sin(dLat/2)**2+Math.cos((a.latitude*Math.PI)/180)*Math.cos((b.latitude*Math.PI)/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
const SystemNav=()=> <nav className="hsys-nav" aria-label="Health systems"><Link href="/home/health/sleep">Sleep</Link><Link href="/home/health/meditation">Mind</Link><Link href="/home/health/recipes">Food</Link><Link href="/home/health/trails" aria-current="page">Move</Link><Link href="/home/health/dictionary">Knowledge</Link></nav>;

export default function TrailsPage(){
  const[activity,setActivity]=useState<Activity>("Walk"),[running,setRunning]=useState(false),[sec,setSec]=useState(0),[dist,setDist]=useState(0),[logs,setLogs]=useState<Log[]>([]),[note,setNote]=useState("");
  const watch=useRef<number|null>(null),last=useRef<GeolocationCoordinates|null>(null);
  useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw)setLogs(JSON.parse(raw))}catch{}return()=>{if(watch.current!==null)navigator.geolocation?.clearWatch(watch.current)}},[]);
  useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setSec(s=>s+1),1000);return()=>window.clearInterval(id)},[running]);
  function start(){setRunning(true);setSec(0);setDist(0);last.current=null;if(navigator.geolocation)watch.current=navigator.geolocation.watchPosition(p=>{if(last.current)setDist(d=>d+miles(last.current!,p.coords));last.current=p.coords},()=>{},{enableHighAccuracy:true,maximumAge:5000})}
  function stop(){setRunning(false);if(watch.current!==null){navigator.geolocation?.clearWatch(watch.current);watch.current=null}}
  function save(){if(!dist)return;const entry:Log={id:String(Date.now()),date:new Date().toLocaleDateString(),activity,distance:Math.round(dist*100)/100,duration:sec,note:note.trim()};const next=[...logs,entry].slice(-100);setLogs(next);localStorage.setItem(KEY,JSON.stringify(next));const date=todayKey(),history=loadHealthDays(),base=history.find(d=>d.date===date)??blankDay(date);upsertHealthDay({...base,movement:true,movementNote:note.trim()},history);setNote("");setSec(0)}
  const total=useMemo(()=>logs.reduce((s,x)=>s+x.distance,0),[logs]);
  const time=String(Math.floor(sec/3600)).padStart(2,"0")+":"+String(Math.floor(sec/60)%60).padStart(2,"0")+":"+String(sec%60).padStart(2,"0");
  return <main className="hsys hsys-move" aria-label="Movement"><div className="hsys-inner">
    <Link href="/home/health" className="hsys-back"><ChevronLeft size={13}/> Health</Link>
    <header className="hsys-mast"><p className="hsys-k">04 / Movement</p><h1 className="hsys-title">Move</h1><p className="hsys-sub">Walk, run, or ride. Keep the record.</p><div className="hsys-stats"><div><strong>{dist.toFixed(2)}</strong><span>Current mi</span></div><div><strong>{time}</strong><span>Elapsed</span></div><div><strong>{total.toFixed(1)}</strong><span>Total mi</span></div></div></header>
    <SystemNav/>
    <section className="hsys-section"><p className="hsys-label">01 / Choose your mode</p><div className="hsys-chips">{(["Walk","Run","Bike"] as Activity[]).map(x=><button key={x} type="button" disabled={running} className={"hsys-chip"+(activity===x?" on":"")} onClick={()=>setActivity(x)}>{x}</button>)}</div><button type="button" className="hsys-btn" onClick={running?stop:start}>{running?<><Square size={11} style={{verticalAlign:-2,marginRight:5}}/> Stop session</>:<><Play size={11} style={{verticalAlign:-2,marginRight:5}}/> Start session</>}</button><p className="hsys-item-s" style={{marginTop:8}}><MapPin size={11} style={{verticalAlign:-2,marginRight:4}}/> GPS runs only while a session is active.</p></section>
    <section className="hsys-section"><p className="hsys-label">02 / Finish the record</p><label className="hsys-field"><span>Distance · miles</span><input type="number" min={0} step={0.01} value={dist||""} onChange={e=>setDist(Number(e.target.value)||0)} disabled={running} placeholder="0.00"/></label><label className="hsys-field"><span>Context <em>(optional)</em></span><input value={note} onChange={e=>setNote(e.target.value)} disabled={running} placeholder="Route, weather, how it felt"/></label><button type="button" className="hsys-btn" disabled={!dist||running} onClick={save}>Log movement</button></section>
    <section className="hsys-section"><p className="hsys-label">03 / The record · {logs.length}</p><div className="hsys-list">{logs.length===0?<p className="hsys-item-s" style={{padding:"14px 0"}}>Your first session will start the record.</p>:logs.slice(-10).reverse().map(x=><div key={x.id} className="hsys-item"><div><p className="hsys-item-t">{x.activity} · {x.distance.toFixed(2)} mi</p><p className="hsys-item-s">{x.date}{x.note?" · "+x.note:""}</p></div><span className="hsys-item-r">{Math.round(x.duration/60)}m</span></div>)}</div></section>
  </div></main>;
}