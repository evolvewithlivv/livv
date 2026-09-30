"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getEffectiveTier, hydrateServerEntitlement } from "@/lib/billing";
import { hasTier } from "@/lib/membership";
import { moduleById } from "@/lib/vault";
import type { LivvTier } from "@/lib/identity";

export default function VaultPrintPage() {
  const params = useParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";
  const mod = useMemo(() => (id ? moduleById(id) : null), [id]);
  const [tier, setTier] = useState<LivvTier>("spark");

  useEffect(() => {
    const sync = () => setTier(getEffectiveTier());
    sync();
    void hydrateServerEntitlement().then(sync);
  }, []);

  useEffect(() => {
    // Auto-open print dialog once content is ready and allowed
    if (!mod) return;
    if (!hasTier(tier, mod.minTier)) return;
    const t = window.setTimeout(() => {
      try {
        window.print();
      } catch {
        /* user can print manually */
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [mod, tier]);

  if (!mod) {
    return (
      <main className="p-8">
        <p>Not found.</p>
        <Link href="/home/vault">Back</Link>
      </main>
    );
  }

  if (!hasTier(tier, mod.minTier)) {
    return (
      <main className="p-8">
        <p>This download requires a higher membership tier.</p>
        <Link href="/home/tiers">View tiers</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[640px] bg-white px-8 py-10 text-black print:px-0 print:py-0">
      <div className="no-print mb-6 flex gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-black px-5 py-2.5 text-[13px] font-semibold text-white"
        >
          Print / Save as PDF
        </button>
        <Link
          href={`/home/vault/${mod.id}`}
          className="rounded-full border border-black/20 px-5 py-2.5 text-[13px] font-semibold"
        >
          Back
        </Link>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
        LIVV Member Vault · {mod.kind}
      </p>
      <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.03em]">{mod.title}</h1>
      <p className="mt-2 text-[15px] text-neutral-600">{mod.blurb}</p>
      <p className="mt-1 text-[12px] text-neutral-400">{mod.meta}</p>

      {mod.body?.map((p) => (
        <p key={p.slice(0, 20)} className="mt-4 text-[14px] leading-7 text-neutral-800">
          {p}
        </p>
      ))}

      {mod.steps && mod.steps.length > 0 ? (
        <ol className="mt-8 list-decimal space-y-3 pl-5">
          {mod.steps.map((step, i) => (
            <li key={i} className="text-[14px] leading-6 text-neutral-900">
              {step}
            </li>
          ))}
        </ol>
      ) : null}

      <p className="mt-12 border-t border-neutral-200 pt-4 text-[11px] text-neutral-400">
        evolvewithlivv.com · For personal use by LIVV members
      </p>

      <style jsx global>{`
        @media print {
          .no-print,
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </main>
  );
}
