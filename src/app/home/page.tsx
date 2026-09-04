"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/identity/avatar";
import { AmbientField } from "@/components/layout/ambient-field";
import { PackFoil } from "@/components/packs/pack-foil";
import { PackOpenModal } from "@/components/packs/pack-open";
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
import { loadPacks, tryGrantDailyPack, type PendingPack } from "@/lib/packs";

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

function evalaInsight(rec: LivvRecord, done: number, total: number) {
  if (rec.streak >= 3 && rec.workoutsCompleted >= 2) {
    return {
      title: "Evala noticed",
      body: `Body signal is stable for ${rec.streak} days. Consistency usually breaks after long idle evenings — protect the window before 9.`,
    };
  }
  if (done === total && total > 0) {
    return {
      title: "Evala noticed",
      body: "Every pillar has signal today. Do not invent more work. Protect recovery.",
    };
  }
  if (rec.streak === 0 && rec.goalsCompleted > 0) {
    return {
      title: "Evala noticed",
      body: "History exists. The chain does not. One action restarts it without drama.",
    };
  }
  if (done === 0 && rec.workoutsCompleted + rec.goalsCompleted > 0) {
    return {
      title: "Evala noticed",
      body: "The board is empty today. Your average week is better than this moment. Close the gap once.",
    };
  }
  return null;
}

export default function HomePage() {
  const router = useRouter();
  const [now, setNow] = useState(() => new Date());
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [me, setMe] = useState<Identity | null>(null);
  const [pulse, setPulse] = useState(false);
  const [pending, setPending] = useState<PendingPack[]>([]);
  const [opening, setOpening] = useState<PendingPack | null>(null);

  const pull = () => {
    setRec(loadRecord());
    setMe(loadIdentity());
    setPending(loadPacks().pending);
  };

  useEffect(() => {
    pull();
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    window.addEventListener("livv-identity", pull);
    window.addEventListener("livv-record", pull);
    window.addEventListener("livv-packs", pull);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("livv-identity", pull);
      window.removeEventListener("livv-record", pull);
      window.removeEventListener("livv-packs", pull);
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
  const alive = Math.min(1, (done / total) * 0.55 + (rec.streak > 0 ? 0.2 : 0) + 0.15);
  const insight = evalaInsight(rec, done, total);
  const quiet = missedYesterday(rec);
  const checkedIn = isCheckedInToday(rec);
  const readyPack = pending[0] || null;

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
        setPulse(true);
        window.setTimeout(() => setPulse(false), 900);
        addEmbers(10 * tier.multiplier + (emberBonus || 0));
        tryGrantDailyPack();
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
          className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-90"
          style={{
            background: `radial-gradient(circle, rgb(var(--livv-accent) / ${0.18 + alive * 0.12}) 0%, transparent 68%)`,
            filter: "blur(8px)",
          }}
        />
        <AmbientField intensity="strong" />
        <div className="livv-grain opacity-[0.035]" />
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-5 pt-5">
        <header className="flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="LIVV" className="h-8 w-8 object-contain opacity-95" />
          <Link href="/home/profile" className="rounded-full ring-1 ring-white/10">
            <Avatar identity={me} size={34} />
          </Link>
        </header>

        <div className="mt-10 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/35">
            {dateLabel}
          </p>
          <p className="font-display mt-4 text-[28px] font-semibold leading-tight tracking-tight text-white/95">
            {greet.line}
          </p>
          {quiet && (
            <p className="mt-3 text-[13px] text-white/40">
              Yesterday was quiet. Data, not failure.
            </p>
          )}
        </div>

        <div className="relative mx-auto mt-10 flex h-[240px] w-[240px] items-center justify-center">
          <div
            className={`evo-ring absolute inset-0 rounded-full ${pulse ? "evo-pulse" : ""}`}
            style={{
              background: `conic-gradient(from 210deg, rgb(var(--livv-accent) / ${0.55 + alive * 0.35}) ${xpPct}%, rgba(255,255,255,0.06) ${xpPct}% 100%)`,
              mask: "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))",
              WebkitMask:
                "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))",
            }}
          />
          <div
            className="evo-core absolute inset-6 rounded-full"
            style={{
              background: `radial-gradient(circle at 40% 35%, rgb(var(--livv-accent) / ${0.22 + alive * 0.25}), rgba(8,10,16,0.92) 62%)`,
              boxShadow: `0 0 ${40 + alive * 50}px rgb(var(--livv-accent) / ${0.15 + alive * 0.2}), inset 0 0 40px rgba(0,0,0,0.45)`,
            }}
          />
          <div className="relative z-10 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/40">Evolution</p>
            <p className="font-display mt-1 text-[52px] font-semibold leading-none tracking-tight">
              {rec.level}
            </p>
            <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.2em] text-livv-accent-soft">
              {evo.name}
            </p>
            <p className="mt-2 text-[11px] text-white/35">
              {rec.streak > 0 ? `Day ${rec.streak} of the chain` : "Chain not started"}
            </p>
          </div>
        </div>

        {/* Pack ready */}
        {readyPack && (
          <button
            type="button"
            onClick={() => {
              feedback("tick");
              setOpening(readyPack);
            }}
            className="mx-auto mt-8 flex items-center gap-4 rounded-[22px] px-4 py-3 text-left"
            style={{
              background: "linear-gradient(135deg, rgb(var(--livv-accent) / 0.15), rgba(255,255,255,0.03))",
              boxShadow: "0 0 0 1px rgb(var(--livv-accent) / 0.25), 0 0 28px rgb(var(--livv-accent) / 0.12)",
            }}
          >
            <PackFoil kind={readyPack.kind} size="sm" pulse />
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-livv-accent-soft">Pack ready</p>
              <p className="mt-0.5 text-[15px] font-semibold">Open Daily Spark</p>
              <p className="text-[12px] text-white/40">Earned by showing up</p>
            </div>
          </button>
        )}

        <button
          type="button"
          onClick={onPrimary}
          disabled={move.href === "/home" && checkedIn}
          className="group relative mt-8 w-full overflow-hidden rounded-[28px] text-left"
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

        {insight && (
          <section className="mt-12">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/30">
              {insight.title}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-white/65">{insight.body}</p>
            <Link href="/home/evala" className="mt-3 inline-block text-[13px] text-livv-accent-soft">
              Open Evala →
            </Link>
          </section>
        )}

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

        <p className="mt-14 text-center text-[11px] text-white/20">{greet.salutation}</p>
      </div>

      {opening && (
        <PackOpenModal
          packId={opening.id}
          kind={opening.kind}
          onClose={() => {
            setOpening(null);
            pull();
          }}
        />
      )}

      <style jsx>{`
        .evo-core {
          animation: evoBreathe 7s ease-in-out infinite;
        }
        .evo-pulse {
          animation: evoFlash 0.85s ease-out;
        }
        @keyframes evoBreathe {
          0%,
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.03);
            filter: brightness(1.08);
          }
        }
        @keyframes evoFlash {
          0% {
            filter: brightness(1);
          }
          40% {
            filter: brightness(1.35);
          }
          100% {
            filter: brightness(1);
          }
        }
      `}</style>
    </main>
  );
}
