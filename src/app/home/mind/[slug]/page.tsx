"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Bookmark, Check, ChevronRight } from "lucide-react";
import { articleBySlug, deskMeta, nextArticle } from "@/lib/wiki";
import { logCustomAction } from "@/lib/record";
import { feedback } from "@/lib/sensory";

const COLORS=["#60A5FA","#C084FC","#34D399","#FBBF24","#FB7185","#22D3EE","#F472B6","#A3E635"];
function colorFor(slug:string){let n=0;for(const ch of slug)n=(n*31+ch.charCodeAt(0))>>>0;return COLORS[n%COLORS.length];}

export default function ArticlePage(){
  const params=useParams<{slug:string}>();
  const article=articleBySlug(String(params.slug||""));
  const [done,setDone]=useState(false);
  const [saved,setSaved]=useState(false);
  if(!article)return <main className="livv-page min-h-dvh px-5 pt-8 text-white"><p className="text-white/60">That article is not available.</p><Link href="/home/mind" className="mt-4 inline-block text-livv-accent-soft">Back to The Field</Link></main>;
  const desk=deskMeta(article.desk);const accent=colorFor(article.slug);const next=nextArticle(article.slug);
  const markDone=()=>{if(done)return;logCustomAction({title:`LIVV · ${article.title}`,pillar:"Mind",size:"small"});feedback("complete");setDone(true);};
  return <main className="livv-page relative min-h-full overflow-hidden pb-24 text-white"><article className="relative z-10 mx-auto max-w-xl px-5 pt-5">
    <div className="flex items-center justify-between"><Link href="/home/mind" className="text-[11px] font-semibold text-white/55">← The Field</Link><span className="rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{color:accent,background:`${accent}15`}}>{desk.label}</span></div>
    <div className="mt-7 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-1/3 rounded-full" style={{background:accent,boxShadow:`0 0 16px ${accent}`}}/></div>
    <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{color:accent}}>LIVV original · {article.readMins} min read</p>
    <h1 className="font-display mt-3 text-[36px] font-semibold leading-[1.02] tracking-tight">{article.title}</h1>
    <p className="mt-4 text-[18px] leading-snug" style={{color:accent}}>{article.hook}</p>
    <div className="mt-8 space-y-4">{article.beats.map((beat,index)=><section key={beat.k} className="rounded-[25px] border border-white/10 bg-white/[0.025] p-5" style={{boxShadow:index===0?`inset 3px 0 0 ${accent}`:"none"}}><p className="text-[10px] font-bold" style={{color:accent}}>{beat.k}</p><p className="mt-3 text-[16px] leading-[1.65] text-white/80">{beat.t}</p></section>)}</div>
    <section className="mt-8 overflow-hidden rounded-[30px] border p-5" style={{borderColor:`${accent}55`,background:`linear-gradient(145deg,${accent}18,rgba(255,255,255,.02))`}}><div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{color:accent}}>Put it into motion</p><button type="button" onClick={()=>setSaved(!saved)} aria-label={saved?"Remove bookmark":"Save article"} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60"><Bookmark size={15} fill={saved?"currentColor":"none"}/></button></div><p className="mt-3 text-[16px] leading-relaxed text-white/90">{article.move}</p><button type="button" onClick={markDone} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[13px] font-semibold text-black" style={{background:accent}}>{done?<><Check size={16}/>Logged to your progress</>:"I did it. Log this read."}</button></section>
    <Link href={`/home/mind/${next.slug}`} className="mt-9 flex items-center gap-4 rounded-[26px] border border-white/10 bg-white/[0.025] p-4"><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Next read</p><p className="mt-1 text-[17px] font-semibold">{next.title}</p></div><span className="grid h-11 w-11 place-items-center rounded-full" style={{background:colorFor(next.slug),color:"#000"}}><ChevronRight size={18}/></span></Link>
  </article></main>;
}
