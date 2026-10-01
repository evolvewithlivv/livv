"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  /** The single thing Home exists to say */
  line: string;
  /** Optional quieter support under the line */
  under?: string;
  /** One act — not a directory */
  act?: { label: string; href: string };
  /** Presence mark available */
  canMark: boolean;
};

function phaseForHour(hour: number): { phase: Phase; phaseLabel: string } {
  if (hour < 5) return { phase: "night", phaseLabel: "Night" };
  if (hour < 11) return { phase: "dawn", phaseLabel: "Morning" };
  if (hour < 17) return { phase: "day", phaseLabel: "Day" };
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

  // Empty life in the system — first signal is evidence, not cheerleading
  if (!hasAnyHistory && !trained && !checkedIn && objectivesDone === 0) {
    return {
      phase,
      phaseLabel,
      line: "Nothing is recorded yet.",
      under: "Capability is evidence. Mark the day or train once — the system starts from that.",
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

  // Trained
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
        act: { label: "Health", href: "/home/health" },
        canMark: false,
      };
    }
    return {
      phase,
      phaseLabel,
      line: "You already moved.",
      under: "Keep the rest of the day clean. Attention is a resource.",
      act: { label: "Daily", href: "/home/daily" },
      canMark: false,
    };
  }

  // Checked in, not trained
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
    under: "Open one room when you need it. Leave the rest alone.",
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

  if (!rec || !me || !signal) return <main className="min-h-dvh" />;

  const checkedIn = isCheckedInToday(rec);

  const markPresence = () => {
    if (checkedIn) return;
    const result = checkInRecord();
    if (result.already) return;
    feedback("checkin");
    const base = embersFromAction("checkin");
    addEmbers(base);
    // Keep optional streak bonus if server still emits it — no tier multiplier
    const bonus =
      result.emberBonus && [4, 6, 8, 10, 12, 15].includes(result.emberBonus)
        ? result.emberBonus
        : 0;
    if (bonus) addEmbers(bonus, `ember-checkin-bonus-${Date.now()}`);
    pull();
  };

  return (
    <main className="livv-page min-h-full pb-28">
      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-[40rem] flex-col px-5 sm:px-6">
        {/* Phase + week pulse — not a greeting/quote stack */}
        <header className="pt-6">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-livv-muted">
              {signal.phaseLabel}
            </p>
            <p className="text-[11px] tabular-nums text-livv-muted">
              {now.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Week as a single instrument — presence, not analytics */}
          <div
            className="mt-8 flex items-end gap-1.5"
            role="img"
            aria-label={`Week presence: ${bars.filter((b) => b.active).length} of 7 days active`}
          >
            {bars.map((bar) => {
              const isToday = bar.key === todayKey;
              const h = bar.active ? Math.max(12, 12 + Math.round(bar.v * 0.2)) : 6;
              return (
                <div key={bar.key} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full max-w-[28px] rounded-sm transition-all"
                    style={{
                      height: h,
                      background: bar.active
                        ? isToday
                          ? "rgb(var(--livv-ink))"
                          : "color-mix(in srgb, rgb(var(--livv-ink)) 55%, transparent)"
                        : "color-mix(in srgb, rgb(var(--livv-ink)) 12%, transparent)",
                    }}
                  />
                  <span
                    className={
                      "text-[9px] font-medium uppercase tracking-wider " +
                      (isToday ? "text-[rgb(var(--livv-ink))]" : "text-livv-muted")
                    }
                  >
                    {bar.d}
                  </span>
                </div>
              );
            })}
          </div>
        </header>

        {/* The Signal — optical center of the product */}
        <section className="flex flex-1 flex-col justify-center py-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-livv-muted">
            Signal
          </p>
          <h1 className="mt-5 max-w-[16ch] text-[32px] font-bold leading-[1.08] tracking-[-0.045em] text-[rgb(var(--livv-ink))] sm:text-[36px]">
            {signal.line}
          </h1>
          {signal.under ? (
            <p className="mt-5 max-w-[34ch] text-[15px] leading-[1.55] text-livv-muted">
              {signal.under}
            </p>
          ) : null}

          {signal.act ? (
            <Link
              href={signal.act.href}
              className="mt-10 inline-flex h-12 max-w-full items-center justify-center self-start rounded-full bg-[rgb(var(--livv-ink))] px-7 text-[13px] font-semibold text-[rgb(var(--livv-bg))] transition active:opacity-90"
            >
              {signal.act.label}
            </Link>
          ) : null}
        </section>

        {/* Presence — consequence, not a dashboard row */}
        <footer className="border-t border-livv-border pb-8 pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[rgb(var(--livv-ink))]">
                {checkedIn ? "Marked" : "Presence"}
              </p>
              <p className="mt-0.5 text-[12px] text-livv-muted">
                {checkedIn
                  ? rec.streak > 1
                    ? `${rec.streak}-day chain`
                    : "On the record for today"
                  : "One mark. Optional. Real."}
              </p>
            </div>
            {signal.canMark || checkedIn ? (
              <button
                type="button"
                onClick={markPresence}
                disabled={checkedIn}
                aria-label={checkedIn ? "Already marked present" : "Mark presence for today"}
                className={
                  checkedIn
                    ? "h-10 shrink-0 rounded-full border border-livv-border px-4 text-[12px] font-semibold text-livv-muted"
                    : "h-10 shrink-0 rounded-full border border-[rgb(var(--livv-ink))] px-4 text-[12px] font-semibold text-[rgb(var(--livv-ink))]"
                }
              >
                {checkedIn ? "Done" : "Mark"}
              </button>
            ) : null}
          </div>
        </footer>
      </div>
    </main>
  );
}
