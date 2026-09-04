"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/identity/avatar";
import { AmbientField } from "@/components/layout/ambient-field";
import { addEmbers, loadIdentity, type Identity } from "@/lib/identity";
import { getTier } from "@/lib/membership";
import {
  checkInRecord,
  isCheckedInToday,
  loadRecord,
  missedYesterday,
  todaysCustom,
  todaysObjectives,
  type LivvRecord,
} from "@/lib/record";
import {
  actionsCompletedCount,
  contextGreeting,
  nextMove,
} from "@/lib/command";
import { evolutionTitle } from "@/lib/levels";
import { feedback } from "@/lib/sensory";
import { claimPacksIfDue, canClaimPacks } from "@/lib/packs";
import { quoteForSession, type Quote } from "@/lib/quotes";

const LOGO =
  "https://raw.githubusercontent.com/evolvewithlivv/livv/main/Photoroom_20260831_123254.png";

const PILLAR_HREF: Record<string, string> = {
  body: "/home/train",
  mind: "/home/evala",
  career: "/home/evala",
  finance: "/home/evala",
  social: "/home/connect",
  self: "/home",
};

export default function HomePage() {
  const router = useRouter();
  const [now, setNow] = useState(() => new Date());
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [me, setMe] = useState<Identity | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  const pull = () => {
    setRec(loadRecord());
    setMe(loadIdentity());
  };

  useEffect(() => {
    pull();
    setQuote(quoteForSession());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    window.addEventListener("livv-identity", pull);
    window.addEventListener("livv-record", pull);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("livv-identity", pull);
      window.removeEventListener("livv-record", pull);
    };
  }, []);

  const recent = useMemo(() => {
    if (!rec) return [] as string[];
    const items: string[] = [];
    if (isCheckedInToday(rec)) items.push("Checked in");
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (rec.days[key]?.workout) items.push(rec.lastWorkout?.name || "Training session");
    todaysObjectives(rec)
      .filter((o) => o.completed)
      .forEach((o) => items.push(o.title));
    todaysCustom(rec).forEach((c) => items.push(c.title));
    return items.slice(0, 4);
  }, [rec, now]);

  if (!rec || !me) {
    return <main className="min-h-dvh bg-[#050505]" />;
  }

  const tier = getTier(me.tier);
  const greet = contextGreeting(now, rec);
  const move = nextMove(rec);
  const { done, total, pillars } = actionsCompletedCount(rec);
  const nodes = [
    ...pillars,
    { id: "self", name: "Self", done: isCheckedInToday(rec) },
  ];
  const evo = evolutionTitle(rec.level);
  const xpPct = Math.min(100, Math.round((rec.currentXp / rec.xpToNext) * 100));
  const quiet = missedYesterday(rec);
  const checkedIn = isCheckedInToday(rec);

  const dateLabel = now
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  const onPrimary = () => {
    if (move.href === "/home") {
      const { already, emberBonus } = checkInRecord();
      if (!already) {
        feedback("checkin");
        addEmbers(10 * tier.multiplier + (emberBonus || 0));
        if (canClaimPacks(me.tier)) claimPacksIfDue();
        pull();
      }
      return;
    }
    feedback("tick");
    router.push(move.href);
  };

  return (
    <main className="relative min-h-full overflow-hidden pb-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div
          className="absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full"
          style={{
            background: `radial-gradient(circle, rgb(var(--livv-accent) / 0.14) 0%, transparent 65%)`,
          }}
        />
        <AmbientField intensity="strong" />
        <div className="livv-grain opacity-[0.035]" />
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-5 pt-5">
        <header className="flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="LIVV" className="h-8 w-8 object-contain opacity-95" />
          <div className="flex items-center gap-3">
            <Link href="/home/messages" className="text-[12px] text-white/40">
              DM
            </Link>
            <Link href="/home/profile">
              <Avatar identity={me} size={34} showTierRing />
            </Link>
          </div>
        </header>

        <div className="mt-10 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/35">
            {dateLabel}
          </p>
          {quote && (
            <blockquote className="mt-6">
              <p className="font-display text-[22px] font-semibold leading-snug tracking-tight text-white/95">
                “{quote.text}”
              </p>
              <footer className="mt-4 text-[12px] tracking-wide text-white/35">
                — {quote.author}
              </footer>
            </blockquote>
          )}
          {quiet && (
            <p className="mt-4 text-[13px] text-white/40">
              Yesterday was quiet. Data, not failure.
            </p>
          )}
        </div>

        <section className="mt-12">
          <div className="flex items-end justify-between px-1">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Evolution</p>
              <p className="font-display mt-1 text-[42px] font-semibold leading-none tracking-tight">
                {rec.level}
              </p>
              <p className="mt-1 text-[13px] uppercase tracking-[0.18em] text-livv-accent-soft">
                {evo.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/30">
                {rec.streak > 0 ? `Day ${rec.streak}` : "No chain"}
              </p>
              <p className="mt-1 text-[11px] text-white/25">
                {rec.currentXp}/{rec.xpToNext} XP
              </p>
            </div>
          </div>
          <div className="relative mt-5 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${xpPct}%`,
                background: "linear-gradient(90deg, rgb(var(--livv-accent) / 0.4), rgb(var(--livv-accent)))",
                boxShadow: "0 0 12px rgb(var(--livv-accent) / 0.6)",
              }}
            />
          </div>
          <p className="mt-3 text-[12px] text-white/35">{evo.line}</p>
        </section>

        <button
          type="button"
          onClick={onPrimary}
          disabled={move.href === "/home" && checkedIn}
          className="group relative mt-10 w-full overflow-hidden rounded-[28px] text-left"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgb(var(--livv-accent) / 0.22), rgba(255,255,255,0.03) 55%, rgb(var(--livv-accent) / 0.08))",
            }}
          />
          <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" />
          <div className="relative px-6 py-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-livv-accent-soft">
              Next move
            </p>
            <p className="font-display mt-2 text-[26px] font-semibold leading-none tracking-tight">
              {move.title}
            </p>
            <p className="mt-2 max-w-[28ch] text-[14px] leading-snug text-white/50">{move.reason}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-black transition group-active:scale-[0.98]">
              {move.href === "/home" && checkedIn ? "Logged" : move.cta}
              <span aria-hidden className="text-black/50">
                →
              </span>
            </div>
          </div>
        </button>

        <section className="mt-12">
          <div className="mb-5 px-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/30">
              Life system
            </p>
            <p className="mt-1 text-[15px] font-medium text-white/80">
              {done === total ? "You’re clear." : `${done} / ${total} with signal`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-x-3 gap-y-6">
            {nodes.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  feedback("tick");
                  if (n.id === "self") {
                    if (!checkedIn) onPrimary();
                    return;
                  }
                  router.push(PILLAR_HREF[n.id] || "/home/evala");
                }}
                className="flex flex-col items-center gap-2.5"
              >
                <span
                  className="relative flex h-14 w-14 items-center justify-center rounded-full transition"
                  style={{
                    background: n.done
                      ? `radial-gradient(circle at 35% 30%, rgb(var(--livv-accent) / 0.55), rgb(var(--livv-accent) / 0.12))`
                      : "rgba(255,255,255,0.03)",
                    boxShadow: n.done
                      ? `0 0 24px rgb(var(--livv-accent) / 0.35)`
                      : "inset 0 0 0 1px rgba(255,255,255,0.08)",
                  }}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${n.done ? "bg-white" : "bg-white/25"}`}
                  />
                </span>
                <span
                  className={`text-[11px] font-medium tracking-[0.12em] ${
                    n.done ? "text-white/80" : "text-white/30"
                  }`}
                >
                  {n.name.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </section>

        {recent.length > 0 && (
          <section className="mt-12 border-t border-white/[0.06] pt-8">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/30">
              Recent momentum
            </p>
            <ul className="mt-4 space-y-3">
              {recent.map((item, i) => (
                <li key={`${item}-${i}`} className="flex items-center gap-3 text-[14px] text-white/55">
                  <span className="h-1.5 w-1.5 rounded-full bg-livv-accent/80" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px]">
          <Link href="/home/progress" className="text-livv-accent-soft">
            Progress
          </Link>
          <Link href="/home/packs" className="text-white/45">
            Packs
          </Link>
          <Link href="/home/evala" className="text-white/35">
            Evala
          </Link>
          <Link href="/home/messages" className="text-white/35">
            Messages
          </Link>
        </div>

        <p className="mt-10 text-center text-[11px] text-white/20">{greet.salutation}</p>
      </div>
    </main>
  );
}
