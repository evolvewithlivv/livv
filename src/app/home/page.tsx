"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronRight, Plus } from "lucide-react";
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
import { ANNOUNCEMENTS } from "@/lib/announcements";
import { WIKI, deskMeta } from "@/lib/wiki";

function greetingForHour(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Wind down";
}

/** Display name as they set it on Profile. */
function displayNameForGreeting(me: Identity): string {
  const raw = (me.displayName || "").trim();
  if (raw) return raw.split(/\s+/)[0];
  const user = (me.username || "").trim();
  if (user) return user.startsWith("@") ? user.slice(1) : user;
  return "there";
}

/** Rotate featured reads by day so Home feels alive without a CMS. */
function featuredReads(count = 3) {
  if (WIKI.length === 0) return [];
  const start = new Date().getDate() % WIKI.length;
  const out = [];
  for (let i = 0; i < Math.min(count, WIKI.length); i++) {
    out.push(WIKI[(start + i) % WIKI.length]);
  }
  return out;
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

  const reads = useMemo(() => featuredReads(3), []);

  if (!rec || !me) return <main className="min-h-dvh" />;

  const checkedIn = isCheckedInToday(rec);
  const name = displayNameForGreeting(me);
  const hour = new Date().getHours();
  const hello = greetingForHour(hour);

  const checkIn = () => {
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
    <main className="livv-page min-h-full pb-24">
      <div className="mx-auto w-full max-w-xl px-5 pb-12 sm:px-6">
        {/* Greeting */}
        <header className="pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
            Home
          </p>
          <h1 className="mt-2 text-[30px] font-semibold leading-[1.1] tracking-[-0.045em] sm:text-[34px]">
            {hello}, {name}.
          </h1>
        </header>

        {/* Check in — primary daily action on Home */}
        <section className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-livv-border px-4 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
              Check in
            </p>
            <p className="mt-1.5 text-[15px] font-semibold tracking-[-0.02em]">
              {checkedIn ? "You're checked in" : "Check in for today"}
            </p>
            <p className="mt-1 text-[12px] text-livv-muted">
              {checkedIn
                ? rec.streak > 1
                  ? `${rec.streak}-day chain`
                  : "On the record"
                : "One tap. Starts the day on the record."}
            </p>
          </div>
          <button
            type="button"
            onClick={checkIn}
            disabled={checkedIn}
            aria-label={checkedIn ? "Already checked in" : "Check in"}
            className={
              checkedIn
                ? "flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-livv-border px-4 text-[12px] font-semibold text-livv-muted"
                : "flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[rgb(var(--livv-ink))] px-5 text-[12px] font-semibold text-[var(--livv-bg)]"
            }
          >
            {checkedIn ? <Check size={14} strokeWidth={2.25} /> : <Plus size={14} strokeWidth={2.25} />}
            {checkedIn ? "Done" : "Check in"}
          </button>
        </section>

        {/* Announcements */}
        <section className="mt-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
            Announcements
          </p>
          <h2 className="mt-1.5 text-[22px] font-semibold tracking-[-0.035em]">From LIVV</h2>
          <div className="mt-5 divide-y divide-livv-border border-t border-livv-border">
            {ANNOUNCEMENTS.map((a) => (
              <div key={a.id} className="py-5">
                <p className="text-[11px] text-livv-muted">{a.date}</p>
                <p className="mt-1.5 text-[16px] font-semibold tracking-[-0.02em] text-[rgb(var(--livv-ink))]">
                  {a.title}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-livv-muted">{a.body}</p>
                {a.href && a.cta ? (
                  <Link
                    href={a.href}
                    className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[rgb(var(--livv-ink))] underline-offset-4 hover:underline"
                  >
                    {a.cta}
                    <ArrowRight size={13} />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* Reading / news */}
        <section className="mt-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
            Read
          </p>
          <h2 className="mt-1.5 text-[22px] font-semibold tracking-[-0.035em]">Worth your time</h2>
          <p className="mt-2 max-w-[36ch] text-[13px] leading-relaxed text-livv-muted">
            Short pieces on capability, health, and how to use the system.
          </p>
          <div className="mt-5 divide-y divide-livv-border border-t border-livv-border">
            {reads.map((article) => {
              const desk = deskMeta(article.desk);
              return (
                <Link
                  key={article.slug}
                  href={`/home/read/${article.slug}`}
                  className="group flex items-start gap-3 py-5 transition active:opacity-80"
                >
                  <span className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-livv-muted">
                      {desk.label} · {article.readMins} min
                    </span>
                    <span className="mt-1.5 block text-[16px] font-semibold tracking-[-0.02em] text-[rgb(var(--livv-ink))]">
                      {article.title}
                    </span>
                    <span className="mt-1.5 block text-[13px] leading-relaxed text-livv-muted">
                      {article.hook}
                    </span>
                  </span>
                  <ChevronRight
                    size={16}
                    className="mt-1 shrink-0 text-livv-muted opacity-50 group-hover:opacity-100"
                  />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Quote — quiet close */}
        {quote ? (
          <section className="mt-12 border-t border-livv-border pt-8 pb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
              Carry this
            </p>
            <blockquote className="mt-4 max-w-[32ch] text-[18px] font-medium leading-[1.35] tracking-[-0.02em] text-[rgb(var(--livv-ink))]">
              “{quote.text}”
            </blockquote>
            <p className="mt-4 text-[12px] font-semibold text-[rgb(var(--livv-ink))]">
              {quote.author}
              {quote.source ? (
                <span className="font-normal text-livv-muted"> · {quote.source}</span>
              ) : null}
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
