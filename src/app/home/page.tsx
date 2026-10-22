"use client";

import { useEffect, useState } from "react";
import { LivvMark } from "@/components/brand/livv-mark";
import { ArrowUpRight, HeartPulse, Dumbbell, Sprout, Brain } from "lucide-react";
import Link from "next/link";
import { loadIdentity, addEmbers, emberBalanceIsFresh, type Identity } from "@/lib/identity";
import { checkInRecord, isCheckedInToday, loadRecord, type LivvRecord } from "@/lib/record";
import { feedback } from "@/lib/sensory";
import { dailySummary, dailyQuestion } from "@/lib/daily";
import { quoteForSession, type Quote } from "@/lib/quotes";
import { nextMove, type Move } from "@/lib/command";
import { consumeFirstSessionPending } from "@/lib/onboarding";
import { CountUp } from "@/components/motion/count-up";
import { SkeletonScreen } from "@/components/motion/skeleton";
import "./home-signal.css";

function greetingForHour(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Wind down";
}

function displayName(me: Identity): string {
  const raw = (me.displayName || "").trim();
  if (raw) return raw;
  const user = (me.username || "").trim();
  if (user) return user.startsWith("@") ? user.slice(1) : user;
  return "there";
}

function presenceLine(checkedIn: boolean, streak: number, firstSession: boolean): string {
  if (checkedIn) {
    if (streak > 1) return `${streak} days present.`;
    return "You showed up today.";
  }
  if (firstSession) return "Start here. Mark today, then open Daily.";
  if (streak > 0) return `${streak}-day streak. Mark today.`;
  return "Mark the day.";
}

export default function HomePage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [me, setMe] = useState<Identity | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [move, setMove] = useState<Move | null>(null);
  const [question, setQuestion] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [firstSession, setFirstSession] = useState(false);
  const [emberNote, setEmberNote] = useState("");

  const pull = () => {
    const r = loadRecord();
    setRec(r);
    setMe((prev) => {
      const next = loadIdentity();
      if (prev && emberBalanceIsFresh() && prev.embers > (next.embers || 0)) {
        return { ...next, embers: prev.embers };
      }
      return next;
    });
    setMove(nextMove(r));
    setQuestion(dailyQuestion(new Date()));
    dailySummary();
  };

  useEffect(() => {
    pull();
    setQuote(quoteForSession());
    if (consumeFirstSessionPending()) setFirstSession(true);
    const events = ["livv-identity", "livv-record", "livv-daily"];
    events.forEach((e) => window.addEventListener(e, pull));
    const onAward = (event: Event) => {
      const detail = (event as CustomEvent<{ ok?: boolean; error?: string; total?: number }>).detail;
      if (detail && detail.ok === false) {
        setEmberNote(detail.error || "Embers could not be awarded.");
        return;
      }
      setEmberNote("");
      if (typeof detail?.total === "number") {
        setMe((prev) => (prev ? { ...prev, embers: detail.total as number } : prev));
      }
    };
    window.addEventListener("livv-ember-award", onAward);
    const clock = window.setInterval(() => setNow(new Date()), 30_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, pull));
      window.removeEventListener("livv-ember-award", onAward);
      window.clearInterval(clock);
    };
  }, []);

  if (!rec || !me) {
    return <SkeletonScreen label="Loading home" />;
  }

  const checkedIn = isCheckedInToday(rec);
  const name = displayName(me);
  const hello = greetingForHour(now.getHours());
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(now);
  const streak = rec.streak || 0;
  const embers = me.embers || 0;
  const sessions = rec.workoutsCompleted || 0;

  const showCheckIn = !checkedIn;
  const actionableMove = move && move.href !== "/home" ? move : null;

  const checkIn = () => {
    if (checkedIn) return;
    const result = checkInRecord();
    if (result.already) return;
    feedback("checkin");
    addEmbers("checkin");
    const bonus =
      result.emberBonus && [4, 6, 8, 10, 12, 15].includes(result.emberBonus)
        ? result.emberBonus
        : 0;
    if (bonus) addEmbers(bonus, `ember-checkin-bonus-${Date.now()}`);
    pull();
  };

  return (
    <main className={"ho" + (checkedIn ? " is-present" : "")} aria-label="Home">
      <div className="ho-shell">
        <header className="ho-top">
          <p className="ho-date">{dateLabel}</p>
          <Link href="/home/profile" className="ho-identity" aria-label="Open profile">
            {me.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.photo} alt="" className="ho-avatar" width={28} height={28} />
            ) : (
              <span className="ho-avatar-fallback" aria-hidden>
                {(name[0] || "L").toUpperCase()}
              </span>
            )}
            <span className={"ho-status" + (checkedIn ? " on" : "")}>
              {checkedIn ? "Present" : "Away"}
            </span>
          </Link>
        </header>

        <section className="ho-today">
          <p className="ho-hello">{hello}</p>
          <h1 className="ho-name">{name}</h1>
          <p className="ho-presence">{presenceLine(checkedIn, streak, firstSession)}</p>

          {showCheckIn ? (
            <button type="button" className="ho-primary" onClick={checkIn}>
              Check in
            </button>
          ) : actionableMove ? (
            <Link href={actionableMove.href} className="ho-primary">
              {actionableMove.cta || actionableMove.title || "Continue"}
            </Link>
          ) : (
            <p className="ho-done">Today is logged.</p>
          )}
          {emberNote ? (
            <p className="ho-context" role="status">
              {emberNote}
            </p>
          ) : null}
          {!showCheckIn && actionableMove ? (
            <p className="ho-context">{actionableMove.reason}</p>
          ) : null}
        </section>

        <div className="ho-aside">
          {move && showCheckIn ? (
            <section className="ho-block">
              <p className="ho-k">Next</p>
              <Link href={move.href} className="ho-row">
                <div className="ho-row-main">
                  <p className="ho-row-t">{move.title}</p>
                  <p className="ho-row-s">{move.reason}</p>
                </div>
                <span className="ho-row-cta">{move.cta}</span>
              </Link>
            </section>
          ) : null}

          {question ? (
            <section className="ho-block">
              <p className="ho-k">Reflect</p>
              <Link href="/home/daily" className="ho-row">
                <div className="ho-row-main">
                  <p className="ho-row-t ho-row-t-soft">{question}</p>
                </div>
                <span className="ho-row-cta">Daily</span>
              </Link>
            </section>
          ) : null}
        </div>

        <section className="ho-systems" aria-label="LIVV systems">
          <div className="ho-systems-head"><div><p className="ho-k">LIVV SYSTEM</p><h2>Your world, in motion.</h2></div></div>
          <div className="ho-system-grid">
            <Link href="/home/daily" prefetch={false} className="ho-system ho-system-daily"><span><Brain size={16}/></span><strong>Daily</strong><small>Mind · life · action</small><ArrowUpRight size={15}/></Link>
            <Link href="/home/train" prefetch={false} className="ho-system ho-system-train"><span><Dumbbell size={16}/></span><strong>Train</strong><small>Build · execute · record</small><ArrowUpRight size={15}/></Link>
            <Link href="/home/health" prefetch={false} className="ho-system ho-system-health"><span><HeartPulse size={16}/></span><strong>Health</strong><small>Sleep · food · movement</small><ArrowUpRight size={15}/></Link>
            <Link href="/home/field" prefetch={false} className="ho-system ho-system-field"><span><Sprout size={16}/></span><strong>Field</strong><small>Grow · keep · preserve</small><ArrowUpRight size={15}/></Link>
          </div>
        </section>

        <p className="ho-signal" aria-label="Signal">
          <span><CountUp value={streak} suffix="d" /> present</span>
          <span className="ho-dot" aria-hidden />
          <span><CountUp value={embers} /> embers</span>
          <span className="ho-dot" aria-hidden />
          <span>
            {sessions} session{sessions === 1 ? "" : "s"}
          </span>
        </p>

        {quote ? (
          <footer className="ho-quote">
            <p className="ho-q">“{quote.text}”</p>
            <p className="ho-qa">{quote.author}</p>
          </footer>
        ) : null}
        <div className="ho-pillars">
          <LivvMark kind="wordmark" alt="LIVV" />
        </div>
      </div>
    </main>
  );
}
