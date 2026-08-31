"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Avatar } from "@/components/identity/avatar";
import { addEmbers, loadIdentity, type Identity } from "@/lib/identity";
import { getTier } from "@/lib/membership";
import { checkInToday, getDailyCard, readStreak } from "@/lib/daily";

const LOGO =
  "https://raw.githubusercontent.com/evolvewithlivv/livv/main/Photoroom_20260831_123254.png";

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
  const [checkedIn, setCheckedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<Identity | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 30_000);
    const saved = readStreak();
    setStreak(saved.streak);
    setCheckedIn(saved.checkedInToday);
    const sync = () => setMe(loadIdentity());
    sync();
    window.addEventListener("livv-identity", sync);
    setReady(true);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("livv-identity", sync);
    };
  }, []);

  const card = useMemo(() => getDailyCard(now), [now]);
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
    const next = checkInToday();
    setStreak(next.streak);
    if (!checkedIn) {
      addEmbers(10 * tier.multiplier);
      setMe(loadIdentity());
    }
    setCheckedIn(true);
  };

  return (
    <main className="relative overflow-hidden pt-6 pb-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-livv-gradient"
      />

      <Container className="relative">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="text-[15px] font-semibold tracking-tight">LIVV</span>
          </div>
          <Link href="/home/profile" className="flex items-center gap-2">
            {me && <Avatar identity={me} size={36} />}
          </Link>
        </header>

        <p className="text-[12px] font-medium text-white/40">
          {dateLabel} · {timeLabel}
        </p>
        <h1 className="mt-2 text-[34px] font-semibold leading-[1.08] tracking-tight">
          {greeting(now.getHours(), me?.displayName || "there")}.
        </h1>
        <p className="mt-3 max-w-[22ch] text-[22px] font-medium leading-snug tracking-tight text-white/88">
          {card.line}
        </p>

        <section className="mt-8 grid grid-cols-[1fr_auto] gap-3">
          <div className="rounded-[22px] border border-livv-border bg-livv-surface px-5 py-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
              Today
            </p>
            <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight">
              {card.theme}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/45">{card.note}</p>
          </div>

          <div className="flex min-w-[104px] flex-col items-center justify-center rounded-[22px] border border-livv-border bg-livv-surface px-4 py-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
              Streak
            </p>
            <p className="mt-2 text-[40px] font-semibold leading-none tracking-tight text-livv-accent">
              {ready ? streak : "—"}
            </p>
            <p className="mt-1 text-[11px] text-white/40">days</p>
          </div>
        </section>

        <section className="mt-3 rounded-[22px] border border-livv-accent/25 bg-livv-accent/[0.07] px-5 py-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-livv-accent-soft">
            Your move
          </p>
          <p className="mt-2 text-[17px] font-medium leading-snug tracking-tight">
            {card.mission}
          </p>
          <Link
            href={card.missionHref}
            className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-livv-accent px-5 text-[14px] font-semibold text-white"
          >
            {card.missionCta}
          </Link>
        </section>

        <button
          type="button"
          onClick={onCheckIn}
          disabled={checkedIn}
          className="mt-3 flex h-[72px] w-full items-center justify-between rounded-[22px] border border-livv-border bg-livv-surface px-5 text-left"
        >
          <span>
            <span className="block text-[15px] font-semibold tracking-tight">
              {checkedIn ? "You showed up today" : "I showed up today"}
            </span>
            <span className="mt-0.5 block text-[13px] text-white/40">
              {checkedIn
                ? `+${10 * tier.multiplier} Embers banked.`
                : `Check in. ${tier.multiplier}x Embers on ${tier.name}.`}
            </span>
          </span>
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${
              checkedIn
                ? "bg-livv-accent text-white"
                : "border border-livv-border text-white/40"
            }`}
          >
            {checkedIn ? "✓" : ""}
          </span>
        </button>

        {me && me.tier === "spark" && (
          <Link
            href="/home/profile#membership"
            className="mt-3 block rounded-[22px] border border-white/[0.06] bg-white/[0.03] px-5 py-4"
          >
            <p className="text-[13px] text-white/55">
              Rise banks Embers at 2x. Same check-in. Twice the later gear.
            </p>
          </Link>
        )}
      </Container>
    </main>
  );
}
