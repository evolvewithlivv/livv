"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { livePillars, loadRecord, logCustomAction, setObjective, todaysCustom, todaysObjectives, type LivvRecord } from "@/lib/record";
import { loadIdentity } from "@/lib/identity";
import { evolutionTitle } from "@/lib/levels";
import { strongestPillar, needsAttention } from "@/lib/command";
import { feedback } from "@/lib/sensory";
import { cn } from "@/lib/utils";
import { PILLAR_DEFS } from "@/lib/evolve-data";
import { buildEvalaEvidence } from "@/lib/evala-evidence";

const PROMPTS = [
  "What is pulling my attention off course this week?",
  "Where am I over-indexing and where am I neglecting myself?",
  "What is the smallest action that would restore momentum today?",
  "Review my last seven days without sugarcoating it.",
];

export default function EvalaPage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [draft, setDraft] = useState("");
  const [thread, setThread] = useState<{ role: "you" | "evala"; text: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pillar, setPillar] = useState("Mind");
  const [size, setSize] = useState<"small" | "standard" | "major">("standard");

  useEffect(() => {
    const sync = () => setRec(loadRecord());
    sync();
    window.addEventListener("livv-record", sync);
    return () => window.removeEventListener("livv-record", sync);
  }, []);

  const briefing = useMemo(() => {
    if (!rec) return null;
    const strong = strongestPillar(rec);
    const weak = needsAttention(rec);
    const evo = evolutionTitle(rec.level);
    const open = todaysObjectives(rec).filter((o) => !o.completed);
    const evidence = buildEvalaEvidence(rec);
    return {
      evo, strong, weak, open, evidence,
      line: evidence.headline,
    };
  }, [rec]);

  if (!rec || !briefing) return <main className="min-h-dvh bg-[#030405]" />;

  const snapshot = () => {
    const me = loadIdentity();
    return {
      name: me.displayName || me.username,
      level: rec.level,
      streak: rec.streak,
      embers: me.embers,
      evo: briefing.evo.name,
      strong: briefing.strong.name,
      weak: briefing.weak.name,
      open: briefing.open.map((o) => o.title),
      lastWorkout: rec.lastWorkout?.name || null,
      evidence: briefing.evidence.snapshotLines.slice(0, 12),
    };
  };

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    feedback("tick");
    setDraft("");
    setThread((t) => [...t, { role: "you", text: q }]);
    setBusy(true);
    try {
      const res = await fetch("/api/evala", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, snapshot: snapshot() }),
      });
      const data = (await res.json()) as { text?: string };
      setThread((t) => [...t, { role: "evala", text: data.text || "Say that again." }]);
    } catch {
      setThread((t) => [...t, { role: "evala", text: "I could not reach the live layer. Ask again in a second." }]);
    } finally {
      setBusy(false);
    }
  };

  const pillars = livePillars(rec);
  const custom = todaysCustom(rec);
  const completed = todaysObjectives(rec).filter((o) => o.completed).length;
  const total = todaysObjectives(rec).length;

  return (
    <main className="livv-page relative min-h-full overflow-hidden pb-12">
      <div className="relative z-10 mx-auto max-w-lg px-5 pt-5">
        <PageHero
          eyebrow="Intelligence layer"
          title="Evala"
          subtitle="Ask what is actually going on. It will answer that, not a script."
          accent="#b28cff"
        />

        <section className="livv-glass mt-8 overflow-hidden rounded-[28px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-livv-accent-soft">Live read</p>
              <p className="mt-1 text-[11px] text-white/25">Based on your current record</p>
            </div>
            <span className="rounded-full bg-livv-accent/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-livv-accent-soft">Active</span>
          </div>
          <p className="font-display mt-7 text-[24px] leading-[1.12] tracking-tight text-white/95">{briefing.line}</p>
          <div className="mt-7 grid grid-cols-3 gap-2">
            <Metric label="EVOLUTION" value={`Lv ${rec.level}`} />
            <Metric label="CHAIN" value={`${rec.streak}d`} />
            <Metric label="TODAY" value={`${completed}/${total}`} />
          </div>
          <div className="mt-6 border-t border-white/[0.06] pt-5">
            <p className="text-[9px] uppercase tracking-[0.24em] text-white/25">Why I'm saying this</p>
            <p className="mt-1 text-[11px] text-white/30">From your local record only — not a mood model.</p>
            <ul className="mt-4 space-y-3">
              {briefing.evidence.items.slice(0, 5).map((item) => (
                <li key={item.claim} className="rounded-2xl border border-white/[0.06] bg-black/20 px-3.5 py-3">
                  <p className="text-[13px] font-medium text-white/85">{item.claim}</p>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-white/35">{item.because.slice(0, 3).join(" · ")}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div><p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Today’s loops</p><p className="mt-1 text-[12px] text-white/25">Small actions compound.</p></div>
            <span className="text-[12px] tabular-nums text-livv-accent-soft">{completed}/{total}</span>
          </div>
          <div className="mt-4 space-y-2">
            {todaysObjectives(rec).map((obj, i) => (
              <button key={obj.id} type="button" onClick={() => { setObjective(obj.id, !obj.completed); feedback(obj.completed ? "tick" : "checkin"); setRec(loadRecord()); }} className={cn("group flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left", obj.completed ? "border-livv-accent/20 bg-livv-accent/[0.06]" : "border-white/[0.07] bg-white/[0.025]")}>
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs", obj.completed ? "bg-livv-accent text-white shadow-[0_0_18px_rgb(var(--livv-accent)/.35)]" : "bg-white/[0.04] text-white/25 ring-1 ring-white/10")}>{obj.completed ? "✓" : String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1"><span className={cn("block text-[14px]", obj.completed && "text-white/35 line-through")}>{obj.title}</span><span className="mt-0.5 block text-[11px] text-white/25">{obj.pillar} · +{obj.xp} XP</span></span>
                <span className="text-white/15 transition group-hover:text-white/40">›</span>
              </button>
            ))}
            {custom.map((c) => <div key={c.id} className="flex items-center gap-3 px-2 py-2 text-[13px] text-white/45"><span className="h-1.5 w-1.5 rounded-full bg-livv-accent" />{c.title}<span className="text-white/20">+{c.xp}</span></div>)}
          </div>
          <button type="button" onClick={() => setLogOpen(true)} className="mt-4 rounded-full border border-white/10 px-3.5 py-2 text-[12px] text-livv-accent-soft">+ Log real action</button>
        </section>

        <section className="mt-11 rounded-[26px] border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.28em] text-white/30">System shape</p><p className="mt-1 text-[12px] text-white/25">Where your energy is landing</p></div><span className="text-[10px] uppercase tracking-[0.18em] text-white/20">6 pillars</span></div>
          <div className="mt-6 grid grid-cols-3 gap-y-6">
            {pillars.filter((p) => p.id !== "life").map((p) => <div key={p.id} className="text-center"><div className="livv-breathe mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.08]" style={{ background: `radial-gradient(circle, rgb(var(--livv-accent) / ${0.09 + p.progress / 220}), transparent 70%)`, boxShadow: p.level > 1 ? "0 0 25px rgb(var(--livv-accent)/.14)" : undefined }}><span className="font-display text-[15px]">{p.level}</span></div><p className="mt-2 text-[9px] tracking-[0.16em] text-white/35">{p.name.toUpperCase()}</p></div>)}
          </div>
        </section>

        <section className="mt-11">
          <div className="flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Ask Evala</p><p className="mt-1 text-[12px] text-white/25">It reads your question plus your record.</p></div></div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{PROMPTS.map((p) => <button key={p} type="button" onClick={() => ask(p)} className="shrink-0 rounded-full border border-white/10 bg-white/[0.025] px-3 py-2 text-[11px] text-white/45">{p}</button>)}</div>
          <div className="mt-5 space-y-4">{thread.map((m, i) => <div key={i} className={m.role === "you" ? "text-right" : "text-left"}><p className="text-[9px] uppercase tracking-[0.2em] text-white/20">{m.role === "you" ? "You" : "Evala"}</p><p className={cn("mt-1 inline-block max-w-[92%] rounded-2xl px-3.5 py-3 text-[13px] leading-relaxed", m.role === "you" ? "bg-white/[0.04] text-white/55" : "bg-livv-accent/[0.07] text-white/80 ring-1 ring-livv-accent/10")}>{m.text}</p></div>)}</div>
          {busy && <p className="mt-3 text-[11px] text-white/30">Evala is reading it…</p>}
          <div className="mt-5 flex gap-2"><input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask(draft)} placeholder="Ask from your actual life…" className="h-12 min-w-0 flex-1 rounded-2xl bg-white/[0.035] px-4 text-sm outline-none ring-1 ring-white/10 placeholder:text-white/20" /><button type="button" disabled={busy} onClick={() => ask(draft)} className="h-12 rounded-2xl bg-white px-5 text-sm font-semibold text-black disabled:opacity-40">Ask</button></div>
        </section>

        <Link href="/home/progress" className="mt-11 flex items-center justify-between border-t border-white/[0.06] pt-5 text-[13px] text-white/35"><span>See the full evolution story</span><span>→</span></Link>
      </div>

      {logOpen && <div className="fixed inset-0 z-[70] flex items-end bg-black/75 backdrop-blur-md"><div className="w-full max-w-lg rounded-t-[30px] border-t border-white/10 bg-[#0a0c10] p-5 pb-10 shadow-[0_-30px_80px_rgba(0,0,0,.55)]"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Log action</p><p className="mt-1 text-[12px] text-white/20">Give the system another signal.</p></div><button onClick={() => setLogOpen(false)} className="text-xl text-white/30">×</button></div><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What did you actually do?" className="mt-6 w-full border-b border-white/10 bg-transparent pb-3 text-[19px] outline-none placeholder:text-white/20" /><div className="mt-5 flex flex-wrap gap-2">{PILLAR_DEFS.filter((p) => p.id !== "life").map((p) => <button key={p.id} type="button" onClick={() => setPillar(p.name)} className={cn("rounded-full px-3 py-1.5 text-xs ring-1", pillar === p.name ? "bg-livv-accent/20 text-white ring-livv-accent/40" : "text-white/35 ring-white/10")}>{p.name}</button>)}</div><div className="mt-4 flex gap-2">{(["small", "standard", "major"] as const).map((s) => <button key={s} type="button" onClick={() => setSize(s)} className={cn("flex-1 rounded-xl py-3 text-xs capitalize ring-1", size === s ? "bg-livv-accent/10 ring-livv-accent/40" : "text-white/35 ring-white/10")}>{s}</button>)}</div><button type="button" onClick={() => { if (title.trim().length < 2) return; logCustomAction({ title, pillar, size }); feedback("complete"); setRec(loadRecord()); setTitle(""); setLogOpen(false); }} className="mt-6 w-full rounded-2xl bg-white py-3.5 text-sm font-semibold text-black">Add to record</button></div></div>}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-black/20 px-3 py-3 ring-1 ring-white/[0.06]"><p className="text-[8px] tracking-[0.18em] text-white/25">{label}</p><p className="mt-1 text-[15px] font-medium text-white/75">{value}</p></div>;
}
