"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, Flame, Settings2, Trophy, Zap } from "lucide-react";
import { Avatar } from "@/components/identity/avatar";
import { fileToPhoto, loadIdentity, patchIdentity, type Identity } from "@/lib/identity";
import { loadRecord, livePillars, weekHitCount, type LivvRecord } from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { getEffectiveTier } from "@/lib/billing";
import { getTier } from "@/lib/membership";
import { tierColor } from "@/lib/tier-style";
import { syncIdentityToCloud } from "@/lib/auth";
import { buildProgressInsights } from "@/lib/progress-insights";

export default function ProfilePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => {
      try {
        setMe(loadIdentity());
        setRec(loadRecord());
      } catch {}
    };
    sync();
    for (const event of ["livv-identity", "livv-record", "livv-billing"]) window.addEventListener(event, sync);
    return () => {
      for (const event of ["livv-identity", "livv-record", "livv-billing"]) window.removeEventListener(event, sync);
    };
  }, []);

  const insights = useMemo(() => (rec ? buildProgressInsights(rec, 14) : null), [rec]);

  if (!me || !rec || !insights) return <main className="min-h-dvh bg-[#070809]" />;

  const tier = getEffectiveTier();
  const tierDef = getTier(tier);
  const tierStyle = tierColor(tier);
  const evo = evolutionTitle(rec.level);
  const xpNeeded = Math.max(1, rec.xpToNext || 1);
  const xpPct = Math.min(100, Math.round((rec.currentXp / xpNeeded) * 100));
  const pillars = livePillars(rec);
  const activeDays = weekHitCount(rec);

  const updatePhoto = async (file?: File) => {
    if (!file) return;
    try {
      const next = patchIdentity({ photo: await fileToPhoto(file) });
      setMe(next);
      void syncIdentityToCloud(next);
    } catch {}
  };

  return (
    <main className="min-h-full bg-[#070809] pb-28 text-white">
      <div className="mx-auto w-full max-w-[460px] px-4 pb-8 pt-4 sm:px-5">
        <header className="flex items-center justify-between px-1 py-2">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-white/[.04] text-[11px] font-black">L</span>
            <div>
              <p className="text-[11px] font-bold tracking-[.18em]">LIVV</p>
              <p className="text-[7px] font-semibold uppercase tracking-[.22em] text-white/35">Identity</p>
            </div>
          </div>
          <Link href="/home/settings" aria-label="Settings" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[.035] text-white/60">
            <Settings2 size={16} strokeWidth={1.8} />
          </Link>
        </header>

        <section className="relative mt-4 overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(145deg,#15171b_0%,#0d0f12_58%,#111923_100%)] px-5 pb-5 pt-5 shadow-[0_24px_70px_rgba(0,0,0,.28)]">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-[#1769ff]/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[.16]" style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px)", backgroundSize:"30px 30px", maskImage:"linear-gradient(to bottom,black,transparent 92%)" }} />

          <div className="relative flex items-center gap-4">
            <button type="button" onClick={() => fileRef.current?.click()} className="relative shrink-0 rounded-full" aria-label="Change profile photo">
              <Avatar identity={{ ...me, tier }} size={82} fit="contain" className="profile-avatar" showTierRing />
              <span className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full border-2 border-[#111318] bg-white text-black">
                <span className="text-[10px] font-bold">+</span>
              </span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void updatePhoto(e.target.files?.[0])} />
            <div className="min-w-0 flex-1 pr-16">
              <p className="text-[8px] font-bold uppercase tracking-[.2em] text-white/35">Current state</p>
              <h1 className="mt-1 truncate text-[25px] font-semibold leading-none tracking-[-.045em]">{me.displayName || me.username || "Member"}</h1>
              <p className="mt-1 text-[11px] text-white/45">@{me.username || "livv"}</p>
            </div>
            <span className="absolute right-0 top-0 rounded-full border px-2.5 py-1.5 text-[7px] font-extrabold uppercase tracking-[.16em]" style={{ color:tierStyle.hex, borderColor:`color-mix(in srgb, ${tierStyle.hex} 48%, transparent)`, background:`color-mix(in srgb, ${tierStyle.hex} 10%, transparent)` }}>
              {tierDef.name}
            </span>
          </div>

          <div className="relative mt-5 border-t border-white/[.08] pt-4">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-[.2em] text-white/35">Evolution status</p>
                <h2 className="mt-1 text-[31px] font-semibold leading-none tracking-[-.055em]">{evo.name}</h2>
                <p className="mt-2 max-w-[29ch] text-[10px] leading-[1.45] text-white/45">{evo.line}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[7px] font-bold uppercase tracking-[.2em] text-white/30">Level</p>
                <strong className="mt-1 block text-[34px] font-semibold leading-none tabular-nums">{rec.level}</strong>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3 text-[7px] font-bold uppercase tracking-[.17em] text-white/35">
                <span>XP progress</span><span className="text-white/55">{rec.currentXp.toLocaleString()} / {xpNeeded.toLocaleString()}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[.09]">
                <div className="h-full rounded-full bg-[#1769ff] shadow-[0_0_16px_rgba(23,105,255,.45)]" style={{ width:`${xpPct}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[8px] text-white/30">
                <span>{xpPct}% toward next level</span><span>{activeDays}/7 active this week</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-3 grid grid-cols-4 overflow-hidden rounded-[20px] border border-white/10 bg-white/[.025]">
          <IdentityStat icon={<Flame />} value={String(rec.streak || 0)} label="Streak" suffix="d" />
          <IdentityStat icon={<Trophy />} value={String(rec.workoutsCompleted || 0)} label="Workouts" />
          <IdentityStat icon={<Zap />} value={(me.embers || 0).toLocaleString()} label="Embers" />
          <IdentityStat value={`${insights.consistencyPct}%`} label="14d" />
        </section>

        <section className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[.2em] text-white/35">The record</p>
              <h2 className="mt-1 text-[20px] font-semibold tracking-[-.04em]">How you&apos;re moving.</h2>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-[.12em] text-white/35">14 days</span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <RecordMetric value={String(insights.objectivesCompletedInWindow)} label="Actions" />
            <RecordMetric value={`${insights.longestActiveRun}d`} label="Best run" />
            <RecordMetric value={`${Math.round(insights.balancePct)}%`} label="Areas" />
          </div>

          <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[.025] p-4">
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              {pillars.map((pillar) => (
                <div key={pillar.id}>
                  <div className="flex items-center justify-between gap-2 text-[8px] font-bold uppercase tracking-[.1em] text-white/45">
                    <span>{pillar.name}</span><span className="tabular-nums text-white/65">{pillar.progress}%</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[.08]">
                    <span className="block h-full rounded-full bg-white/70" style={{ width:`${Math.min(100, pillar.progress)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 border-t border-white/[.08] pt-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[.2em] text-white/30">Membership</p>
              <p className="mt-1 text-[14px] font-semibold">{tierDef.name}</p>
            </div>
            <Link href="/home/tiers" className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[.12em] text-white/45">
              View tiers <ArrowUpRight size={13} />
            </Link>
          </div>
        </section>

        <footer className="mt-6 flex items-end justify-between gap-4 border-t border-white/[.07] pt-4 text-[6px] font-bold uppercase tracking-[.15em] text-white/25">
          <span>Longevity · Integrity · Vitality · Vigilance</span><span className="shrink-0 text-white/45">Evolve with purpose.</span>
        </footer>
      </div>
    </main>
  );
}

function IdentityStat({ icon, value, label, suffix }: { icon?: ReactNode; value:string; label:string; suffix?:string }) {
  return (
    <div className="min-w-0 border-r border-white/[.08] px-1 py-3.5 text-center last:border-r-0">
      {icon ? <div className="mx-auto mb-1.5 grid h-4 w-4 place-items-center text-white/35">{icon}</div> : <div className="h-4" />}
      <strong className="block text-[15px] font-semibold leading-none tabular-nums">{value}{suffix ? <small className="ml-0.5 text-[9px] text-white/40">{suffix}</small> : null}</strong>
      <span className="mt-1.5 block text-[7px] font-bold uppercase tracking-[.12em] text-white/30">{label}</span>
    </div>
  );
}

function RecordMetric({ value, label }: { value:string; label:string }) {
  return (
    <div className="rounded-[16px] border border-white/[.08] bg-white/[.025] px-3 py-3">
      <strong className="block text-[17px] font-semibold leading-none tabular-nums">{value}</strong>
      <span className="mt-1.5 block text-[7px] font-bold uppercase tracking-[.1em] text-white/30">{label}</span>
    </div>
  );
}
