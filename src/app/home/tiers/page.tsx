"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  Crown,
  Flame,
  LockKeyhole,
  Sparkles,
  Zap,
} from "lucide-react";
import { loadIdentity, type Identity } from "@/lib/identity";
import { TIERS, getTier, hasTier } from "@/lib/membership";
import { getEffectiveTier, openBillingPortal, startCheckout } from "@/lib/billing";

const PAID_TIERS = ["rise", "apex", "circle"] as const;
const TIER_ICONS = {
  spark: Flame,
  rise: Zap,
  apex: Sparkles,
  circle: Crown,
} as const;

export default function TiersPage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [effectiveTier, setEffectiveTier] = useState(getEffectiveTier());
  const [billingBusy, setBillingBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sync = () => {
      try {
        setMe(loadIdentity());
        setEffectiveTier(getEffectiveTier());
      } catch {
        /* keep last good state */
      }
    };
    sync();
    for (const event of ["livv-identity", "livv-billing"]) {
      window.addEventListener(event, sync);
    }
    return () => {
      for (const event of ["livv-identity", "livv-billing"]) {
        window.removeEventListener(event, sync);
      }
    };
  }, []);

  const checkout = async (nextTier: (typeof PAID_TIERS)[number]) => {
    setBillingBusy(true);
    setError("");
    try {
      const result = await startCheckout(nextTier);
      if (!result.ok) setError(result.error || "Checkout unavailable.");
    } finally {
      setBillingBusy(false);
    }
  };

  const onPortal = async () => {
    setBillingBusy(true);
    setError("");
    try {
      const result = await openBillingPortal();
      if (!result.ok) setError(result.error || "Billing portal unavailable.");
    } finally {
      setBillingBusy(false);
    }
  };

  if (!me) return <main className="livv-page min-h-full" />;

  const current = getTier(effectiveTier);

  return (
    <main className="livv-page min-h-full pb-14">
      <div className="mx-auto w-full max-w-xl px-5 pt-6 sm:px-6">
        <header>
          <Link
            href="/home/profile"
            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted"
          >
            <ChevronLeft size={13} /> Profile
          </Link>
          <p className="mt-7 text-[10px] font-semibold uppercase tracking-[.2em] text-livv-muted">
            Membership
          </p>
          <h1 className="mt-2 text-[32px] font-semibold leading-[1.02] tracking-[-.05em] sm:text-[38px]">
            How far do you want the system to go with you?
          </h1>
          <p className="mt-3 max-w-[40ch] text-[13px] leading-6 text-livv-muted">
            Spark is the full core. Rise and above open the Vault: protocols, tools, and downloads.
            Your tier travels with your account.
          </p>
        </header>

        <section className="mt-8 border-y border-livv-border py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-livv-muted">
                Your tier
              </p>
              <p className="mt-1 text-[18px] font-semibold tracking-[-.03em]">{current.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[18px] font-semibold tabular-nums">
                {current.price}
                <span className="text-[11px] font-normal text-livv-muted">{current.cadence}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-livv-muted">{current.multiplier}x Embers</p>
            </div>
          </div>
          {effectiveTier !== "spark" && (
            <button
              type="button"
              onClick={() => void onPortal()}
              disabled={billingBusy}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-livv-border py-3 text-[12px] font-semibold uppercase tracking-[.12em] text-livv-muted disabled:opacity-50"
            >
              Manage membership
              <ArrowUpRight size={14} />
            </button>
          )}
        </section>

        <section className="mt-8 space-y-6">
          {TIERS.map((tier) => {
            const Icon = TIER_ICONS[tier.id];
            const isCurrent = tier.id === effectiveTier;
            const unlocked = hasTier(effectiveTier, tier.id);
            const isPaid = PAID_TIERS.includes(tier.id as (typeof PAID_TIERS)[number]);

            return (
              <article
                key={tier.id}
                className={
                  "border-t border-livv-border pt-5 " +
                  (isCurrent ? "" : "")
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={
                        "grid h-10 w-10 shrink-0 place-items-center rounded-full border " +
                        (isCurrent
                          ? "border-livv-accent/40 bg-livv-accent-soft text-livv-accent"
                          : "border-livv-border text-livv-muted")
                      }
                    >
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[17px] font-semibold tracking-[-.03em]">{tier.name}</h2>
                        {isCurrent && (
                          <span className="text-[9px] font-bold uppercase tracking-[.12em] text-livv-accent">
                            Current
                          </span>
                        )}
                        {tier.featured && !isCurrent && (
                          <span className="text-[9px] font-bold uppercase tracking-[.12em] text-livv-muted">
                            Most chosen
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[12px] leading-5 text-livv-muted">{tier.blurb}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[17px] font-semibold tabular-nums">
                      {tier.price}
                      <span className="text-[11px] font-normal text-livv-muted">{tier.cadence}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-livv-muted">{tier.multiplier}x Embers</p>
                  </div>
                </div>

                <ul className="mt-4 space-y-2.5">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex gap-2.5 text-[12px] leading-5">
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-livv-accent-soft text-livv-accent">
                        <Check size={10} strokeWidth={3} />
                      </span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  {isCurrent ? (
                    <div className="flex items-center justify-center gap-2 rounded-full border border-livv-border py-3 text-[11px] font-semibold uppercase tracking-[.12em] text-livv-muted">
                      <Check size={14} className="text-livv-accent" /> Current plan
                    </div>
                  ) : unlocked ? (
                    <div className="flex items-center justify-center gap-2 rounded-full border border-livv-border py-3 text-[11px] font-semibold uppercase tracking-[.12em] text-livv-accent">
                      <Check size={14} /> Included with your membership
                    </div>
                  ) : isPaid ? (
                    <button
                      type="button"
                      onClick={() =>
                        void checkout(tier.id as (typeof PAID_TIERS)[number])
                      }
                      disabled={billingBusy}
                      className="livv-tier-unlock flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[12px] font-semibold uppercase tracking-[.12em] disabled:opacity-50"
                    >
                      {billingBusy ? "Opening checkout..." : `Continue with ${tier.name}`}
                      <ArrowUpRight size={14} />
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>

        {error && (
          <p className="mt-4 text-center text-[12px] text-red-500" role="status">
            {error}
          </p>
        )}

        <p className="mt-8 flex items-center justify-center gap-1.5 pb-4 text-[10px] text-livv-muted">
          <LockKeyhole size={12} /> Membership follows your account across devices.
        </p>
      </div>
    </main>
  );
}
