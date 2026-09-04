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
import { actionsCompletedCount, contextGreeting, nextMove } from "@/lib/command";
import { evolutionTitle } from "@/lib/levels";
import { feedback } from "@/lib/sensory";
import { claimPacksIfDue, canClaimPacks } from "@/lib/packs";
import { quoteForSession, type Quote } from "@/lib/quotes";
import { dailySummary } from "@/lib/daily";

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
  const [daily, setDaily] = useState(() =>
    typeof window !== "undefined" ? dailySummary() : null
  );

  const pull = () => {
    setRec(loadRecord());
    setMe(loadIdentity());
    setDaily(dailySummary());
  };

  useEffect(() => {
    pull();
    setQuote(quoteForSession());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    window.addEventListener("livv-identity", pull);
    window.addEventListener("livv-record", pull);
    window.addEventListener("livv-daily", pull);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("livv-identity", pull);
      window.removeEventListener("livv-record", pull);
      window.removeEventListener("livv-daily", pull);
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

  if (!rec || !me) return <main className="min-h-dvh bg-[#050505]" />;

  const tier = getTier(me.tier);
  const greet = contextGreeting(now, rec);
  const move = nextMove(rec);
  const { done, total, pillars } = actionsCompletedCount(rec);
  const nodes = [...pillars, { id: "self", name: "Self", done: isCheckedInToday(rec) }];
  const evo = evolutionTitle(rec.level);
  const xpPct = Math.min(100, Math.round((rec.currentXp / rec.xpToNext) * 100));
  const quiet = missedYesterday(rec);
  const checkedIn = isCheckedInToday(rec);
  const dateLabel = now
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
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

  const dailyLeft = daily ? daily.total - daily.done : 3;

  return (
    <main className="relative min-h-full overflow-hidden bg-[#050505] pb-10 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[-14rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgb(var(--livv-accent) / 0.18) 0%, transparent 64%)",
          }}
        />
        <AmbientField intensity="strong" />
        <div className="livv-grain opacity-[0.045]" />
      </div>

      <div className="relative z-10 mx-auto max-w-xl px-5 pt-5">
        <header className="flex items-center justify-between">
          <Link href="/home" aria-label="LIVV home" className="group flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="LIVV" className="h-8 w-8 object-contain transition group-active:scale-95" />
            <span className="text-[10px] font-semibold tracking-[0.32em] text-white/35">LIVV</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/home/messages"
              className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/45"
            >
              Inbox
            </Link>
            <Link href="/home/profile" aria-label="Profile">
              <Avatar identity={me} size={34} showTierRing />
            </Link>
          </div>
        </header>

        {/* World state + quote */}
        <section className="relative mt-9 overflow-hidden rounded-[34px] border border-white/[0.09] bg-white/[0.025] px-6 pb-7 pt-6 shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-livv-accent/60 to-transparent" />
          <div className="relative flex items-start justify-between gap-5">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-livv-accent-soft">
                {daily?.world.title || dateLabel}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/30">
                {daily?.world.focus || greet.salutation}
              </p>
              <h1 className="font-display mt-3 text-[28px] font-semibold leading-[0.95] tracking-[-0.04em]">
                {daily?.world.line || "Your life is moving."}
              </h1>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[9px] uppercase tracking-[0.24em] text-white/25">Streak</p>
              <p className="font-display mt-1 text-3xl font-semibold tracking-tight">{rec.streak}</p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/25">days</p>
            </div>
          </div>
          {quote && (
            <blockquote className="relative mt-8 border-l border-livv-accent/45 pl-4">
              <p className="font-display text-[16px] font-medium leading-snug tracking-tight text-white/80">
                “{quote.text}”
              </p>
              <footer className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/25">
                {quote.author}
              </footer>
            </blockquote>
          )}
          {daily?.callback && (
            <p className="mt-5 text-[12px] leading-relaxed text-white/40">
              30 days ago you wrote about something you were avoiding.{" "}
              <Link href="/home/daily" className="text-livv-accent-soft">
                See it →
              </Link>
            </p>
          )}
        </section>

        {/* DAILY DROP CTA — the retention hook */}
        <Link href="/home/daily" className="mt-5 block" onClick={() => feedback("tick")}>
          <div
            className="relative overflow-hidden rounded-[28px] border px-5 py-5 transition active:scale-[0.99]"
            style={{
              borderColor: daily?.allDone
                ? "rgb(var(--livv-accent) / 0.35)"
                : "rgba(255,255,255,0.08)",
              background: daily?.allDone
                ? "linear-gradient(135deg, rgb(var(--livv-accent) / 0.18), rgba(255,255,255,0.03))"
                : "rgba(255,255,255,0.025)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-livv-accent-soft">
                  Today · The Daily Drop
                </p>
                <p className="font-display mt-2 text-[22px] font-semibold tracking-tight">
                  {daily?.dropClaimed
                    ? "Drop claimed"
                    : daily?.allDone
                      ? "Drop ready — open it"
                      : `${dailyLeft} thing${dailyLeft === 1 ? "" : "s"} waiting`}
                </p>
                <p className="mt-1 text-[12px] text-white/40">
                  Mind · Body · Life
                  {daily && !daily.dropClaimed
                    ? ` → ${daily.drop.name}`
                    : ""}
                  {daily?.doubleXp ? " · 2× XP on" : ""}
                </p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-xl">
                {daily?.dropClaimed ? "✓" : daily?.allDone ? daily.drop.icon : "→"}
              </span>
            </div>
            {daily && (
              <div className="mt-4 flex gap-1.5">
                {daily.tasks.map((t) => (
                  <span
                    key={t.id}
                    className={`h-1 flex-1 rounded-full ${
                      daily.done > daily.tasks.findIndex((x) => x.id === t.id) ||
                      (typeof window !== "undefined" &&
                        dailySummary().done >=
                          daily.tasks.findIndex((x) => x.id === t.id) + 1)
                        ? "bg-livv-accent"
                        : "bg-white/10"
                    }`}
                    style={{
                      background:
                        daily.tasks
                          .slice(0, daily.done)
                          .some((x) => x.id === t.id) || completedIncludes(daily, t.id)
                          ? undefined
                          : undefined,
                    }}
                  />
                ))}
                {/* simpler progress bars */}
              </div>
            )}
            {daily && (
              <div className="mt-3 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full ${i < daily.done ? "bg-livv-accent" : "bg-white/10"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>

        <section className="mt-5 grid grid-cols-[1fr_auto] gap-3">
          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">Evolution</p>
                <p className="font-display mt-1 text-4xl font-semibold leading-none tracking-[-0.04em]">
                  {rec.level}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/30">
                  {rec.currentXp} / {rec.xpToNext}
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-livv-accent-soft">XP</p>
              </div>
            </div>
            <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-livv-accent transition-all duration-700"
                style={{ width: `${xpPct}%`, boxShadow: "0 0 18px rgb(var(--livv-accent) / 0.7)" }}
              />
            </div>
            <p className="mt-3 text-[11px] text-white/35">{evo.name}</p>
          </div>

          <Link
            href="/home/progress"
            className="flex min-w-[92px] flex-col justify-between rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-4 backdrop-blur-xl transition active:scale-[0.98]"
          >
            <span className="text-[9px] uppercase tracking-[0.26em] text-white/25">Signal</span>
            <span className="font-display text-3xl font-semibold">{done}</span>
            <span className="text-[9px] uppercase tracking-[0.16em] text-white/25">of {total}</span>
          </Link>
        </section>

        <section className="mt-6">
          <button
            type="button"
            onClick={onPrimary}
            disabled={move.href === "/home" && checkedIn}
            className="group relative w-full overflow-hidden rounded-[34px] border border-livv-accent/25 text-left shadow-[0_18px_70px_rgb(var(--livv-accent)/0.12)] transition duration-300 active:scale-[0.99] disabled:cursor-default"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-livv-accent/20 via-white/[0.035] to-transparent" />
            <div className="relative p-6">
              <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-livv-accent-soft">
                Command
              </p>
              <p className="font-display mt-3 max-w-[13ch] text-[28px] font-semibold leading-[0.96] tracking-[-0.04em]">
                {move.title}
              </p>
              <p className="mt-4 max-w-[34ch] text-[13px] leading-relaxed text-white/45">{move.reason}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-black">
                  {move.href === "/home" && checkedIn ? "Logged" : move.cta}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">Next move</span>
              </div>
            </div>
          </button>
        </section>

        <section className="mt-9">
          <div className="mb-4 flex items-end justify-between px-1">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-white/25">Life system</p>
              <p className="mt-1 text-[14px] font-medium text-white/70">
                {done === total ? "Everything is aligned." : `${done} of ${total} signals active`}
              </p>
            </div>
            <Link href="/home/progress" className="text-[10px] uppercase tracking-[0.18em] text-white/25">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                className="group relative overflow-hidden rounded-[25px] border border-white/[0.07] bg-white/[0.025] p-4 text-left backdrop-blur-xl transition active:scale-[0.98]"
              >
                <div className="relative flex items-center justify-between">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                      n.done ? "border-livv-accent/35 bg-livv-accent/15" : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        n.done ? "bg-livv-accent shadow-[0_0_12px_rgb(var(--livv-accent)/0.9)]" : "bg-white/20"
                      }`}
                    />
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.18em] text-white/20">
                    {n.done ? "On" : "Open"}
                  </span>
                </div>
                <p
                  className={`relative mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    n.done ? "text-white/75" : "text-white/35"
                  }`}
                >
                  {n.name}
                </p>
              </button>
            ))}
          </div>
        </section>

        {(recent.length > 0 || quiet) && (
          <section className="mt-9 rounded-[28px] border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-xl">
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-white/25">Momentum</p>
            {quiet && (
              <p className="mt-4 rounded-2xl bg-white/[0.025] px-4 py-3 text-[12px] text-white/35">
                Yesterday was quiet. Data, not failure.
              </p>
            )}
            {recent.length > 0 && (
              <ul className="mt-4 space-y-2">
                {recent.map((item, i) => (
                  <li
                    key={`${item}-${i}`}
                    className="flex items-center gap-3 rounded-2xl bg-white/[0.02] px-3 py-2.5 text-[12px] text-white/50"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-livv-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <nav className="mt-9 grid grid-cols-4 gap-2" aria-label="LIVV destinations">
          {[
            ["Daily", "/home/daily"],
            ["Progress", "/home/progress"],
            ["Evala", "/home/evala"],
            ["Packs", "/home/packs"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.018] px-2 py-3 text-center text-[9px] font-medium uppercase tracking-[0.16em] text-white/30 transition hover:text-white/55 active:scale-[0.98]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="mt-8 text-center text-[9px] uppercase tracking-[0.28em] text-white/15">{evo.line}</p>
      </div>
    </main>
  );
}

function completedIncludes(
  daily: NonNullable<ReturnType<typeof dailySummary>>,
  id: string
) {
  return daily.done > daily.tasks.findIndex((t) => t.id === id);
}
