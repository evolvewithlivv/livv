"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addEmbers, loadIdentity, type Identity } from "@/lib/identity";
import { getTier } from "@/lib/membership";
import { getEffectiveTier } from "@/lib/billing";
import { checkInRecord, isCheckedInToday, loadRecord, type LivvRecord } from "@/lib/record";
import { dailyPillarStatus } from "@/lib/command";
import { buildBehaviorLoop } from "@/lib/behavior-loop";
import { evolutionTitle } from "@/lib/levels";
import { feedback } from "@/lib/sensory";
import { canClaimPacks, claimPacksIfDue } from "@/lib/packs";
import { quoteForSession, type Quote } from "@/lib/quotes";
import { dailySummary } from "@/lib/daily";

const ACTIONS = [
  { id: "body", label: "Body", color: "#F93827", href: "/home/train", help: "Train or move your body." },
  { id: "mind", label: "Mind", color: "#F61981", href: "/home/mind", help: "Read, reflect, or clear your head." },
  { id: "career", label: "Career", color: "#FF9D23", href: "/home/evala", help: "Move important work forward." },
  { id: "finance", label: "Finance", color: "#9A00FF", href: "/home/evala", help: "Make one useful money move." },
  { id: "social", label: "Social", color: "#4DFF00", href: "/home/connect", help: "Talk to someone who matters." },
  { id: "life", label: "Life", color: "#FCF927", href: "/home/daily", help: "Handle something that improves your life." },
] as const;

type Action = (typeof ACTIONS)[number];

function ActionCard({ action, complete, onOpen }: { action: Action; complete: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="livv-action-card relative min-h-[126px] overflow-hidden rounded-[24px] border p-4 text-left transition hover:border-white/20 active:scale-[0.98]"
      style={{
        borderColor: complete ? `${action.color}55` : "rgba(255,255,255,.10)",
        background: complete
          ? `linear-gradient(145deg, ${action.color}0A, rgba(11,13,16,.94))`
          : "linear-gradient(145deg, rgba(17,19,24,.92), rgba(8,10,13,.96))",
      }}
    >
      <span
        className="absolute right-4 top-4 h-2 w-2 rounded-full"
        style={{ background: action.color }}
      />
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: action.color }}>
        {action.label}
      </p>
      <p className="mt-6 text-[16px] font-semibold text-white/90">{complete ? "Complete" : "Open"}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-white/55">{complete ? "Logged today." : action.help}</p>
      {complete && <span className="absolute bottom-3 right-4 text-[18px]" style={{ color: action.color }}>✓</span>}
    </button>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [now, setNow] = useState(() => new Date());
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [me, setMe] = useState<Identity | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [daily, setDaily] = useState(() => (typeof window !== "undefined" ? dailySummary() : null));

  const pull = () => { setRec(loadRecord()); setMe(loadIdentity()); setDaily(dailySummary()); };

  useEffect(() => {
    pull(); setQuote(quoteForSession());
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    for (const event of ["livv-identity", "livv-record", "livv-daily", "livv-billing"]) window.addEventListener(event, pull);
    return () => { window.clearInterval(timer); for (const event of ["livv-identity", "livv-record", "livv-daily", "livv-billing"]) window.removeEventListener(event, pull); };
  }, []);

  const status = useMemo(() => (rec ? dailyPillarStatus(rec) : []), [rec]);
  if (!rec || !me) return <main className="min-h-dvh" />;

  const tier = getTier(getEffectiveTier());
  const checkedIn = isCheckedInToday(rec);
  const statusFor = (id: string) => id === "life" ? checkedIn : Boolean(status.find((item) => item.id === id)?.done);
  const done = ACTIONS.filter((action) => statusFor(action.id)).length;
  const evo = evolutionTitle(rec.level);
  const xpPct = Math.min(100, Math.round((rec.currentXp / rec.xpToNext) * 100));
  const worldFocus = daily?.world.focus || "Focus: today";

  const onCheckIn = () => {
    if (checkedIn) return;
    const result = checkInRecord(); if (result.already) return;
    feedback("checkin"); addEmbers(10 * tier.multiplier + (result.emberBonus || 0));
    if (canClaimPacks(getEffectiveTier())) claimPacksIfDue(getEffectiveTier()); pull();
  };

  return (
    <main className="livv-page relative min-h-full overflow-hidden pb-16 text-white">
      <div className="relative z-10 mx-auto max-w-xl px-5 pt-5">
        <section className="livv-glass relative overflow-hidden rounded-[34px] px-6 pb-7 pt-6">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-livv-accent/60 to-transparent" />
          <div className="flex items-start justify-between gap-5"><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-livv-accent-soft">{worldFocus}</p><h1 className="font-display mt-3 text-[31px] font-semibold leading-[0.98] tracking-[-0.04em]">{daily?.world.line || `Welcome back, ${me.displayName || "member"}.`}</h1></div><div className="shrink-0 text-right"><p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Streak</p><p className="font-display mt-1 text-3xl font-semibold">{rec.streak}</p><p className="text-[10px] uppercase tracking-[0.18em] text-white/45">days</p></div></div>
          {quote && <blockquote className="relative mt-7 border-l-2 border-livv-accent/50 pl-4"><p className="font-display text-[17px] font-medium leading-snug text-white/90">“{quote.text}”</p><footer className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/45">{quote.author}</footer></blockquote>}
        </section>
        <section className="mt-6"><div className="mb-3 flex items-end justify-between px-1"><div><p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">Today</p><p className="mt-1 text-[14px] font-medium text-white/80">{done} of 6 actions complete</p></div><Link href="/home/daily" className="text-[11px] font-semibold text-livv-accent-soft">Open Daily</Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{ACTIONS.map((action) => <ActionCard key={action.id} action={action} complete={statusFor(action.id)} onOpen={() => { feedback("tick"); router.push(action.href); }} />)}</div></section>
        <section className="mt-6 grid grid-cols-[1fr_auto] gap-3"><div className="livv-glass rounded-[28px] p-5"><div className="flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[0.24em] text-white/50">Level</p><p className="font-display mt-1 text-4xl font-semibold">{rec.level}</p></div><p className="text-[10px] text-white/55">{rec.currentXp} / {rec.xpToNext} XP</p></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-livv-accent" style={{ width: `${xpPct}%` }} /></div><p className="mt-3 text-[11px] text-white/55">{evo.name}</p></div><button type="button" onClick={onCheckIn} disabled={checkedIn} className="flex min-w-[98px] flex-col justify-between rounded-[28px] border border-livv-accent/35 bg-livv-accent/[0.08] p-4 text-left disabled:opacity-70"><span className="text-[10px] uppercase tracking-[0.22em] text-livv-accent-soft">Check in</span><span className="font-display text-3xl font-semibold">{checkedIn ? "✓" : "GO"}</span><span className="text-[10px] text-white/55">{checkedIn ? "Logged" : "Close today"}</span></button></section>
      </div>
    </main>
  );
}
