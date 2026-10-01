"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { moduleById } from "@/lib/vault";

export default function VaultModulePage() {
  const params = useParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  const mod = useMemo(() => (id ? moduleById(id) : null), [id]);

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
