"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { checkInToday, getDailyCard, readStreak } from "@/lib/daily";

const LOGO =
  "https://raw.githubusercontent.com/evolvewithlivv/livv/main/Photoroom_20260831_123254.png";

function greeting(hour: number) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Wind down";
}

export default function HomePage() {
  const [now, setNow] = useState(() => new Date());
  const [streak, setStreak] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 30_000);
    const saved = readStreak();
    setStreak(saved.streak);
    setCheckedIn(saved.checkedInToday);
    setReady(true);
    return () => window.clearInterval(id);
  }, []);

  const card = useMemo(() => getDailyCard(now), [now]);

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
          <Link
            href="/home/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-livv-border bg-livv-surface text-xs font-medium text-white/75"
          >
            You
          </Link>
        </header>

        <p className="text-[12px] font-medium text-white/40">
          {dateLabel} · {timeLabel}
        </p>
        <h1 className="mt-2 text-[34px] font-semibold leading-[1.08] tracking-tight">
          {greeting(now.getHours())}.
        </h1>
        <p className="mt-3 max-w-[20ch] text-[22px] font-medium leading-snug tracking-tight text-white/88">
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
          className="mt-3 flex h-[72px] w-full items-center justify-between rounded-[22px] border border-livv-border bg-livv-surface px-5 text-left disabled:opacity-100"
        >
          <span>
            <span className="block text-[15px] font-semibold tracking-tight">
              {checkedIn ? "You showed up today" : "I showed up today"}
            </span>
            <span className="mt-0.5 block text-[13px] text-white/40">
              {checkedIn
                ? "Come back tomorrow. The page will be different."
                : "Tap this so the streak counts."}
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

        <p className="mt-8 text-center text-[12px] leading-relaxed text-white/28">
          This screen changes every day. The rooms stay in the bar below.
        </p>
      </Container>
    </main>
  );
}
