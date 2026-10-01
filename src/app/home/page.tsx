"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { addEmbers, loadIdentity, type Identity } from "@/lib/identity";
import { getEffectiveTier } from "@/lib/billing";
import { checkInRecord, isCheckedInToday, loadRecord, type LivvRecord } from "@/lib/record";
import { feedback } from "@/lib/sensory";
import { dailySummary } from "@/lib/daily";
import { quoteForSession, type Quote } from "@/lib/quotes";
import { embersFromAction } from "@/lib/embers";
import { nextMove } from "@/lib/command";
import { evolutionTitle } from "@/lib/levels";

/**
 * Home is not a tab bar and not an empty void.
 * Identity · one idea to carry · one move if you want it · presence.
 */
export default function HomePage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [me, setMe] = useState<Identity | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  const pull = () => {
    setRec(loadRecord());
    setMe(loadIdentity());
    dailySummary();
  };

  useEffect(() => {
    pull();
    setQuote(quoteForSession());
    const events = ["livv-identity", "livv-record", "livv-daily", "livv-billing"];
    events.forEach((e) => window.addEventListener(e, pull));
    return () => events.forEach((e) => window.removeEventListener(e, pull));
  }, []);

  const move = useMemo(() => (rec ? nextMove(rec) : null), [rec]);

  if (!rec || !me) return <main className="min-h-dvh" />;

  const checkedIn = isCheckedInToday(rec);
  const rawName = me.displayName?.trim() || "";
  const brandish =
    !rawName ||
    rawName.toLowerCase() === "livv" ||
    rawName.toLowerCase() === "there";
  const first =
    brandish
      ? me.username?.trim() || "friend"
      : rawName.split(/\s+/)[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 5
      ? "Still up"
      : hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : hour < 21
            ? "Good evening"
            : "Wind down";
  const evo = evolutionTitle(rec.level || 1);

  const checkIn = () => {
    if (checkedIn) return;
    const result = checkInRecord();
    if (result.already) return;
    feedback("checkin");
    const base = embersFromAction("checkin");
    const bonus =
      result.emberBonus && [4, 6, 8, 10, 12, 15].includes(result.emberBonus)
        ? result.emberBonus
        : 0;
    addEmbers(base);
    if (bonus) addEmbers(bonus, `ember-checkin-bonus-${Date.now()}`);
    void getEffectiveTier();
    pull();
  };

  return (
    <main className="livv-page min-h-full pb-28">
      <div className="mx-auto w-full max-w-[40rem] px-5 pt-8 sm:px-6">
        {/* Who you are — not the brand wordmark as a name */}
        <header>
          <p className="text-[12px] font-medium text-livv-muted">
            {greeting}, {first}
          </p>
          <h1 className="mt-3 max-w-[14ch] text-[34px] font-bold leading-[1.05] tracking-[-0.045em] text-[rgb(var(--livv-ink))] sm:text-[38px]">
            {evo.name}.
          </h1>
          <p className="mt-3 max-w-[36ch] text-[14px] leading-relaxed text-livv-muted">
            {evo.line}
          </p>
          <p className="mt-4 text-[12px] text-livv-muted">
            Level{" "}
            <span className="tabular-nums text-[rgb(var(--livv-ink))]">{rec.level || 1}</span>
            {rec.streak > 0 ? (
              <>
                {" "}·{" "}
                <span className="tabular-nums text-[rgb(var(--livv-ink))]">{rec.streak}</span>
                {" "}day streak
              </>
            ) : null}
          </p>
        </header>

        {/* One idea — editorial, not floating in a void */}
        <section className="mt-12 border-t border-livv-border pt-10">
          {quote ? (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
                Carry this
              </p>
              <blockquote className="mt-5 max-w-[28ch] text-[24px] font-semibold leading-[1.2] tracking-[-0.035em] text-[rgb(var(--livv-ink))] sm:text-[26px]">
                {quote.text}
              </blockquote>
              <p className="mt-6 text-[13px] font-medium text-[rgb(var(--livv-ink))]">
                {quote.author}
              </p>
              {quote.source ? (
                <p className="mt-1 text-[11px] text-livv-muted">{quote.source}</p>
              ) : null}
            </>
          ) : (
            <p className="max-w-[24ch] text-[24px] font-semibold leading-[1.2] tracking-[-0.035em] text-[rgb(var(--livv-ink))]">
              Evolve with purpose.
            </p>
          )}
        </section>

        {/* One move — not a room directory */}
        {move && move.href !== "/home" ? (
          <section className="mt-12 border-t border-livv-border pt-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
              If you do one thing
            </p>
            <Link
              href={move.href}
              className="mt-4 flex items-start justify-between gap-4 transition active:opacity-80"
            >
              <span className="min-w-0">
                <span className="block text-[18px] font-semibold tracking-[-0.03em] text-[rgb(var(--livv-ink))]">
                  {move.title}
                </span>
                <span className="mt-1.5 block max-w-[32ch] text-[13px] leading-relaxed text-livv-muted">
                  {move.reason}
                </span>
              </span>
              <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-border text-[rgb(var(--livv-ink))]">
                <ArrowRight size={16} />
              </span>
            </Link>
          </section>
        ) : null}

        {/* Presence */}
        <section className="mt-12 border-t border-livv-border pt-8 pb-10">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-[rgb(var(--livv-ink))]">
                {checkedIn ? "You showed up." : "Show up."}
              </p>
              <p className="mt-1 text-[12px] text-livv-muted">
                {checkedIn
                  ? "Today is marked. Use the tabs when you are ready to work."
                  : "One mark. Then use the tabs for the real work."}
              </p>
            </div>
            <button
              type="button"
              onClick={checkIn}
              disabled={checkedIn}
              aria-label={checkedIn ? "Already checked in" : "Check in for today"}
              className={
                checkedIn
                  ? "flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-livv-border px-4 text-[12px] font-semibold text-livv-muted"
                  : "flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[rgb(var(--livv-ink))] px-5 text-[12px] font-semibold text-[rgb(var(--livv-bg))]"
              }
            >
              {checkedIn ? <Check size={15} strokeWidth={2.25} /> : null}
              {checkedIn ? "Here" : "I am here"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
