"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { addEmbers, loadIdentity, type Identity } from "@/lib/identity";
import { getEffectiveTier } from "@/lib/billing";
import { checkInRecord, isCheckedInToday, loadRecord, type LivvRecord } from "@/lib/record";
import { feedback } from "@/lib/sensory";
import { dailySummary } from "@/lib/daily";
import { quoteForSession, type Quote } from "@/lib/quotes";
import { embersFromAction } from "@/lib/embers";

/** Rooms of the product — destinations, not a daily checklist. */
const ROOMS = [
  {
    href: "/home/train",
    label: "Train",
    line: "Build a body that holds under pressure.",
  },
  {
    href: "/home/daily",
    label: "Daily",
    line: "A few real moves. Not a second job.",
  },
  {
    href: "/home/health",
    label: "Health",
    line: "Sleep, fuel, recovery, and the long game.",
  },
  {
    href: "/home/vault",
    label: "Vault",
    line: "Protocols and tools when you are ready to go deeper.",
  },
  {
    href: "/home/profile",
    label: "You",
    line: "Identity, membership, and the record of who you are becoming.",
  },
] as const;

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
  const displayName = me.displayName || "there";
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
      <div className="mx-auto w-full max-w-[40rem] px-5 sm:px-6">
        <header className="pt-8 pb-2">
          <p className="text-[11px] font-medium tracking-[0.04em] text-livv-muted">
            {greeting}
          </p>
          <h1 className="mt-3 max-w-[12ch] text-[42px] font-bold leading-[0.95] tracking-[-0.055em] text-[rgb(var(--livv-ink))] sm:text-[48px]">
            {displayName}.
          </h1>
          <p className="mt-5 max-w-[28ch] text-[15px] leading-relaxed text-livv-muted">
            You are here to evolve — not to clear a list.
          </p>
        </header>

        <section className="mt-14 border-t border-livv-border pt-10">
          {quote ? (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
                Carry this
              </p>
              <blockquote className="mt-5 max-w-[22ch] text-[28px] font-semibold leading-[1.15] tracking-[-0.04em] text-[rgb(var(--livv-ink))] sm:max-w-[26ch] sm:text-[32px]">
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
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
                LIVV
              </p>
              <p className="mt-5 max-w-[22ch] text-[28px] font-semibold leading-[1.15] tracking-[-0.04em] text-[rgb(var(--livv-ink))]">
                Longevity. Integrity. Vitality. Vigilance.
              </p>
            </>
          )}
        </section>

        <section className="mt-14 flex items-center justify-between gap-4 border-t border-livv-border pt-8">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
              Presence
            </p>
            <p className="mt-2 text-[14px] text-livv-muted">
              {checkedIn ? (
                <>
                  You showed up today
                  {rec.streak > 1 ? (
                    <>
                      {" "}·{" "}
                      <span className="tabular-nums text-[rgb(var(--livv-ink))]">
                        {rec.streak}
                      </span>{" "}
                      day streak
                    </>
                  ) : null}
                </>
              ) : (
                "Mark that you are here. Nothing else required."
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={checkIn}
            disabled={checkedIn}
            className={
              checkedIn
                ? "flex h-11 shrink-0 items-center gap-2 rounded-full border border-livv-border px-4 text-[12px] font-semibold text-livv-muted"
                : "flex h-11 shrink-0 items-center gap-2 rounded-full bg-[rgb(var(--livv-ink))] px-5 text-[12px] font-semibold text-[rgb(var(--livv-bg))]"
            }
          >
            {checkedIn ? <Check size={15} /> : null}
            {checkedIn ? "Here" : "I am here"}
          </button>
        </section>

        <section className="mt-16 border-t border-livv-border pt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
            Enter
          </p>
          <h2 className="mt-3 max-w-[16ch] text-[26px] font-bold leading-[1.1] tracking-[-0.04em] text-[rgb(var(--livv-ink))]">
            Where do you want to go?
          </h2>
          <p className="mt-3 max-w-[36ch] text-[14px] leading-relaxed text-livv-muted">
            Open one room. Leave the rest alone until you need it.
          </p>

          <div className="mt-10 divide-y divide-livv-border border-t border-livv-border">
            {ROOMS.map((room) => (
              <Link
                key={room.href}
                href={room.href}
                className="group flex items-start justify-between gap-4 py-6 transition active:opacity-80"
              >
                <span className="min-w-0">
                  <span className="block text-[18px] font-semibold tracking-[-0.03em] text-[rgb(var(--livv-ink))]">
                    {room.label}
                  </span>
                  <span className="mt-1.5 block max-w-[32ch] text-[13px] leading-relaxed text-livv-muted">
                    {room.line}
                  </span>
                </span>
                <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-livv-border text-livv-muted transition group-hover:border-[rgb(var(--livv-ink))] group-hover:text-[rgb(var(--livv-ink))]">
                  <ArrowUpRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <p className="mt-16 pb-6 text-center text-[12px] text-livv-muted">
          Evolve with purpose.
        </p>
      </div>
    </main>
  );
}
