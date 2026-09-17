"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronRight, Flame, Plus } from "lucide-react";
import { addEmbers, loadIdentity, type Identity } from "@/lib/identity";
import { getTier } from "@/lib/membership";
import { getEffectiveTier } from "@/lib/billing";
import { checkInRecord, isCheckedInToday, loadRecord, type LivvRecord } from "@/lib/record";
import { dailyPillarStatus } from "@/lib/command";
import { buildBehaviorLoop } from "@/lib/behavior-loop";
import { feedback } from "@/lib/sensory";
import { dailySummary } from "@/lib/daily";

const AREAS = [
  { id: "body", label: "Body", href: "/home/train", description: "Train, recover, move." },
  { id: "mind", label: "Mind", href: "/home/mind", description: "Read, reflect, learn." },
  { id: "career", label: "Work", href: "/home/evala", description: "Build what matters." },
  { id: "finance", label: "Money", href: "/home/evala", description: "Make a useful move." },
  { id: "social", label: "People", href: "/home/connect", description: "Stay connected." },
  { id: "life", label: "Life", href: "/home/daily", description: "Handle real life." },
] as const;

export default function HomePage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [me, setMe] = useState<Identity | null>(null);
  const [daily, setDaily] = useState<ReturnType<typeof dailySummary> | null>(null);

  const pull = () => { setRec(loadRecord()); setMe(loadIdentity()); setDaily(dailySummary()); };
  useEffect(() => {
    pull();
    const events = ["livv-identity", "livv-record", "livv-daily", "livv-billing"];
    events.forEach((e) => window.addEventListener(e, pull));
    return () => events.forEach((e) => window.removeEventListener(e, pull));
  }, []);

  const status = useMemo(() => rec ? dailyPillarStatus(rec) : [], [rec]);
  const loop = useMemo(() => rec ? buildBehaviorLoop(rec, new Date()) : null, [rec]);
  if (!rec || !me || !loop) return <main className="min-h-dvh" />;

  const checkedIn = isCheckedInToday(rec);
  const complete = (id: string) => id === "life" ? checkedIn : Boolean(status.find((x) => x.id === id)?.done);
  const done = AREAS.filter((x) => complete(x.id)).length;
  const xp = Math.min(100, Math.round((rec.currentXp / Math.max(rec.xpToNext, 1)) * 100));

  const checkIn = () => {
    if (checkedIn) return;
    const result = checkInRecord();
    if (result.already) return;
    const tier = getTier(getEffectiveTier());
    feedback("checkin");
    addEmbers(10 * tier.multiplier + (result.emberBonus || 0));
    pull();
  };

  return (
    <main className="livv-page min-h-full pb-24">
      <div className="mx-auto w-full max-w-2xl px-4 pb-8 sm:px-6">
        <section className="pt-5 sm:pt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium text-livv-muted">Good to see you, {me.displayName || "there"}.</p>
              <h1 className="mt-1 text-[32px] font-semibold leading-tight tracking-[-.045em] sm:text-[40px]">{daily?.world.line || "What are you building today?"}</h1>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-livv-accent-soft text-livv-accent">
              <Flame size={19} strokeWidth={1.9} />
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-2xl border border-livv-border bg-livv-surface p-5 sm:p-6">
          <div className="flex items-start justify-between gap-5">
            <div><p className="text-[11px] font-medium uppercase tracking-[.12em] text-livv-muted">Today</p><p className="mt-2 text-[24px] font-semibold tracking-[-.035em]">{done} of {AREAS.length} areas moved</p></div>
            <button onClick={checkIn} disabled={checkedIn} className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-livv-accent px-4 text-[12px] font-semibold text-white disabled:opacity-50">{checkedIn ? <Check size={15} /> : <Plus size={15} />}{checkedIn ? "Checked in" : "Check in"}</button>
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"><div className="h-full rounded-full bg-livv-accent transition-all" style={{ width: `${(done / AREAS.length) * 100}%` }} /></div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-livv-muted"><span>{rec.streak} day streak</span><span>Level {rec.level} · {xp}% to next</span></div>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between"><div><p className="text-[11px] font-medium uppercase tracking-[.12em] text-livv-muted">Your life</p><h2 className="mt-1 text-[22px] font-semibold tracking-[-.035em]">Six areas. One life.</h2></div></div>
          <div className="overflow-hidden rounded-2xl border border-livv-border bg-livv-surface">
            {AREAS.map((area, i) => {
              const isDone = complete(area.id);
              return <Link key={area.id} href={area.href} className={`flex items-center gap-4 px-4 py-4 sm:px-5 ${i !== AREAS.length - 1 ? "border-b border-livv-border" : ""}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${isDone ? "border-livv-accent bg-livv-accent-soft text-livv-accent" : "border-livv-border text-livv-muted"}`}>{isDone ? <Check size={16} /> : <span className="text-[12px] font-semibold">{i + 1}</span>}</span>
                <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold">{area.label}</span><span className="mt-0.5 block text-[11px] text-livv-muted">{area.description}</span></span>
                <ChevronRight size={18} className="shrink-0 text-livv-muted" />
              </Link>;
            })}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-livv-border bg-livv-surface p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-medium uppercase tracking-[.12em] text-livv-muted">Next</p><h2 className="mt-1 text-[22px] font-semibold tracking-[-.035em]">{loop.move.title}</h2><p className="mt-2 max-w-[42ch] text-[12px] leading-relaxed text-livv-muted">{loop.move.reason}</p></div><Link href={loop.move.href} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-border"><ArrowRight size={17} /></Link></div>
        </section>
      </div>
    </main>
  );
}
