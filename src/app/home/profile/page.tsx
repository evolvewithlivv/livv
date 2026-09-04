"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/identity/avatar";
import { AmbientField } from "@/components/layout/ambient-field";
import {
  fileToPhoto,
  loadIdentity,
  patchIdentity,
  type Identity,
  type LivvTier,
} from "@/lib/identity";
import { TIERS, getTier } from "@/lib/membership";
import { liveAchievements, loadRecord, type LivvRecord } from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { EMBERS_BLURB } from "@/lib/embers";
import { cn } from "@/lib/utils";
import { feedback } from "@/lib/sensory";

export default function ProfilePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [picked, setPicked] = useState<LivvTier | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => {
      setMe(loadIdentity());
      setRec(loadRecord());
    };
    sync();
    window.addEventListener("livv-identity", sync);
    window.addEventListener("livv-record", sync);
    return () => {
      window.removeEventListener("livv-identity", sync);
      window.removeEventListener("livv-record", sync);
    };
  }, []);

  if (!me || !rec) return <main className="min-h-dvh bg-[#050505]" />;

  const tier = getTier(me.tier);
  const evo = evolutionTitle(rec.level);
  const xpPct = Math.min(100, Math.round((rec.currentXp / rec.xpToNext) * 100));
  const achievements = liveAchievements(rec).filter((a) => a.unlocked);

  const onPickPhoto = async (file?: File) => {
    if (!file) return;
    feedback("tick");
    setMe(patchIdentity({ photo: await fileToPhoto(file) }));
  };

  return (
    <main className="relative min-h-full overflow-hidden pb-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div
          className="absolute left-1/2 top-[-40px] h-[360px] w-[360px] -translate-x-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgb(var(--livv-accent) / 0.18), transparent 68%)",
          }}
        />
        <AmbientField />
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/30">Identity</p>
          <Link href="/home/settings" className="text-[13px] text-white/40">
            Settings
          </Link>
        </div>

        <div className="mt-10 flex flex-col items-center text-center">
          <button type="button" onClick={() => fileRef.current?.click()} className="relative">
            <span
              className="absolute -inset-2 rounded-full opacity-70"
              style={{
                background: "radial-gradient(circle, rgb(var(--livv-accent) / 0.35), transparent 70%)",
                filter: "blur(12px)",
              }}
            />
            <Avatar identity={me} size={104} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickPhoto(e.target.files?.[0])}
          />
          <h1 className="font-display mt-6 text-[30px] font-semibold tracking-tight">{me.displayName}</h1>
          <p className="text-[14px] text-white/35">@{me.username}</p>
          {me.bio && <p className="mt-3 max-w-[28ch] text-[14px] text-white/50">{me.bio}</p>}
        </div>

        {/* Evolution strip */}
        <section className="mt-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Evolution</p>
          <p className="font-display mt-2 text-[48px] font-semibold leading-none">{rec.level}</p>
          <p className="mt-2 text-[13px] uppercase tracking-[0.2em] text-livv-accent-soft">{evo.name}</p>
          <p className="mx-auto mt-2 max-w-[26ch] text-[13px] text-white/40">{evo.line}</p>
          <div className="mx-auto mt-5 h-1 max-w-[200px] overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-livv-accent" style={{ width: `${xpPct}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-white/30">
            {rec.currentXp} / {rec.xpToNext} XP · {rec.streak}d streak · {me.embers} Embers
          </p>
        </section>

        {/* Membership */}
        <section className="mt-14">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Membership</p>
              <p className="mt-2 text-[18px] font-semibold">{tier.name}</p>
              <p className="text-[13px] text-white/40">
                {tier.price}
                {tier.cadence} · {tier.multiplier}x Embers
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {TIERS.map((t) => {
              const active = me.tier === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    feedback("tick");
                    setPicked(t.id);
                  }}
                  className="w-full text-left"
                >
                  <div
                    className="rounded-[22px] px-5 py-4"
                    style={{
                      background: active
                        ? "linear-gradient(135deg, rgb(var(--livv-accent) / 0.2), rgba(255,255,255,0.03))"
                        : "rgba(255,255,255,0.03)",
                      boxShadow: active
                        ? "0 0 0 1px rgb(var(--livv-accent) / 0.35), 0 0 28px rgb(var(--livv-accent) / 0.12)"
                        : "inset 0 0 0 1px rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-baseline justify-between">
                      <p className="text-[16px] font-semibold">{t.name}</p>
                      <p className="text-[13px] text-white/45">
                        {t.price}
                        {t.cadence !== "forever" ? t.cadence : ""}
                      </p>
                    </div>
                    <p className="mt-1 text-[13px] text-white/40">{t.blurb}</p>
                    {active && (
                      <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-livv-accent-soft">
                        Current
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Embers</p>
          <p className="mt-3 text-[28px] font-semibold tracking-tight">{me.embers}</p>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-white/40">{EMBERS_BLURB}</p>
        </section>

        {achievements.length > 0 && (
          <section className="mt-12">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Unlocked</p>
            <ul className="mt-4 space-y-3">
              {achievements.map((a) => (
                <li key={a.id} className="flex items-center gap-3 text-[14px] text-white/70">
                  <span>{a.icon}</span>
                  <span>
                    {a.title}
                    <span className="text-white/30"> · {a.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 flex flex-col gap-3">
          <Link href="/home/progress" className="text-[14px] text-livv-accent-soft">
            Progress story →
          </Link>
          <Link href="/home/evala" className="text-[14px] text-white/40">
            Ask Evala →
          </Link>
        </div>
      </div>

      {picked && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/75 backdrop-blur-sm">
          <div className="w-full rounded-t-[28px] bg-[#0c0e12] p-6 pb-10 ring-1 ring-white/10">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Tier</p>
            <h2 className="font-display mt-2 text-[28px] font-semibold">{getTier(picked).name}</h2>
            <p className="mt-2 text-[14px] text-white/45">{getTier(picked).blurb}</p>
            <ul className="mt-5 space-y-2">
              {getTier(picked).perks.map((p) => (
                <li key={p} className="text-[13px] text-white/60">
                  · {p}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-2">
              <button
                type="button"
                onClick={() => setPicked(null)}
                className="flex-1 py-3 text-sm text-white/40"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setMe(patchIdentity({ tier: picked }));
                  feedback("unlock");
                  setPicked(null);
                }}
                className="flex-1 rounded-full bg-white py-3 text-sm font-semibold text-black"
              >
                {me.tier === picked ? "Current" : "Select tier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
