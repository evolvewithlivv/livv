"use client";

import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";

const SHOP_URL = "https://n8tv6p-pu.myshopify.com";
const PRODUCTS = [
  { name: "Essential Long Sleeve Tee", subtitle: "Black / White Logo", price: "$44.99", image: "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/unisex-long-sleeve-tee-black-heather-front-6a9eead841a4c.png?v=1788799728", href: `${SHOP_URL}/products/livv-essential-long-sleeve-tee-1` },
  { name: "Essential Long Sleeve Tee", subtitle: "White / Black Logo", price: "$44.99", image: "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/unisex-long-sleeve-tee-white-front-6a9ee93df3eae.png?v=1788799311", href: `${SHOP_URL}/products/livv-essential-long-sleeve-tee` },
  { name: "Essential Hoodie", subtitle: "White / Black Logo", price: "$59.99", image: "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/unisex-premium-pullover-hoodie-white-front-6aa80b26d646e.png?v=1789397841", href: `${SHOP_URL}/products/unisex-hoodie-1` },
  { name: "Essential Hoodie", subtitle: "Black / White Logo", price: "$59.99", image: "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/unisex-premium-pullover-hoodie-black-front-6aa80abe54914.png?v=1789397724", href: `${SHOP_URL}/products/unisex-hoodie` },

];

export default function ShopPage() {
  return (
    <main className="livv-page min-h-full text-livv-ink">
      <div className="mx-auto w-full max-w-2xl px-5 pb-12 pt-6 sm:px-6">
        <PageHero eyebrow="LIVV / Shop" title="Wear the standard." subtitle="The physical side of LIVV. Wear the standard. Carry the mindset. Keep evolving." right={<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-livv-muted"><ShoppingBag size={19} strokeWidth={1.7} /></div>} />
        <a href={SHOP_URL} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center rounded-full bg-livv-ink px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-bg transition hover:opacity-90 active:scale-[0.98]">Shop the full LIVV store <ArrowUpRight size={14} className="ml-2" /></a>
        <section className="pt-8">
          <div className="flex items-end justify-between gap-4 border-b border-livv-line pb-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-livv-muted">Essentials</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">The physical system.</h2></div><span className="text-[10px] font-medium uppercase tracking-[0.16em] text-livv-muted">{PRODUCTS.length} pieces</span></div>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6">
            {PRODUCTS.map((product) => (
              <a key={product.href} href={product.href} target="_blank" rel="noreferrer" className="group transition active:scale-[0.99]">
                <div className="aspect-[4/5] overflow-hidden rounded-xl"><img src={product.image} alt={`${product.name} / ${product.subtitle}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" /></div>
                <div className="pt-3"><p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-livv-muted">Essential</p><h3 className="mt-1 text-[13px] font-semibold leading-tight">{product.name}</h3><p className="mt-1 text-[11px] text-livv-muted">{product.subtitle}</p><div className="mt-3 flex items-center justify-between"><span className="text-sm font-semibold">{product.price}</span><span className="flex h-8 w-8 items-center justify-center text-livv-muted transition group-hover:text-livv-ink"><ArrowUpRight size={15} /></span></div></div>
              </a>
            ))}
          </div>
        </section>
        <a href={SHOP_URL} target="_blank" rel="noreferrer" className="mt-6 flex items-center justify-center rounded-xl bg-livv-ink py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-bg transition hover:opacity-90 active:scale-[0.99]">Explore the entire LIVV storefront <ArrowUpRight size={14} className="ml-2" /></a>
        <p className="mt-7 text-center text-[9px] uppercase tracking-[0.2em] text-livv-muted">Built to evolve with you</p>
      </div>
    </main>
  );
}
