"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronLeft, Moon, Star } from "lucide-react";

const KEY = "livv-sleep-v1";
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  }, []);

  const recent = useMemo(() => entries.slice(-7).reverse(), [entries]);
  const average = recent.length
    ? Math.round((recent.reduce((s, e) => s + duration(e.bedtime, e.wake), 0) / recent.length) * 10) / 10
    : 0;
  const current = duration(bedtime, wake);

  function save() {
    if (!bedtime || !wake) return;
    const next = [
      ...entries.filter((e) => e.date !== today()),
      { date: today(), bedtime, wake, quality, note: note.trim() },
    ].slice(-90);
    setEntries(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setBedtime(""); setWake(""); setNote("");
  }

  return (
    <main className="livv-page min-h-full">
      <div className="mx-auto w-full max-w-xl px-5 pb-12 sm:px-6">
        <header className="pt-6 sm:pt-9">
          <Link href="/home/health" className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
            <ChevronLeft size={13} /> Health
          </Link>
          <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-livv-accent">
            <Moon size={13} /> Sleep
          </div>
          <h1 className="mt-2 text-[38px] font-semibold leading-[.98] tracking-[-.06em] sm:text-[46px]">
            Sleep, remembered.
          </h1>
          <p className="mt-4 max-w-[39ch] text-[13px] leading-6 text-livv-muted">
            Log the night. Notice the pattern. No prescribed schedule.
          </p>
        </header>

        <section className="mt-8 border-y border-livv-border py-6">
          <div className="grid grid-cols-2 divide-x divide-livv-border">
            <Stat label="Last 7 avg" value={average ? `${average}h` : "—"} />
            <Stat label="Current night" value={current ? `${current}h` : "—"} />
          </div>
        </section>

        <section className="mt-9">
          <SectionHead label="Check in" title="Log a night." sub="Capture the basics while they are still fresh." />
          <div className="mt-4 border-y border-livv-border">
            <div className="grid grid-cols-2 divide-x divide-livv-border">
              <Field label="Bedtime">
                <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className="w-full bg-transparent text-[15px] font-semibold outline-none" />
              </Field>
              <Field label="Wake time">
                <input type="time" value={wake} onChange={(e) => setWake(e.target.value)} className="w-full bg-transparent text-[15px] font-semibold outline-none" />
              </Field>
            </div>
            <div className="border-t border-livv-border py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-livv-muted">Sleep quality</p>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" onClick={() => setQuality(n)}
                    className={`grid h-11 place-items-center rounded-full border text-sm transition ${quality === n ? "border-livv-accent bg-livv-accent-soft text-livv-accent" : "border-livv-border text-livv-muted"}`}
                    aria-label={`Sleep quality ${n} of 5`} aria-pressed={quality === n}>
                    <Star size={14} fill={quality === n ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={180}
              placeholder="Optional note about the night..."
              className="min-h-24 w-full border-t border-livv-border bg-transparent p-4 text-[13px] leading-6 outline-none placeholder:text-livv-muted" />
            <button type="button" onClick={save} disabled={!bedtime || !wake}
              className="mx-4 mb-4 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-full bg-livv-ink py-3.5 text-[10px] font-semibold uppercase tracking-[.14em] text-livv-bg disabled:opacity-30">
              <Check size={14} /> Save sleep
            </button>
          </div>
        </section>

        <section className="mt-9">
          <SectionHead label="History" title="Recent nights." sub="Your record is stored on this device." />
          <div className="mt-4 divide-y divide-livv-border border-y border-livv-border">
            {recent.length === 0 && <p className="py-6 text-[13px] text-livv-muted">Your first night will appear here.</p>}
            {recent.map((e) => (
              <div key={e.date} className="flex items-center gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold">{e.date}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-livv-muted">{e.bedtime} → {e.wake} · quality {e.quality}/5</p>
                </div>
                <span className="text-[14px] font-semibold tabular-nums">{duration(e.bedtime, e.wake)}h</span>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-8 text-[10px] leading-5 text-livv-muted">
          LIVV Sleep is wellness tracking, not medical advice or diagnosis.
        </p>
      </div>
    </main>
  );
}

function SectionHead({label,title,sub}:{label:string;title:string;sub?:string}) {
  return <div><p className="text-[10px] font-semibold uppercase tracking-[.19em] text-livv-muted">{label}</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-.045em]">{title}</h2>{sub&&<p className="mt-2 max-w-[38ch] text-[11px] leading-relaxed text-livv-muted">{sub}</p>}</div>;
}
function Stat({label,value}:{label:string;value:string}) {
  return <div className="px-4 first:pl-0 last:pr-0"><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-livv-muted">{label}</p><p className="mt-2 text-[27px] font-semibold tracking-[-.05em]">{value}</p></div>;
}
function Field({label,children}:{label:string;children:ReactNode}) {
  return <label className="block px-4 py-5 first:pl-0 last:pr-0"><span className="block text-[10px] font-semibold uppercase tracking-[.15em] text-livv-muted">{label}</span><div className="mt-3">{children}</div></label>;
}
