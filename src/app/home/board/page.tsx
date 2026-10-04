"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Caveat } from "next/font/google";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { addEmbers, loadIdentity, type Identity } from "@/lib/identity";
import { checkInRecord, isCheckedInToday, loadRecord, type LivvRecord } from "@/lib/record";
import { feedback } from "@/lib/sensory";
import { dailySummary } from "@/lib/daily";
import { quoteForSession, type Quote } from "@/lib/quotes";
import { embersFromAction } from "@/lib/embers";
import { ANNOUNCEMENTS } from "@/lib/announcements";
import { WIKI, type WikiArticle } from "@/lib/wiki";

const hand = Caveat({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });

type PaperTone = "cream" | "kraft" | "aged";
type PersonalSticky = { id: string; text: string; tone: PaperTone; updatedAt: number };

const STICKY_KEY = "livv-home-stickies-v1";
const MAX_STICKIES = 3;

function clip(text: string, max: number) {
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

function paperStyle(tone: PaperTone): CSSProperties {
  if (tone === "kraft") {
    return {
      background: "linear-gradient(155deg, #d4b896 0%, #c4a574 50%, #b8956a 100%)",
      color: "#2a1f14",
      boxShadow: "0 1px 0 rgba(255,255,255,0.35) inset, 0 8px 20px rgba(0,0,0,0.4), 0 2px 5px rgba(0,0,0,0.22)",
    };
  }
  if (tone === "aged") {
    return {
      background: "linear-gradient(155deg, #e8dfc8 0%, #ddd2b5 50%, #d0c4a4 100%)",
      color: "#2a2418",
      boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 8px 20px rgba(0,0,0,0.4), 0 2px 5px rgba(0,0,0,0.22)",
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
  onClick,
  href,
  ariaLabel,
  disabled,
}: {
  children: ReactNode;
  tone?: PaperTone;
  rotate?: number;
  className?: string;
  onClick?: () => void;
  href?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const base = "relative block w-full p-3 text-left transition active:scale-[0.98] " + hand.className;
  const style: CSSProperties = { ...paperStyle(tone), transform: `rotate(${rotate}deg)` };
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
  if (onClick) {
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

function featuredRead(): WikiArticle | null {
  if (WIKI.length === 0) return null;
  return WIKI[new Date().getDate() % WIKI.length] ?? null;
}

export default function BoardPage() {
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

  const checkIn = () => {
    if (checkedIn) return;
    const result = checkInRecord();
    if (result.already) return;
    feedback("checkin");
    addEmbers(embersFromAction("checkin"));
    const bonus =
      result.emberBonus && [4, 6, 8, 10, 12, 15].includes(result.emberBonus) ? result.emberBonus : 0;
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
      saveStickies(
        stickies.map((s) => (s.id === editingId ? { ...s, text, tone, updatedAt: Date.now() } : s))
      );
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
    <main className="min-h-full text-livv-ink">
      <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-4 sm:px-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Board</p>
            <h1 className="mt-1 text-[22px] font-semibold tracking-tight">The board.</h1>
          </div>
          <button
            type="button"
            onClick={openNewSticky}
            disabled={stickies.length >= MAX_STICKIES}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-livv-border px-3 text-[11px] font-semibold uppercase tracking-[0.1em] disabled:opacity-40"
          >
            <Plus size={14} />
            Note
          </button>
        </div>

        <div
          aria-label="LIVV board"
          className="relative overflow-hidden rounded-[22px] border border-black/20 p-3 sm:p-4"
          style={{
            background: `
              radial-gradient(ellipse at 20% 15%, rgba(180,140,90,0.25), transparent 40%),
              radial-gradient(ellipse at 80% 80%, rgba(60,40,20,0.35), transparent 45%),
              linear-gradient(165deg, #6b4f35 0%, #5a412c 35%, #4a3524 70%, #3d2c1e 100%)
            `,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 8px rgba(0,0,0,0.35), 0 12px 40px rgba(0,0,0,0.25)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
            aria-hidden
          />

          <div className="relative grid grid-cols-2 gap-3 sm:gap-3.5">
            <Note
              tone="cream"
              rotate={-3.5}
              onClick={checkIn}
              disabled={checkedIn}
              ariaLabel={checkedIn ? "Already checked in" : "Check in for today"}
              className="min-h-[6.75rem]"
            >
              <p className="text-[11px] font-bold uppercase tracking-wide opacity-60">Today</p>
              <p className="mt-1 text-[18px] font-semibold leading-tight">
                {checkedIn ? "Present." : "Check in."}
              </p>
            </Note>

            {primaryUpdate ? (
              <Note tone="aged" rotate={2.8} href={primaryUpdate.href} ariaLabel={primaryUpdate.title} className="min-h-[6.75rem]">
                <p className="text-[11px] font-bold uppercase tracking-wide opacity-60">Update</p>
                <p className="mt-1 text-[17px] font-semibold leading-tight">{clip(primaryUpdate.title, 60)}</p>
              </Note>
            ) : null}

            {featured ? (
              <Note
                tone="cream"
                rotate={-1}
                href={`/home/read/${featured.slug}`}
                ariaLabel={`Read: ${featured.title}`}
                className="col-span-2 min-h-[7.6rem] px-3.5 py-3.5"
              >
                <p className="text-[11px] font-bold uppercase tracking-wide opacity-60">Read</p>
                <p className="mt-1 text-[19px] font-semibold leading-tight">{featured.title}</p>
                <p className="mt-2 text-[14px] leading-snug opacity-70">{clip(featured.hook || "", 120)}</p>
              </Note>
            ) : null}

            {secondaryUpdate ? (
              <Note tone="kraft" rotate={3.2} href={secondaryUpdate.href} ariaLabel={secondaryUpdate.title} className="min-h-[6.25rem]">
                <p className="text-[11px] font-bold uppercase tracking-wide opacity-60">Notice</p>
                <p className="mt-1 text-[17px] font-semibold leading-tight">{clip(secondaryUpdate.title, 55)}</p>
              </Note>
            ) : null}

            {quote ? (
              <Note tone="cream" rotate={-2.5} className="min-h-[6.25rem]">
                <p className="text-[16px] font-semibold leading-snug">“{clip(quote.text, 90)}”</p>
                <p className="mt-2 text-[12px] opacity-60">— {quote.author}</p>
              </Note>
            ) : null}

            {stickies.map((sticky, index) => (
              <Note
                key={sticky.id}
                tone={sticky.tone}
                rotate={index % 2 === 0 ? 2.2 : -2.8}
                onClick={() => openEditSticky(sticky)}
                ariaLabel="Edit your note"
                className="min-h-[6.25rem]"
              >
                <p className="text-[11px] font-bold uppercase tracking-wide opacity-60">Yours</p>
                <p className="mt-1 text-[17px] font-semibold leading-[1.15]">{clip(sticky.text, 105)}</p>
              </Note>
            ))}
          </div>
        </div>
      </div>

      {composerOpen ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-[22px] border border-livv-border bg-livv-bg p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-livv-muted">
                {editingId ? "Edit note" : "New note"}
              </p>
              <button type="button" onClick={() => setComposerOpen(false)} className="rounded-full p-2 text-livv-muted" aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={160}
              rows={4}
              placeholder="Write it like a sticky note…"
              className="mt-4 w-full resize-none rounded-xl border border-livv-border bg-transparent p-3 text-[15px] outline-none"
              autoFocus
            />
            <div className="mt-3 flex gap-2">
              {(["cream", "kraft", "aged"] as PaperTone[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={
                    "h-8 flex-1 rounded-full border text-[10px] font-semibold uppercase tracking-wide " +
                    (tone === t ? "border-livv-ink" : "border-livv-border text-livv-muted")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              {editingId ? (
                <button type="button" onClick={deleteSticky} className="inline-flex h-11 items-center gap-1.5 rounded-full border border-livv-border px-4 text-[12px] font-semibold text-red-500">
                  <Trash2 size={14} />
                  Delete
                </button>
              ) : null}
              <button
                type="button"
                onClick={saveSticky}
                disabled={!draft.trim()}
                className="h-11 flex-1 rounded-full bg-[rgb(var(--livv-ink))] px-5 text-[12px] font-semibold text-[rgb(var(--livv-bg))] disabled:opacity-40"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Pencil size={14} />
                  Save
                </span>
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-livv-muted">Up to three personal notes.</p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
