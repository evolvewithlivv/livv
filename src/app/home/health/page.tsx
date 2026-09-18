"use client";

import { useEffect, useState } from "react";

const KEY = "livv-health-v1";

type HealthState = {
  sleep: number;
  water: number;
  meals: number;
  movement: boolean;
  weight: string;
  note: string;
};

const DEFAULTS: HealthState = { sleep: 0, water: 0, meals: 0, movement: false, weight: "", note: "" };

export default function HealthPage() {
  const [state, setState] = useState<HealthState>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<HealthState>) });
    } catch {}
  }, []);

  const update = (patch: Partial<HealthState>) => {
    const next = { ...state, ...patch };
    setState(next);
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  return (
    <main className="livv-page min-h-full pb-20">
      <div className="mx-auto max-w-xl px-5 pt-5">
        <header className="pb-7 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[var(--livv-pro-muted)]">Health</p>
          <h1 className="mt-2 text-[clamp(1.8rem,8vw,2.5rem)] font-semibold tracking-[-.05em]">Know your baseline.</h1>
          <p className="mx-auto mt-2 max-w-[38ch] text-[12px] leading-relaxed text-[var(--livv-pro-muted)]">
            A simple place to understand how your body is doing over time.
          </p>
        </header>

        <section className="border-y border-[var(--livv-pro-line)] py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[var(--livv-pro-accent)]">Today</p>
          <div className="mt-4 grid grid-cols-2 divide-x divide-[var(--livv-pro-line)]">
            <Metric label="Sleep" value={state.sleep ? `${state.sleep}h` : "—"} />
            <Metric label="Movement" value={state.movement ? "Done" : "Open"} />
          </div>
        </section>

        <section className="mt-8">
          <SectionHead label="Check in" title="The basics." sub="Log what matters. Nothing here is tied to a specific time." />
          <div className="mt-4 divide-y divide-[var(--livv-pro-line)] border-y border-[var(--livv-pro-line)]">
            <Stepper label="Sleep" value={state.sleep ? `${state.sleep} hours` : "Not logged"} action="hour" onClick={() => update({ sleep: state.sleep >= 12 ? 0 : state.sleep + 1 })} />
            <Stepper label="Water" value={`${state.water} / 8 glasses`} action="glass" onClick={() => update({ water: Math.min(8, state.water + 1) })} />
            <Stepper label="Meals" value={`${state.meals} / 3 logged`} action="meal" onClick={() => update({ meals: Math.min(3, state.meals + 1) })} />
            <button type="button" onClick={() => update({ movement: !state.movement })} className="flex w-full items-center gap-4 py-4 text-left">
              <span className={`grid h-9 w-9 place-items-center rounded-full border text-[11px] font-semibold ${state.movement ? "border-[var(--livv-pro-accent)] bg-[var(--livv-pro-accent-soft)] text-[var(--livv-pro-accent)]" : "border-[var(--livv-pro-line)] text-[var(--livv-pro-muted)]"}`}>{state.movement ? "✓" : "+"}</span>
              <span className="flex-1"><span className="block text-[14px] font-semibold">Movement</span><span className="mt-0.5 block text-[10px] text-[var(--livv-pro-muted)]">{state.movement ? "Completed today" : "Log when you've moved your body"}</span></span>
              <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--livv-pro-muted)]">{state.movement ? "Done" : "Log"}</span>
            </button>
          </div>
        </section>

        <section className="mt-8">
          <SectionHead label="Body" title="Your baseline." sub="Optional measurements you choose to keep." />
          <div className="mt-4 border-y border-[var(--livv-pro-line)] py-5">
            <label className="block text-[10px] font-semibold uppercase tracking-[.16em] text-[var(--livv-pro-muted)]">Weight</label>
            <div className="mt-3 flex items-center gap-3">
              <input value={state.weight} onChange={e => update({ weight: e.target.value })} inputMode="decimal" placeholder="—" aria-label="Weight" className="min-w-0 flex-1 border-b border-[var(--livv-pro-line)] bg-transparent py-2 text-[22px] outline-none focus:border-[var(--livv-pro-accent)]" />
              <span className="text-[11px] text-[var(--livv-pro-muted)]">lb</span>
            </div>
          </div>
        </section>

        <section className="mt-8 pb-8">
          <SectionHead label="Journal" title="How do you feel?" sub="A quick note gives your numbers some context." />
          <textarea value={state.note} onChange={e => update({ note: e.target.value })} placeholder="Energy, soreness, appetite, mood, anything worth remembering…" aria-label="Health note" className="mt-4 min-h-32 w-full resize-none rounded-2xl border border-[var(--livv-pro-line)] bg-[var(--livv-pro-surface-2)] p-4 text-[13px] leading-relaxed outline-none placeholder:text-[var(--livv-pro-muted)] focus:border-[var(--livv-pro-accent)]" />
          <p className="mt-2 text-center text-[9px] text-[var(--livv-pro-muted)]">Personal tracking only. LIVV does not diagnose medical conditions.</p>
        </section>
      </div>
    </main>
  );
}

function SectionHead({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[var(--livv-pro-muted)]">{label}</p><h2 className="mt-1 text-[26px] font-semibold tracking-tight">{title}</h2>{sub && <p className="mt-1 text-[12px] text-[var(--livv-pro-muted)]">{sub}</p>}</div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="px-3 first:pl-0"><p className="text-[9px] uppercase tracking-[.16em] text-[var(--livv-pro-muted)]">{label}</p><p className="mt-1 text-[22px] font-semibold">{value}</p></div>;
}

function Stepper({ label, value, action, onClick }: { label: string; value: string; action: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-4 py-4 text-left">
    <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--livv-pro-line)] text-[11px] text-[var(--livv-pro-muted)]">+</span>
    <span className="flex-1"><span className="block text-[14px] font-semibold">{label}</span><span className="mt-0.5 block text-[10px] text-[var(--livv-pro-muted)]">{value}</span></span>
    <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--livv-pro-muted)]">+ 1 {action}</span>
  </button>;
}
