"use client";

import { ShoppingBag } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";

export default function ShopPage() {
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

        <section className="mt-8 border-y border-livv-line py-12 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-livv-muted">
            Collection 001
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Nothing to sell yet.
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-livv-muted">
            LIVV is only showing products here when they are actually available.
            No placeholders. No stale listings. No fake catalog.
          </p>
        </section>

        <p className="mt-7 text-center text-[9px] uppercase tracking-[0.2em] text-livv-muted">
          Built to evolve with you
        </p>
      </div>
    </main>
  );
}
