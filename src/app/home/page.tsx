"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronRight, Plus } from "lucide-react";
import { addEmbers, loadIdentity, type Identity } from "@/lib/identity";
import { getTier } from "@/lib/membership";
import { getEffectiveTier } from "@/lib/billing";
import { checkInRecord, isCheckedInToday, loadRecord, type LivvRecord } from "@/lib/record";
import { dailyPillarStatus } from "@/lib/command";
import { buildBehaviorLoop } from "@/lib/behavior-loop";
import { feedback } from "@/lib/sensory";
import { dailySummary } from "@/lib/daily";
import { quoteForSession, type Quote } from "@/lib/quotes";

/** Each area routes to a distinct product surface — no shared dump destination. */
const AREAS = [
  {
    id: "body",
    label: "Body",
    href: "/home/train",
    description: "Train, recover, move.",
  },
  {
    id: "mind",
    label: "Mind",
    href: "/home/mind",
    description: "Read, reflect, learn.",
  },
  {
    id: "career",
    label: "Work",
    href: "/home/daily",
    description: "Priorities, focus, and follow-through.",
  },
  {
    id: "finance",
    label: "Money",
    href: "/home/mind?desk=finance",
    description: "Decisions that protect and grow resources.",
  },
  {
    id: "home",
    label: "Home",
    href: "/home/health",
    description: "Sleep, fuel, space, and baseline health.",
  },
  {
    id: "capability",
    label: "Capability",
    href: "/home/health/dictionary",
    description: "Language and principles that change how you act.",
  },
] as const;

export default function HomePage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [me, setMe] = useState<Identity | null>(null);
  const [daily, setDaily] = useState<ReturnType<typeof dailySummary> | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  const pull = () => {
    setRec(loadRecord());
    setMe(loadIdentity());
    setDaily(dailySummary());
  };
  useEffect(() => {
    pull();
    setQuote(quoteForSession());
    const events = ["livv-identity", "livv-record", "livv-daily", "livv-billing"];
    events.forEach((e) => window.addEventListener(e, pull));
    return () => events.forEach((e) => window.removeEventListener(e, pull));
  }, []);

  const status = useMemo(() => (rec ? dailyPillarStatus(rec) : []), [rec]);
  const loop = useMemo(() => (rec ? buildBehaviorLoop(rec, new Date()) : null), [rec]);
  if (!rec || !me || !loop) return <main className="min-h-dvh" />;

  const checkedIn = isCheckedInToday(rec);
  const complete = (id: string) =>
    id === "life" ? checkedIn : Boolean(status.find((x) => x.id === id)?.done);
  const done = AREAS.filter((x) => complete(x.id)).length;
  const xp = Math.min(100, Math.round((rec.currentXp / Math.max(rec.xpToNext, 1)) * 100));
  const displayName = me.displayName || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const checkIn = () => {
    if (checkedIn) return;
    const result = checkInRecord();
    if (result.already) return;
    const tier = getTier(getEffectiveTier());
    feedback("checkin");
    addEmbers(10 * tier.multiplier + (result.emberBonus || 0));
    pull();
  };

  return (
    <main className="livv-page min-h-full pb-24">
      <div className="mx-auto w-full max-w-xl px-5 pb-12 sm:px-6">
        <header className="livv-page-hero">
          <div className="livv-page-hero-main">
            <p className="livv-page-eyebrow">Today</p>
            <p className="livv-page-subtitle" style={{ marginTop: "0.625rem" }}>
              {greeting}, {displayName}.
            </p>
            <h1 className="livv-page-title" style={{ marginTop: "0.35rem", maxWidth: "34rem" }}>
              What are you building today?
            </h1>
          </div>
        </header>

        {/* Perspective — no heavy border-y cage */}
        <section className="mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-livv-muted">
            Perspective
          </p>
          {quote && (
            <>
              <blockquote className="mt-4 max-w-[39ch] text-[22px] font-medium leading-[1.28] tracking-[-.025em]">
                “{quote.text}”
              </blockquote>
              <p className="mt-5 text-[12px] font-semibold">{quote.author}</p>
              <p className="mt-1 text-[10px] text-livv-muted">{quote.source}</p>
            </>
          )}
        </section>

        {/* Life-area progress — one clear system on Home */}
        <section className="mt-12 rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)] px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
                Life areas
              </p>
              <p className="mt-1.5 text-[25px] font-semibold tracking-[-.04em]">
                {done} / {AREAS.length}
              </p>
              <p className="mt-1 text-[11px] text-livv-muted">
                Touched today across the six areas
              </p>
            </div>
            <button
              type="button"
              onClick={checkIn}
              disabled={checkedIn}
              className="flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-livv-ink px-4 text-[11px] font-semibold text-livv-bg disabled:opacity-45"
            >
              {checkedIn ? <Check size={14} /> : <Plus size={14} />}
              {checkedIn ? "Checked in" : "Check in"}
            </button>
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-livv-border">
            <div
              className="h-full rounded-full bg-livv-accent transition-all"
              style={{ width: `${(done / AREAS.length) * 100}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-livv-muted">
            <span>{rec.streak} day streak</span>
            <span>{xp}% toward next level</span>
          </div>
        </section>

        {/* Six areas */}
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
                Life
              </p>
              <h2 className="mt-1.5 text-[24px] font-semibold tracking-[-.04em]">
                Six areas. One life.
              </h2>
            </div>
            <Link href="/home/progress" className="text-[11px] font-semibold text-livv-muted">
              Progress
            </Link>
          </div>
          <div className="overflow-hidden rounded-[22px] border border-livv-border">
            {AREAS.map((area, i) => {
              const isDone = complete(area.id);
              const last = i === AREAS.length - 1;
              return (
                <Link
                  key={area.id}
                  href={area.href}
                  className={
                    "group flex items-center gap-4 px-4 py-4 " +
                    (last ? "" : "border-b border-livv-border")
                  }
                >
                  <span
                    className={
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full border " +
                      (isDone
                        ? "border-livv-accent bg-livv-accent-soft text-livv-accent"
                        : "border-livv-border text-livv-muted")
                    }
                  >
                    {isDone ? (
                      <Check size={15} />
                    ) : (
                      <span className="text-[11px] font-semibold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold">{area.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-livv-muted">
                      {area.description}
                    </span>
                  </span>
                  <ChevronRight
                    size={17}
                    className="shrink-0 text-livv-muted transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Next move */}
        <section className="mt-12 pb-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
                Next move
              </p>
              <h2 className="mt-1.5 text-[23px] font-semibold tracking-[-.035em]">
                {loop.move.title}
              </h2>
              <p className="mt-2 max-w-[38ch] text-[12px] leading-relaxed text-livv-muted">
                {loop.move.reason}
              </p>
            </div>
            <Link
              href={loop.move.href}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-border"
              aria-label={loop.move.title}
            >
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
