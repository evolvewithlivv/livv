"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { addEmbers, loadIdentity, type Identity } from "@/lib/identity";
import { getEffectiveTier } from "@/lib/billing";
import { checkInRecord, isCheckedInToday, loadRecord, type LivvRecord } from "@/lib/record";
import { feedback } from "@/lib/sensory";
import { dailySummary } from "@/lib/daily";
import { quoteForSession, type Quote } from "@/lib/quotes";
import { embersFromAction } from "@/lib/embers";

/**
 * Home is not navigation.
 * Tabs already open the rooms. This screen is presence + one idea to carry.
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

  if (!rec || !me) return <main className="min-h-dvh" />;

  const checkedIn = isCheckedInToday(rec);
  const displayName = me.displayName?.trim() || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

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
      <div className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-[40rem] flex-col px-5 sm:px-6">
        {/* Identity */}
        <header className="pt-10">
          <p className="text-[12px] font-medium tracking-[0.02em] text-livv-muted">
            {greeting}
          </p>
          <h1 className="mt-4 text-[44px] font-bold leading-[0.92] tracking-[-0.06em] text-[rgb(var(--livv-ink))] sm:text-[52px]">
            {displayName}.
          </h1>
        </header>

        {/* The idea — fills the middle of the world */}
        <section className="flex flex-1 flex-col justify-center py-12">
          {quote ? (
            <>
              <blockquote className="max-w-[18ch] text-[30px] font-semibold leading-[1.12] tracking-[-0.045em] text-[rgb(var(--livv-ink))] sm:max-w-[22ch] sm:text-[34px]">
                {quote.text}
              </blockquote>
              <div className="mt-10">
                <p className="text-[14px] font-medium text-[rgb(var(--livv-ink))]">
                  {quote.author}
                </p>
                {quote.source ? (
                  <p className="mt-1 text-[12px] text-livv-muted">{quote.source}</p>
                ) : null}
              </div>
            </>
          ) : (
            <p className="max-w-[16ch] text-[30px] font-semibold leading-[1.12] tracking-[-0.045em] text-[rgb(var(--livv-ink))]">
              Evolve with purpose.
            </p>
          )}
        </section>

        {/* Presence only — no room list, no second nav */}
        <footer className="border-t border-livv-border pb-8 pt-8">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              {checkedIn ? (
                <>
                  <p className="text-[14px] font-medium text-[rgb(var(--livv-ink))]">
                    You are here.
                  </p>
                  {rec.streak > 1 ? (
                    <p className="mt-1 text-[12px] text-livv-muted">
                      <span className="tabular-nums">{rec.streak}</span> day streak
                    </p>
                  ) : (
                    <p className="mt-1 text-[12px] text-livv-muted">Marked for today</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-[14px] font-medium text-[rgb(var(--livv-ink))]">
                    Show up.
                  </p>
                  <p className="mt-1 text-[12px] text-livv-muted">
                    One mark. Nothing else required.
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={checkIn}
              disabled={checkedIn}
              aria-label={checkedIn ? "Already checked in" : "Check in for today"}
              className={
                checkedIn
                  ? "flex h-12 shrink-0 items-center gap-2 rounded-full border border-livv-border px-5 text-[13px] font-semibold text-livv-muted"
                  : "flex h-12 shrink-0 items-center gap-2 rounded-full bg-[rgb(var(--livv-ink))] px-6 text-[13px] font-semibold text-[rgb(var(--livv-bg))]"
              }
            >
              {checkedIn ? <Check size={16} strokeWidth={2.25} /> : null}
              {checkedIn ? "Here" : "I am here"}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
