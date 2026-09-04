"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AmbientField } from "@/components/layout/ambient-field";
import {
  livePillars,
  loadRecord,
  weekBars,
  weekHitCount,
  type LivvRecord,
} from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { needsAttention, strongestPillar } from "@/lib/command";
import { feedback } from "@/lib/sensory";
import {
  advanceSeason,
  claimSeasonComplete,
  seasonProgress,
} from "@/lib/seasons";
import {
  claimWeeklyClear,
  setWeeklyTarget,
  weeklyClearStatus,
} from "@/lib/weekly-clear";
import { applyStreakRepair, getRepairOffer } from "@/lib/streak-repair";
import { setProgress as vaultSetProgress } from "@/lib/vault-sets";
import { clearPair, loadPair, setPair, type PairChain } from "@/lib/pair-chain";
import { addEmbers } from "@/lib/identity";
import { enqueueMilestone } from "@/lib/milestones";

export default function ProgressPage() {
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [season, setSeason] = useState(() =>
    typeof window !== "undefined" ? seasonProgress() : null
  );
  const [weekly, setWeekly] = useState(() =>
    typeof window !== "undefined" ? weeklyClearStatus() : null
  );
  const [repair, setRepair] = useState<{ previous: number; restored: number } | null>(null);
  const [sets, setSets] = useState(() =>
    typeof window !== "undefined" ? vaultSetProgress() : []
  );
  const [pair, setPairState] = useState<PairChain | null>(null);
  const [pairName, setPairName] = useState("");

  const sync = () => {
    setRec(loadRecord());
    setSeason(seasonProgress());
    setWeekly(weeklyClearStatus());
    setRepair(getRepairOffer());
    setSets(vaultSetProgress());
    setPairState(loadPair());
  };

  useEffect(() => {
    sync();
    window.addEventListener("livv-record", sync);
    window.addEventListener("livv-season", sync);
    window.addEventListener("livv-weekly", sync);
    window.addEventListener("livv-packs", sync);
    window.addEventListener("livv-pair", sync);
    return () => {
      window.removeEventListener("livv-record", sync);
      window.removeEventListener("livv-season", sync);
      window.removeEventListener("livv-weekly", sync);
      window.removeEventListener("livv-packs", sync);
      window.removeEventListener("livv-pair", sync);
    };
  }, []);

  if (!rec || !season || !weekly) return <main className="min-h-dvh bg-[#050505]" />;

  const week = weekBars(rec);
  const hits = weekHitCount(rec);
  const pillars = livePillars(rec);
  const empty = rec.workoutsCompleted === 0 && rec.goalsCompleted === 0 && rec.streak === 0;
  const evo = evolutionTitle(rec.level);
  const strong = strongestPillar(rec);
  const weak = needsAttention(rec);

  let weekMessage = "Empty board. One action changes that.";
  if (hits >= 5) weekMessage = "You showed up more than most weeks. Keep the line.";
  else if (hits >= 3) weekMessage = "Momentum is forming. Do not treat the rest of the week casually.";
  else if (hits >= 1) weekMessage = "Signal exists. Stack another day.";

  return (
    <main className="relative min-h-full overflow-hidden pb-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div
          className="absolute right-[-20%] top-10 h-[300px] w-[300px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgb(var(--livv-accent) / 0.14), transparent 70%)",
          }}
        />
        <AmbientField />
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/30">Long view</p>
        <h1 className="font-display mt-2 text-[34px] font-semibold tracking-tight">Progress</h1>

        {/* Streak repair */}
        {repair && (
          <section
            className="mt-8 rounded-[22px] px-5 py-4"
            style={{
              background: "linear-gradient(135deg, rgb(var(--livv-accent) / 0.15), rgba(255,255,255,0.03))",
              boxShadow: "0 0 0 1px rgb(var(--livv-accent) / 0.3)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.22em] text-livv-accent-soft">Streak repair</p>
            <p className="mt-2 text-[16px] font-semibold">
              You had {repair.previous}. Rebuild to {repair.restored}.
            </p>
            <p className="mt-1 text-[13px] text-white/40">
              Half the chain returns. The rest you earn again.
            </p>
            <button
              type="button"
              onClick={() => {
                applyStreakRepair();
                feedback("unlock");
                sync();
              }}
              className="mt-4 rounded-full bg-white px-5 py-2 text-[13px] font-semibold text-black"
            >
              Repair chain
            </button>
          </section>
        )}

        {/* Season chapter */}
        <section className="mt-12">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Chapter</p>
          <p className="font-display mt-2 text-[26px] font-semibold">{season.def.name}</p>
          <p className="mt-1 text-[14px] text-white/45">{season.def.line}</p>
          <p className="mt-2 text-[12px] text-white/30">
            Day {season.elapsed + 1} · {season.remaining} days left in chapter
          </p>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-livv-accent transition-all"
              style={{ width: `${season.pct}%` }}
            />
          </div>
          <ul className="mt-5 space-y-3">
            {season.objectives.map((o) => (
              <li key={o.id} className="flex items-center justify-between text-[14px]">
                <span className={o.done ? "text-white/35 line-through" : "text-white/70"}>
                  {o.title}
                </span>
                <span className="tabular-nums text-white/40">
                  {o.current}/{o.target}
                </span>
              </li>
            ))}
          </ul>
          {season.allDone && !season.state.claimed && (
            <button
              type="button"
              onClick={() => {
                claimSeasonComplete();
                addEmbers(50);
                feedback("unlock");
                advanceSeason();
                sync();
              }}
              className="mt-5 w-full rounded-full bg-white py-3 text-[14px] font-semibold text-black"
            >
              Complete chapter · +50 Embers
            </button>
          )}
        </section>

        {/* Weekly clear */}
        <section className="mt-12">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Weekly clear</p>
          <p className="font-display mt-2 text-[48px] font-semibold leading-none">
            {weekly.hits}
            <span className="text-[24px] text-white/30"> / {weekly.target}</span>
          </p>
          <p className="mt-2 text-[14px] text-white/45">
            {weekly.met
              ? weekly.claimed
                ? "Clear claimed this week."
                : "Target hit. Claim your clear."
              : `${weekly.remaining} more active day${weekly.remaining === 1 ? "" : "s"} to clear.`}
          </p>
          <div className="mt-4 flex gap-2">
            {[3, 4, 5, 6, 7].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setWeeklyTarget(n);
                  feedback("tick");
                  sync();
                }}
                className={`h-9 w-9 rounded-full text-[13px] font-medium ${
                  weekly.target === n
                    ? "bg-white text-black"
                    : "text-white/40 ring-1 ring-white/15"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {weekly.met && !weekly.claimed && (
            <button
              type="button"
              onClick={() => {
                claimWeeklyClear();
                addEmbers(25);
                feedback("complete");
                sync();
              }}
              className="mt-5 rounded-full bg-livv-accent px-5 py-2.5 text-[13px] font-semibold text-white"
            >
              Claim clear · +25 Embers
            </button>
          )}
          <div className="mt-6 flex h-20 items-end justify-between gap-2">
            {week.map((day) => (
              <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-full"
                  style={{
                    height: `${Math.max(day.v, day.active ? 14 : 4)}%`,
                    minHeight: day.active ? 14 : 4,
                    background: day.active
                      ? "linear-gradient(to top, rgb(var(--livv-accent)), rgb(var(--livv-accent) / 0.5))"
                      : "rgba(255,255,255,0.08)",
                  }}
                />
                <span className="text-[10px] text-white/30">{day.d}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-white/40">{weekMessage}</p>
        </section>

        {!empty && (
          <>
            <section className="mt-12 grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Strongest</p>
                <p className="mt-2 text-[22px] font-semibold">{strong.name}</p>
                <p className="text-[13px] text-livv-accent-soft">Level {strong.level}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Needs weight</p>
                <p className="mt-2 text-[22px] font-semibold">{weak.name}</p>
                <p className="text-[13px] text-white/40">Level {weak.level}</p>
              </div>
            </section>

            <section className="mt-12">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Evolution</p>
              <p className="font-display mt-2 text-[28px] font-semibold">Level {rec.level}</p>
              <p className="text-[14px] text-livv-accent-soft">{evo.name}</p>
            </section>

            <section className="mt-12">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Pillars</p>
              <div className="mt-5 space-y-4">
                {pillars.map((p) => (
                  <div key={p.id}>
                    <div className="flex justify-between text-[14px]">
                      <span>{p.name}</span>
                      <span className="text-white/35">Lv {p.level}</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-livv-accent"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Vault sets */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Vault sets</p>
            <Link href="/home/vault" className="text-[13px] text-livv-accent-soft">
              Vault →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {sets.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-[14px]">
                <span className={s.complete ? "text-livv-accent-soft" : "text-white/60"}>
                  {s.name}
                  {s.complete ? " · complete" : ""}
                </span>
                <span className="tabular-nums text-white/35">
                  {s.have}/{s.total}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Pair chain */}
        <section className="mt-12">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Pair chain</p>
          <p className="mt-2 text-[13px] text-white/40">
            Optional. Shared accountability on one pillar — not a public leaderboard.
          </p>
          {pair ? (
            <div className="mt-4">
              <p className="text-[16px] font-semibold">
                {pair.partnerName} · {pair.pillar}
              </p>
              <p className="text-[13px] text-white/40">{pair.sharedDays} shared days</p>
              <button
                type="button"
                onClick={() => {
                  clearPair();
                  sync();
                }}
                className="mt-3 text-[13px] text-white/35"
              >
                End pair
              </button>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <input
                value={pairName}
                onChange={(e) => setPairName(e.target.value)}
                placeholder="Partner name"
                className="h-11 flex-1 rounded-full bg-white/[0.05] px-4 text-sm outline-none ring-1 ring-white/10"
              />
              <button
                type="button"
                onClick={() => {
                  if (pairName.trim().length < 2) return;
                  setPair({
                    partnerName: pairName.trim(),
                    partnerUsername: pairName.trim().toLowerCase().replace(/\s/g, ""),
                    pillar: "Body",
                  });
                  feedback("tick");
                  setPairName("");
                  sync();
                }}
                className="rounded-full bg-white px-4 text-sm font-semibold text-black"
              >
                Link
              </button>
            </div>
          )}
        </section>

        <section className="mt-12 flex gap-8 text-[14px] text-white/45">
          <div>
            <p className="text-[22px] font-semibold text-white">{rec.workoutsCompleted}</p>
            <p className="text-[11px] text-white/30">Sessions</p>
          </div>
          <div>
            <p className="text-[22px] font-semibold text-white">{rec.goalsCompleted}</p>
            <p className="text-[11px] text-white/30">Actions</p>
          </div>
          <div>
            <p className="text-[22px] font-semibold text-white">{rec.streak}d</p>
            <p className="text-[11px] text-white/30">Streak</p>
          </div>
        </section>
      </div>
    </main>
  );
}
