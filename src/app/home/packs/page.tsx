"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AmbientField } from "@/components/layout/ambient-field";
import { PackFoil } from "@/components/packs/pack-foil";
import { PackOpenModal } from "@/components/packs/pack-open";
import { CardFace } from "@/components/packs/card-face";
import { loadIdentity, type Identity } from "@/lib/identity";
import {
  canClaimPacks,
  claimPacksIfDue,
  collectionStats,
  formatCountdown,
  getCard,
  GRADE_META,
  loadPacks,
  msUntilNextPack,
  packEntitlement,
  purchaseApexPack,
  type PackGrade,
  type PendingPack,
} from "@/lib/packs";
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
    // auto-claim when due
    if (canClaimPacks(id.tier)) {
      claimPacksIfDue();
    }
    const s = loadPacks();
    setPending(s.pending);
    setOwnedPreview(s.owned.slice(0, 6));
    setStats(collectionStats());
    setMsLeft(msUntilNextPack(id.tier));
  };

  useEffect(() => {
    sync();
    const tick = window.setInterval(() => {
      const id = loadIdentity();
      const left = msUntilNextPack(id.tier);
      setMsLeft(left);
      if (left <= 0 && canClaimPacks(id.tier)) {
        claimPacksIfDue();
        sync();
      }
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

  return (
    <main className="relative min-h-full overflow-hidden pb-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div
          className="absolute left-1/2 top-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgb(var(--livv-accent) / 0.14), transparent 70%)",
          }}
        />
        <AmbientField />
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/30">Collect</p>
        <h1 className="font-display mt-2 text-[34px] font-semibold tracking-tight">Packs</h1>
        <p className="mt-2 text-[14px] text-white/40">{ent.label}</p>

        {/* Countdown / claim status */}
        <section className="mt-8 text-center">
          {ready ? (
            <>
              <p className="text-[10px] uppercase tracking-[0.28em] text-livv-accent-soft">Ready to open</p>
              <p className="font-display mt-2 text-[28px] font-semibold">{pending.length} pack{pending.length > 1 ? "s" : ""}</p>
            </>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Next drop</p>
              <p className="font-display mt-2 text-[36px] font-semibold tabular-nums tracking-tight">
                {formatCountdown(msLeft)}
              </p>
              <p className="mt-2 text-[13px] text-white/35">Live countdown · resets on claim</p>
            </>
          )}
        </section>

        {/* Pending packs carousel */}
        {ready && (
          <div className="mt-8 flex justify-center gap-4 overflow-x-auto pb-2">
            {pending.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  feedback("tick");
                  setOpening(p);
                }}
                className="shrink-0"
              >
                <PackFoil grade={p.grade} size="md" pulse />
                <p className="mt-2 text-center text-[10px] text-white/40">{GRADE_META[p.grade].name}</p>
              </button>
            ))}
          </div>
        )}

        {!ready && (
          <div className="mt-10 flex justify-center opacity-40">
            <PackFoil grade={ent.grants[0] as PackGrade} size="lg" />
          </div>
        )}

        {/* Grades legend */}
        <section className="mt-14">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Pack grades</p>
          <div className="mt-4 space-y-3">
            {([1, 2, 3, 4] as PackGrade[]).map((g) => {
              const m = GRADE_META[g];
              return (
                <div
                  key={g}
                  className="flex items-center gap-4 rounded-[18px] px-4 py-3"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
                >
                  <PackFoil grade={g} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">{m.name}</p>
                    <p className="text-[12px] text-white/40">
                      {m.purchasableOnly ? "Purchase only" : m.subtitle}
                    </p>
                  </div>
                  {m.purchasableOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        purchaseApexPack();
                        feedback("unlock");
                        sync();
                      }}
                      className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-black"
                    >
                      Get
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Vault</p>
            <Link href="/home/vault" className="text-[13px] text-livv-accent-soft">
              Open →
            </Link>
          </div>
          <p className="mt-2 text-[13px] text-white/40">
            {stats.uniqueCount}/{stats.catalogSize} unique cards
          </p>
          {ownedPreview.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {ownedPreview.map((o) => (
                <div key={o.instanceId} className="shrink-0">
                  <CardFace card={getCard(o.cardId)} size="sm" />
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="mt-12 text-[12px] leading-relaxed text-white/25">
          Spark: 1× Spark Pack / 24h · Rise: 1× Spark / 12h · Apex: 1× Rise Pack / 12h · Inner Circle:
          5 packs / 24h (2 Spark, 2 Rise, 1 Signal). Apex Pack is purchase-only.
        </p>
      </div>

      {opening && (
        <PackOpenModal
          packId={opening.id}
          grade={opening.grade}
          onClose={() => {
            setOpening(null);
            sync();
          }}
        />
      )}
    </main>
  );
}
