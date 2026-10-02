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

const CORK_STYLE: CSSProperties = {
  backgroundColor: "#1a1510",
  backgroundImage: [
    "radial-gradient(ellipse 120% 80% at 20% 30%, rgba(90,70,50,0.35), transparent 55%)",
    "radial-gradient(ellipse 90% 70% at 80% 70%, rgba(40,30,22,0.5), transparent 50%)",
    "repeating-radial-gradient(circle at 12% 18%, rgba(255,220,180,0.04) 0 0.5px, transparent 0.6px 3px)",
    "repeating-radial-gradient(circle at 70% 40%, rgba(0,0,0,0.2) 0 0.6px, transparent 0.7px 4px)",
    "repeating-linear-gradient(105deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 5px)",
  ].join(","),
  boxShadow:
    "inset 0 0 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.45)",
};

type PaperTone = "cream" | "kraft" | "aged";

function paperStyle(tone: PaperTone): CSSProperties {
  if (tone === "kraft") {
    return {
      background: "linear-gradient(145deg, #c4a882 0%, #b8956a 40%, #a8845c 100%)",
      color: "#2a2118",
      boxShadow:
        "0 1px 0 rgba(255,255,255,0.2) inset, 0 8px 20px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.2)",
    };
  }
  if (tone === "aged") {
    return {
      background: "linear-gradient(160deg, #e8e0d0 0%, #d9d0bc 50%, #cfc6b0 100%)",
      color: "#2c2820",
      boxShadow:
        "0 1px 0 rgba(255,255,255,0.35) inset, 0 10px 24px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2)",
    };
  }
  return {
    background: "linear-gradient(155deg, #f7f2e8 0%, #efe8da 45%, #e5dcc8 100%)",
    color: "#1f1a14",
    boxShadow:
      "0 1px 0 rgba(255,255,255,0.5) inset, 0 10px 28px rgba(0,0,0,0.42), 0 2px 6px rgba(0,0,0,0.22)",
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
    "relative block w-full p-3.5 text-left transition active:scale-[0.98] " + hand.className;

  const style: CSSProperties = {
    ...paperStyle(tone),
    transform: `rotate(${rotate}deg)`,
  };

  const inner = (
    <>
      <Thumbtack />
      <div className="pt-1">{children}</div>
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
    <main className="livv-page min-h-full pb-24">
      <div className="mx-auto w-full max-w-xl px-4 pb-10 sm:px-5">
        <header className="pt-5 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Home</p>
          <h1 className="mt-1.5 text-[22px] font-semibold tracking-[-0.03em] text-[rgb(var(--livv-ink))]">
            {hello}, {name}.
          </h1>
        </header>

        <section
          className="relative overflow-hidden rounded-sm border border-black/40 px-3 py-5 sm:px-4 sm:py-6"
          style={CORK_STYLE}
          aria-label="LIVV board"
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-sm"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 0 3px rgba(0,0,0,0.25)",
            }}
          />

          <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
            <Note
              tone="cream"
              rotate={-3.5}
              as="button"
              onClick={checkIn}
              disabled={checkedIn}
              ariaLabel={checkedIn ? "Already checked in" : "Check in for today"}
              className="min-h-[7.5rem]"
            >
              <p className="text-[22px] font-semibold leading-[1.15] tracking-[-0.01em] sm:text-[24px]">
                {checkedIn ? "Checked in." : "Check in today."}
              </p>
              <p className="mt-2 text-[15px] leading-snug opacity-80 sm:text-[16px]">
                {checkedIn
                  ? rec.streak > 1
                    ? `${rec.streak}-day chain.`
                    : "On the record."
                  : "Same you. Better tomorrow."}
              </p>
              {checkedIn ? (
                <span className="mt-3 inline-flex items-center gap-1 text-[14px] opacity-70">
                  <Check size={14} strokeWidth={2.5} /> Done
                </span>
              ) : null}
            </Note>

            {primaryUpdate ? (
              <Note
                tone="aged"
                rotate={2.8}
                href={primaryUpdate.href}
                ariaLabel={primaryUpdate.title}
                className="min-h-[7.5rem]"
              >
                <p className="text-[20px] font-semibold leading-[1.15] sm:text-[22px]">
                  {primaryUpdate.title}
                </p>
                <p className="mt-2 text-[14px] leading-snug opacity-80 sm:text-[15px]">
                  {clip(primaryUpdate.body, 90)}
                </p>
              </Note>
            ) : null}
          </div>

          {featured ? (
            <div className="relative mx-auto mt-4 max-w-[85%] sm:mt-5 sm:max-w-[80%]">
              <Note
                tone="cream"
                rotate={-1.2}
                href={`/home/read/${featured.slug}`}
                ariaLabel={`Read: ${featured.title}`}
                className="min-h-[8.5rem] px-4 py-4"
              >
                <p className="text-[12px] font-medium uppercase tracking-[0.12em] opacity-55">
                  Read · {featured.readMins} min
                </p>
                <p className="mt-2 text-[24px] font-semibold leading-[1.12] sm:text-[26px]">
                  {featured.title}
                </p>
                <p className="mt-2 text-[15px] leading-snug opacity-75">{clip(featured.hook, 100)}</p>
              </Note>
            </div>
          ) : null}

          <div className="relative mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4">
            {secondaryUpdate ? (
              <Note
                tone="kraft"
                rotate={3.2}
                href={secondaryUpdate.href}
                ariaLabel={secondaryUpdate.title}
                className="min-h-[7rem]"
              >
                <p className="text-[20px] font-semibold leading-[1.15] sm:text-[21px]">
                  {secondaryUpdate.title}
                </p>
                <p className="mt-2 text-[14px] leading-snug opacity-80">{clip(secondaryUpdate.body, 70)}</p>
              </Note>
            ) : (
              <div />
            )}

            {quote ? (
              <Note tone="cream" rotate={-2.5} className="min-h-[7rem]">
                <p className="text-[17px] font-semibold leading-[1.25] sm:text-[18px]">
                  &ldquo;{clip(quote.text, 110)}&rdquo;
                </p>
                <p className="mt-2 text-[13px] opacity-65">&mdash; {quote.author}</p>
              </Note>
            ) : null}
          </div>
        </section>

        <p className="mt-5 text-center text-[11px] text-livv-muted">
          Pin what matters. Work lives in the tabs.
        </p>
      </div>
    </main>
  );
}
