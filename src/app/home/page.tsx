"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Caveat } from "next/font/google";
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
import { ANNOUNCEMENTS } from "@/lib/announcements";
import { WIKI, type WikiArticle } from "@/lib/wiki";

const hand = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

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

function featuredRead(): WikiArticle | null {
  if (WIKI.length === 0) return null;
  return WIKI[new Date().getDate() % WIKI.length] ?? null;
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "...";
}

/** Dark cork — denser grain so the board reads as a surface, not empty black. */
const CORK_STYLE: CSSProperties = {
  backgroundColor: "#2a2218",
  backgroundImage: [
    "radial-gradient(ellipse at 15% 20%, rgba(120,90,60,0.45), transparent 50%)",
    "radial-gradient(ellipse at 85% 75%, rgba(60,45,30,0.55), transparent 45%)",
    "repeating-radial-gradient(circle at 8% 12%, rgba(255,210,160,0.07) 0 0.6px, transparent 0.7px 2.8px)",
    "repeating-radial-gradient(circle at 62% 38%, rgba(0,0,0,0.28) 0 0.7px, transparent 0.8px 3.2px)",
    "repeating-radial-gradient(circle at 40% 80%, rgba(255,220,180,0.05) 0 0.5px, transparent 0.6px 3.5px)",
    "repeating-linear-gradient(112deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 4px)",
    "repeating-linear-gradient(22deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 6px)",
  ].join(","),
  boxShadow:
    "inset 0 0 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.4)",
};

type PaperTone = "cream" | "kraft" | "aged";

function paperStyle(tone: PaperTone): CSSProperties {
  if (tone === "kraft") {
    return {
      background: "linear-gradient(145deg, #c4a882 0%, #b8956a 40%, #a8845c 100%)",
      color: "#2a2118",
      boxShadow:
        "0 1px 0 rgba(255,255,255,0.2) inset, 0 6px 16px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.2)",
    };
  }
  if (tone === "aged") {
    return {
      background: "linear-gradient(160deg, #e8e0d0 0%, #d9d0bc 50%, #cfc6b0 100%)",
      color: "#2c2820",
      boxShadow:
        "0 1px 0 rgba(255,255,255,0.35) inset, 0 8px 18px rgba(0,0,0,0.38), 0 2px 4px rgba(0,0,0,0.2)",
    };
  }
  return {
    background: "linear-gradient(155deg, #f7f2e8 0%, #efe8da 45%, #e5dcc8 100%)",
    color: "#1f1a14",
    boxShadow:
      "0 1px 0 rgba(255,255,255,0.5) inset, 0 8px 20px rgba(0,0,0,0.4), 0 2px 5px rgba(0,0,0,0.22)",
  };
}

function Thumbtack() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-0 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        background:
          "radial-gradient(circle at 35% 30%, #f0f0f0 0%, #a8a8a8 40%, #5a5a5a 75%, #2a2a2a 100%)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.5)",
      }}
    />
  );
}

function Note({
  children,
  tone = "cream",
  rotate = 0,
  className = "",
  as: Comp = "div",
  onClick,
  href,
  ariaLabel,
  disabled,
}: {
  children: ReactNode;
  tone?: PaperTone;
  rotate?: number;
  className?: string;
  as?: "div" | "button" | "a";
  onClick?: () => void;
  href?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const base =
    "relative block w-full p-3 text-left transition active:scale-[0.98] " + hand.className;

  const style: CSSProperties = {
    ...paperStyle(tone),
    transform: `rotate(${rotate}deg)`,
  };

  const inner = (
    <>
      <Thumbtack />
      <div className="pt-0.5">{children}</div>
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} aria-label={ariaLabel} className={`${base} ${className}`} style={style}>
        {inner}
      </Link>
    );
  }

  if (Comp === "button" || onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`${base} ${className} disabled:opacity-90`}
        style={style}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={`${base} ${className}`} style={style} aria-label={ariaLabel}>
      {inner}
    </div>
  );
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

  const featured = useMemo(() => featuredRead(), []);
  const primaryUpdate = ANNOUNCEMENTS[0];
  const secondaryUpdate = ANNOUNCEMENTS[1];

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
    <main className="livv-page min-h-full pb-20">
      {/* Board owns the screen — minimal chrome outside */}
      <div className="mx-auto flex w-full max-w-xl flex-col px-3 sm:px-4">
        <header className="flex items-end justify-between gap-3 pt-3 pb-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
              Home
            </p>
            <h1 className="mt-0.5 text-[18px] font-semibold tracking-[-0.03em] text-[rgb(var(--livv-ink))]">
              {hello}, {name}.
            </h1>
          </div>
        </header>

        <section
          className="relative flex min-h-[calc(100dvh-9.5rem)] flex-col overflow-hidden rounded-[3px] border border-black/50 px-2.5 py-3 sm:px-3 sm:py-4"
          style={CORK_STYLE}
          aria-label="LIVV board"
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[3px]"
            style={{
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 0 4px rgba(0,0,0,0.2)",
            }}
          />

          {/* Notes pack the board — tighter gaps, full width */}
          <div className="relative flex flex-1 flex-col justify-between gap-2.5 sm:gap-3">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <Note
                tone="cream"
                rotate={-3.5}
                as="button"
                onClick={checkIn}
                disabled={checkedIn}
                ariaLabel={checkedIn ? "Already checked in" : "Check in for today"}
                className="min-h-[6.75rem]"
              >
                <p className="text-[20px] font-semibold leading-[1.12] sm:text-[22px]">
                  {checkedIn ? "Checked in." : "Check in today."}
                </p>
                <p className="mt-1.5 text-[14px] leading-snug opacity-80">
                  {checkedIn
                    ? rec.streak > 1
                      ? `${rec.streak}-day chain.`
                      : "On the record."
                    : "Same you. Better tomorrow."}
                </p>
                {checkedIn ? (
                  <span className="mt-2 inline-flex items-center gap-1 text-[13px] opacity-70">
                    <Check size={13} strokeWidth={2.5} /> Done
                  </span>
                ) : null}
              </Note>

              {primaryUpdate ? (
                <Note
                  tone="aged"
                  rotate={2.8}
                  href={primaryUpdate.href}
                  ariaLabel={primaryUpdate.title}
                  className="min-h-[6.75rem]"
                >
                  <p className="text-[18px] font-semibold leading-[1.12] sm:text-[20px]">
                    {primaryUpdate.title}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-snug opacity-80">
                    {clip(primaryUpdate.body, 85)}
                  </p>
                </Note>
              ) : null}
            </div>

            {featured ? (
              <Note
                tone="cream"
                rotate={-1}
                href={`/home/read/${featured.slug}`}
                ariaLabel={`Read: ${featured.title}`}
                className="min-h-[7.25rem] px-3.5 py-3.5"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] opacity-55">
                  Read · {featured.readMins} min
                </p>
                <p className="mt-1.5 text-[22px] font-semibold leading-[1.1] sm:text-[24px]">
                  {featured.title}
                </p>
                <p className="mt-1.5 text-[14px] leading-snug opacity-75">
                  {clip(featured.hook, 95)}
                </p>
              </Note>
            ) : null}

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {secondaryUpdate ? (
                <Note
                  tone="kraft"
                  rotate={3.2}
                  href={secondaryUpdate.href}
                  ariaLabel={secondaryUpdate.title}
                  className="min-h-[6.5rem]"
                >
                  <p className="text-[18px] font-semibold leading-[1.12] sm:text-[19px]">
                    {secondaryUpdate.title}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-snug opacity-80">
                    {clip(secondaryUpdate.body, 65)}
                  </p>
                </Note>
              ) : (
                <div />
              )}

              {quote ? (
                <Note tone="cream" rotate={-2.5} className="min-h-[6.5rem]">
                  <p className="text-[16px] font-semibold leading-[1.22] sm:text-[17px]">
                    &ldquo;{clip(quote.text, 100)}&rdquo;
                  </p>
                  <p className="mt-1.5 text-[12px] opacity-65">&mdash; {quote.author}</p>
                </Note>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
