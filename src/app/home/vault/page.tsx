"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { CardFace } from "@/components/packs/card-face";
import { PackFoil } from "@/components/packs/pack-foil";
import { PackOpenModal } from "@/components/packs/pack-open";
import {
  CARD_CATALOG,
  collectionStats,
  getCard,
  loadPacks,
  type OwnedCard,
  type PendingPack,
  type Rarity,
} from "@/lib/packs";
import { feedback } from "@/lib/sensory";

export default function VaultPage() {
  const [owned, setOwned] = useState<OwnedCard[]>([]);
  const [pending, setPending] = useState<PendingPack[]>([]);
  const [stats, setStats] = useState({ uniqueCount: 0, catalogSize: 16, totalOpened: 0, pending: 0 });
  const [opening, setOpening] = useState<PendingPack | null>(null);
  const [filter, setFilter] = useState<Rarity | "all">("all");

  const sync = () => {
    const s = loadPacks();
    setOwned(s.owned);
    setPending(s.pending);
    setStats(collectionStats());
  };

  useEffect(() => {
    sync();
    window.addEventListener("livv-packs", sync);
    return () => window.removeEventListener("livv-packs", sync);
  }, []);

  const filtered = owned.filter((o) => {
    if (filter === "all") return true;
    return getCard(o.cardId).rarity === filter;
  });

  return (
    <main className="livv-page relative min-h-full overflow-hidden pb-12">
      <div className="relative z-10 mx-auto max-w-lg px-5 pt-5">
        <PageHero
          eyebrow="Collection"
          title="Vault"
          subtitle="Every card you’ve pulled lives here."
          accent="#ff9f43"
        />
        <p className="mt-3 text-[13px] text-white/35">
          {stats.uniqueCount} / {stats.catalogSize} unique · {stats.totalOpened} opened
        </p>

        {pending.length > 0 && (
          <section className="mt-10">
            <p className="text-[10px] uppercase tracking-[0.28em] text-livv-accent-soft">Ready</p>
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
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
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 flex gap-2 overflow-x-auto">
          {(["all", "common", "elevated", "rare", "apex"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] capitalize tracking-wide ${
                filter === f ? "bg-white text-black" : "text-white/40 ring-1 ring-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="font-display text-[20px]">Vault is empty</p>
            <p className="mt-2 text-[14px] text-white/40">Open a pack from the Packs tab.</p>
            <Link href="/home/shop" className="mt-6 inline-block text-[14px] text-livv-accent-soft">
              Packs →
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-3 gap-3">
            {filtered.map((o) => (
              <div key={o.instanceId} className="flex justify-center">
                <CardFace card={getCard(o.cardId)} size="sm" />
              </div>
            ))}
          </div>
        )}

        <section className="mt-14">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Catalog</p>
          <p className="mt-2 text-[13px] text-white/35">
            {CARD_CATALOG.length} cards exist. Real art drops in later.
          </p>
        </section>
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
