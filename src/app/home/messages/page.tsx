"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Avatar } from "@/components/identity/avatar";
import { loadThreads, type DmThread } from "@/lib/messages";

export default function MessagesPage() {
  const [threads, setThreads] = useState<DmThread[]>([]);
  useEffect(() => { const sync=()=>setThreads(loadThreads().sort((a,b)=>b.updatedAt-a.updatedAt)); sync(); window.addEventListener("livv-dms",sync); return()=>window.removeEventListener("livv-dms",sync); }, []);
  return <main className="livv-page relative min-h-full overflow-hidden pb-12"><div className="relative z-10 mx-auto max-w-lg px-5 pt-5"><PageHero eyebrow="Inbox" title="Messages" subtitle="Private messages on this device." accent="#ff72c9" right={<Link href="/home/connect" className="text-[13px] text-white/35">Connect</Link>} />
    <div className="mt-5 rounded-2xl border border-white/[.06] bg-white/[.02] px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/30">V1 note</p><p className="mt-1 text-[12px] leading-5 text-white/40">Messages are local in this V1 build. They are not yet delivered between different LIVV members.</p></div>
    <div className="mt-6 space-y-1">{threads.map(t=>{const last=t.messages[t.messages.length-1];return <Link key={t.id} href={`/home/messages/${t.id}`} className="flex items-center gap-3 rounded-[18px] px-3 py-3 transition active:bg-white/[.04]"><Avatar identity={{displayName:t.peerName,photo:t.peerPhoto,accent:t.peerAccent}} size={48}/><div className="min-w-0 flex-1"><div className="flex items-baseline justify-between gap-2"><p className="truncate text-[15px] font-semibold">{t.peerName}</p><p className="shrink-0 text-[11px] text-white/30">{formatWhen(last?.at||t.updatedAt)}</p></div><p className="truncate text-[13px] text-white/40">{last?(last.fromMe?`You: ${last.text}`:last.text):"No messages"}</p></div></Link>})}</div>
    {threads.length===0&&<div className="mt-16 text-center"><p className="text-[14px] text-white/35">No conversations yet.</p><Link href="/home/connect" className="mt-3 inline-block text-[12px] text-white/45">Find your people →</Link></div>}</div></main>;
}
function formatWhen(at:number){const d=Date.now()-at;if(d<60_000)return"now";if(d<3_600_000)return`${Math.floor(d/60_000)}m`;if(d<86_400_000)return`${Math.floor(d/3_600_000)}h`;return`${Math.floor(d/86_400_000)}d`;}