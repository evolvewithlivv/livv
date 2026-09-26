"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, ShoppingBag } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { loadIdentity } from "@/lib/identity";
import {
  EMBERS_PER_DOLLAR,
  MIN_REDEEM_EMBERS,
  MAX_CREDIT_DOLLARS,
  REDEEM_RULES_COPY,
  formatEmberValue,
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
      <div className="mx-auto w-full max-w-2xl px-5 pb-12 pt-6 sm:px-6">
        <PageHero
          eyebrow="LIVV / Shop"
          title="Wear the standard."
          subtitle="The physical side of LIVV. Earn Embers in the app. Redeem them here when Collection drops."
          right={
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-livv-muted">
              <ShoppingBag size={19} strokeWidth={1.7} />
            </div>
          }
        />

        {/* Ember wallet */}
        <section className="mt-8 rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)] px-5 py-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-border text-livv-accent">
              <Flame size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
                Your Embers
              </p>
              <p className="mt-1.5 text-[26px] font-semibold tracking-[-.04em]">
                {embers.toLocaleString()}
              </p>
              <p className="mt-1 text-[12px] text-livv-muted">
                {dollars >= 1
                  ? `≈ $${dollars} toward Collection`
                  : `Earn toward $${Math.ceil(MIN_REDEEM_EMBERS / EMBERS_PER_DOLLAR)} minimum redeem`}
              </p>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-livv-border">
            <div
              className="h-full rounded-full bg-livv-accent transition-all"
              style={{ width: `${towardMin}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-livv-muted">
            {embers >= MIN_REDEEM_EMBERS
              ? "You can redeem on Collection when pieces are live."
              : `${(MIN_REDEEM_EMBERS - embers).toLocaleString()} more Embers to reach the $${Math.ceil(MIN_REDEEM_EMBERS / EMBERS_PER_DOLLAR)} minimum.`}
          </p>
        </section>

        <section className="mt-8 border-y border-livv-border py-12 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-livv-muted">
            Collection 001
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Nothing to sell yet.
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-livv-muted">
            LIVV only lists products when they are actually available. When Collection drops,
            Embers apply at checkout — not as cash, not as giveaways.
          </p>
        </section>

        <section className="mt-8 rounded-[22px] border border-livv-border px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
            Redemption rules
          </p>
          <ul className="mt-4 space-y-3">
            {REDEEM_RULES_COPY.map((line) => (
              <li key={line} className="flex gap-2.5 text-[12px] leading-5 text-livv-muted">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-livv-accent" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[11px] leading-relaxed text-livv-muted">
            Higher membership tiers earn Embers faster. The burn rate is the same for everyone so
            discounts stay honest.
          </p>
          <Link
            href="/home/tiers"
            className="mt-4 inline-flex text-[11px] font-semibold text-livv-accent"
          >
            View membership tiers →
          </Link>
        </section>

        <p className="mt-7 text-center text-[9px] uppercase tracking-[0.2em] text-livv-muted">
          Built to evolve with you · Max ${MAX_CREDIT_DOLLARS} Ember credit per order
        </p>
      </div>
    </main>
  );
}
