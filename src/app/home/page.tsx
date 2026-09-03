"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Avatar } from "@/components/identity/avatar";
import { AmbientField } from "@/components/layout/ambient-field";
import { addEmbers, loadIdentity, type Identity } from "@/lib/identity";
import { getTier } from "@/lib/membership";
import {
  checkInRecord,
  isCheckedInToday,
  loadRecord,
  missedYesterday,
  useStreakFreeze,
  weekHitCount,
  type LivvRecord,
} from "@/lib/record";
import {
  actionsCompletedCount,
  contextGreeting,
  focusCard,
  nextMove,
} from "@/lib/command";
import { evolutionTitle } from "@/lib/levels";
import { EMBERS_BLURB } from "@/lib/embers";
import { feedback } from "@/lib/sensory";

const LOGO =
  "https://raw.githubusercontent.com/evolvewithlivv/livv/main/Photoroom_20260831_123254.png";

export default function HomePage() {
  const [now, setNow] = useState(() => new Date());
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [me, setMe] = useState<Identity | null>(null);
  const [pop, setPop] = useState(false);
  const [bonusLine, setBonusLine] = useState<string | null>(null);

  const pull = () => {
    setRec(loadRecord());
    setMe(loadIdentity());
  };

  useEffect(() => {
    pull();
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    window.addEventListener("livv-identity", pull);
    window.addEventListener("livv-record", pull);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("livv-identity", pull);
      window.removeEventListener("livv-record", pull);
    };
  }, []);

  if (!rec || !me) {
    return <main className="min-h-[50dvh] bg-livv-black" />;
  }

  const tier = getTier(me.tier);
  const greet = contextGreeting(now, rec);
  const focus = focusCard(now);
  const move = nextMove(rec);
  const { done, total, pillars } = actionsCompletedCount(rec);
  const checkedIn = isCheckedInToday(rec);
  const evo = evolutionTitle(rec.level);
  const quiet = missedYesterday(rec);
  const weekHits = weekHitCount(rec);

  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const onCheckIn = () => {
    const { record, already, emberBonus } = checkInRecord();
    setRec(record);
    if (!already) {
      feedback("checkin");
      setPop(true);
      window.setTimeout(() => setPop(false), 700);
      const base = 10 * tier.multiplier;
      addEmbers(base + (emberBonus || 0));
      setMe(loadIdentity());
      if (emberBonus) setBonusLine(`+${emberBonus} extra Embers. Momentum noticed.`);
      else setBonusLine(`+${base} Embers. You showed up.`);
    }
  };

  return (
    <main className="relative overflow-hidden pt-6 pb-8">
      <AmbientField intensity="strong" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80">
        <div className="livv-atmosphere absolute inset-0 bg-livv-gradient" />
        <div className="livv-grain" />
      </div>

      <Container className="relative">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain drop-shadow-[0_0_12px_rgb(var(--livv-accent)/0.35)]"
            />
            <span className="font-display text-[15px] font-semibold tracking-tight">LIVV</span>
          </div>
          <Link href="/home/profile" className="flex items-center gap-2">
            <Avatar identity={me} size={36} />
          </Link>
        </header>

        <p className="text-[12px] font-medium text-white/40">{dateLabel}</p>
        <h1 className="font-display mt-2 text-[34px] font-semibold leading-[1.05] tracking-tight">
          {greet.salutation}.
        </h1>
        <p className="mt-3 max-w-[28ch] text-[17px] font-medium leading-snug text-white/75">
          {greet.line}
        </p>

        {quiet && (
          <div className="mt-5 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[13px] text-white/55">
              Yesterday was quiet. That is data, not failure.
            </p>
            <p className="mt-1 text-[12px] text-white/35">Start again today.</p>
          </div>
        )}

        <section className="mt-7 grid grid-cols-[1fr_auto] gap-3">
          <div className="livv-card-glow rounded-[22px] border border-livv-border bg-livv-surface/85 px-5 py-4 backdrop-blur-md">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
              Today&apos;s focus
            </p>
            <p className="font-display mt-2 text-[26px] font-semibold leading-none tracking-tight">
              {focus.theme}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{focus.principle}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-white/35">{focus.detail}</p>
          </div>

          <div className="livv-card-glow-strong relative flex min-w-[104px] flex-col items-center justify-center overflow-hidden rounded-[22px] border border-livv-accent/25 bg-livv-surface/90 px-4 py-4">
            {pop && (
              <span className="livv-pulse-ring absolute inset-0 rounded-[22px] border border-livv-accent/50" />
            )}
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">Streak</p>
            <p
              className={`font-display mt-2 text-[40px] font-semibold leading-none tracking-tight text-livv-accent ${
                pop ? "livv-check-pop" : ""
              }`}
            >
              {rec.streak}
            </p>
            <p className="mt-1 text-[11px] text-white/40">days</p>
          </div>
        </section>

        <section className="livv-card-glow-strong mt-3 rounded-[22px] border border-livv-accent/30 bg-livv-accent/[0.09] px-5 py-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-livv-accent-soft">
            Your move
          </p>
          <p className="mt-2 text-[18px] font-semibold tracking-tight">{move.title}</p>
          <p className="mt-1 text-sm text-white/45">{move.reason}</p>
          {move.href === "/home" ? (
            <button
              type="button"
              onClick={onCheckIn}
              disabled={checkedIn}
              className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-livv-accent px-5 text-[14px] font-semibold text-white shadow-[0_0_28px_rgb(var(--livv-accent)/0.35)]"
            >
              {checkedIn ? "Already logged" : move.cta}
            </button>
          ) : (
            <Link
              href={move.href}
              onClick={() => feedback("tick")}
              className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-livv-accent px-5 text-[14px] font-semibold text-white shadow-[0_0_28px_rgb(var(--livv-accent)/0.35)]"
            >
              {move.cta}
            </Link>
          )}
        </section>

        <section className="livv-card-glow mt-3 rounded-[22px] border border-livv-border bg-livv-surface/90 px-5 py-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">Today</p>
              <p className="mt-1 text-[22px] font-semibold tracking-tight">
                {done} / {total}
              </p>
            </div>
            <p className="text-[12px] text-white/35">actions with signal</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-livv-accent transition-all duration-700"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {pillars.map((p) => (
              <span
                key={p.id}
                className={`rounded-full border px-2.5 py-1 text-[11px] ${
                  p.done
                    ? "border-livv-accent/40 bg-livv-accent/15 text-livv-accent-soft"
                    : "border-livv-border text-white/35"
                }`}
              >
                {p.name} {p.done ? "✓" : "○"}
              </span>
            ))}
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] ${
                checkedIn
                  ? "border-livv-accent/40 bg-livv-accent/15 text-livv-accent-soft"
                  : "border-livv-border text-white/35"
              }`}
            >
              Check-in {checkedIn ? "✓" : "○"}
            </span>
          </div>
          <p className="mt-3 text-[11px] text-white/30">
            Not every pillar every day. Consistency across the week is the point.
          </p>
        </section>

        {!checkedIn && (
          <button
            type="button"
            onClick={onCheckIn}
            className="livv-card-glow mt-3 flex h-[72px] w-full items-center justify-between rounded-[22px] border border-livv-border bg-livv-surface/90 px-5 text-left"
          >
            <span>
              <span className="block text-[15px] font-semibold">I showed up today</span>
              <span className="mt-0.5 block text-[13px] text-white/40">
                Check in. Embers track momentum, not points for games.
              </span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-livv-border text-white/40" />
          </button>
        )}

        {checkedIn && (
          <div className="mt-3 rounded-[22px] border border-livv-border bg-livv-surface/80 px-5 py-4">
            <p className="text-[15px] font-semibold">You showed up today</p>
            <p className="mt-1 text-[13px] text-white/40">{bonusLine || "On the record."}</p>
          </div>
        )}

        <section className="mt-3 grid grid-cols-2 gap-3">
          <Link
            href="/home/evolve"
            className="livv-card-glow rounded-[20px] border border-livv-border bg-livv-surface/80 px-4 py-4"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">Evolution</p>
            <p className="font-display mt-1 text-[22px] font-semibold">Lv {rec.level}</p>
            <p className="mt-0.5 text-[12px] text-livv-accent-soft">{evo.name}</p>
          </Link>
          <Link
            href="/home/progress"
            className="livv-card-glow rounded-[20px] border border-livv-border bg-livv-surface/80 px-4 py-4"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">This week</p>
            <p className="font-display mt-1 text-[22px] font-semibold">{weekHits}/7</p>
            <p className="mt-0.5 text-[12px] text-white/40">days with signal</p>
          </Link>
        </section>

        <p className="mt-6 text-[11px] leading-relaxed text-white/28">{EMBERS_BLURB}</p>

        {rec.streak === 0 && (rec.streakFreezes ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => {
              const next = useStreakFreeze();
              if (next) {
                feedback("unlock");
                setRec(next);
              }
            }}
            className="mt-3 w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-[13px] text-white/45"
          >
            Life happens. Use a streak freeze ({rec.streakFreezes} left this week).
          </button>
        )}
      </Container>
    </main>
  );
}
