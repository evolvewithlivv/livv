import type { Metadata } from "next";
import Link from "next/link";
import { TIERS } from "@/lib/membership";

export const metadata: Metadata = {
  title: "Pricing",
  description: "LIVV core is free. No subscription is required to start.",
};

export default function PricingPage() {
  const plan = TIERS[0];

  return (
    <main className="auth-page relative min-h-dvh text-[rgb(var(--livv-ink))]">
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[rgb(var(--livv-muted))]">Pricing</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">{plan.price}</h1>
        <p className="mt-3 text-[15px] leading-6 text-[rgb(var(--livv-muted))]">{plan.blurb} {plan.cadence === "forever" ? "No subscription is required to start." : plan.cadence}</p>
        <ul className="mt-8 space-y-3 text-[14px] leading-6">
          {plan.perks.map((perk) => (
            <li key={perk} className="border-b border-[rgb(var(--livv-border))] pb-3">{perk}</li>
          ))}
        </ul>
        <Link
          href="/go/001"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[rgb(var(--livv-ink))] px-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--livv-bg))]"
        >
          Create a free account
        </Link>
      </div>
    </main>
  );
}
