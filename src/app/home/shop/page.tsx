"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { loadIdentity } from "@/lib/identity";
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
      <div className="mx-auto w-full max-w-2xl px-5 pb-12 pt-6 sm:px-6">
        <header className="pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
            Collection
          </p>
          <h1 className="mt-2 max-w-[14ch] text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[34px]">
            Wear the standard.
          </h1>
          <p className="mt-3 max-w-[36ch] text-[14px] leading-relaxed text-livv-muted">
            Physical goods from LIVV. Earn Embers in the app. Redeem when Collection drops.
          </p>
        </header>

        <section className="mt-10">
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
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-livv-border">
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

        <section className="mt-12 border-t border-livv-border pt-10 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-livv-muted">
            Collection 001
          </p>
          <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.03em]">Nothing to sell yet.</h2>
          <p className="mx-auto mt-3 max-w-[32ch] text-[13px] leading-relaxed text-livv-muted">
            When pieces drop, they live here. Embers convert to credit at{" "}
            {EMBERS_PER_DOLLAR} Embers per dollar (max ${MAX_CREDIT_DOLLARS}).
          </p>
          <p className="mx-auto mt-6 max-w-[40ch] text-[11px] leading-relaxed text-livv-muted">
            {REDEEM_RULES_COPY}
          </p>
        </section>

        <section className="mt-10 pb-4 text-center">
          <Link href="/home/tiers" className="text-[12px] font-semibold text-livv-muted underline-offset-4 hover:underline">
            Membership accelerates Embers
          </Link>
        </section>
      </div>
    </main>
  );
}
