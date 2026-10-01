"use client";

import Link from "next/link";
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

/** Prefer the name they chose — never email, never the brand word as a person. */
function resolveGreetingName(me: Identity): { name: string | null; needsName: boolean } {
  const raw = (me.displayName || "").trim();
  if (!raw) return { name: null, needsName: true };

  const lower = raw.toLowerCase();
  if (lower === "livv" || lower === "there" || lower === "user") {
    return { name: null, needsName: true };
  }
  if (raw.includes("@") || raw.includes(".com") || raw.includes(".net")) {
    return { name: null, needsName: true };
  }

  const first = raw.split(/\s+/)[0];
  if (!first || first.length < 2) return { name: null, needsName: true };
  return { name: first, needsName: false };
}

function greetingForHour(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Wind down";
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
  const { name, needsName } = resolveGreetingName(me);
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
        {/* Who this is for */}
        <header className="pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
            Home
          </p>
          <h1 className="mt-2 text-[30px] font-semibold leading-[1.1] tracking-[-0.045em] sm:text-[34px]">
            {name ? (
              <>
                {hello}, {name}.
              </>
            ) : (
              <>{hello}.</>
            )}
          </h1>
          {needsName ? (
            <p className="mt-3 text-[14px] leading-relaxed text-livv-muted">
              <Link
                href="/home/profile"
                className="font-medium text-[rgb(var(--livv-ink))] underline-offset-4 hover:underline"
              >
                Set the name you want to be called
              </Link>
              {" — not the brand, not an email."}
            </p>
          ) : (
            <p className="mt-3 text-[14px] leading-relaxed text-livv-muted">
              {checkedIn
                ? rec.streak > 1
                  ? `Marked · ${rec.streak}-day chain`
                  : "Marked for today"
                : "You are here. Mark when you want it on the record."}
            </p>
          )}
        </header>

        {/* Breathing room — the day is not a dashboard */}
        <div className="flex-1" aria-hidden />

        {/* Quote — returns, sits low, carries the tone */}
        {quote ? (
          <section className="pb-2 text-center">
            <blockquote className="mx-auto max-w-[28ch] text-[22px] font-medium leading-[1.3] tracking-[-0.03em] text-[rgb(var(--livv-ink))] sm:text-[24px]">
              “{quote.text}”
            </blockquote>
            <p className="mt-6 text-[12px] font-semibold text-[rgb(var(--livv-ink))]">
              {quote.author}
            </p>
            {quote.source ? (
              <p className="mt-1 text-[11px] text-livv-muted">{quote.source}</p>
            ) : null}
          </section>
        ) : null}

        {/* Presence — quiet, same control language as the rest of the app */}
        <footer className="mt-12 border-t border-livv-border pb-10 pt-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
                Presence
              </p>
              <p className="mt-1.5 text-[15px] font-semibold tracking-[-0.02em]">
                {checkedIn ? "On the record" : "Not marked yet"}
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
