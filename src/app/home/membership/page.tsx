"use client";

import Link from "next/link";
import { useState } from "react";
import { openBillingPortal } from "@/lib/billing";

export default function MembershipPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function manageExistingBilling() {
    setBusy(true);
    setMessage("");
    const result = await openBillingPortal();
    if (!result.ok) setMessage(result.error || "No active billing account was found.");
    setBusy(false);
  }

  return (
    <main className="min-h-dvh bg-[rgb(var(--livv-bg))] px-5 py-10 text-[rgb(var(--livv-ink))]">
      <div className="mx-auto max-w-lg">
        <Link href="/home/profile" className="text-sm text-[rgb(var(--livv-muted))]">← Back to You</Link>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--livv-muted))]">LIVV access</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Evolve with purpose.</h1>
        <p className="mt-4 text-base leading-7 text-[rgb(var(--livv-muted))]">LIVV’s core is free. No tiers. No monthly fee to keep using your tools, learning practical skills, or building your personal record.</p>

        <section className="mt-8 border-y border-[rgb(var(--livv-border))] py-6">
          <h2 className="text-lg font-semibold">Your progress belongs to you.</h2>
          <p className="mt-2 text-sm leading-6 text-[rgb(var(--livv-muted))]">We’re building LIVV to help people become more capable in real life, not to put their progress behind a recurring bill. We’ll explore sustainable ways to support the platform without making core access depend on a subscription.</p>
        </section>

        <section className="mt-6">
          <h2 className="text-base font-semibold">Already paying for a LIVV membership?</h2>
          <p className="mt-2 text-sm leading-6 text-[rgb(var(--livv-muted))]">You can still open the billing portal to review or cancel an existing subscription. This does not start a new subscription.</p>
          <button type="button" disabled={busy} onClick={() => void manageExistingBilling()} className="mt-4 rounded-full border border-[rgb(var(--livv-border))] px-5 py-3 text-sm font-semibold disabled:opacity-50">{busy ? "Opening billing…" : "Manage existing billing"}</button>
          {message ? <p role="status" className="mt-4 text-sm text-[rgb(var(--livv-muted))]">{message}</p> : null}
        </section>

        <p className="mt-8 text-xs leading-5 text-[rgb(var(--livv-muted))]">LIVV does not offer new paid tiers. Any existing subscription remains separate until you review or cancel it in the billing portal.</p>
      </div>
    </main>
  );
}
