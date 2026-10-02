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
import { WIKI, deskMeta, type WikiArticle } from "@/lib/wiki";

function greetingForHour(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Wind down";
}

function displayNameForGreeting(me: Identity): string {
  const raw = (me.displayName || "").trim();
  if (raw) return raw.split(/\s+/)[0];
  const user = (me.username || "").trim();
  if (user) return user.startsWith("@") ? user.slice(1) : user;
  return "there";
}

/** Rotate featured set by calendar day. */
function featuredReads(count = 3): WikiArticle[] {
  if (WIKI.length === 0) return [];
  const start = new Date().getDate() % WIKI.length;
  const out: WikiArticle[] = [];
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
  const featured = reads[0] ?? null;
  const more = reads.slice(1);

  if (!rec || !me) return <main className="min-h-dvh" />;

  const checkedIn = isCheckedInToday(rec);
  const name = displayNameForGreeting(me);
  const hello = greetingForHour(new Date().getHours());

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
        {/* 1. Presence */}
        <header className="pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
            Home
          </p>
          <h1 className="mt-2 text-[30px] font-semibold leading-[1.1] tracking-[-0.045em] sm:text-[34px]">
            {hello}, {name}.
          </h1>
        </header>

        <section className="mt-8 flex items-center justify-between gap-4 border-t border-livv-border pt-6">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-[-0.02em]">
              {checkedIn ? "Checked in" : "Check in"}
            </p>
            <p className="mt-1 text-[13px] text-livv-muted">
              {checkedIn
                ? rec.streak > 1
                  ? `${rec.streak}-day chain`
                  : "Today is on the record"
                : "One mark. Then use the tabs."}
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
                : "flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[rgb(var(--livv-ink))] px-5 text-[12px] font-semibold text-[var(--livv-bg)]"
            }
          >
            {checkedIn ? <Check size={14} strokeWidth={2.25} /> : <Plus size={14} strokeWidth={2.25} />}
            {checkedIn ? "Done" : "Check in"}
          </button>
        </section>

        {/* 2. Featured read — one clear lead */}
        {featured ? (
          <section className="mt-12 border-t border-livv-border pt-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
              Read
            </p>
            <Link href={`/home/read/${featured.slug}`} className="group mt-4 block active:opacity-80">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-livv-muted">
                {deskMeta(featured.desk).label} · {featured.readMins} min
              </p>
              <h2 className="mt-2 max-w-[20ch] text-[24px] font-semibold leading-[1.15] tracking-[-0.04em] text-[rgb(var(--livv-ink))] sm:text-[26px]">
                {featured.title}
              </h2>
              <p className="mt-3 max-w-[36ch] text-[14px] leading-relaxed text-livv-muted">
                {featured.hook}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[rgb(var(--livv-ink))]">
                Open
                <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>

            {more.length > 0 ? (
              <div className="mt-8 divide-y divide-livv-border border-t border-livv-border">
                {more.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/home/read/${article.slug}`}
                    className="group flex items-center gap-3 py-4 transition active:opacity-80"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-livv-muted">
                        {deskMeta(article.desk).label} · {article.readMins} min
                      </span>
                      <span className="mt-1 block text-[15px] font-semibold tracking-[-0.02em] text-[rgb(var(--livv-ink))]">
                        {article.title}
                      </span>
                    </span>
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-livv-muted opacity-40 group-hover:opacity-100"
                    />
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {/* 3. Updates — secondary, compact */}
        <section className="mt-12 border-t border-livv-border pt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
            Updates
          </p>
          <div className="mt-4 space-y-6">
            {ANNOUNCEMENTS.map((a) => (
              <div key={a.id}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-livv-muted">
                  {a.label}
                </p>
                <p className="mt-1.5 text-[15px] font-semibold tracking-[-0.02em] text-[rgb(var(--livv-ink))]">
                  {a.title}
                </p>
                <p className="mt-1.5 max-w-[38ch] text-[13px] leading-relaxed text-livv-muted">
                  {a.body}
                </p>
                {a.href && a.cta ? (
                  <Link
                    href={a.href}
                    className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-[rgb(var(--livv-ink))] underline-offset-4 hover:underline"
                  >
                    {a.cta}
                    <ArrowRight size={12} />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* 4. Quote — close */}
        {quote ? (
          <section className="mt-12 border-t border-livv-border pt-8 pb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
              Carry this
            </p>
            <blockquote className="mt-4 max-w-[30ch] text-[17px] font-medium leading-[1.4] tracking-[-0.02em] text-[rgb(var(--livv-ink))]">
              “{quote.text}”
            </blockquote>
            <p className="mt-4 text-[12px] text-livv-muted">
              <span className="font-semibold text-[rgb(var(--livv-ink))]">{quote.author}</span>
              {quote.source ? ` · ${quote.source}` : ""}
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
