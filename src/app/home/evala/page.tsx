"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AmbientField } from "@/components/layout/ambient-field";
import {
  livePillars,
  loadRecord,
  logCustomAction,
  setObjective,
  todaysCustom,
  todaysObjectives,
  type LivvRecord,
} from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { strongestPillar, needsAttention } from "@/lib/command";
import { feedback } from "@/lib/sensory";
import { cn } from "@/lib/utils";
import { PILLAR_DEFS } from "@/lib/evolve-data";

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
    const objs = todaysObjectives(rec);
    const open = objs.filter((o) => !o.completed);
    return {
      evo,
      strong,
      weak,
      open,
      line:
        open[0]
          ? `Open loop: ${open[0].title}. That is the highest leverage move still sitting on today.`
          : rec.streak > 0
            ? `Chain is alive at ${rec.streak} days. ${strong.name} leads. ${weak.name} is quiet.`
            : `No active chain. One logged action is enough to re-enter.`,
    };
  }, [rec]);

  if (!rec || !briefing) return <main className="min-h-dvh bg-[#050505]" />;

  const ask = (question: string) => {
    const q = question.trim();
    if (!q) return;
    feedback("tick");
    const strong = strongestPillar(rec);
    const weak = needsAttention(rec);
    const objs = todaysObjectives(rec).filter((o) => !o.completed);
    let answer =
      `From your record: Evolution ${briefing.evo.name} (Lv ${rec.level}). ${strong.name} is ahead. ${weak.name} needs weight. `;
    if (objs[0]) answer += `Still open today — ${objs[0].title}. Do that before inventing new work.`;
    else answer += `Today’s loops are clear. Protect recovery or deepen ${weak.name}.`;
    if (/money|spend|finance/i.test(q))
      answer =
        "Finance only moves when it is logged. Track one spend or transfer today. Silence here is usually avoidance, not strategy.";
    if (/train|body|workout/i.test(q))
      answer =
        rec.lastWorkout
          ? `Last session: ${rec.lastWorkout.name}. Repeat it or open Train and start without redesigning the plan.`
          : "No session on record. Open Train. Ten minutes counts.";
    setThread((t) => [...t, { role: "you", text: q }, { role: "evala", text: answer }]);
    setDraft("");
  };

  const pillars = livePillars(rec);
  const custom = todaysCustom(rec);

  return (
    <main className="relative min-h-full overflow-hidden pb-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div
          className="absolute left-1/2 top-0 h-[380px] w-[380px] -translate-x-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgb(var(--livv-accent) / 0.16), transparent 70%)",
          }}
        />
        <AmbientField />
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/30">Intelligence</p>
        <h1 className="font-display mt-2 text-[34px] font-semibold tracking-tight">Evala</h1>
        <p className="mt-2 max-w-[28ch] text-[14px] leading-relaxed text-white/45">
          Not a chatbot. A read on your evolution from what you actually logged.
        </p>

        <section className="mt-8">
          <p className="text-[10px] uppercase tracking-[0.28em] text-livv-accent-soft">Briefing</p>
          <p className="font-display mt-3 text-[22px] leading-snug tracking-tight text-white/90">
            {briefing.line}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-white/40">
            <span>{briefing.evo.name} · Lv {rec.level}</span>
            <span>Strong · {briefing.strong.name}</span>
            <span>Quiet · {briefing.weak.name}</span>
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Today’s loops</p>
          <div className="mt-4 space-y-3">
            {todaysObjectives(rec).map((obj) => (
              <button
                key={obj.id}
                type="button"
                onClick={() => {
                  setObjective(obj.id, !obj.completed);
                  feedback(obj.completed ? "tick" : "checkin");
                  setRec(loadRecord());
                }}
                className="flex w-full items-center gap-3 text-left"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs",
                    obj.completed
                      ? "bg-livv-accent text-white shadow-[0_0_16px_rgb(var(--livv-accent)/0.4)]"
                      : "ring-1 ring-white/15 text-white/30"
                  )}
                >
                  {obj.completed ? "✓" : ""}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[15px]", obj.completed && "text-white/35 line-through")}>
                    {obj.title}
                  </span>
                  <span className="text-[12px] text-white/30">
                    {obj.pillar} · +{obj.xp} XP
                  </span>
                </span>
              </button>
            ))}
            {custom.map((c) => (
              <div key={c.id} className="flex items-center gap-3 pl-1">
                <span className="h-2 w-2 rounded-full bg-livv-accent" />
                <span className="text-[14px] text-white/60">
                  {c.title}{" "}
                  <span className="text-white/30">
                    · {c.pillar} · +{c.xp}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setLogOpen(true)}
            className="mt-5 text-[13px] text-livv-accent-soft"
          >
            + Log real action
          </button>
        </section>

        <section className="mt-12">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Pillar shape</p>
          <div className="mt-5 grid grid-cols-3 gap-4">
            {pillars
              .filter((p) => p.id !== "life")
              .map((p) => (
                <div key={p.id} className="text-center">
                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-[11px] font-semibold"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, rgb(var(--livv-accent) / ${0.15 + p.progress / 200}), rgba(255,255,255,0.03))`,
                      boxShadow:
                        p.level > 1
                          ? "0 0 18px rgb(var(--livv-accent) / 0.25)"
                          : "inset 0 0 0 1px rgba(255,255,255,0.08)",
                    }}
                  >
                    {p.level}
                  </div>
                  <p className="mt-2 text-[10px] tracking-[0.14em] text-white/45">{p.name.toUpperCase()}</p>
                </div>
              ))}
          </div>
        </section>

        <section className="mt-12">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Ask Evala</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => ask(p)}
                className="rounded-full px-3 py-1.5 text-left text-[12px] text-white/50 ring-1 ring-white/10"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {thread.map((m, i) => (
              <div key={i} className={m.role === "you" ? "text-right" : "text-left"}>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                  {m.role === "you" ? "You" : "Evala"}
                </p>
                <p
                  className={cn(
                    "mt-1 inline-block max-w-[92%] text-[14px] leading-relaxed",
                    m.role === "you" ? "text-white/70" : "text-white/85"
                  )}
                >
                  {m.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask(draft)}
              placeholder="Ask from your actual life…"
              className="h-12 flex-1 rounded-full bg-white/[0.04] px-4 text-sm outline-none ring-1 ring-white/10 placeholder:text-white/25"
            />
            <button
              type="button"
              onClick={() => ask(draft)}
              className="h-12 rounded-full bg-white px-5 text-sm font-semibold text-black"
            >
              Ask
            </button>
          </div>
        </section>

        <Link href="/home/progress" className="mt-12 block text-[13px] text-white/35">
          Full progress story →
        </Link>
      </div>

      {logOpen && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-t-[28px] bg-[#0c0e12] p-5 pb-10 ring-1 ring-white/10">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Log action</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you actually do?"
              className="mt-4 w-full bg-transparent text-[18px] outline-none placeholder:text-white/25"
            />
            <div className="mt-5 flex flex-wrap gap-2">
              {PILLAR_DEFS.filter((p) => p.id !== "life").map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPillar(p.name)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs ring-1",
                    pillar === p.name
                      ? "bg-livv-accent/20 ring-livv-accent/40"
                      : "ring-white/10 text-white/40"
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              {(["small", "standard", "major"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={cn(
                    "flex-1 rounded-2xl py-3 text-xs capitalize ring-1",
                    size === s ? "ring-livv-accent/50 bg-livv-accent/10" : "ring-white/10 text-white/40"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => setLogOpen(false)} className="flex-1 py-3 text-sm text-white/40">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (title.trim().length < 2) return;
                  logCustomAction({ title, pillar, size });
                  feedback("complete");
                  setRec(loadRecord());
                  setTitle("");
                  setLogOpen(false);
                }}
                className="flex-1 rounded-full bg-white py-3 text-sm font-semibold text-black"
              >
                Log it
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
