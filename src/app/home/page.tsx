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
import { buildProgressInsights } from "@/lib/progress-insights";
import { CapabilityOrbit } from "@/components/livv/capability-orbit";

const ACTIONS = [
  { id: "body", label: "Body", color: "#F93827", href: "/home/train", help: "Train or move your body." },
  { id: "mind", label: "Mind", color: "#F61981", href: "/home/mind", help: "Read, reflect, or clear your head." },
  { id: "career", label: "Career", color: "#FF9D23", href: "/home/evala", help: "Move important work forward." },
  { id: "finance", label: "Finance", color: "#9A00FF", href: "/home/evala", help: "Make one useful money move." },
  { id: "social", label: "Social", color: "#4DFF00", href: "/home/connect", help: "Talk to someone who matters." },
  { id: "life", label: "Life", color: "#FCF927", href: "/home/daily", help: "Handle something that improves your life." },
] as const;

type Action = (typeof ACTIONS)[number];

function ActionRow({ action, complete, onOpen }: { action: Action; complete: boolean; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="group flex w-full items-center gap-4 border-b border-white/[.08] py-4 text-left last:border-b-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[.025]" style={{ borderColor: complete ? `${action.color}65` : undefined }}>
        <span className="h-2 w-2 rounded-full" style={{ background: action.color, boxShadow: complete ? `0 0 12px ${action.color}80` : "none" }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-white/90">{action.label}</span>
          {complete && <span className="text-[9px] font-semibold uppercase tracking-[.16em]" style={{ color: action.color }}>logged</span>}
        </span>
        <span className="mt-1 block text-[11px] text-white/45">{complete ? "Proof added today." : action.help}</span>
      </span>
      <span className="text-[18px] text-white/25 transition group-hover:translate-x-1 group-hover:text-white/60">→</span>
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
    for (const e of ["livv-identity", "livv-record", "livv-daily", "livv-billing"]) window.addEventListener(e, pull);
    return () => { window.clearInterval(timer); for (const e of ["livv-identity", "livv-record", "livv-daily", "livv-billing"]) window.removeEventListener(e, pull); };
  }, []);

  const status = useMemo(() => (rec ? dailyPillarStatus(rec) : []), [rec]);
  const loop = useMemo(() => (rec ? buildBehaviorLoop(rec, now) : null), [rec, now]);
  const insights = useMemo(() => (rec ? buildProgressInsights(rec, 14) : null), [rec]);
  if (!rec || !me || !loop || !insights) return <main className="min-h-dvh" />;

  const tier = getTier(getEffectiveTier());
  const checkedIn = isCheckedInToday(rec);
  const statusFor = (id: string) => id === "life" ? checkedIn : Boolean(status.find((item) => item.id === id)?.done);
  const done = ACTIONS.filter((a) => statusFor(a.id)).length;
  const evo = evolutionTitle(rec.level);
  const xpPct = Math.min(100, Math.round((rec.currentXp / rec.xpToNext) * 100));
  const orbitItems = ACTIONS.map((action) => ({ ...action, complete: statusFor(action.id) }));

  const onCheckIn = () => {
    if (checkedIn) return;
    const result = checkInRecord(); if (result.already) return;
    feedback("checkin"); addEmbers(10 * tier.multiplier + (result.emberBonus || 0));
    if (canClaimPacks(getEffectiveTier())) claimPacksIfDue(getEffectiveTier());
    pull();
  };
  const openAction = (href: string) => { feedback("tick"); router.push(href); };

  return (
    <main className="livv-page min-h-full overflow-hidden pb-16 text-white">
      <div className="mx-auto max-w-xl px-5 pt-5">
        <header className="relative pb-6 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0F7FFF] shadow-[0_0_12px_#0F7FFF70]" />
              <span className="text-[10px] font-semibold uppercase tracking-[.3em] text-[#0F7FFF]">Today</span>
            </div>
            <span className="text-[10px] uppercase tracking-[.2em] text-white/35">{now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>
          <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-5">
            <h1 className="font-display text-[clamp(2.35rem,10vw,3.6rem)] font-semibold leading-[.88] tracking-[-.07em]">{daily?.world.line || `Welcome back, ${me.displayName || "member"}.`}</h1>
            <div className="text-right"><p className="font-display text-[32px] leading-none">{rec.streak}</p><p className="mt-1 text-[9px] uppercase tracking-[.2em] text-white/40">day streak</p></div>
          </div>
          <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-[#0F7FFF]/60 via-white/10 to-transparent" />
        </header>

        {quote && <blockquote className="relative mt-5 border-l-2 border-[#0F7FFF]/55 pl-5 py-1"><p className="font-display text-[17px] leading-snug text-white/80">“{quote.text}”</p><footer className="mt-3 text-[9px] uppercase tracking-[.22em] text-white/38">{quote.author}</footer></blockquote>}

        <CapabilityOrbit items={orbitItems} onSelect={(item) => openAction(item.href)} />

        <section className="mt-7">
          <div className="flex items-end justify-between px-1 pb-2"><div><p className="text-[9px] font-semibold uppercase tracking-[.3em] text-white/38">Today</p><h2 className="font-display mt-1 text-[25px]">Six useful moves.</h2></div><span className="text-[10px] text-white/40">{done}/6 logged</span></div>
          <div className="border-y border-white/[.08]">{ACTIONS.map((a) => <ActionRow key={a.id} action={a} complete={statusFor(a.id)} onOpen={() => openAction(a.href)} />)}</div>
        </section>

        <section className="mt-7 overflow-hidden rounded-[22px] border border-white/10 bg-white/[.025] p-5">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[.3em] text-[#0F7FFF]">Next move</p><h2 className="font-display mt-2 text-[24px] leading-none">{loop.move.title}</h2><p className="mt-2 max-w-[32ch] text-[11px] leading-relaxed text-white/50">{loop.move.reason}</p></div><Link href={loop.move.href} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-[18px] text-black">→</Link></div>
          <div className="mt-5 flex items-center justify-between border-t border-white/[.08] pt-4"><span className="text-[10px] uppercase tracking-[.18em] text-white/35">System status</span><span className="text-[11px] text-white/65">{loop.status}</span></div>
        </section>

        <section className="mt-7 grid grid-cols-[1fr_104px] gap-3">
          <Link href="/home/progress" className="rounded-[22px] border border-white/10 bg-white/[.025] p-5"><div className="flex items-end justify-between"><div><p className="text-[9px] uppercase tracking-[.25em] text-white/38">Evolution</p><p className="font-display mt-2 text-[31px] leading-none">Level {rec.level}</p></div><span className="text-[10px] text-white/40">{rec.currentXp}/{rec.xpToNext}</span></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#0F7FFF]" style={{ width: `${xpPct}%` }} /></div><p className="mt-3 text-[10px] text-white/45">{evo.name} · {insights.momentum} momentum</p></Link>
          <button type="button" onClick={onCheckIn} disabled={checkedIn} className="flex flex-col justify-between rounded-[22px] border border-[#0F7FFF]/30 bg-[#0F7FFF]/[.07] p-4 text-left disabled:opacity-70"><span className="text-[9px] uppercase tracking-[.2em] text-[#0F7FFF]">Check in</span><span className="font-display text-[30px]">{checkedIn ? "✓" : "GO"}</span><span className="text-[9px] uppercase tracking-[.16em] text-white/38">{checkedIn ? "logged" : "close today"}</span></button>
        </section>
      </div>
    </main>
  );
}
