"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyStripeEntitlement, hydrateServerEntitlement, invalidateServerEntitlementCache } from "@/lib/billing";
import type { LivvTier } from "@/lib/identity";
import { feedback } from "@/lib/sensory";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { syncCloudMemberState } from "@/lib/supabase/cloud-state";

export default function BillingSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Confirming payment…");

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
        const client = isSupabaseConfigured() ? getSupabaseBrowserClient() : null;
        const { data: sd } = (await client?.auth.getSession()) ?? { data: { session: null } };
        const token = sd.session?.access_token;
        if (isSupabaseConfigured() && !token) {
          setStatus("error");
          setMessage("Your LIVV identity session is still loading. Reload and try again.");
          return;
        }

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`, {
          headers,
          cache: "no-store",
        });
        const data = (await res.json()) as {
          kind?: string;
          grade?: number;
          qty?: number;
          tier?: LivvTier;
          customerId?: string;
          subscriptionId?: string;
          error?: string;
        };

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Could not confirm payment.");
          return;
        }

        // Packs are retired from V1. Historical pack checkout sessions are acknowledged
        // without local grants; pack_purchases rows remain for audit only.
        if (data.kind === "pack") {
          await syncCloudMemberState().catch(() => undefined);
          feedback("tick");
          if (!cancelled) {
            setStatus("ok");
            setMessage("Payment received. Digital packs are no longer part of LIVV.");
            window.setTimeout(() => router.replace("/home/shop"), 1400);
          }
          return;
        }

        if (!data.tier) {
          setStatus("error");
          setMessage(data.error || "Could not confirm payment.");
          return;
        }

        applyStripeEntitlement({
          tier: data.tier,
          customerId: data.customerId,
          subscriptionId: data.subscriptionId,
        });
        invalidateServerEntitlementCache();
        void hydrateServerEntitlement();
        await syncCloudMemberState().catch(() => undefined);
        feedback("unlock");

        if (!cancelled) {
          setStatus("ok");
          setMessage(`${label(data.tier)} is active on your account.`);
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-livv-accent-soft">Billing</p>
      <h1 className="font-display mt-3 text-[28px] font-semibold tracking-tight">
        {status === "loading" && "Almost there"}
        {status === "ok" && "You’re in"}
        {status === "error" && "Something stalled"}
      </h1>
      <p className="mt-3 max-w-sm text-[14px] text-white/45">{message}</p>
      {status === "error" ? (
        <button
          type="button"
          onClick={() => router.replace("/home/shop")}
          className="mt-8 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-black"
        >
          Back to shop
        </button>
      ) : null}
    </main>
  );
}

function label(tier: LivvTier) {
  return ({ spark: "Spark", rise: "Rise", apex: "Apex", circle: "Inner Circle" } as const)[tier];
}
