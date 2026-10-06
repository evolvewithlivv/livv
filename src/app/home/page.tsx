"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadIdentity, addEmbers, type Identity } from "@/lib/identity";
import { checkInRecord, isCheckedInToday, loadRecord, type LivvRecord } from "@/lib/record";
import { feedback } from "@/lib/sensory";
import { dailySummary } from "@/lib/daily";
import { quoteForSession, type Quote } from "@/lib/quotes";
import { embersFromAction } from "@/lib/embers";
import { nextMove, focusCard, type Move } from "@/lib/command";
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
  if (raw) return raw.split(/\s+/)[0];
  const user = (me.username || "").trim();
  if (user) return user.startsWith("@") ? user.slice(1) : user;
  return "there";
}

export default function HomePage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [me, setMe] = useState<Identity | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [move, setMove] = useState<Move | null>(null);
  const [focus, setFocus] = useState<{ theme: string; principle: string; detail: string } | null>(null);
  const [now, setNow] = useState(() => new Date());

  const pull = () => {
    const r = loadRecord();
    setRec(r);
    setMe(loadIdentity());
    setMove(nextMove(r));
    setFocus(focusCard(new Date()));
    dailySummary();
  };

  useEffect(() => {
    pull();
    setQuote(quoteForSession());
    const events = ["livv-identity", "livv-record", "livv-daily"];
    events.forEach((e) => window.addEventListener(e, pull));
    const clock = window.setInterval(() => setNow(new Date()), 30_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, pull));
      window.clearInterval(clock);
    };
  }, []);

  if (!rec || !me) {
    return <main className="hs min-h-[70dvh]" aria-hidden />;
  }

  const checkedIn = isCheckedInToday(rec);
  const name = displayName(me);
  const hello = greetingForHour(now.getHours());
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(now);
  const streak = rec.streak || 0;
  const embers = me.embers || 0;
  const sessions = rec.workoutsCompleted || 0;

  const checkIn = () => {
    if (checkedIn) return;
    const result = checkInRecord();
    if (result.already) return;
    feedback("checkin");
    addEmbers(embersFromAction("checkin"));
    const bonus =
      result.emberBonus && [4, 6, 8, 10, 12, 15].includes(result.emberBonus)
        ? result.emberBonus
        : 0;
    if (bonus) addEmbers(bonus, `ember-checkin-bonus-${Date.now()}`);
    pull();
  };

  return (
    <main
      className={"hs" + (checkedIn ? " is-present" : "")}
      aria-label="LIVV Home"
    >
      <div className="hs-void" aria-hidden />
      <div className="hs-grid" aria-hidden />

      <div className="hs-inner">
        <header className="hs-top">
          <div className="hs-top-left">
            <p className="hs-date">{dateLabel}</p>
            <p className="hs-time">{timeLabel}</p>
          </div>
          <p className={"hs-status" + (checkedIn ? " on" : "")}>
            {checkedIn ? "PRESENT" : "AWAITING"}
          </p>
        </header>

        <section className="hs-hero">
          <div className="hs-signal" aria-hidden>
            <div className="hs-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/livv-logo.png"
                alt="LIVV"
                width={160}
                height={160}
              />
            </div>
          </div>

          <p className="hs-hello">{hello}</p>
          <h1 className="hs-name">{name}.</h1>
          <p className="hs-sub">
            {checkedIn
              ? streak > 1
                ? `${streak} days present. Keep the line clean.`
                : "You showed up today."
              : "One check-in. Mark the day."}
          </p>
        </section>

        <section className="hs-readouts" aria-label="Presence">
          <div className="hs-read">
            <p className="hs-read-v">{streak}</p>
            <p className="hs-read-l">Streak</p>
          </div>
          <div className="hs-read-div" aria-hidden />
          <div className="hs-read">
            <p className="hs-read-v">{embers.toLocaleString()}</p>
            <p className="hs-read-l">Embers</p>
          </div>
          <div className="hs-read-div" aria-hidden />
          <div className="hs-read">
            <p className="hs-read-v">{sessions}</p>
            <p className="hs-read-l">Sessions</p>
          </div>
        </section>

        <section className="hs-actions">
          <button
            type="button"
            className={"hs-primary" + (checkedIn ? " done" : "")}
            onClick={checkIn}
            disabled={checkedIn}
          >
            <span>{checkedIn ? "Checked in" : "Check in"}</span>
            <span className="hs-primary-meta" aria-hidden>
              {checkedIn ? "✓" : "→"}
            </span>
          </button>
        </section>

        {move ? (
          <section className="hs-panel" aria-label="Next move">
            <p className="hs-panel-kicker">Next move</p>
            <p className="hs-panel-title">{move.title}</p>
            <p className="hs-panel-body">{move.reason}</p>
            <Link href={move.href} className="hs-panel-cta">
              <span>{move.cta}</span>
              <span aria-hidden>→</span>
            </Link>
          </section>
        ) : null}

        {focus ? (
          <section className="hs-panel hs-panel-soft" aria-label="Today focus">
            <p className="hs-panel-kicker">Today</p>
            <p className="hs-panel-title">{focus.theme}</p>
            <p className="hs-panel-body">{focus.principle}</p>
            {focus.detail ? (
              <p className="hs-panel-detail">{focus.detail}</p>
            ) : null}
          </section>
        ) : null}

        {quote ? (
          <footer className="hs-quote">
            <p className="hs-quote-text">“{quote.text}”</p>
            <p className="hs-quote-author">— {quote.author}</p>
          </footer>
        ) : null}
      </div>
    </main>
  );
}
