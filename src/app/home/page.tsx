"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { addEmbers, loadIdentity, type Identity } from "@/lib/identity";
import {
  checkInRecord,
  isCheckedInToday,
  loadRecord,
  missedYesterday,
  weekBars,
  type LivvRecord,
} from "@/lib/record";
import { dayKey } from "@/lib/dates";
import { feedback } from "@/lib/sensory";
import { dailySummary } from "@/lib/daily";
import { embersFromAction } from "@/lib/embers";

type Phase = "dawn" | "day" | "evening" | "night";

type Signal = {
  phase: Phase;
  phaseLabel: string;
  line: string;
  under?: string;
  act?: { label: string; href: string };
  canMark: boolean;
};

function phaseForHour(hour: number): { phase: Phase; phaseLabel: string } {
  if (hour < 5) return { phase: "night", phaseLabel: "Night" };
  if (hour < 11) return { phase: "dawn", phaseLabel: "Morning" };
  if (hour < 17) return { phase: "day", phaseLabel: "Afternoon" };
  if (hour < 21) return { phase: "evening", phaseLabel: "Evening" };
  return { phase: "night", phaseLabel: "Night" };
}

function buildSignal(rec: LivvRecord, now = new Date()): Signal {
  const hour = now.getHours();
  const { phase, phaseLabel } = phaseForHour(hour);
  const today = dayKey(now);
  const day = rec.days[today];
  const trained = Boolean(day?.workout);
  const checkedIn = Boolean(day?.checkIn);
  const objectivesDone = day?.objectives?.length ?? 0;
  const hasAnyHistory =
    rec.workoutsCompleted + rec.goalsCompleted + (rec.streak || 0) > 0;
  const thinChain = missedYesterday(rec) && rec.streak > 0;
  const weekActive = weekBars(rec).filter((b) => b.active).length;

  if (!hasAnyHistory && !trained && !checkedIn && objectivesDone === 0) {
    return {
      phase,
      phaseLabel,
      line: "Nothing is recorded yet.",
      under: "Capability is evidence. Train once or mark the day — the system starts from that.",
      act: { label: "Open Train", href: "/home/train" },
      canMark: true,
    };
  }

  if (thinChain && !checkedIn && !trained) {
    return {
      phase,
      phaseLabel,
      line: "The chain is thin.",
      under: "Yesterday went quiet. One real mark today keeps the line continuous.",
      act: { label: "Open Daily", href: "/home/daily" },
      canMark: true,
    };
  }

  if (!trained && (phase === "dawn" || phase === "day")) {
    return {
      phase,
      phaseLabel,
      line: "The body has not been asked yet.",
      under:
        phase === "dawn"
          ? "Morning is still open. Motion before negotiation."
          : "The day is moving. Train before it decides without you.",
      act: { label: "Train", href: "/home/train" },
      canMark: !checkedIn,
    };
  }

  if (!trained && (phase === "evening" || phase === "night")) {
    return {
      phase,
      phaseLabel,
      line: "No session on the record today.",
      under: "Still recoverable — a short session counts. Or mark presence and protect sleep.",
      act: { label: "Train", href: "/home/train" },
      canMark: !checkedIn,
    };
  }

  if (trained && !checkedIn) {
    return {
      phase,
      phaseLabel,
      line: "The body answered.",
      under: "Session is logged. Close the day so the chain holds.",
      canMark: true,
    };
  }

  if (trained && checkedIn) {
    if (phase === "evening" || phase === "night") {
      return {
        phase,
        phaseLabel,
        line: "The work is on the record.",
        under:
          weekActive >= 5
            ? "A dense week. Protect recovery — sleep is still training."
            : "Enough for today. Do not invent extra work to feel useful.",
        act: { label: "Open Health", href: "/home/health" },
        canMark: false,
      };
    }
    return {
      phase,
      phaseLabel,
      line: "You already moved.",
      under: "Keep the rest of the day clean. Attention is a resource.",
      act: { label: "Open Daily", href: "/home/daily" },
      canMark: false,
    };
  }

  if (checkedIn && !trained) {
    return {
      phase,
      phaseLabel,
      line: "Present. Not yet trained.",
      under: "Presence is marked. The body still has room to work.",
      act: { label: "Train", href: "/home/train" },
      canMark: false,
    };
  }

  return {
    phase,
    phaseLabel,
    line: "Hold the standard.",
    under: "Use Daily, Train, or Health when you need them. Leave the rest alone.",
    canMark: !checkedIn,
  };
}

export default function HomePage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [me, setMe] = useState<Identity | null>(null);
  const [now, setNow] = useState(() => new Date());

  const pull = () => {
    setRec(loadRecord());
    setMe(loadIdentity());
    dailySummary();
    setNow(new Date());
  };

  useEffect(() => {
    pull();
    const events = ["livv-identity", "livv-record", "livv-daily"];
    events.forEach((e) => window.addEventListener(e, pull));
    return () => events.forEach((e) => window.removeEventListener(e, pull));
  }, []);

  const signal = useMemo(() => (rec ? buildSignal(rec, now) : null), [rec, now]);
  const bars = useMemo(() => (rec ? weekBars(rec) : []), [rec]);
  const todayKey = dayKey(now);
  const activeDays = bars.filter((b) => b.active).length;

  if (!rec || !me || !signal) return <main className="min-h-dvh" />;

  const checkedIn = isCheckedInToday(rec);

  const markPresence = () => {
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
      <div className="mx-auto w-full max-w-xl px-5 pb-12 sm:px-6">
        {/* Same opening language as Health / Train / You */}
        <header className="pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
            Home · {signal.phaseLabel}
          </p>
          <h1 className="mt-2 max-w-[18ch] text-[30px] font-semibold leading-[1.1] tracking-[-0.045em] sm:text-[34px]">
            {signal.line}
          </h1>
          {signal.under ? (
            <p className="mt-3 max-w-[36ch] text-[14px] leading-relaxed text-livv-muted">
              {signal.under}
            </p>
          ) : null}
        </header>

        {/* Week presence — same metric rhythm as Health baseline */}
        <section className="mt-10 border-t border-livv-border pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
                This week
              </p>
              <p className="mt-1.5 text-[15px] text-livv-muted">
                <span className="font-semibold tabular-nums text-[rgb(var(--livv-ink))]">
                  {activeDays}
                </span>{" "}
                of 7 days with evidence
              </p>
            </div>
            {rec.streak > 0 ? (
              <p className="text-[12px] tabular-nums text-livv-muted">
                <span className="font-semibold text-[rgb(var(--livv-ink))]">{rec.streak}</span>{" "}
                day chain
              </p>
            ) : null}
          </div>

          <div
            className="mt-6 flex items-end gap-2"
            role="img"
            aria-label={`${activeDays} of 7 days active this week`}
          >
            {bars.map((bar) => {
              const isToday = bar.key === todayKey;
              const h = bar.active ? Math.max(14, 14 + Math.round(bar.v * 0.22)) : 8;
              return (
                <div key={bar.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full max-w-[32px] rounded-[4px]"
                    style={{
                      height: h,
                      background: bar.active
                        ? isToday
                          ? "rgb(var(--livv-ink))"
                          : "color-mix(in srgb, rgb(var(--livv-ink)) 45%, transparent)"
                        : "color-mix(in srgb, rgb(var(--livv-ink)) 10%, transparent)",
                    }}
                  />
                  <span
                    className={
                      "text-[10px] font-medium " +
                      (isToday ? "text-[rgb(var(--livv-ink))]" : "text-livv-muted")
                    }
                  >
                    {bar.d}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Primary act — full-width like Train */}
        {signal.act ? (
          <section className="mt-10">
            <Link
              href={signal.act.href}
              className="flex w-full items-center justify-between gap-3 rounded-full bg-[rgb(var(--livv-ink))] px-6 py-4 text-[14px] font-semibold text-[var(--livv-bg)] transition active:opacity-90"
            >
              <span>{signal.act.label}</span>
              <ArrowRight size={16} strokeWidth={2.25} />
            </Link>
          </section>
        ) : null}

        {/* Presence — same row language as Health check-ins */}
        <section className="mt-10 border-t border-livv-border pt-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
                Presence
              </p>
              <p className="mt-1.5 text-[15px] font-semibold tracking-[-0.02em] text-[rgb(var(--livv-ink))]">
                {checkedIn ? "Marked for today" : "Not marked yet"}
              </p>
              <p className="mt-1 text-[12px] text-livv-muted">
                {checkedIn
                  ? "On the record. Use the tabs for the rest."
                  : "Optional. One mark when you show up."}
              </p>
            </div>
            <button
              type="button"
              onClick={markPresence}
              disabled={checkedIn}
              aria-label={checkedIn ? "Already marked" : "Mark presence"}
              className={
                checkedIn
                  ? "flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-livv-border px-4 text-[12px] font-semibold text-livv-muted"
                  : "flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-livv-border px-4 text-[12px] font-semibold text-[rgb(var(--livv-ink))]"
              }
            >
              {checkedIn ? <Check size={14} strokeWidth={2.25} /> : null}
              {checkedIn ? "Done" : "Mark"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
