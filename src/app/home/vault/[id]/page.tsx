"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Lock } from "lucide-react";
import { getEffectiveTier, hydrateServerEntitlement } from "@/lib/billing";
import { hasTier } from "@/lib/membership";
import { moduleById } from "@/lib/vault";
import type { LivvTier } from "@/lib/identity";

export default function VaultModulePage() {
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
    window.addEventListener("livv-billing", sync);
    return () => window.removeEventListener("livv-billing", sync);
  }, []);

  if (!mod) {
    return (
      <main className="livv-page min-h-full px-5 pt-10">
        <p className="text-livv-muted">Module not found.</p>
        <Link href="/home/vault" className="mt-4 inline-block text-[13px] font-semibold underline">
          Back to Vault
        </Link>
      </main>
    );
  }

  const allowed = hasTier(tier, mod.minTier);

  if (!allowed) {
    return (
      <main className="livv-page min-h-full pb-24">
        <div className="mx-auto w-full max-w-xl px-5 pt-6">
          <Link
            href="/home/vault"
            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-livv-muted"
          >
            <ArrowLeft size={12} /> Vault
          </Link>
          <div className="mt-10 rounded-[22px] border border-livv-border px-5 py-8 text-center">
            <Lock size={22} className="mx-auto text-livv-muted" />
            <h1 className="mt-4 text-[22px] font-semibold tracking-[-0.03em]">{mod.title}</h1>
            <p className="mt-2 text-[13px] text-livv-muted">
              Requires {mod.minTier === "apex" ? "Apex" : "Rise"} or higher.
            </p>
            <Link
              href="/home/tiers"
              className="mt-6 inline-flex rounded-full bg-[rgb(var(--livv-ink))] px-6 py-3 text-[13px] font-semibold text-[rgb(var(--livv-bg))]"
            >
              View tiers
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="livv-page min-h-full pb-24">
      <div className="mx-auto w-full max-w-xl px-5 pt-6 sm:px-6">
        <Link
          href="/home/vault"
          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-livv-muted"
        >
          <ArrowLeft size={12} /> Vault
        </Link>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
          {mod.kind} · {mod.meta}
        </p>
        <h1 className="mt-2 text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] sm:text-[34px]">
          {mod.title}
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-livv-muted">{mod.blurb}</p>

        {mod.body?.map((p) => (
          <p key={p.slice(0, 24)} className="mt-4 text-[15px] leading-7 text-[rgb(var(--livv-ink))]">
            {p}
          </p>
        ))}

        {mod.steps && mod.steps.length > 0 ? (
          <ol className="mt-8 space-y-4">
            {mod.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-livv-accent-soft text-[11px] font-bold text-livv-accent">
                  {i + 1}
                </span>
                <p className="text-[14px] leading-6 text-[rgb(var(--livv-ink))]">{step}</p>
              </li>
            ))}
          </ol>
        ) : null}

        {mod.downloadable ? (
          <Link
            href={`/home/vault/${mod.id}/print`}
            className="mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-[rgb(var(--livv-ink))] py-3.5 text-[13px] font-semibold text-[rgb(var(--livv-bg))]"
          >
            <Download size={16} />
            Download / print PDF
          </Link>
        ) : null}

        <p className="mt-4 text-center text-[11px] text-livv-muted">
          Opens a clean print layout. Use Share → Save to Files or Print → PDF.
        </p>
      </div>
    </main>
  );
}
