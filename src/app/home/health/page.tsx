"use client";

import { useEffect, useMemo, useState } from "react";

const KEY = "livv-health-v2";
type Day = { date: string; sleep: number; water: number; meals: number; movement: boolean; weight: string; note: string };
const blank = (date: string): Day => ({ date, sleep: 0, water: 0, meals: 0, movement: false, weight: "", note: "" });
const todayKey = () => new Date().toISOString().slice(0, 10);

export default function HealthPage() {
  const [days, setDays] = useState<Day[]>([]);
  const [loaded, setLoaded] = useState(false);
  const today = todayKey();
  const current = useMemo(() => days.find(d => d.date === today) ?? blank(today), [days, today]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved)) setDays(saved.filter((d): d is Day => d && typeof d.date === "string").slice(-90));
      } else {
        const legacy = window.localStorage.getItem("livv-health-v1");
        if (legacy) setDays([{ ...blank(today), ...(JSON.parse(legacy) as Partial<Day>) }]);
      }
    } catch {}
    setLoaded(true);
  }, [today]);

  const save = (day: Day) => {
    setDays(prev => {
      const next = [...prev.filter(d => d.date !== day.date), day].sort((a, b) => a.date.localeCompare(b.date)).slice(-90);
      try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const update = (patch: Partial<Day>) => save({ ...current, ...patch });
  const history = useMemo(() => {
    const map = new Map(days.map(d => [d.date, d]));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return map.get(key) ?? blank(key);
    });
  }, [days]);
  const averages = useMemo(() => {
    const tracked = history.filter(d => d.sleep || d.water || d.meals || d.movement);
    return tracked.length ? {
      sleep: tracked.reduce((s, d) => s + d.sleep, 0) / tracked.length,
      water: tracked.reduce((s, d) => s + d.water, 0) / tracked.length,
      meals: tracked.reduce((s, d) => s + d.meals, 0) / tracked.length,
      movement: tracked.filter(d => d.movement).length
    } : { sleep: 0, water: 0, meals: 0, movement: 0 };
  }, [history]);

  if (!loaded) return null;
  return (
    <main className="livv-page min-h-full pb-20">
      <div className="mx-auto max-w-xl px-5 pt-5">
        <header className="pb-7 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[var(--livv-pro-muted)]">Health</p>
          <h1 className="mt-2 text-[clamp(1.8rem,8vw,2.5rem)] font-semibold tracking-[-.05em]">Know your baseline.</h1>
          <p className="mx-auto mt-2 max-w-[38ch] text-[12px] leading-relaxed text-[var(--livv-pro-muted)]">Track the signals. Notice the patterns. Make informed changes.</p>
        </header>

        <section className="border-y border-[var(--livv-pro-line)] py-5">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[var(--livv-pro-accent)]">Today</p><p className="mt-1 text-[28px] font-semibold tracking-tight">{completion(current)}% logged</p></div>
            <span className="text-[10px] uppercase tracking-[.14em] text-[var(--livv-pro-muted)]">{today}</span>
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--livv-pro-surface-2)]"><div className="h-full rounded-full bg-[var(--livv-pro-accent)]" style={{ width: `${completion(current)}%` }} /></div>
          <div className="mt-5 grid grid-cols-3 divide-x divide-[var(--livv-pro-line)]"><Metric label="Sleep" value={current.sleep ? `${current.sleep}h` : "—"} /><Metric label="Water" value={`${current.water}/8`} /><Metric label="Movement" value={current.movement ? "Done" : "—"} /></div>
        </section>

        <section className="mt-8">
          <SectionHead label="Check in" title="The basics." sub="Log whenever you want. There is no prescribed schedule." />
          <div className="mt-4 divide-y divide-[var(--livv-pro-line)] border-y border-[var(--livv-pro-line)]">
            <Stepper label="Sleep" value={current.sleep ? `${current.sleep} hours` : "Not logged"} action={current.sleep >= 12 ? "Reset" : "+ 1 hour"} onClick={() => update({ sleep: current.sleep >= 12 ? 0 : current.sleep + 1 })} />
            <Stepper label="Water" value={`${current.water} / 8 glasses`} action={current.water >= 8 ? "Complete" : "+ 1 glass"} onClick={() => update({ water: Math.min(8, current.water + 1) })} />
            <Stepper label="Meals" value={`${current.meals} / 3 logged`} action={current.meals >= 3 ? "Complete" : "+ 1 meal"} onClick={() => update({ meals: Math.min(3, current.meals + 1) })} />
            <Toggle label="Movement" detail="Any intentional movement counts." done={current.movement} onClick={() => update({ movement: !current.movement })} />
          </div>
        </section>

        <section className="mt-8">
          <SectionHead label="Body" title="Measurements." sub="Optional. Track only what is useful to you." />
          <div className="mt-4 divide-y divide-[var(--livv-pro-line)] border-y border-[var(--livv-pro-line)]">
            <label className="flex items-center gap-4 py-4"><span className="w-24 text-[14px] font-semibold">Weight</span><input value={current.weight} onChange={e => update({ weight: e.target.value })} inputMode="decimal" placeholder="—" aria-label="Weight" className="min-w-0 flex-1 border-b border-[var(--livv-pro-line)] bg-transparent py-2 text-[18px] outline-none focus:border-[var(--livv-pro-accent)]" /><span className="text-[10px] text-[var(--livv-pro-muted)]">lb</span></label>
            <label className="flex items-center gap-4 py-4"><span className="w-24 text-[14px] font-semibold">Note</span><input value={current.note} onChange={e => update({ note: e.target.value })} placeholder="Anything worth remembering" aria-label="Health note" className="min-w-0 flex-1 border-b border-[var(--livv-pro-line)] bg-transparent py-2 text-[13px] outline-none focus:border-[var(--livv-pro-accent)]" /></label>
          </div>
        </section>

        <section className="mt-8">
          <SectionHead label="Trends" title="Seven-day view." sub="A snapshot of your recent tracking, not a medical assessment." />
          <div className="mt-4 border-y border-[var(--livv-pro-line)]">
            <Trend label="Sleep" value={averages.sleep ? `${averages.sleep.toFixed(1)}h avg` : "No data"} percent={averages.sleep / 8 * 100} />
            <Trend label="Water" value={averages.water ? `${averages.water.toFixed(1)} / 8 avg` : "No data"} percent={averages.water / 8 * 100} />
            <Trend label="Meals" value={averages.meals ? `${averages.meals.toFixed(1)} / 3 avg` : "No data"} percent={averages.meals / 3 * 100} />
            <Trend label="Movement" value={`${averages.movement} / 7 days`} percent={averages.movement / 7 * 100} />
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1.5">{history.map(d => <div key={d.date} className="text-center"><div className={`mx-auto h-9 w-9 rounded-full border ${completion(d) ? "border-[var(--livv-pro-accent)] bg-[var(--livv-pro-accent-soft)]" : "border-[var(--livv-pro-line)]"}`}><span className="text-[9px] leading-9 text-[var(--livv-pro-muted)]">{completion(d)}%</span></div><p className="mt-1 text-[8px] uppercase text-[var(--livv-pro-muted)]">{new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow" })}</p></div>)}</div>
        </section>

        <section className="mt-8 pb-8">
          <SectionHead label="Health record" title="Recent notes." sub="Your tracking stays on this device for now." />
          <div className="mt-4 divide-y divide-[var(--livv-pro-line)] border-y border-[var(--livv-pro-line)]">
            {days.filter(d => d.note.trim()).slice(-5).reverse().map(d => <div key={d.date} className="py-4"><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[var(--livv-pro-muted)]">{d.date}</p><p className="mt-2 text-[13px] leading-relaxed">{d.note}</p></div>)}
            {!days.some(d => d.note.trim()) && <p className="py-5 text-[12px] text-[var(--livv-pro-muted)]">Your notes will appear here as you add them.</p>}
          </div>
          <p className="mt-3 text-center text-[9px] text-[var(--livv-pro-muted)]">Personal tracking only. LIVV does not diagnose medical conditions.</p>
        </section>
      </div>
    </main>
  );
}

function completion(d: Day) { return Math.round(([d.sleep > 0, d.water > 0, d.meals > 0, d.movement].filter(Boolean).length / 4) * 100); }
function SectionHead({ label, title, sub }: { label: string; title: string; sub?: string }) { return <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[var(--livv-pro-muted)]">{label}</p><h2 className="mt-1 text-[26px] font-semibold tracking-tight">{title}</h2>{sub && <p className="mt-1 text-[12px] text-[var(--livv-pro-muted)]">{sub}</p>}</div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="px-3 first:pl-0"><p className="text-[9px] uppercase tracking-[.16em] text-[var(--livv-pro-muted)]">{label}</p><p className="mt-1 text-[18px] font-semibold">{value}</p></div>; }
function Stepper({ label, value, action, onClick }: { label: string; value: string; action: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="flex w-full items-center gap-4 py-4 text-left"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--livv-pro-line)] text-[11px] text-[var(--livv-pro-muted)]">+</span><span className="flex-1"><span className="block text-[14px] font-semibold">{label}</span><span className="mt-0.5 block text-[10px] text-[var(--livv-pro-muted)]">{value}</span></span><span className="text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--livv-pro-muted)]">{action}</span></button>; }
function Toggle({ label, detail, done, onClick }: { label: string; detail: string; done: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className="flex w-full items-center gap-4 py-4 text-left"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-[11px] font-semibold ${done ? "border-[var(--livv-pro-accent)] bg-[var(--livv-pro-accent-soft)] text-[var(--livv-pro-accent)]" : "border-[var(--livv-pro-line)] text-[var(--livv-pro-muted)]"}`}>{done ? "✓" : "+"}</span><span className="flex-1"><span className="block text-[14px] font-semibold">{label}</span><span className="mt-0.5 block text-[10px] text-[var(--livv-pro-muted)]">{detail}</span></span><span className="text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--livv-pro-muted)]">{done ? "Done" : "Log"}</span></button>; }
function Trend({ label, value, percent }: { label: string; value: string; percent: number }) { return <div className="border-b border-[var(--livv-pro-line)] py-4 last:border-b-0"><div className="flex items-center justify-between gap-4"><span className="text-[14px] font-semibold">{label}</span><span className="text-[10px] text-[var(--livv-pro-muted)]">{value}</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--livv-pro-surface-2)]"><div className="h-full rounded-full bg-[var(--livv-pro-accent)]" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></div></div>; }
