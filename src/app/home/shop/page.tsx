"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Flame } from "lucide-react";
import { loadIdentity } from "@/lib/identity";
import { PageHero } from "@/components/layout/page-hero";
import {
  EMBERS_PER_DOLLAR,
  MIN_REDEEM_EMBERS,
  MAX_CREDIT_DOLLARS,
  REDEEM_RULES_COPY,
  embersToDollars,
} from "@/lib/ember-economy";

const SHOP_URL = "https://evolvewithlivv.com";

const PRODUCTS = [
  {
    name: "LIVV Heavyweight Tee - White Logo",
    subtitle: "Heavyweight / white logo",
    price: "From $39.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-premium-heavyweight-tee-black-front-6ac2572409a64.png?v=1791121207",
    href: `${SHOP_URL}/products/men-s-premium-heavyweight-tee-1`,
  },
  {
    name: "LIVV Heavyweight Tee - Black Logo",
    subtitle: "Heavyweight / black logo",
    price: "From $39.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-premium-heavyweight-tee-white-front-6ac256bda7240.png?v=1791121101",
    href: `${SHOP_URL}/products/men-s-premium-heavyweight-tee`,
  },
  {
    name: "LIVV Heavyweight Long Sleeve - White Logo",
    subtitle: "Heavyweight / white logo",
    price: "From $44.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-heavyweight-long-sleeve-t-shirt-black-front-6ac2573c45416.png?v=1791121222",
    href: `${SHOP_URL}/products/mens-heavyweight-long-sleeve-t-shirt-1`,
  },
  {
    name: "LIVV Heavyweight Long Sleeve - Black Logo",
    subtitle: "Heavyweight / black logo",
    price: "From $44.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-heavyweight-long-sleeve-t-shirt-white-front-6ac256f65cc22.png?v=1791121157",
    href: `${SHOP_URL}/products/mens-heavyweight-long-sleeve-t-shirt`,
  },
  {
    name: "LIVV Recycled Mesh Shorts",
    subtitle: "Recycled performance mesh",
    price: "$49.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/all-over-print-youth-recycled-mesh-shorts-white-front-6ac2560852ffd.png?v=1791120923",
    href: `${SHOP_URL}/products/all-over-print-youth-recycled-mesh-shorts`,
  },
  {
    name: "LIVV Tough iPhone Case",
    subtitle: "Matte or gloss / dual-layer",
    price: "$34.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/tough-case-for-iphone-matte-iphone-17-pro-max-front-6ac255eaa6549.png?v=1791120889",
    href: `${SHOP_URL}/products/tough-case-for-iphone®`,
  },
];

export default function ShopPage() {
  const [embers, setEmbers] = useState(0);

  useEffect(() => {
    const sync = () => setEmbers(loadIdentity().embers || 0);
    sync();
    window.addEventListener("livv-identity", sync);
    return () => window.removeEventListener("livv-identity", sync);
  }, []);

  const towardMin = Math.min(100, Math.round((embers / MIN_REDEEM_EMBERS) * 100));
  const dollars = embersToDollars(embers);

  return (
    <main className="livv-page min-h-full text-livv-ink">
      <div className="livv-stagger mx-auto w-full max-w-2xl px-5 pb-12 pt-6 sm:px-6">
        <PageHero
          eyebrow="Collection 001"
          title="Wear the standard."
          subtitle="Physical goods from LIVV. Made to order. Earn Embers in the app and redeem when you have enough."
        />

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4 border-b border-livv-border pb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-livv-muted">
                The physical system
              </p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-tight">Collection 001</h2>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-[.16em] text-livv-muted">
              {PRODUCTS.length} pieces
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8">
            {PRODUCTS.map((product) => (
              <a
                key={product.href}
                href={product.href}
                target="_blank"
                rel="noreferrer"
                className="group min-w-0 transition active:scale-[0.99]"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-[18px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_3%,transparent)]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                    loading="lazy"
                  />
                </div>
                <div className="pt-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[.17em] text-livv-muted">
                    Collection 001
                  </p>
                  <h3 className="mt-1 text-[13px] font-semibold leading-tight">{product.name}</h3>
                  <p className="mt-1 text-[11px] text-livv-muted">{product.subtitle}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{product.price}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center text-livv-muted transition group-hover:text-livv-ink">
                      <ArrowUpRight size={15} />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)] px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-livv-border">
              <Flame size={18} className="text-livv-accent" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-livv-muted">Your Embers</p>
              <p className="mt-1 text-[26px] font-semibold tabular-nums tracking-tight">{embers.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[.12em] text-livv-muted">Value</p>
              <p className="mt-1 text-[14px] font-semibold tabular-nums">${dollars.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-livv-border">
            <div
              className="h-full rounded-full bg-livv-accent transition-[width] duration-500 ease-out"
              style={{ width: `${towardMin}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-livv-muted">
            {embers >= MIN_REDEEM_EMBERS
              ? `Ready to redeem (min ${MIN_REDEEM_EMBERS.toLocaleString()} Embers).`
              : `${(MIN_REDEEM_EMBERS - embers).toLocaleString()} Embers to minimum redeem.`}
          </p>
        </section>

        <section className="mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-livv-muted">Earned in LIVV</p>
          <h2 className="mt-2 text-[24px] font-semibold tracking-tight">Your actions have value.</h2>
          <p className="mt-2 max-w-[40ch] text-[13px] leading-relaxed text-livv-muted">
            Embers convert to credit at {EMBERS_PER_DOLLAR} per dollar, up to ${MAX_CREDIT_DOLLARS}. Collection
            pieces are made to order, so buy what you will actually use.
          </p>
          <ul className="mt-4 space-y-1.5 text-[12px] leading-relaxed text-livv-muted">
            {REDEEM_RULES_COPY.map((rule) => (
              <li key={rule} className="flex gap-2">
                <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-livv-muted opacity-60" aria-hidden />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <Link
            href="/home/profile"
            className="livv-press inline-flex min-h-11 items-center rounded-full border border-livv-border px-5 text-[12px] font-semibold"
          >
            View profile & Embers
          </Link>
        </section>
      </div>
    </main>
  );
}
