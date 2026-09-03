"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Avatar } from "@/components/identity/avatar";
import { AmbientField } from "@/components/layout/ambient-field";
import { addEmbers, loadIdentity, type Identity } from "@/lib/identity";
import { getTier } from "@/lib/membership";
import { getDailyCard } from "@/lib/daily";
import {
  checkInRecord,
  isCheckedInToday,
  loadRecord,
  useStreakFreeze,
  weekHitCount,
} from "@/lib/record";
import { feedback } from "@/lib/sensory";
import { dayNumber } from "@/lib/daily";

const LOGO =
  "https://raw.githubusercontent.com/evolvewithlivv/livv/main/Photoroom_20260831_123254.png";

const SPARKS = [
  "Small reps compound into a different person.",
  "Nobody is grading today except you.",
  "Consistency is quieter than motivation.",
  "Show up ugly. Still counts.",
  "The version you want is built on boring days.",
  "Protect the chain. One action is enough.",
  "You already know what to do.",
];

function greeting(hour: number, name: string) {
  const first = name.split(" ")[0] || "there";
  if (hour < 5) return `Still up, ${first}`;
  if (hour < 12) return `Morning, ${first}`;
  if (hour < 17) return `Hey, ${first}`;
  if (hour < 21) return `Evening, ${first}`;
  return `Wind down, ${first}`;
}

export default function HomePage() {
  const [now, setNow] = useState(() => new Date());
  const [streak, setStreak] = useState(0);
  const [displayStreak, setDisplayStreak] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<Identity | null>(null);
  const [pop, setPop] = useState(false);
  const [weekHits, setWeekHits] = useState(0);
  const [freezes, setFreezes] = useState(0);
  const [bonusLine, setBonusLine] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 30_000);
    const pull = () => {
      const rec = loadRecord();
      setStreak(rec.streak);
      setDisplayStreak(rec.streak);
      setCheckedIn(isCheckedInToday(rec));
      setWeekHits(weekHitCount(rec));
      setFreezes(rec.streakFreezes ?? 1);
      setMe(loadIdentity());
    };
    pull();
    window.addEventListener("livv-identity", pull);
    window.addEventListener("livv-record", pull);
    setReady(true);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("livv-identity", pull);
      window.removeEventListener("livv-record", pull);
    };
  }, []);

  const card = useMemo(() => getDailyCard(now), [now]);
  const spark = useMemo(() => SPARKS[dayNumber(now) % SPARKS.length], [now]);
  const tier = me ? getTier(me.tier) : getTier("spark");

  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const timeLabel = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const onCheckIn = () => {
    const { record, already, emberBonus } = checkInRecord();
    setStreak(record.streak);
    setWeekHits(weekHitCount(record));
    setFreezes(record.streakFreezes ?? 1);
    setCheckedIn(true);
    if (!already) {
      feedback("checkin");
      setPop(true);
      window.setTimeout(() => setPop(false), 700);
      const from = Math.max(0, record.streak - 1);
      setDisplayStreak(from);
      window.setTimeout(() => setDisplayStreak(record.streak), 80);
      const base = 10 * tier.multiplier;
      addEmbers(base + (emberBonus || 0));
      setMe(loadIdentity());
      if (emberBonus) setBonusLine(`+${emberBonus} surprise Embers for showing up`);
      else setBonusLine(null);
    }
  };

  const onFreeze = () => {
    const next = useStreakFreeze();
    if (!next) return;
    feedback("unlock");
    setStreak(next.streak);
    setDisplayStreak(next.streak);
    setFreezes(next.streakFreezes);
  };

  return (
    <main className="relative overflow-hidden pt-6 pb-8">
      <AmbientField intensity="strong" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80">
        <div className="livv-atmosphere absolute inset-0 bg-livv-gradient" />
        <div className="livv-grain" />
      </div>

      <Container className="relative">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="" width={32} height={32} className="h-8 w-8 object-contain drop-shadow-[0_0_12px_rgb(var(--livv-accent)/0.35)]" />
            <span className="font-display text-[15px] font-semibold tracking-tight">LIVV</span>
          </div>
          <Link href="/home/profile" className="flex items-center gap-2">
            {me && <Avatar identity={me} size={36} />}
          </Link>
        </header>

        <p className="text-[12px] font-medium text-white/40">
          {dateLabel} · {timeLabel}
        </p>
        <h1 className="font-display mt-2 text-[36px] font-semibold leading-[1.05] tracking-tight">
          {greeting(now.getHours(), me?.displayName || "there")}.
        </h1>
        <p className="mt-3 max-w-[22ch] text-[21px] font-medium leading-snug tracking-tight text-white/88">
          {card.line}
        </p>
        <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/40">{spark}</p>

        <section className="mt-8 grid grid-cols-[1fr_auto] gap-3">
          <div className="livv-card-glow rounded-[22px] border border-livv-border bg-livv-surface/85 px-5 py-4 backdrop-blur-md">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">Today</p>
            <p className="font-display mt-2 text-[28px] font-semibold leading-none tracking-tight">
              {card.theme}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/45">{card.note}</p>
          </div>

          <div className="livv-card-glow-strong relative flex min-w-[112px] flex-col items-center justify-center overflow-hidden rounded-[22px] border border-livv-accent/25 bg-livv-surface/90 px-4 py-4 backdrop-blur-md">
            {pop && (
              <span className="livv-pulse-ring absolute inset-0 rounded-[22px] border border-livv-accent/50" />
            )}
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">Streak</p>
            <p
              className={`font-display mt-2 text-[44px] font-semibold leading-none tracking-tight text-livv-accent ${
                pop ? "livv-check-pop" : ""
              }`}
            >
              {ready ? displayStreak : "—"}
            </p>
            <p className="mt-1 text-[11px] text-white/40">days</p>
          </div>
        </section>

        <section className="livv-card-glow-strong mt-3 rounded-[22px] border border-livv-accent/30 bg-livv-accent/[0.09] px-5 py-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-livv-accent-soft">
            Your move
          </p>
          <p className="mt-2 text-[17px] font-medium leading-snug tracking-tight">{card.mission}</p>
          <Link
            href={card.missionHref}
            onClick={() => feedback("tick")}
            className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-livv-accent px-5 text-[14px] font-semibold text-white shadow-[0_0_28px_rgb(var(--livv-accent)/0.35)] active:scale-[0.98]"
          >
            {card.missionCta}
          </Link>
        </section>

        <button
          type="button"
          onClick={onCheckIn}
          disabled={checkedIn}
          className="livv-card-glow mt-3 flex h-[76px] w-full items-center justify-between rounded-[22px] border border-livv-border bg-livv-surface/90 px-5 text-left backdrop-blur-md transition active:scale-[0.99]"
        >
          <span>
            <span className="block text-[15px] font-semibold tracking-tight">
              {checkedIn ? "You showed up today" : "I showed up today"}
            </span>
            <span className="mt-0.5 block text-[13px] text-white/40">
              {checkedIn
                ? bonusLine || `+${10 * tier.multiplier} Embers banked.`
                : `Check in. ${tier.multiplier}x Embers on ${tier.name}.`}
            </span>
          </span>
          <span
            className={`relative flex h-9 w-9 items-center justify-center rounded-full text-sm ${
              checkedIn
                ? "bg-livv-accent text-white shadow-[0_0_16px_rgb(var(--livv-accent)/0.5)]"
                : "border border-livv-border text-white/40"
            }`}
          >
            {checkedIn ? "✓" : ""}
          </span>
        </button>

        {streak === 0 && freezes > 0 && (
          <button
            type="button"
            onClick={onFreeze}
            className="mt-3 w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-[13px] text-white/50"
          >
            Life happens. Use a streak freeze ({freezes} left this week) — no shame, just keep the
            chain.
          </button>
        )}

        <Link
          href="/home/progress"
          className="livv-card-glow mt-3 block rounded-[22px] border border-livv-border bg-livv-surface/70 px-5 py-4"
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">This week</p>
          <p className="mt-1 text-[15px] font-medium">
            {weekHits}/7 days with signal
            <span className="text-white/40"> · open recap</span>
          </p>
        </Link>
      </Container>
    </main>
  );
}
