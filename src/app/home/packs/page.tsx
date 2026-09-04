"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AmbientField } from "@/components/layout/ambient-field";
import { PackFoil } from "@/components/packs/pack-foil";
import { PackOpenModal } from "@/components/packs/pack-open";
import { CardFace } from "@/components/packs/card-face";
import { loadIdentity, type Identity } from "@/lib/identity";
import { canClaimPacks, claimPacksIfDue, collectionStats, formatCountdown, getCard, GRADE_META, loadPacks, msUntilNextPack, packEntitlement, purchaseApexPack, type PackGrade, type PendingPack } from "@/lib/packs";
import { feedback } from "@/lib/sensory";

export default function PacksPage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [pending, setPending] = useState<PendingPack[]>([]);
  const [ownedPreview, setOwnedPreview] = useState<{ cardId: string; instanceId: string }[]>([]);
  const [stats, setStats] = useState({ uniqueCount: 0, catalogSize: 16, pending: 0 });
  const [msLeft, setMsLeft] = useState(0);
  const [opening, setOpening] = useState<PendingPack | null>(null);

  const sync = () => {
    const id = loadIdentity();
    setMe(id);
    if (canClaimPacks(id.tier)) claimPacksIfDue();
    const s = loadPacks();
    setPending(s.pending);
    setOwnedPreview(s.owned.slice(0, 8));
    setStats(collectionStats());
    setMsLeft(msUntilNextPack(id.tier));
  };

  useEffect(() => {
    sync();
    const tick = window.setInterval(() => {
      const id = loadIdentity();
      const left = msUntilNextPack(id.tier);
      setMsLeft(left);
      if (left <= 0 && canClaimPacks(id.tier)) { claimPacksIfDue(); sync(); }
    }, 1000);
    window.addEventListener("livv-packs", sync);
    window.addEventListener("livv-identity", sync);
    return () => {
      window.clearInterval(tick);
      window.removeEventListener("livv-packs", sync);
      window.removeEventListener("livv-identity", sync);
    };
  }, []);

  if (!me) return <main className="min-h-dvh bg-[#050505]" />;
  const ent = packEntitlement(me.tier);
  const ready = pending.length > 0;
  const collectionPct = Math.round((stats.uniqueCount / Math.max(1, stats.catalogSize)) * 100);

  return (
    <main className="relative min-h-full overflow-hidden pb-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute left-1/2 top-[-80px] h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-livv-accent/10 blur-[90px]" />
        <AmbientField intensity="strong" />
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <header className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/30">Collection chamber</p>
            <h1 className="font-display mt-2 text-[36px] font-semibold tracking-tight">Packs</h1>
            <p className="mt-2 text-[13px] text-white/35">{ent.label}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">Archive</p>
            <p className="mt-1 text-[17px] font-semibold tabular-nums">{stats.uniqueCount}<span className="text-white/25">/{stats.catalogSize}</span></p>
          </div>
        </header>

        <section className="livv-reveal livv-glow-sweep relative mt-9 overflow-hidden rounded-[32px] border border-white/[0.09] bg-white/[0.035] px-5 py-6 shadow-[0_25px_80px_rgba(0,0,0,.35)]">
          <div className="pointer-events-none absolute right-[-30px] top-[-30px] h-40 w-40 rounded-full bg-livv-accent/15 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-livv-accent-soft">{ready ? "Signal detected" : "Next drop"}</p>
              <p className="font-display mt-2 text-[40px] font-semibold leading-none tabular-nums tracking-tight">
                {ready ? `${pending.length} ready` : formatCountdown(msLeft)}
              </p>
              <p className="mt-3 max-w-[24ch] text-[12px] leading-relaxed text-white/35">
                {ready ? "The chamber is holding new matter. Open a pack and add it to your archive." : "Your next drop is forming in real time."}
              </p>
            </div>
            <div className="livv-breathe relative flex h-28 w-28 items-center justify-center rounded-full border border-livv-accent/25 bg-livv-accent/[0.04]">
              <div className="absolute h-20 w-20 rounded-full border border-livv-accent/20" />
              <div className="absolute h-12 w-12 rounded-full bg-livv-accent/15 blur-md" />
              <span className="relative text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-accent-soft">LIVV</span>
            </div>
          </div>
        </section>

        {ready && (
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Awaiting you</p>
              <span className="text-[10px] text-white/25">tap to open</span>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-3 pt-1 scrollbar-none">
              {pending.map((p, i) => (
                <button key={p.id} type="button" onClick={() => { feedback("tick"); setOpening(p); }} className="livv-reveal shrink-0" style={{ animationDelay: `${i * 90}ms` }}>
                  <PackFoil grade={p.grade} size="md" pulse />
                  <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">{GRADE_META[p.grade].name}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {!ready && (
          <div className="mt-10 flex justify-center opacity-55">
            <PackFoil grade={ent.grants[0] as PackGrade} size="lg" />
          </div>
        )}

        <section className="mt-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Archive density</p>
              <p className="mt-1 text-[14px] text-white/50">Your collection is {collectionPct}% explored.</p>
            </div>
            <Link href="/home/vault" className="text-[12px] text-livv-accent-soft">Enter vault →</Link>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div className="h-full rounded-full bg-livv-accent shadow-[0_0_14px_rgb(var(--livv-accent)/.5)] transition-all duration-700" style={{ width: `${collectionPct}%` }} />
          </div>
          {ownedPreview.length > 0 && (
            <div className="mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {ownedPreview.map((o, i) => (
                <div key={o.instanceId} className="livv-reveal shrink-0" style={{ animationDelay: `${i * 60}ms` }}>
                  <CardFace card={getCard(o.cardId)} size="sm" />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Matter classes</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {([1, 2, 3, 4] as PackGrade[]).map((g) => {
              const m = GRADE_META[g];
              return (
                <div key={g} className="group rounded-[22px] border border-white/[0.07] bg-white/[0.025] p-3.5 transition hover:bg-white/[0.045]">
                  <div className="flex items-center gap-3">
                    <PackFoil grade={g} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold">{m.name}</p>
                      <p className="mt-0.5 truncate text-[10px] text-white/30">{m.purchasableOnly ? "Purchase only" : m.subtitle}</p>
                    </div>
                  </div>
                  {m.purchasableOnly && (
                    <button type="button" onClick={() => { purchaseApexPack(); feedback("unlock"); sync(); }} className="mt-3 w-full rounded-full bg-white py-2 text-[11px] font-semibold text-black">Acquire</button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <p className="mt-12 text-[11px] leading-relaxed text-white/20">Spark: 1× / 24h · Rise: 1× / 12h · Apex: 1× / 12h · Inner Circle: 5 / 24h. Apex Pack is purchase-only.</p>
      </div>

      {opening && <PackOpenModal packId={opening.id} grade={opening.grade} onClose={() => { setOpening(null); sync(); }} />}
    </main>
  );
}
