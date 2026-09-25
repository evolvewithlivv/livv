"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, Moon, Star, Sun, TimerReset } from "lucide-react";

const KEY = "livv-sleep-v2";
type Entry = { date: string; bedtime: string; wake: string; quality: number; note: string };

function today() { return new Date().toISOString().slice(0, 10); }
function duration(b: string, w: string) {
  if (!b || !w) return 0;
  const a = b.split(":").map(Number), c = w.split(":").map(Number);
  let s = a[0] * 60 + a[1], e = c[0] * 60 + c[1];
  if (e <= s) e += 1440;
  return Math.round(((e - s) / 60) * 10) / 10;
}

export default function SleepPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [bedtime, setBedtime] = useState("");
  const [wake, setWake] = useState("");
  const [quality, setQuality] = useState(3);
  const [note, setNote] = useState("");

  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setEntries(JSON.parse(raw)); } catch {} }, []);
  const recent = useMemo(() => entries.slice(-7).reverse(), [entries]);
  const average = recent.length ? Math.round((recent.reduce((s, e) => s + duration(e.bedtime, e.wake), 0) / recent.length) * 10) / 10 : 0;
  const current = duration(bedtime, wake);

  function save() {
    if (!bedtime || !wake) return;
    const next = [...entries.filter(e => e.date !== today()), { date: today(), bedtime, wake, quality, note: note.trim() }].slice(-90);
    setEntries(next); localStorage.setItem(KEY, JSON.stringify(next));
    setBedtime(""); setWake(""); setNote("");
  }

  return <main className="livv-page min-h-full">
    <div className="mx-auto w-full max-w-xl px-5 pb-14 sm:px-6">
      <header className="pt-6 sm:pt-9">
        <Link href="/home/health" className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted"><ChevronLeft size={13}/> Health</Link>
        <div className="mt-7 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-livv-accent"><Moon size={13}/> Recovery</div>
        <h1 className="mt-2 text-[40px] font-semibold leading-[.96] tracking-[-.06em] sm:text-[48px]">Sleep is a system.</h1>
        <p className="mt-4 max-w-[42ch] text-[13px] leading-6 text-livv-muted">Sleep affects recovery, attention, mood, training, and the ability to make good decisions. LIVV helps you notice your own pattern rather than chase a perfect number.</p>
      </header>

      <section className="mt-9 grid grid-cols-2 border-y border-livv-border py-6">
        <Stat label="7-night average" value={average ? `${average}h` : "—"} />
        <Stat label="Current entry" value={current ? `${current}h` : "—"} />
      </section>

      <section className="mt-10">
        <SectionHead label="Build the record" title="Log the night." sub="The useful part is consistency. Record roughly the same information each time." />
        <div className="mt-5 border-y border-livv-border">
          <div className="grid grid-cols-2 divide-x divide-livv-border">
            <Field label="Bedtime"><input type="time" value={bedtime} onChange={e=>setBedtime(e.target.value)} className="w-full bg-transparent text-[15px] font-semibold outline-none"/></Field>
            <Field label="Wake time"><input type="time" value={wake} onChange={e=>setWake(e.target.value)} className="w-full bg-transparent text-[15px] font-semibold outline-none"/></Field>
          </div>
          <div className="border-t border-livv-border px-4 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-livv-muted">How did it feel?</p>
            <div className="mt-3 grid grid-cols-5 gap-2">{[1,2,3,4,5].map(n=><button key={n} type="button" onClick={()=>setQuality(n)} className={`grid h-11 place-items-center rounded-full border ${quality===n?"border-livv-accent bg-livv-accent-soft text-livv-accent":"border-livv-border text-livv-muted"}`} aria-label={`Sleep quality ${n} of 5`}><Star size={14} fill={quality===n?"currentColor":"none"}/></button>)}</div>
          </div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} maxLength={240} placeholder="What affected the night? Late meal, stress, training, screen time, alcohol, travel, etc." className="min-h-28 w-full border-t border-livv-border bg-transparent p-4 text-[13px] leading-6 outline-none placeholder:text-livv-muted"/>
          <button type="button" onClick={save} disabled={!bedtime||!wake} className="mx-4 mb-4 w-[calc(100%-2rem)] rounded-full bg-livv-ink py-3.5 text-[10px] font-semibold uppercase tracking-[.14em] text-livv-bg disabled:opacity-30">Save night</button>
        </div>
      </section>

      <section className="mt-10">
        <SectionHead label="Improve the system" title="What actually helps." />
        <div className="mt-5 space-y-4">
          <Guide icon={<Moon size={16}/>} title="Protect a consistent window" text="A reasonably consistent sleep and wake rhythm makes it easier for your body to anticipate rest. Start with a schedule you can actually keep." />
          <Guide icon={<Sun size={16}/>} title="Get light and movement early" text="Morning light and daytime activity help anchor your body clock. A short walk outside is a simple place to start." />
          <Guide icon={<TimerReset size={16}/>} title="Make the last hour boring" text="Lower the stimulation. Dim the room, finish the work, and give yourself a repeatable wind-down instead of trying to force sleep." />
        </div>
      </section>

      <section className="mt-10">
        <SectionHead label="History" title="Recent nights." sub="Your sleep log is stored on this device." />
        <div className="mt-5 divide-y divide-livv-border border-y border-livv-border">
          {!recent.length && <p className="py-7 text-[13px] text-livv-muted">Your first night will appear here.</p>}
          {recent.map(e=><div key={e.date} className="py-5"><div className="flex items-center justify-between gap-4"><p className="text-[14px] font-semibold">{e.date}</p><p className="text-[15px] font-semibold tabular-nums">{duration(e.bedtime,e.wake)}h</p></div><p className="mt-1 text-[11px] text-livv-muted">{e.bedtime} → {e.wake} · quality {e.quality}/5</p>{e.note&&<p className="mt-3 text-[12px] leading-5 text-livv-muted">{e.note}</p>}</div>)}
        </div>
      </section>
      <p className="mt-9 text-[10px] leading-5 text-livv-muted">LIVV Sleep is general wellness tracking, not medical advice or diagnosis.</p>
    </div>
  </main>;
}
function SectionHead({label,title,sub}:{label:string;title:string;sub?:string}){return <div><p className="text-[10px] font-semibold uppercase tracking-[.19em] text-livv-muted">{label}</p><h2 className="mt-1 text-[26px] font-semibold tracking-[-.045em]">{title}</h2>{sub&&<p className="mt-2 max-w-[42ch] text-[12px] leading-5 text-livv-muted">{sub}</p>}</div>}
function Stat({label,value}:{label:string;value:string}){return <div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-livv-muted">{label}</p><p className="mt-2 text-[29px] font-semibold tracking-[-.05em]">{value}</p></div>}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="px-4 py-5 first:pl-0 last:pr-0"><span className="block text-[10px] font-semibold uppercase tracking-[.15em] text-livv-muted">{label}</span><div className="mt-3">{children}</div></label>}
function Guide({icon,title,text}:{icon:ReactNode;title:string;text:string}){return <div className="flex gap-4 border-b border-livv-border pb-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-livv-border text-livv-muted">{icon}</span><div><h3 className="text-[14px] font-semibold">{title}</h3><p className="mt-1 text-[12px] leading-5 text-livv-muted">{text}</p></div></div>}
