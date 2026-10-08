"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Moon, Plus } from "lucide-react";
import { feedback } from "@/lib/sensory";
import { blankDay, loadHealthDays, todayKey, upsertHealthDay } from "@/lib/health";
import "../health-systems.css";

const KEY="livv-sleep-v2";
type Entry={date:string;bedtime:string;wake:string;quality:number;note:string};
const nav=<nav className="hsys-nav" aria-label="Health systems"><Link href="/home/health/sleep" aria-current="page">Sleep</Link><Link href="/home/health/meditation">Mind</Link><Link href="/home/health/recipes">Food</Link><Link href="/home/health/trails">Move</Link><Link href="/home/health/dictionary">Knowledge</Link></nav>;
function dateKey(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function duration(b:string,w:string){if(!b||!w)return 0;const a=b.split(":").map(Number),c=w.split(":").map(Number);let s=a[0]*60+a[1],e=c[0]*60+c[1];if(e<=s)e+=1440;return Math.round(((e-s)/60)*10)/10}

export default function SleepPage(){
 const[entries,setEntries]=useState<Entry[]>([]),[bedtime,setBedtime]=useState(""),[wake,setWake]=useState(""),[quality,setQuality]=useState(3),[note,setNote]=useState("");
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw)setEntries(JSON.parse(raw))}catch{}},[]);
 const recent=useMemo(()=>entries.slice(-7).reverse(),[entries]);
 const avg=recent.length?Math.round(recent.reduce((s,e)=>s+duration(e.bedtime,e.wake),0)/recent.length*10)/10:0;
 const current=duration(bedtime,wake);
 const target=Math.max(0,8-current);
 function save(){if(!bedtime||!wake)return;const date=dateKey(),entry={date,bedtime,wake,quality,note:note.trim()},next=[...entries.filter(e=>e.date!==date),entry].slice(-90);setEntries(next);localStorage.setItem(KEY,JSON.stringify(next));const d=todayKey(),h=loadHealthDays(),base=h.find(x=>x.date===d)??blankDay(d);upsertHealthDay({...base,sleep:duration(bedtime,wake)},h);setBedtime("");setWake("");setNote("");feedback("complete")}
 return <main className="hsys hsys-sleep" aria-label="Sleep"><div className="hsys-inner">
  <Link href="/home/health" className="hsys-back"><ChevronLeft size={14}/> Health</Link>
  <header className="hsys-mast"><p className="hsys-k">01 / Recovery</p><h1 className="hsys-title">Sleep</h1><p className="hsys-sub">Protect the part of your life where your body rebuilds.</p>
   <div className="hsys-stats"><div><strong>{current?current+"h":"—"}</strong><span>Tonight</span></div><div><strong>{avg?avg+"h":"—"}</strong><span>7-day average</span></div><div><strong>8h</strong><span>Target</span></div></div>
  </header>{nav}
  <section className="hsys-section"><p className="hsys-label">Log the night</p><div className="hsys-card">
   <label className="hsys-field"><span>Bedtime</span><input type="time" value={bedtime} onChange={e=>setBedtime(e.target.value)}/></label>
   <label className="hsys-field"><span>Wake time</span><input type="time" value={wake} onChange={e=>setWake(e.target.value)}/></label>
   <div className="hsys-field"><span>How did it feel?</span><div className="hsys-chips">{[1,2,3,4,5].map(n=><button key={n} type="button" className={"hsys-chip"+(quality===n?" on":"")} onClick={()=>setQuality(n)}>{n}</button>)}</div></div>
   <label className="hsys-field"><span>Context <em>(optional)</em></span><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Stress, training, food, screens, room..." /></label>
   <button type="button" className="hsys-btn" disabled={!bedtime||!wake} onClick={save}><Moon size={13}/> Log night</button>
  </div></section>
  <section className="hsys-section"><p className="hsys-label">The useful signal</p><div className="hsys-card"><p className="hsys-item-t">{current?target>0?target+"h still needed for 8h tonight":"8h reached":"Start by logging bedtime and wake time."}</p><p className="hsys-item-s">One night is information. Repeated nights become a pattern.</p></div></section>
  <section className="hsys-section"><p className="hsys-label">Recent nights</p><div className="hsys-list">{recent.length===0?<p className="hsys-empty">Your first night will start the record.</p>:recent.map(e=><div key={e.date} className="hsys-item"><div><p className="hsys-item-t">{e.date}</p><p className="hsys-item-s">{e.bedtime} → {e.wake}{e.note?" · "+e.note:""}</p></div><span className="hsys-item-r">{duration(e.bedtime,e.wake)}h · Q{e.quality}</span></div>)}</div></section>
  <div className="hsys-note"><Plus size={12} style={{verticalAlign:-2,marginRight:5}}/> Consistency beats perfect tracking.</div>
 </div></main>
}