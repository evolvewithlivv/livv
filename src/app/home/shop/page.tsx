"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag, Sparkles } from "lucide-react";
import { PackFoil } from "@/components/packs/pack-foil";
import { PackOpenModal } from "@/components/packs/pack-open";
import { loadPacks, GRADE_META, collectionStats, formatCountdown, msUntilNextPack, canClaimPacks, claimPacksIfDue, type PackGrade, type PendingPack } from "@/lib/packs";
import { buyPack, PACK_SHOP } from "@/lib/pack-shop";
import { getEffectiveTier, isStripeConfigured } from "@/lib/billing";
import { feedback } from "@/lib/sensory";
import { PageHero } from "@/components/layout/page-hero";

const SHOP_URL = "https://n8tv6p-pu.myshopify.com";
const PRODUCTS = [
  { name: "Essential Long Sleeve Tee", subtitle: "Black / White Logo", price: "$44.99", image: "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/unisex-long-sleeve-tee-black-heather-front-6a9eead841a4c.png?v=1788799728", href: `${SHOP_URL}/products/livv-essential-long-sleeve-tee-1` },
  { name: "Essential Long Sleeve Tee", subtitle: "White / Black Logo", price: "$44.99", image: "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/unisex-long-sleeve-tee-white-front-6a9ee93df3eae.png?v=1788799311", href: `${SHOP_URL}/products/livv-essential-long-sleeve-tee` },
];

export default function ShopPage() {
  const [pending, setPending] = useState<PendingPack[]>([]);
  const [msLeft, setMsLeft] = useState(0);
  const [opening, setOpening] = useState<PendingPack | null>(null);
  const [stats, setStats] = useState({ uniqueCount: 0, catalogSize: 16 });
  const [buying, setBuying] = useState<PackGrade | null>(null);

  const sync = () => {
    const tier = getEffectiveTier();
    if (canClaimPacks(tier)) claimPacksIfDue(tier);
    const state = loadPacks();
    setPending(state.pending);
    setStats(collectionStats());
    setMsLeft(msUntilNextPack(tier));
  };

  useEffect(() => {
    sync();
    const timer = window.setInterval(() => {
      const tier = getEffectiveTier();
      const left = msUntilNextPack(tier);
      setMsLeft(left);
      if (left <= 0 && canClaimPacks(tier)) {
        claimPacksIfDue(tier);
        sync();
      }
    }, 1000);
    window.addEventListener("livv-packs", sync);
    window.addEventListener("livv-identity", sync);
    window.addEventListener("livv-billing", sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("livv-packs", sync);
      window.removeEventListener("livv-identity", sync);
      window.removeEventListener("livv-billing", sync);
    };
  }, []);

  const ready = pending.length > 0;
  const collectionPct = stats.catalogSize > 0 ? Math.min(100, Math.round((stats.uniqueCount / stats.catalogSize) * 100)) : 0;

  async function handlePackBuy(grade: PackGrade) {
    feedback("tick");
    setBuying(grade);
    try {
      const out = await buyPack(grade);
      if (out.local) {
        feedback("unlock");
        sync();
      }
    } finally {
      setBuying(null);
    }
  }

  return (
    <main className="livv-page min-h-full text-livv-ink">
      <div className="mx-auto w-full max-w-2xl px-5 pb-12 pt-6 sm:px-6">
        <PageHero
          eyebrow="LIVV / Shop"
          title="Wear the standard."
          subtitle="The physical side of LIVV. Wear the standard. Carry the mindset. Keep evolving."
          right={
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-livv-muted">
              <ShoppingBag size={19} strokeWidth={1.7} />
            </div>
          }
        />
        <a href={SHOP_URL} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center rounded-full bg-livv-ink px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-bg transition hover:opacity-90 active:scale-[0.98]">Shop the full LIVV store <ArrowUpRight size={14} className="ml-2" /></a>

        <section className="border-b border-livv-line py-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-livv-muted">Evolution Packs</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">Build your archive.</h2>
            </div>
            <Sparkles size={18} strokeWidth={1.6} className="text-livv-muted" />
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Next drop</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.025em]">{ready ? `${pending.length} ready` : formatCountdown(msLeft)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Collected</p>
                <p className="mt-1 text-sm font-semibold">{stats.uniqueCount}<span className="text-livv-muted"> / {stats.catalogSize}</span></p>
              </div>
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-livv-line">
              <div className="h-full rounded-full bg-livv-ink transition-all duration-500" style={{ width: `${collectionPct}%` }} />
            </div>

            {ready && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {pending.map((pack) => (
                  <button key={pack.id} type="button" onClick={() => { feedback("tick"); setOpening(pack); }} className="shrink-0 px-1 py-1 text-center transition active:scale-[0.98]">
                    <PackFoil grade={pack.grade} size="sm" pulse />
                    <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-livv-muted">{GRADE_META[pack.grade].name.replace(" Pack", "")}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 divide-y divide-livv-line border-y border-livv-line">
            {([1, 2, 3, 4] as PackGrade[]).map((grade) => {
              const meta = GRADE_META[grade];
              const shop = PACK_SHOP[grade];
              return (
                <div key={grade} className="py-4 first:pt-3 last:pb-3">
                  <div className="flex items-center gap-4">
                    <PackFoil grade={grade} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-semibold">{meta.name}</p>
                        <p className="text-sm font-semibold">{shop.price}</p>
                      </div>
                      <p className="mt-1 text-[11px] leading-5 text-livv-muted">{meta.subtitle} · {shop.value}</p>
                    </div>
                  </div>
                  <button type="button" disabled={buying !== null} onClick={() => handlePackBuy(grade)} className="mt-3 w-full rounded-xl bg-livv-ink px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-livv-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45">
                    {buying === grade ? "Opening checkout…" : isStripeConfigured() ? `Buy ${shop.price}` : `Add ${shop.price} pack`}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <Link href="/home/vault" className="flex items-center justify-between border-b border-livv-line py-5 transition active:scale-[0.99]">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-livv-muted">Your archive</p>
            <p className="mt-1 text-sm font-medium">Open the Vault</p>
          </div>
          <ArrowUpRight size={18} strokeWidth={1.7} />
        </Link>

        <section className="pt-8">
          <div className="flex items-end justify-between gap-4 border-b border-livv-line pb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-livv-muted">Essentials</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">The physical system.</h2>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-livv-muted">{PRODUCTS.length} pieces</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6">
            {PRODUCTS.map((product) => (
              <a key={product.href} href={product.href} target="_blank" rel="noreferrer" className="group transition active:scale-[0.99]">
                <div className="aspect-[4/5] overflow-hidden rounded-xl">
                  <img src={product.image} alt={`${product.name} / ${product.subtitle}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
                </div>
                <div className="pt-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-livv-muted">Essential</p>
                  <h3 className="mt-1 text-[13px] font-semibold leading-tight">{product.name}</h3>
                  <p className="mt-1 text-[11px] text-livv-muted">{product.subtitle}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">{product.price}</span>
                    <span className="flex h-8 w-8 items-center justify-center text-livv-muted transition group-hover:text-livv-ink"><ArrowUpRight size={15} /></span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <a href={SHOP_URL} target="_blank" rel="noreferrer" className="mt-6 flex items-center justify-center rounded-xl bg-livv-ink py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-bg transition hover:opacity-90 active:scale-[0.99]">Explore the entire LIVV storefront <ArrowUpRight size={14} className="ml-2" /></a>
        <p className="mt-7 text-center text-[9px] uppercase tracking-[0.2em] text-livv-muted">Built to evolve with you</p>
      </div>

      {opening && <PackOpenModal packId={opening.id} grade={opening.grade} onClose={() => { setOpening(null); sync(); }} />}
    </main>
  );
}
