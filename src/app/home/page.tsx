"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Caveat } from "next/font/google";
import { ArrowUpRight, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { addEmbers, loadIdentity, type Identity } from "@/lib/identity";
import { checkInRecord, isCheckedInToday, loadRecord, type LivvRecord } from "@/lib/record";
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

type PaperTone = "cream" | "kraft" | "aged";
type PersonalSticky = {
  id: string;
  text: string;
  tone: PaperTone;
  updatedAt: number;
};

const STICKY_KEY = "livv-home-stickies-v1";
const MAX_STICKIES = 3;

function greetingForHour(hour: number): string {
  if (hour < 5) return "Late night";
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  if (hour < 21) return "Evening";
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

function loadStickies(): PersonalSticky[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STICKY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is PersonalSticky => Boolean(x && typeof x.id === "string" && typeof x.text === "string"))
      .slice(0, MAX_STICKIES);
  } catch {
    return [];
  }
}

function saveStickies(next: PersonalSticky[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STICKY_KEY, JSON.stringify(next.slice(0, MAX_STICKIES)));
  window.dispatchEvent(new Event("livv-home-stickies"));
}

const CORK_STYLE: CSSProperties = {
  backgroundColor: "transparent",
};

function paperStyle(tone: PaperTone): CSSProperties {
  if (tone === "kraft") {
    return {
      background: "linear-gradient(145deg, #c4a882 0%, #b8956a 40%, #a8845c 100%)",
      color: "#2a2118",
      boxShadow: "0 1px 0 rgba(255,255,255,0.2) inset, 0 6px 16px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.2)",
    };
  }
  if (tone === "aged") {
    return {
      background: "linear-gradient(160deg, #e8e0d0 0%, #d9d0bc 50%, #cfc6b0 100%)",
      color: "#2c2820",
      boxShadow: "0 1px 0 rgba(255,255,255,0.35) inset, 0 8px 18px rgba(0,0,0,0.38), 0 2px 4px rgba(0,0,0,0.2)",
    };
  }
  return {
    background: "linear-gradient(155deg, #f7f2e8 0%, #efe8da 45%, #e5dcc8 100%)",
    color: "#1f1a14",
    boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset, 0 8px 20px rgba(0,0,0,0.4), 0 2px 5px rgba(0,0,0,0.22)",
  };
}

function Thumbtack() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-0 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        background: "radial-gradient(circle at 35% 30%, #f0f0f0 0%, #a8a8a8 40%, #5a5a5a 75%, #2a2a2a 100%)",
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
  const base = "relative block w-full p-3 text-left transition active:scale-[0.98] " + hand.className;
  const style: CSSProperties = { ...paperStyle(tone), transform: `rotate(${rotate}deg)` };
  const inner = <><Thumbtack /><div className="pt-0.5">{children}</div></>;

  if (href && !disabled) {
    return <Link href={href} aria-label={ariaLabel} className={`${base} ${className}`} style={style}>{inner}</Link>;
  }
  if (Comp === "button" || onClick) {
    return <button type="button" onClick={onClick} disabled={disabled} aria-label={ariaLabel} className={`${base} ${className} disabled:opacity-90`} style={style}>{inner}</button>;
  }
  return <div className={`${base} ${className}`} style={style} aria-label={ariaLabel}>{inner}</div>;
}

export default function HomePage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [me, setMe] = useState<Identity | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [stickies, setStickies] = useState<PersonalSticky[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [tone, setTone] = useState<PaperTone>("cream");
  const [composerOpen, setComposerOpen] = useState(false);

  const pull = () => {
    setRec(loadRecord());
    setMe(loadIdentity());
    dailySummary();
  };

  useEffect(() => {
    pull();
    setQuote(quoteForSession());
    setStickies(loadStickies());
    const events = ["livv-identity", "livv-record", "livv-daily"];
    events.forEach((e) => window.addEventListener(e, pull));
    const syncStickies = () => setStickies(loadStickies());
    window.addEventListener("livv-home-stickies", syncStickies);
    return () => {
      events.forEach((e) => window.removeEventListener(e, pull));
      window.removeEventListener("livv-home-stickies", syncStickies);
    };
  }, []);

  const featured = useMemo(() => featuredRead(), []);
  const primaryUpdate = ANNOUNCEMENTS[0];
  const secondaryUpdate = ANNOUNCEMENTS[1];

  if (!rec || !me) return <main className="min-h-dvh" />;

  const checkedIn = isCheckedInToday(rec);
  const name = displayNameForGreeting(me);
  const hello = greetingForHour(new Date().getHours());
  const dateLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const lastWorkout = rec.lastWorkout;
  const lastWorkoutDate = lastWorkout
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(lastWorkout.at))
    : null;

  const checkIn = () => {
    if (checkedIn) return;
    const result = checkInRecord();
    if (result.already) return;
    feedback("checkin");
    addEmbers(embersFromAction("checkin"));
    const bonus = result.emberBonus && [4, 6, 8, 10, 12, 15].includes(result.emberBonus) ? result.emberBonus : 0;
    if (bonus) addEmbers(bonus, `ember-checkin-bonus-${Date.now()}`);
    pull();
  };

  const openNewSticky = () => {
    setEditingId(null);
    setDraft("");
    setTone(stickies.length % 2 === 0 ? "cream" : "kraft");
    setComposerOpen(true);
  };

  const openEditSticky = (sticky: PersonalSticky) => {
    setEditingId(sticky.id);
    setDraft(sticky.text);
    setTone(sticky.tone);
    setComposerOpen(true);
  };

  const saveSticky = () => {
    const text = draft.trim().replace(/\s+/g, " ");
    if (!text) return;
    if (editingId) {
      saveStickies(stickies.map((s) => s.id === editingId ? { ...s, text, tone, updatedAt: Date.now() } : s));
    } else if (stickies.length < MAX_STICKIES) {
      saveStickies([...stickies, { id: `sticky_${Date.now()}`, text, tone, updatedAt: Date.now() }]);
    }
    setStickies(loadStickies());
    setEditingId(null);
    setDraft("");
    setComposerOpen(false);
  };

  const deleteSticky = () => {
    if (!editingId) return;
    saveStickies(stickies.filter((s) => s.id !== editingId));
    setStickies(loadStickies());
    setEditingId(null);
    setDraft("");
    setComposerOpen(false);
  };

  return (
    <main className="livv-page min-h-full pb-20">
      <div className="mx-auto flex w-full max-w-xl flex-col px-3 sm:px-4">
        <header className="px-1 pt-4 pb-5">
          <div className="flex items-end justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-livv-muted">{dateLabel}</p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.05em] text-[rgb(var(--livv-ink))]">
                {hello}, {name}.
              </h1>
            </div>
            <div className="shrink-0 border-l border-[var(--livv-pro-line)] pl-4 text-right">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Embers</p>
              <p className="mt-1 text-[17px] font-semibold tabular-nums text-[rgb(var(--livv-ink))]">{me.embers}</p>
            </div>
          </div>
          <p className="mt-4 max-w-[31rem] text-[14px] leading-6 text-livv-muted">
            {checkedIn ? "You're on the board. Keep the rest of today honest." : "A new day. Put something real on the board."}
          </p>
        </header>

        <section
          className="relative px-0.5 py-2 sm:px-1 sm:py-3"
          aria-label="LIVV bulletin board"
        >
          

          <div className="relative mb-3 flex items-center justify-between px-1">
            <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45">
              <span>LIVV / TODAY</span>
              <span className="mx-2 text-white/20">/</span>
              <span>{rec.streak > 0 ? `${rec.streak} day chain` : "Start your chain"}</span>
            </div>
            {stickies.length < MAX_STICKIES ? (
              <button
                type="button"
                onClick={openNewSticky}
                className="relative z-20 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/80 transition active:scale-[0.97]"
                aria-label="Add a personal pin"
              >
                <Plus size={13} strokeWidth={2.5} /> Add pin
              </button>
            ) : null}
          </div>

          <div className="relative grid grid-cols-2 gap-2.5 sm:gap-3">
            <Note tone="cream" rotate={-3.5} as="button" onClick={checkIn} disabled={checkedIn} ariaLabel={checkedIn ? "Already checked in" : "Check in for today"} className="min-h-[6.75rem]">
              <p className="text-[20px] font-semibold leading-[1.12] sm:text-[22px]">{checkedIn ? "Checked in." : "Check in today."}</p>
              <p className="mt-1.5 text-[14px] leading-snug opacity-80">{checkedIn ? (rec.streak > 1 ? `${rec.streak}-day chain.` : "On the record.") : "Same you. Better tomorrow."}</p>
              {checkedIn ? <span className="mt-2 inline-flex items-center gap-1 text-[13px] opacity-70"><Check size={13} strokeWidth={2.5} /> Done</span> : null}
            </Note>

            {primaryUpdate ? (
              <Note tone="aged" rotate={2.8} href={primaryUpdate.href} ariaLabel={primaryUpdate.title} className="min-h-[6.75rem]">
                <p className="text-[18px] font-semibold leading-[1.12] sm:text-[20px]">{primaryUpdate.title}</p>
                <p className="mt-1.5 text-[13px] leading-snug opacity-80">{clip(primaryUpdate.body, 85)}</p>
              </Note>
            ) : null}

            {featured ? (
              <Note tone="cream" rotate={-1} href={`/home/read/${featured.slug}`} ariaLabel={`Read: ${featured.title}`} className="col-span-2 min-h-[7.6rem] px-3.5 py-3.5">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] opacity-55">Read · {featured.readMins} min</p>
                <p className="mt-1.5 max-w-[24ch] text-[23px] font-semibold leading-[1.06] sm:text-[25px]">{featured.title}</p>
                <p className="mt-1.5 max-w-[42ch] text-[14px] leading-snug opacity-75">{clip(featured.hook, 100)}</p>
              </Note>
            ) : null}

            {secondaryUpdate ? (
              <Note tone="kraft" rotate={3.2} href={secondaryUpdate.href} ariaLabel={secondaryUpdate.title} className="min-h-[6.25rem]">
                <p className="text-[18px] font-semibold leading-[1.12] sm:text-[19px]">{secondaryUpdate.title}</p>
                <p className="mt-1.5 text-[13px] leading-snug opacity-80">{clip(secondaryUpdate.body, 65)}</p>
              </Note>
            ) : null}

            {quote ? (
              <Note tone="cream" rotate={-2.5} className="min-h-[6.25rem]">
                <p className="text-[16px] font-semibold leading-[1.22] sm:text-[17px]">&ldquo;{clip(quote.text, 100)}&rdquo;</p>
                <p className="mt-1.5 text-[12px] opacity-65">&mdash; {quote.author}</p>
              </Note>
            ) : null}

            {stickies.map((sticky, index) => (
              <Note
                key={sticky.id}
                tone={sticky.tone}
                rotate={index % 2 === 0 ? -2.4 : 2.4}
                as="button"
                onClick={() => openEditSticky(sticky)}
                ariaLabel="Edit your pinned note"
                className="min-h-[5.75rem]"
              >
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] opacity-45">Pinned by you</p>
                <p className="text-[17px] font-semibold leading-[1.15]">{clip(sticky.text, 105)}</p>
                <Pencil size={12} className="absolute bottom-2.5 right-2.5 opacity-35" />
              </Note>
            ))}

            {stickies.length < MAX_STICKIES ? (
              <button
                type="button"
                onClick={openNewSticky}
                aria-label="Pin a personal note"
                className={`relative block min-h-[5.75rem] w-full p-3 text-left transition active:scale-[0.98] ${hand.className}`}
                style={{ ...paperStyle(stickies.length === 0 ? "aged" : "kraft"), transform: `rotate(${stickies.length % 2 === 0 ? 2.8 : -2.2}deg)` }}
              >
                <Thumbtack />
                <span className="flex h-full min-h-[4.8rem] flex-col justify-between">
                  <span className="flex items-center gap-2 text-[17px] font-semibold leading-tight">
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-black/20"><Plus size={15} strokeWidth={2.5} /></span>
                    Add a personal pin
                  </span>
                  <span className="text-[12px] leading-snug opacity-65">
                    Goal, reminder, idea, or sentence. Up to {MAX_STICKIES - stickies.length} {MAX_STICKIES - stickies.length === 1 ? "spot" : "spots"} left.
                  </span>
                </span>
              </button>
            ) : null}
          </div>
        </section>

        <section className="mt-10 border-t border-[var(--livv-pro-line)] pt-7" aria-label="What’s next">
          <div className="mb-5 flex items-center justify-between px-1">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-livv-muted">Keep moving</p>
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-livv-muted">Your next move</span>
          </div>

          <Link
            href="/home/train"
            className="group block px-1 pb-6"
          >
            <div className="flex items-end justify-between gap-5">
              <div className="min-w-0">
                <p className="text-[27px] font-semibold tracking-[-0.045em] text-[rgb(var(--livv-ink))]">
                  {lastWorkout ? "Pick up where you left off." : "Start with your body."}
                </p>
                <p className="mt-2 text-[14px] leading-6 text-livv-muted">
                  {lastWorkout
                    ? `${lastWorkout.name} · ${lastWorkout.duration} · ${lastWorkoutDate}`
                    : "Your first session is waiting."}
                </p>
              </div>
              <span className="mb-0.5 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[var(--livv-pro-line)] transition group-active:scale-95">
                <ArrowUpRight size={18} />
              </span>
            </div>
          </Link>

          <div className="mt-1 flex items-center justify-between border-t border-[var(--livv-pro-line)] px-1 pt-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.19em] text-livv-muted">
              {stickies.length}/{MAX_STICKIES} personal pins
            </span>
            {stickies.length < MAX_STICKIES ? (
              <button
                type="button"
                onClick={openNewSticky}
                className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[rgb(var(--livv-ink))]"
              >
                Add a pin ↗
              </button>
            ) : (
              <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-livv-muted">
                Board full
              </span>
            )}
          </div>
        </section>
      </div>

      {composerOpen ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 backdrop-blur-[2px] sm:items-center">
          <div className="w-full max-w-md rounded-[24px] border border-[var(--livv-pro-line)] bg-[var(--livv-pro-bg)] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Personal pin</p>
                <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.03em]">Put something on your board.</h2>
              </div>
              <button type="button" onClick={() => { setEditingId(null); setDraft(""); setComposerOpen(false); }} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--livv-pro-line)]" aria-label="Close"><X size={17} /></button>
            </div>

            <textarea
              autoFocus
              value={draft}
              maxLength={140}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What do you want to keep in sight?"
              className="mt-5 min-h-[120px] w-full resize-none rounded-[16px] border border-[var(--livv-pro-line)] bg-transparent p-4 text-[17px] leading-relaxed outline-none placeholder:text-livv-muted focus:border-[rgb(var(--livv-accent))]"
            />

            <div className="mt-4 flex gap-2">
              {(["cream", "kraft", "aged"] as PaperTone[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTone(option)}
                  className={`h-9 flex-1 rounded-full border text-[10px] font-semibold uppercase tracking-[0.12em] ${tone === option ? "border-[rgb(var(--livv-accent))]" : "border-[var(--livv-pro-line)]"}`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-5 flex gap-2">
              {editingId ? (
                <button type="button" onClick={deleteSticky} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--livv-pro-line)] text-red-400" aria-label="Delete pinned note"><Trash2 size={16} /></button>
              ) : null}
              <button
                type="button"
                disabled={!draft.trim()}
                onClick={saveSticky}
                className="h-11 flex-1 rounded-full bg-[rgb(var(--livv-ink))] px-5 text-[12px] font-semibold text-[rgb(var(--livv-bg))] disabled:opacity-40"
              >
                {editingId ? "Update pin" : "Pin to board"}
              </button>
            </div>
            <p className="mt-3 text-center text-[10px] text-livv-muted">Keep it short. Your board can hold up to three.</p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
