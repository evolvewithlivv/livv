"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, ChevronLeft, Search } from "lucide-react";

const WORDS = [
 ["Adapt","Change your approach when reality changes."],["Agency","The ability to choose and act deliberately."],["Awareness","Seeing what is happening before deciding what to do."],["Capability","The practical ability to handle something yourself."],["Discipline","Doing what matters even when motivation fluctuates."],["Evolve","Develop into a stronger or more capable version."],["Integrity","Make your actions line up with your principles."],["LIVV","Longevity, Integrity, Vitality, and Vigilance."],["Mastery","Deep competence built through deliberate practice."],["Resilience","Recover, adapt, and continue."],["Self-sufficiency","Meet more of your own needs."],["Vitality","Energy and capacity for living well."],["Vigilance","Pay attention to what matters and act early."],["Purpose","A meaningful direction that organizes your actions."],["Presence","Give your attention to what is actually happening."],["Recovery","Restore capacity after effort, stress, or strain."],["Resourcefulness","Find workable paths with what you have."],["Sustainability","Build habits and systems you can maintain."],["Temperance","Use enough without letting excess run the system."],["Growth","A measurable increase in skill, capacity, or understanding."],
] as const;

export default function DictionaryPage(){
 const [q,setQ]=useState("");
 const list=useMemo(()=>WORDS.filter(([word,definition])=>(word+" "+definition).toLowerCase().includes(q.toLowerCase())),[q]);
 return <main className="livv-page min-h-full">
  <div className="mx-auto w-full max-w-xl px-5 pb-12 sm:px-6">
   <header className="pt-6 sm:pt-9">
    <Link href="/home/health" className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted"><ChevronLeft size={13}/> Health</Link>
    <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-livv-accent"><BookOpen size={13}/> LIVV Dictionary</div>
    <h1 className="mt-2 text-[38px] font-semibold leading-[.98] tracking-[-.06em] sm:text-[46px]">Words worth living.</h1>
    <p className="mt-4 max-w-[39ch] text-[13px] leading-6 text-livv-muted">A working vocabulary for capability, character, health, and evolution.</p>
   </header>

   <div className="relative mt-8 border-y border-livv-border">
    <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-livv-muted"/>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search the LIVV dictionary..." className="w-full bg-transparent py-4 pl-7 pr-2 text-[13px] outline-none placeholder:text-livv-muted"/>
   </div>

   <section className="mt-8">
    <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.19em] text-livv-muted">Vocabulary</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-.045em]">Know the language.</h2></div><span className="text-[10px] uppercase tracking-[.14em] text-livv-muted">{list.length} words</span></div>
    <div className="mt-4 divide-y divide-livv-border border-y border-livv-border">
     {list.map(([word,definition],i)=><article key={word} className="py-5">
      <div className="flex items-start gap-4"><span className="w-6 shrink-0 pt-1 text-[9px] font-semibold tabular-nums text-livv-accent">{String(i+1).padStart(2,"0")}</span><div><h2 className="text-[17px] font-semibold tracking-[-.02em]">{word}</h2><p className="mt-2 max-w-[42ch] text-[13px] leading-6 text-livv-muted">{definition}</p></div></div>
     </article>)}
    </div>
    {!list.length&&<p className="py-10 text-center text-[13px] text-livv-muted">No word matched that search.</p>}
   </section>

   <section className="mt-9 border-y border-livv-border py-6">
    <p className="text-[10px] font-semibold uppercase tracking-[.19em] text-livv-muted">LIVV</p>
    <p className="mt-2 text-[22px] font-semibold tracking-[-.04em]">Longevity. Integrity. Vitality. Vigilance.</p>
    <p className="mt-3 text-[11px] leading-5 text-livv-muted">The vocabulary is here to make the philosophy practical—not just something that sounds good.</p>
   </section>
  </div>
 </main>;
}
