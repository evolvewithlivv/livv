"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { moduleById } from "@/lib/vault";

export default function VaultPrintPage() {
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
      <main className="p-8">
        <p>Not found.</p>
        <Link href="/home/vault">Back</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[640px] bg-white px-8 py-10 text-black">
      <div className="mb-6 flex gap-3 print:hidden">
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
        LIVV Vault · {mod.kind}
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
        evolvewithlivv.com · For personal use by LIVV users
      </p>
    </main>
  );
}
