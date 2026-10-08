"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, Play, RotateCcw, Sparkles } from "lucide-react";
import { feedback } from "@/lib/sensory";
import "../health-systems.css";

const DONE_KEY="livv-meditation-done-v1";
const PRACTICES=[
 {name:"Reset",minutes:3,purpose:"Downshift when the mind is noisy.",steps:["Drop the shoulders.","Take five slow breaths.","Notice thoughts without solving them.","Return to the breath.","Choose one next action."]},
 {name:"Focus",minutes:5,purpose:"Create a clean transition into work or training.",steps:["Sit upright and put the phone away.","Take five slow breaths.","Notice when attention wanders.","Return without judging yourself.","Name the one task you are about to do."]},
 {name:"Night",minutes:10,purpose:"Make the landing into sleep quieter.",steps:["Dim the room.","Relax the face, jaw, shoulders, and hands.","Let breathing become natural.","Notice sensations without chasing them.","Return to the next breath."]}
] as const;
const nav=<nav className="hsys-nav" aria-label="Health systems"><Link href="/home/health/sleep">Sleep</Link><Link href="/home/health/meditation" aria-current="page">Mind</Link><Link href="/home/health/recipes">Food</Link><Link href="/home/health/trails">Move</Link><Link href="/home/health/dictionary">Knowledge</Link></nav>;

export default function MeditationPage(){
 const[idx,setIdx]=useState(0),[sec,setSec]=useState(PRACTICES[0].minutes*60),[running,setRunning]=useState(false),[done,setDone]=useState(0);
 useEffect(()=>{try{setDone(Number(localStorage.getItem(DONE_KEY)||"0"))}catch{}},[]);
 useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setSec(v=>{if(v<=1){setRunning(false);setDone(n=>{const next=n+1;try{localStorage.setItem(DONE_KEY,String(next))}catch{}return next});feedback("complete");return 0}return v-1}),1000);return()=>window.clearInterval(id)},[running]);
 const item=PRACTICES[idx], choose=(i:number)=>{setIdx(i);setSec(PRACTICES[i].minutes*60);setRunning(false)},reset=()=>{setSec(item.minutes*60);setRunning(false)};
 const mm=String(Math.floor(sec/60)).padStart(2,"0"),ss=String(sec%60).padStart(2,"0");
 return <main className="hsys hsys-meditation" aria-label="Mind"><div className="hsys-inner">
  <Link href="/home/health" className="hsys-back"><ChevronLeft size={14}/> Health</Link>
  <header className="hsys-mast"><p className="hsys-k">02 / Mind</p><h1 className="hsys-title">Mind</h1><p className="hsys-sub">Use a few quiet minutes to change what happens next.</p><div className="hsys-stats"><div><strong>{done}</strong><span>Sessions</span></div><div><strong>{item.minutes}m</strong><span>Practice</span></div><div><strong>{running?"ON":"READY"}</strong><span>Status</span></div></div></header>
  {nav}
  <section className="hsys-section"><p className="hsys-label">Choose a practice</p><div className="hsys-chips">{PRACTICES.map((p,i)=><button key={p.name} type="button" className={"hsys-chip"+(idx===i?" on":"")} onClick={()=>choose(i)}>{p.name} · {p.minutes}m</button>)}</div><div className="hsys-card" style={{marginTop:10}}><p className="hsys-item-t">{item.purpose}</p></div></section>
  <section className="hsys-section"><div className="hsys-timer"><p className="hsys-timer-v">{mm}<span style={{opacity:.3}}>: </span>{ss}</p><p className="hsys-timer-s">{running?"In practice":sec===0?"Complete":"Ready"} · {done} completed</p></div><div className="hsys-actions"><button type="button" className="hsys-btn" style={{marginTop:0}} onClick={()=>{if(sec===0)return;setRunning(v=>!v);feedback("tick")}}>{running?"Pause":<><Play size={12}/> Start</>}</button><button type="button" className="hsys-btn ghost" style={{marginTop:0}} onClick={reset}><RotateCcw size={12}/> Reset</button></div></section>
  <section className="hsys-section"><p className="hsys-label">Practice</p><div className="hsys-card"><div className="hsys-list">{item.steps.map((step,i)=><div key={step} className="hsys-item"><div><p className="hsys-item-t">{String(i+1).padStart(2,"0")}</p><p className="hsys-item-s">{step}</p></div></div>)}</div></div></section>
  <div className="hsys-note"><Sparkles size={12} style={{verticalAlign:-2,marginRight:5}}/> The goal is not to empty the mind. The goal is to return.</div>
 </div></main>
}