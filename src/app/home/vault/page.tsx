"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, PackageOpen } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { CardFace } from "@/components/packs/card-face";
import { PackFoil } from "@/components/packs/pack-foil";
import { PackOpenModal } from "@/components/packs/pack-open";
import { CARD_CATALOG, collectionStats, getCard, loadPacks, type OwnedCard, type PendingPack, type Rarity } from "@/lib/packs";
import { feedback } from "@/lib/sensory";

const FILTERS: Array<Rarity | "all"> = ["all", "common", "elevated", "rare", "apex"];

export default function VaultPage() {
  const [owned, setOwned] = useState<OwnedCard[]>([]);
  const [pending, setPending] = useState<PendingPack[]>([]);
  const [stats, setStats] = useState({ uniqueCount: 0, catalogSize: 16, totalOpened: 0, pending: 0 });
  const [opening, setOpening] = useState<PendingPack | null>(null);
  const [filter, setFilter] = useState<Rarity | "all">("all");

  const sync = () => {
    const state = loadPacks();
    setOwned(state.owned);
    setPending(state.pending);
    setStats(collectionStats());
  };

  useEffect(() => {
    sync();
    window.addEventListener("livv-packs", sync);
    return () => window.removeEventListener("livv-packs", sync);
  }, []);

  const filtered = owned.filter((item) => filter === "all" || getCard(item.cardId).rarity === filter);
  const pct = stats.catalogSize ? Math.round((stats.uniqueCount / stats.catalogSize) * 100) : 0;

  return (
    <main className="livv-page min-h-full pb-20">
      <div className="mx-auto max-w-xl px-5 pt-5">
        <PageHero eyebrow="Collection" title="Vault" subtitle="A quiet record of what your work has earned." accent="#1769ff" />

        <section className="mt-7 border-y border-[var(--livv-pro-line)] py-6">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[var(--livv-pro-muted)]">Collection</p>
              <p className="mt-2 text-[36px] font-semibold tracking-tight">{stats.uniqueCount}<span className="text-[var(--livv-pro-muted)]"> / {stats.catalogSize}</span></p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium">{pct}% complete</p>
              <p className="mt-1 text-[10px] text-[var(--livv-pro-muted)]">{stats.totalOpened} packs opened</p>
            </div>
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--livv-pro-surface-2)]"><div className="h-full rounded-full bg-[var(--livv-pro-accent)] transition-all" style={{ width: `${pct}%` }} /></div>
        </section>

        {pending.length > 0 && (
          <section className="mt-8 border-b border-[var(--livv-pro-line)] pb-7">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[var(--livv-pro-accent)]">Waiting for you</p><h2 className="mt-1 text-[25px] font-semibold tracking-tight">Unopened rewards.</h2></div>
              <span className="text-[10px] text-[var(--livv-pro-muted)]">{pending.length} ready</span>
            </div>
            <div className="mt-5 flex gap-4 overflow-x-auto pb-2">{pending.map((pack) => <button key={pack.id} type="button" onClick={() => { feedback("tick"); setOpening(pack); }} className="shrink-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--livv-pro-accent)]"><PackFoil grade={pack.grade} size="md" pulse={false} /></button>)}</div>
          </section>
        )}

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[var(--livv-pro-muted)]">Library</p><h2 className="mt-1 text-[25px] font-semibold tracking-tight">Your cards.</h2></div><span className="text-[10px] text-[var(--livv-pro-muted)]">{filtered.length} shown</span></div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{FILTERS.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} aria-pressed={filter === item} className="min-h-10 shrink-0 rounded-full border px-4 text-[10px] font-semibold capitalize transition" style={{ borderColor: filter === item ? "var(--livv-pro-accent)" : "var(--livv-pro-line)", background: filter === item ? "var(--livv-pro-accent-soft)" : "transparent", color: filter === item ? "var(--livv-pro-accent)" : "var(--livv-pro-muted)" }}>{item}</button>)}</div>
        </section>

        {filtered.length === 0 ? (
          <section className="mt-7 border-y border-dashed border-[var(--livv-pro-line)] py-12 text-center">
            <LockKeyhole className="mx-auto text-[var(--livv-pro-muted)]" size={20} />
            <h2 className="mt-4 text-[20px] font-semibold">Nothing here yet.</h2>
            <p className="mx-auto mt-2 max-w-[32ch] text-[12px] leading-relaxed text-[var(--livv-pro-muted)]">Complete work, open rewards, and let the collection build naturally.</p>
            <Link href="/home/shop" className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold text-[var(--livv-pro-accent)]">Visit Shop <ArrowRight size={13} /></Link>
          </section>
        ) : (
          <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {filtered.map((item) => <div key={item.instanceId} className="flex min-w-0 justify-center"><CardFace card={getCard(item.cardId)} size="sm" /></div>)}
          </section>
        )}

        <section className="mt-10 border-t border-[var(--livv-pro-line)] py-6">
          <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--livv-pro-surface-2)] text-[var(--livv-pro-accent)]"><PackageOpen size={16} /></span><div><p className="text-[11px] font-semibold">{CARD_CATALOG.length} cards in the catalog</p><p className="mt-1 text-[10px] text-[var(--livv-pro-muted)]">The collection can expand as LIVV evolves.</p></div></div>
        </section>
      </div>
      {opening && <PackOpenModal packId={opening.id} grade={opening.grade} onClose={() => { setOpening(null); sync(); }} />}
    </main>
  );
}
