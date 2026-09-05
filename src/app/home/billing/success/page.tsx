"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyStripeEntitlement } from "@/lib/billing";
import type { LivvTier } from "@/lib/identity";
import { feedback } from "@/lib/sensory";

export default function BillingSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Confirming your membership…");

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setStatus("error");
      setMessage("Missing checkout session.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`);
        const data = (await res.json()) as {
          tier?: LivvTier;
          customerId?: string;
          subscriptionId?: string;
          error?: string;
        };

        if (!res.ok || !data.tier) {
          if (!cancelled) {
            setStatus("error");
            setMessage(data.error || "Could not confirm payment.");
          }
          return;
        }

        applyStripeEntitlement({
          tier: data.tier,
          customerId: data.customerId,
          subscriptionId: data.subscriptionId,
        });
        feedback("unlock");

        if (!cancelled) {
          setStatus("ok");
          setMessage(`${label(data.tier)} is active on this device.`);
          window.setTimeout(() => router.replace("/home/profile"), 1600);
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Network error confirming payment.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#050505] px-6 text-center text-white">
      <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-livv-accent-soft">
        Billing
      </p>
      <h1 className="font-display mt-3 text-[28px] font-semibold tracking-tight">
        {status === "loading" && "Almost there"}
        {status === "ok" && "You’re in"}
        {status === "error" && "Something stalled"}
      </h1>
      <p className="mt-3 max-w-sm text-[14px] text-white/45">{message}</p>
      {status === "error" && (
        <button
          type="button"
          onClick={() => router.replace("/home/profile")}
          className="mt-8 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-black"
        >
          Back to profile
        </button>
      )}
    </main>
  );
}

function label(tier: LivvTier) {
  return (
    {
      spark: "Spark",
      rise: "Rise",
      apex: "Apex",
      circle: "Inner Circle",
    } as const
  )[tier];
}
