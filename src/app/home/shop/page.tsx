"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { loadIdentity } from "@/lib/identity";
import { haptic } from "@/lib/sensory";
import {
  EMBERS_PER_DOLLAR,
  MIN_REDEEM_EMBERS,
  MAX_CREDIT_DOLLARS,
  REDEEM_RULES_COPY,
  embersToDollars,
} from "@/lib/ember-economy";
import "./shop-rack.css";

const PRODUCTS = [
  {
    name: "Heavyweight Tee",
    detail: "White logo",
    price: "From $39.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-premium-heavyweight-tee-black-front-6ac2572409a64.png?v=1791121207",
    href: "/products/men-s-premium-heavyweight-tee-1",
  },
  {
    name: "Heavyweight Tee",
    detail: "Black logo",
    price: "From $39.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-premium-heavyweight-tee-white-front-6ac256bda7240.png?v=1791121101",
    href: "/products/men-s-premium-heavyweight-tee",
  },
  {
    name: "Long Sleeve",
    detail: "White logo",
    price: "From $44.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-heavyweight-long-sleeve-t-shirt-black-front-6ac2573c45416.png?v=1791121222",
    href: "/products/mens-heavyweight-long-sleeve-t-shirt-1",
  },
  {
    name: "Long Sleeve",
    detail: "Black logo",
    price: "From $44.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-heavyweight-long-sleeve-t-shirt-white-front-6ac256f65cc22.png?v=1791121157",
    href: "/products/mens-heavyweight-long-sleeve-t-shirt",
  },
  {
    name: "iPhone Tough Case",
    detail: "Protect the signal",
    price: "$34.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/tough-case-for-iphone-matte-iphone-17-pro-max-front-6ac255eaa6549.png?v=1791120889",
    href: "/products/tough-case-for-iphone",
  },
];

function Hanger() {
  return (
    <svg className="rack-hanger" viewBox="0 0 120 48" aria-hidden>
      <path
        d="M60 6c0-3.3 2.7-6 6-6s6 2.7 6 6c0 2.2-1.2 4.1-3 5.2V14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M60 14v4M18 28c0-6 12-10 42-10s42 4 42 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 28h84"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ShopPage() {
  const [embers, setEmbers] = useState(0);
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setEmbers(loadIdentity().embers || 0);
    sync();
    window.addEventListener("livv-identity", sync);
    return () => window.removeEventListener("livv-identity", sync);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => {
      const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-rack-item]"));
      if (!cards.length) return;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((card, i) => {
        const center = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive((prev) => (prev === best ? prev : best));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const towardMin = Math.min(100, Math.round((embers / MIN_REDEEM_EMBERS) * 100));
  const dollars = embersToDollars(embers);
  const focused = PRODUCTS[active] ?? PRODUCTS[0];

  const scrollToIndex = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelectorAll<HTMLElement>("[data-rack-item]")[index];
    if (!card) return;
    const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    el.scrollTo({ left, behavior: "smooth" });
    haptic("light");
  };

  return (
    <main className="livv-page min-h-full text-livv-ink">
      <div className="mx-auto w-full max-w-2xl pb-12 pt-5">
        <header className="px-5 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
            Collection 001
          </p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight">The rack.</h1>
          <p className="mt-2 max-w-[36ch] text-[14px] leading-relaxed text-livv-muted">
            Swipe the rail. Tap a piece to open it.
          </p>
        </header>

        <section className="rack mt-8" aria-label="Clothing rack">
          <div className="rack-frame">
            <div className="rack-rail" aria-hidden>
              <span className="rack-rail-bar" />
              <span className="rack-rail-end left" />
              <span className="rack-rail-end right" />
            </div>

            <div className="rack-track" ref={trackRef}>
              {PRODUCTS.map((product, i) => (
                <Link
                  key={product.href}
                  href={product.href}
                  data-rack-item
                  className={"rack-item" + (i === active ? " is-active" : "")}
                  onClick={() => haptic("light")}
                >
                  <Hanger />
                  <div className="rack-hook" aria-hidden />
                  <div className="rack-garment">
                    <img src={product.image} alt={product.name} loading={i < 2 ? "eager" : "lazy"} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rack-focus px-5 sm:px-6">
            <p className="rack-focus-index">
              {String(active + 1).padStart(2, "0")} / {String(PRODUCTS.length).padStart(2, "0")}
            </p>
            <h2 className="rack-focus-name">{focused.name}</h2>
            <p className="rack-focus-detail">{focused.detail}</p>
            <div className="rack-focus-row">
              <span className="rack-focus-price">{focused.price}</span>
              <Link href={focused.href} className="rack-focus-cta" onClick={() => haptic("light")}>
                View piece
              </Link>
            </div>

            <div className="rack-dots" role="tablist" aria-label="Pieces on the rack">
              {PRODUCTS.map((p, i) => (
                <button
                  key={p.href}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={p.name}
                  className={"rack-dot" + (i === active ? " is-active" : "")}
                  onClick={() => scrollToIndex(i)}
                />
              ))}
            </div>
          </div>
        </section>

        <div className="px-5 sm:px-6">
          <section className="mt-12 rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)] px-5 py-5">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-livv-accent/10">
                <Flame size={22} className="text-livv-accent" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-livv-muted">
                  Your Embers
                </p>
                <p className="mt-1 text-[26px] font-semibold tabular-nums tracking-tight">
                  {embers.toLocaleString()}
                </p>
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
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-livv-muted">
              Earned in LIVV
            </p>
            <h2 className="mt-2 text-[24px] font-semibold tracking-tight">Your actions have value.</h2>
            <p className="mt-2 max-w-[40ch] text-[13px] leading-relaxed text-livv-muted">
              Embers convert to credit at {EMBERS_PER_DOLLAR} per dollar, up to ${MAX_CREDIT_DOLLARS}.
              Collection pieces are made to order, so buy what you will actually use.
            </p>
            <ul className="mt-4 space-y-1.5 text-[12px] leading-relaxed text-livv-muted">
              {REDEEM_RULES_COPY.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <span
                    className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-livv-muted opacity-60"
                    aria-hidden
                  />
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
      </div>
    </main>
  );
}
