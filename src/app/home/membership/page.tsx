"use client";

import Link from "next/link";
import { useState } from "react";
import { startCheckout, openBillingPortal } from "@/lib/billing";
import type { LivvTier } from "@/lib/identity";

const plans: { tier: Exclude<LivvTier, "spark">; name: string; price: string; description: string; features: string[] }[] = [
  { tier: "rise", name: "Rise", price: "$8.99", description: "A stronger foundation.", features: ["Expanded personal capability tools", "More room to build your record", "Support LIVV’s free core"] },
  { tier: "apex", name: "Apex", price: "$24.99", description: "For consistent, intentional growth.", features: ["Everything in Rise", "Expanded tools and experiences", "More ways to build capability"] },
  { tier: "circle", name: "Circle", price: "$39.99", description: "The fullest LIVV membership.", features: ["Everything in Apex", "Access to Circle-level experiences", "Help sustain free core access"] },
];

export default function MembershipPage() {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  async function choose(tier: Exclude<LivvTier, "spark">) {
    setBusy(tier); setMessage("");
    const result = await startCheckout(tier);
    if (!result.ok) setMessage(result.error || "Checkout is unavailable right now.");
    setBusy(null);
  }
  async function manage() {
    setBusy("manage"); setMessage("");
    const result = await openBillingPortal();
    if (!result.ok) setMessage(result.error || "Billing portal is unavailable.");
    setBusy(null);
  }

  return (
    <main className="min-h-dvh bg-[rgb(var(--livv-bg))] px-5 py-10 text-[rgb(var(--livv-ink))]">
      <div className="mx-auto max-w-lg">
        <Link href="/home/profile" className="text-sm text-[rgb(var(--livv-muted))]">← Back to You</Link>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--livv-muted))]">LIVV membership</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Evolve with purpose.</h1>
        <p className="mt-4 text-base leading-7 text-[rgb(var(--livv-muted))]">The core stays free. Memberships help support the tools, guidance, and practical experiences that help people become more capable in real life.</p>
        <div className="mt-8 space-y-4">
          {plans.map((plan) => (
            <section key={plan.tier} className="rounded-2xl border border-[rgb(var(--livv-border))] p-5">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-xl font-semibold">{plan.name}</h2><p className="mt-1 text-sm text-[rgb(var(--livv-muted))]">{plan.description}</p></div>
                <div className="shrink-0 text-right"><span className="text-2xl font-semibold">{plan.price}</span><span className="block text-xs text-[rgb(var(--livv-muted))]">USD / month</span></div>
              </div>
              <ul className="my-5 space-y-2 text-sm">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><span aria-hidden="true">✓</span><span>{feature}</span></li>)}</ul>
              <button type="button" disabled={busy !== null} onClick={() => void choose(plan.tier)} className="w-full rounded-full bg-[rgb(var(--livv-ink))] px-5 py-3 text-sm font-semibold text-[rgb(var(--livv-bg))] disabled:opacity-50">{busy === plan.tier ? "Connecting to secure checkout…" : `Choose ${plan.name}`}</button>
            </section>
          ))}
        </div>
        <div className="mt-8 border-t border-[rgb(var(--livv-border))] pt-5">
          <button type="button" disabled={busy !== null} onClick={() => void manage()} className="text-sm underline underline-offset-4 disabled:opacity-50">{busy === "manage" ? "Opening billing…" : "Already a member? Manage billing"}</button>
          {message ? <p role="alert" className="mt-4 text-sm text-red-600">{message}</p> : null}
          <p className="mt-5 text-xs leading-5 text-[rgb(var(--livv-muted))]">Secure payments are processed by Stripe. You can manage or cancel your subscription through the billing portal. Your membership does not remove access to LIVV’s free core.</p>
        </div>
      </div>
    </main>
  );
}
