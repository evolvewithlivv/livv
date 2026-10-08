"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, Search, BookOpen } from "lucide-react";
import WORDS from "@/lib/livv-dictionary";
import "../health-systems.css";

const nav=<nav className="hsys-nav" aria-label="Health systems"><Link href="/home/health/sleep">Sleep</Link><Link href="/home/health/meditation">Mind</Link><Link href="/home/health/recipes">Food</Link><Link href="/home/health/trails">Move</Link><Link href="/home/health/dictionary" aria-current="page">Knowledge</Link></nav>;

export default function DictionaryPage(){
 const[q,setQ]=useState(""),[open,setOpen]=useState<string|null>(null);
 const list=useMemo(()=>{const needle=q.trim().toLowerCase();return needle?WORDS.filter(w=>(w.word+" "+w.meaning+" "+w.practice+" "+w.why).toLowerCase().includes(needle)):WORDS},[q]);
 return <main className="hsys hsys-dictionary" aria-label="Knowledge"><div className="hsys-inner">
  <Link href="/home/health" className="hsys-back"><ChevronLeft size={14}/> Health</Link>
  <header className="hsys-mast"><p className="hsys-k">05 / Knowledge</p><h1 className="hsys-title">Knowledge</h1><p className="hsys-sub">Learn the words that make better decisions easier.</p><div className="hsys-stats"><div><strong>{list.length}</strong><span>Entries</span></div><div><strong>{open?1:0}</strong><span>Open</span></div><div><strong>01</strong><span>Purpose</span></div></div></header>
  {nav}
  <section className="hsys-section"><p className="hsys-label">Find something useful</p><div className="hsys-card"><label className="hsys-field"><span><Search size={10} style={{verticalAlign:-1,marginRight:4}}/> Search the language</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Word or idea"/></label></div></section>
  <section className="hsys-section"><p className="hsys-label">{list.length} {list.length===1?"entry":"entries"}</p><div className="hsys-list">{list.length===0?<p className="hsys-empty">Nothing matched that search.</p>:list.map(w=>{const isOpen=open===w.word;return <button key={w.word} type="button" className="hsys-entry" onClick={()=>setOpen(isOpen?null:w.word)}><p className="hsys-entry-word">{w.word}</p><p className="hsys-entry-body">{w.meaning}</p>{isOpen&&<><p className="hsys-entry-meta"><strong>Practice · </strong>{w.practice}</p><p className="hsys-entry-meta"><strong>Why · </strong>{w.why}</p></>}</button>})}</div></section>
  <div className="hsys-note"><BookOpen size={12} style={{verticalAlign:-2,marginRight:5}}/> Knowledge is only useful when it changes what you do.</div>
 </div></main>
}