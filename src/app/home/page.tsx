"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadIdentity, addEmbers, resolvedAppearance, type Identity } from "@/lib/identity";
import { checkInRecord, isCheckedInToday, loadRecord, type LivvRecord } from "@/lib/record";
import { feedback } from "@/lib/sensory";
import { dailySummary, dailyQuestion } from "@/lib/daily";
import { quoteForSession, type Quote } from "@/lib/quotes";
import { embersFromAction } from "@/lib/embers";
import { nextMove, type Move } from "@/lib/command";
import { LIVV_ICON_BLACK } from "@/lib/header-logo-black";
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
  const [question, setQuestion] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [light, setLight] = useState(false);

  const readLight = () => {
    if (typeof document !== "undefined" && document.documentElement.dataset.theme) {
      return document.documentElement.dataset.theme === "light";
    }
    return resolvedAppearance(loadIdentity().appearance) === "light";
  };

  const pull = () => {
    const r = loadRecord();
    setRec(r);
    setMe(loadIdentity());
    setMove(nextMove(r));
    setQuestion(dailyQuestion(new Date()));
    setLight(readLight());
    dailySummary();
  };

  useEffect(() => {
    pull();
    setQuote(quoteForSession());
    setLight(readLight());
    const events = ["livv-identity", "livv-record", "livv-daily"];
    events.forEach((e) => window.addEventListener(e, pull));
    const clock = window.setInterval(() => setNow(new Date()), 30_000);
    const root = document.documentElement;
    const mo = new MutationObserver(() => setLight(readLight()));
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      events.forEach((e) => window.removeEventListener(e, pull));
      window.clearInterval(clock);
      mo.disconnect();
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

      <div className="hs-inner">
        <header className="hs-mast">
          <p className="hs-mast-date">{dateLabel}</p>
          <p className={"hs-mast-state" + (checkedIn ? " on" : "")}>
            {checkedIn ? "Present" : "Not checked in"}
          </p>
        </header>

        <section className="hs-identity">
          <div className="hs-mark-wrap" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={light ? LIVV_ICON_BLACK : "/livv-logo.png"}
              alt=""
              width={72}
              height={72}
              className="hs-logo"
            />
          </div>
          <p className="hs-hello">{hello}</p>
          <h1 className="hs-name">{name}</h1>
          <p className="hs-line">
            {checkedIn
              ? streak > 1
                ? `${streak} days present.`
                : "You showed up today."
              : "Mark the day."}
          </p>
        </section>

        <div className="hs-metrics" aria-label="Presence">
          <div>
            <span className="hs-m-v">{streak}</span>
            <span className="hs-m-l">Streak</span>
          </div>
          <div>
            <span className="hs-m-v">{embers.toLocaleString()}</span>
            <span className="hs-m-l">Embers</span>
          </div>
          <div>
            <span className="hs-m-v">{sessions}</span>
            <span className="hs-m-l">Sessions</span>
          </div>
        </div>

        <button
          type="button"
          className={"hs-check" + (checkedIn ? " done" : "")}
          onClick={checkIn}
          disabled={checkedIn}
        >
          {checkedIn ? "Checked in" : "Check in"}
        </button>

        <div className="hs-actions-list">
          {move ? (
            <Link href={move.href} className="hs-action-row">
              <div>
                <p className="hs-action-k">Next</p>
                <p className="hs-action-t">{move.title}</p>
                <p className="hs-action-s">{move.reason}</p>
              </div>
              <span className="hs-action-go" aria-hidden>
                {move.cta} →
              </span>
            </Link>
          ) : null}

          {question ? (
            <Link href="/home/daily" className="hs-action-row">
              <div>
                <p className="hs-action-k">Reflect</p>
                <p className="hs-action-t">{question}</p>
              </div>
              <span className="hs-action-go" aria-hidden>
                Daily →
              </span>
            </Link>
          ) : null}
        </div>

        {quote ? (
          <footer className="hs-foot">
            <p className="hs-q">“{quote.text}”</p>
            <p className="hs-qa">{quote.author}</p>
          </footer>
        ) : null}
      </div>
    </main>
  );
}
