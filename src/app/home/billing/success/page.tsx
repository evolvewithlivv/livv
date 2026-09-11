"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  applyStripeEntitlement,
  hydrateServerEntitlement,
  invalidateServerEntitlementCache,
} from "@/lib/billing";
import type { LivvTier } from "@/lib/identity";
import { grantPurchasedPack } from "@/lib/pack-shop";
import type { PackGrade } from "@/lib/packs";
import { GRADE_META } from "@/lib/packs";
import { feedback } from "@/lib/sensory";
import { ensureAnonymousSession } from "@/lib/supabase/anon-session";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

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
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (isSupabaseConfigured()) {
          await ensureAnonymousSession();
          const client = getSupabaseBrowserClient();
          const { data } = await client?.auth.getSession() ?? { data: { session: null } };
          const token = data.session?.access_token;
          if (!token) {
            if (!cancelled) {
              setStatus("error");
              setMessage("Your LIVV identity session is still loading. Reload and try again.");
            }
            return;
          }
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(
          `/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`,
          { headers }
        );
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
          if (!cancelled) {
            setStatus("error");
            setMessage(data.error || "Could not confirm payment.");
          }
          return;
        }

        if (data.kind === "pack" && data.grade) {
          const key = `livv-pack-session-${sessionId}`;
          if (!window.localStorage.getItem(key)) {
            grantPurchasedPack(data.grade as PackGrade, data.qty || 1);
            window.localStorage.setItem(key, "1");
          }
          feedback("unlock");
          if (!cancelled) {
            const name = GRADE_META[data.grade as PackGrade]?.name || "Pack";
            setStatus("ok");
            setMessage(`${name} is in your chamber.`);
            window.setTimeout(() => router.replace("/home/shop"), 1400);
          }
          return;
        }

        if (!data.tier) {
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
        invalidateServerEntitlementCache();
        void hydrateServerEntitlement();
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
          onClick={() => router.replace("/home/shop")}
          className="mt-8 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-black"
        >
          Back to packs
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
