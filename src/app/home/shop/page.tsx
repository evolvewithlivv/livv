"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { loadIdentity } from "@/lib/identity";
import { PageHero } from "@/components/layout/page-hero";
import {
  EMBERS_PER_DOLLAR,
  MIN_REDEEM_EMBERS,
  MAX_CREDIT_DOLLARS,
  REDEEM_RULES_COPY,
  embersToDollars,
} from "@/lib/ember-economy";

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
          eyebrow="Collection"
          title="Wear the standard."
          subtitle="Physical goods from LIVV. Earn Embers in the app. Redeem when Collection drops."
        />

        <section className="mt-10 rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)] px-5 py-5">
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
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-livv-muted">Coming</p>
          <h2 className="mt-2 text-[24px] font-semibold tracking-tight">Collection drops soon.</h2>
          <p className="mt-2 max-w-[40ch] text-[13px] leading-relaxed text-livv-muted">
            Apparel and gear that match how you live. Embers convert to credit at {EMBERS_PER_DOLLAR} per dollar,
            up to ${MAX_CREDIT_DOLLARS}.
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
