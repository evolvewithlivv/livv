"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronLeft, Crown, Flame, LockKeyhole, Sparkles, Zap } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { loadIdentity, type Identity } from "@/lib/identity";
import { TIERS, getTier, hasTier } from "@/lib/membership";
import { getEffectiveTier, openBillingPortal, startCheckout } from "@/lib/billing";
import { feedback } from "@/lib/sensory";

const PAID_TIERS = ["rise", "apex", "circle"] as const;
const TIER_ICONS = { spark: Flame, rise: Zap, apex: Sparkles, circle: Crown } as const;

export default function TiersPage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [effectiveTier, setEffectiveTier] = useState(getEffectiveTier());
  const [selected, setSelected] = useState<Identity["tier"]>(getEffectiveTier());
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
    for (const event of ["livv-identity", "livv-billing"]) window.addEventListener(event, sync);
    return () => {
      for (const event of ["livv-identity", "livv-billing"]) window.removeEventListener(event, sync);
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

  if (!me) return <main className="min-h-dvh" />;

  const selectedDef = getTier(selected);
  const Icon = TIER_ICONS[selected];
  const isCurrent = selected === effectiveTier;
  const canAccess = hasTier(effectiveTier, selected);

  return (
    <main className="livv-account-page livv-page min-h-full pb-28">
      <div className="account-inner mx-auto max-w-xl px-5 pt-5">
        <div className="mb-2">
          <Link href="/home/profile" className="inline-flex items-center gap-1 text-[12px] account-muted">
            <ChevronLeft size={16} /> Profile
          </Link>
        </div>
        <PageHero
          eyebrow="Membership"
          title="Choose your tier."
          subtitle="Unlock more of LIVV as you grow. Your tier travels with your account."
          accent="#1769ff"
        />
        <section className="membership-panel mt-6 overflow-hidden">
          <div className="membership-tabs flex gap-2 overflow-x-auto pb-1">
            {TIERS.map((t) => {
              const active = selected === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setSelected(t.id);
                    feedback("tick");
                  }}
                  className={`membership-tab shrink-0 ${active ? "membership-tab-active" : ""}`}
                >
                  <span>{t.name}</span>
                  {t.featured && <span className="membership-tab-dot" />}
                </button>
              );
            })}
          </div>
          <div className="membership-featured mt-4">
            <div className="membership-featured-top">
              <div className="membership-tier-mark">
                <Icon size={19} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[18px] font-semibold">{selectedDef.name}</p>
                  {selectedDef.featured && <span className="membership-featured-pill">Featured</span>}
                  {isCurrent && <span className="membership-current-pill">Your tier</span>}
                </div>
                <p className="mt-1 text-[11px] account-muted">{selectedDef.blurb}</p>
              </div>
              <div className="text-right">
                <p className="text-[20px] font-semibold">{selectedDef.price}</p>
                <p className="text-[10px] account-muted">
                  {selectedDef.cadence === "forever" ? "No card required" : selectedDef.cadence}
                </p>
              </div>
            </div>
            <div className="membership-benefit-grid">
              {selectedDef.perks.map((perk) => (
                <div key={perk} className="membership-benefit">
                  <span className="membership-check">
                    <Check size={12} />
                  </span>
                  <span>{perk}</span>
                </div>
              ))}
            </div>
            <div className="membership-multiplier">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.16em] account-muted">Ember multiplier</p>
                <p className="mt-1 text-[24px] font-semibold">
                  {selectedDef.multiplier}x{" "}
                  <span className="text-[11px] font-normal account-muted">on standard Ember awards</span>
                </p>
              </div>
              <div className="membership-multiplier-bar">
                <span style={{ width: `${Math.min(100, (selectedDef.multiplier / 6) * 100)}%` }} />
              </div>
            </div>
            <div className="membership-action-row">
              {isCurrent ? (
                <button type="button" onClick={() => void onPortal()} disabled={billingBusy} className="membership-secondary">
                  {effectiveTier === "spark" ? "You are on Spark" : "Manage membership"}
                  <ArrowUpRight size={14} />
                </button>
              ) : canAccess ? (
                <div className="membership-unlocked">
                  <Check size={14} /> Included with your membership
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (selected === "rise" || selected === "apex" || selected === "circle") void checkout(selected);
                  }}
                  disabled={billingBusy}
                  className="membership-primary"
                >
                  {billingBusy ? "Opening checkout..." : `Unlock ${selectedDef.name}`}
                  <ArrowUpRight size={15} />
                </button>
              )}
              <span className="membership-next-hint">
                {selected === "spark"
                  ? "Start free, then unlock more when you are ready."
                  : selected === "circle"
                    ? "Annual membership with the full LIVV tier stack."
                    : `Next: ${getTier(selected === "rise" ? "apex" : "circle").name}`}
              </span>
            </div>
          </div>
          {error && (
            <p className="mt-3 text-[12px] text-red-500" role="status">
              {error}
            </p>
          )}
          <div className="membership-footnote">
            <LockKeyhole size={12} /> Membership status follows your account across devices.
          </div>
        </section>
      </div>
    </main>
  );
}
