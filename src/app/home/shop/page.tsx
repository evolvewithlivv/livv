"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
    detail: "White logo · Made to order",
    price: "From $39.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-premium-heavyweight-tee-black-front-6ac2572409a64.png?v=1791121207",
    href: "/products/men-s-premium-heavyweight-tee-1",
  },
  {
    name: "Heavyweight Tee",
    detail: "Black logo · Made to order",
    price: "From $39.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-premium-heavyweight-tee-white-front-6ac256bda7240.png?v=1791121101",
    href: "/products/men-s-premium-heavyweight-tee",
  },
  {
    name: "Long Sleeve",
    detail: "White logo · Made to order",
    price: "From $44.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-heavyweight-long-sleeve-t-shirt-black-front-6ac2573c45416.png?v=1791121222",
    href: "/products/mens-heavyweight-long-sleeve-t-shirt-1",
  },
  {
    name: "Long Sleeve",
    detail: "Black logo · Made to order",
    price: "From $44.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-heavyweight-long-sleeve-t-shirt-white-front-6ac256f65cc22.png?v=1791121157",
    href: "/products/mens-heavyweight-long-sleeve-t-shirt",
  },
  {
    name: "iPhone Tough Case",
    detail: "Matte finish · Signal ready",
    price: "$34.95",
    image:
      "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/tough-case-for-iphone-matte-iphone-17-pro-max-front-6ac255eaa6549.png?v=1791120889",
    href: "/products/tough-case-for-iphone",
  },
];

const N = PRODUCTS.length;
const STEP = 360 / N;

function Hanger() {
  return (
    <svg className="closet-hanger" viewBox="0 0 80 36" aria-hidden>
      <path
        d="M40 4a5 5 0 1 1 5 5v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M40 12v3M10 24c4-7 14-10 30-10s26 3 30 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line x1="10" y1="24" x2="70" y2="24" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

export default function ShopPage() {
  const [embers, setEmbers] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startRot: 0, lastX: 0, moved: false });
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setEmbers(loadIdentity().embers || 0);
    sync();
    window.addEventListener("livv-identity", sync);
    return () => window.removeEventListener("livv-identity", sync);
  }, []);

  const normalizeIndex = useCallback((rot: number) => {
    const raw = Math.round(-rot / STEP);
    return ((raw % N) + N) % N;
  }, []);

  const active = normalizeIndex(rotation);
  const focused = PRODUCTS[active];

  const snapToIndex = useCallback(
    (index: number) => {
      const target = -index * STEP;
      let delta = target - rotation;
      while (delta > 180) delta -= 360;
      while (delta < -180) delta += 360;
      setRotation(rotation + delta);
      haptic("light");
    },
    [rotation]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startRot: rotation,
      lastX: e.clientX,
      moved: false,
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    setRotation(dragRef.current.startRot + dx * 0.38);
    dragRef.current.lastX = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    const dx = e.clientX - dragRef.current.startX;
    const velocityBoost = dx * 0.08;
    const finalRot = dragRef.current.startRot + dx * 0.38 + velocityBoost;
    const idx = normalizeIndex(finalRot);
    setRotation(-idx * STEP);
    if (dragRef.current.moved) haptic("light");
  };

  const towardMin = Math.min(100, Math.round((embers / MIN_REDEEM_EMBERS) * 100));
  const dollars = embersToDollars(embers);

  return (
    <main className="livv-page min-h-full text-livv-ink">
      <div className="mx-auto w-full max-w-2xl pb-14 pt-6">
        <header className="closet-header px-6">
          <p className="closet-eyebrow">Collection 001</p>
          <h1 className="closet-title">Closet</h1>
          <p className="closet-sub">Drag to rotate. Tap the front piece to open.</p>
        </header>

        <section className="closet" aria-label="Rotating closet">
          <div className="closet-ring" aria-hidden>
            <div className="closet-ring-outer" />
            <div className="closet-ring-inner" />
            <div className="closet-ring-highlight" />
          </div>

          <div
            ref={stageRef}
            className={"closet-stage" + (dragging ? " is-dragging" : "")}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="listbox"
            aria-label="Products"
            aria-activedescendant={`closet-item-${active}`}
          >
            <div
              className="closet-carousel"
              style={{
                transform: `translateZ(-160px) rotateY(${rotation}deg)`,
                transition: dragging ? "none" : "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {PRODUCTS.map((product, i) => {
                const angle = i * STEP;
                const isFront = i === active;
                return (
                  <Link
                    key={product.href}
                    id={`closet-item-${i}`}
                    href={product.href}
                    role="option"
                    aria-selected={isFront}
                    className={"closet-item" + (isFront ? " is-front" : "")}
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(160px)`,
                    }}
                    onClick={(e) => {
                      if (dragRef.current.moved) {
                        e.preventDefault();
                        return;
                      }
                      if (!isFront) {
                        e.preventDefault();
                        snapToIndex(i);
                        return;
                      }
                      haptic("light");
                    }}
                    draggable={false}
                  >
                    <div className="closet-item-inner">
                      <Hanger />
                      <div className="closet-stem" aria-hidden />
                      <div className="closet-garment">
                        <img
                          src={product.image}
                          alt={product.name}
                          draggable={false}
                          loading={i < 2 ? "eager" : "lazy"}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="closet-floor" aria-hidden />

          <div className="closet-info">
            <p className="closet-count">
              {String(active + 1).padStart(2, "0")}
              <span> / {String(N).padStart(2, "0")}</span>
            </p>
            <h2 className="closet-name">{focused.name}</h2>
            <p className="closet-detail">{focused.detail}</p>
            <div className="closet-actions">
              <span className="closet-price">{focused.price}</span>
              <Link href={focused.href} className="closet-cta" onClick={() => haptic("light")}>
                View piece
              </Link>
            </div>
          </div>
        </section>

        <div className="px-6">
          <section className="closet-embers mt-12">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-livv-accent/10">
                <Flame size={20} className="text-livv-accent" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-livv-muted">
                  Your Embers
                </p>
                <p className="mt-0.5 text-[24px] font-semibold tabular-nums tracking-tight">
                  {embers.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[.12em] text-livv-muted">Value</p>
                <p className="mt-0.5 text-[14px] font-semibold tabular-nums">${dollars.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-livv-border">
              <div
                className="h-full rounded-full bg-livv-accent transition-[width] duration-500 ease-out"
                style={{ width: `${towardMin}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-livv-muted">
              {embers >= MIN_REDEEM_EMBERS
                ? `Ready to redeem (min ${MIN_REDEEM_EMBERS.toLocaleString()} Embers).`
                : `${(MIN_REDEEM_EMBERS - embers).toLocaleString()} more Embers to redeem.`}
            </p>
          </section>

          <section className="mt-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
              Earned in LIVV
            </p>
            <h2 className="mt-2 text-[22px] font-semibold tracking-tight">Your actions have value.</h2>
            <p className="mt-2 max-w-[40ch] text-[13px] leading-relaxed text-livv-muted">
              Embers convert at {EMBERS_PER_DOLLAR} per dollar, up to ${MAX_CREDIT_DOLLARS}. Pieces are made
              to order.
            </p>
            <ul className="mt-4 space-y-1.5 text-[12px] leading-relaxed text-livv-muted">
              {REDEEM_RULES_COPY.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-livv-muted opacity-50" aria-hidden />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <Link
              href="/home/profile"
              className="inline-flex min-h-11 items-center rounded-full border border-livv-border px-5 text-[12px] font-semibold"
            >
              Profile & Embers
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
