"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { addEmbers, loadIdentity, type Identity } from "@/lib/identity";
import {
  checkInRecord,
  isCheckedInToday,
  loadRecord,
  type LivvRecord,
} from "@/lib/record";
import { feedback } from "@/lib/sensory";
import { dailySummary } from "@/lib/daily";
import { quoteForSession, type Quote } from "@/lib/quotes";
import { embersFromAction } from "@/lib/embers";

function greetingForHour(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Wind down";
}

/** Whatever they set as display name — including LIVV if that is their choice. */
function displayNameForGreeting(me: Identity): string {
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

  const pull = () => {
    setRec(loadRecord());
    setMe(loadIdentity());
    dailySummary();
  };

  useEffect(() => {
    pull();
    setQuote(quoteForSession());
    const events = ["livv-identity", "livv-record", "livv-daily"];
    events.forEach((e) => window.addEventListener(e, pull));
    return () => events.forEach((e) => window.removeEventListener(e, pull));
  }, []);

  if (!rec || !me) return <main className="min-h-dvh" />;

  const checkedIn = isCheckedInToday(rec);
  const name = displayNameForGreeting(me);
  const hour = new Date().getHours();
  const hello = greetingForHour(hour);

  const markPresence = () => {
    if (checkedIn) return;
    const result = checkInRecord();
    if (result.already) return;
    feedback("checkin");
    const base = embersFromAction("checkin");
    addEmbers(base);
    const bonus =
      result.emberBonus && [4, 6, 8, 10, 12, 15].includes(result.emberBonus)
        ? result.emberBonus
        : 0;
    if (bonus) addEmbers(bonus, `ember-checkin-bonus-${Date.now()}`);
    pull();
  };

  return (
    <main className="livv-page min-h-full pb-20">
      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-xl flex-col px-5 sm:px-6">
        <header className="pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
            Home
          </p>
          <h1 className="mt-2 text-[30px] font-semibold leading-[1.1] tracking-[-0.045em] sm:text-[34px]">
            {hello}, {name}.
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-livv-muted">
            {checkedIn
              ? rec.streak > 1
                ? `On the record · ${rec.streak}-day chain`
                : "On the record for today"
              : "Mark when you want today on the record."}
          </p>
        </header>

        {/* Quote — primary surface of Home, not stranded at the bottom of a void */}
        <section className="mt-14 flex flex-1 flex-col justify-center border-t border-livv-border pt-12">
          {quote ? (
            <>
              <blockquote className="max-w-[30ch] text-[24px] font-medium leading-[1.28] tracking-[-0.03em] text-[rgb(var(--livv-ink))] sm:text-[26px]">
                “{quote.text}”
              </blockquote>
              <p className="mt-8 text-[13px] font-semibold text-[rgb(var(--livv-ink))]">
                {quote.author}
              </p>
              {quote.source ? (
                <p className="mt-1 text-[11px] text-livv-muted">{quote.source}</p>
              ) : null}
            </>
          ) : (
            <p className="max-w-[24ch] text-[24px] font-medium leading-[1.28] tracking-[-0.03em]">
              Evolve with purpose.
            </p>
          )}
        </section>

        <footer className="mt-12 border-t border-livv-border pb-10 pt-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
                Presence
              </p>
              <p className="mt-1.5 text-[15px] font-semibold tracking-[-0.02em]">
                {checkedIn ? "Marked" : "Not marked yet"}
              </p>
            </div>
            <button
              type="button"
              onClick={markPresence}
              disabled={checkedIn}
              aria-label={checkedIn ? "Already marked" : "Mark presence"}
              className={
                checkedIn
                  ? "flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-livv-border px-4 text-[12px] font-semibold text-livv-muted"
                  : "flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[rgb(var(--livv-ink))] px-5 text-[12px] font-semibold text-[var(--livv-bg)]"
              }
            >
              {checkedIn ? <Check size={14} strokeWidth={2.25} /> : null}
              {checkedIn ? "Done" : "Mark"}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
