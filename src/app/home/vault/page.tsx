"use client";

import Link from "next/link";
import { BookOpen, Download, FlaskConical, Sparkles, Wrench } from "lucide-react";
import { VAULT_MODULES, type VaultModule } from "@/lib/vault";

const KIND_ICON = {
  protocol: BookOpen,
  tool: Wrench,
  program: Sparkles,
  series: BookOpen,
  lab: FlaskConical,
} as const;

export default function VaultPage() {
  return (
    <main className="livv-page min-h-full pb-24">
      <div className="mx-auto w-full max-w-xl px-5 pt-6 sm:px-6">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Vault</p>
          <h1 className="mt-2 text-[32px] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[36px]">Tools for real life.</h1>
          <p className="mt-3 max-w-[36ch] text-[14px] leading-6 text-livv-muted">Protocols, tools, programs, and downloads. Useful by design. Free to every LIVV user.</p>
        </header>
        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-livv-muted">The collection</h2>
          <div className="mt-4 space-y-3">
            {VAULT_MODULES.map((mod) => <ModuleCard key={mod.id} mod={mod} />)}
          </div>
        </section>
      </div>
    </main>
  );
}

function ModuleCard({ mod }: { mod: VaultModule }) {
  const Icon = KIND_ICON[mod.kind];
  return (
    <Link href={`/home/vault/${mod.id}`} className="block rounded-[18px] border border-livv-border px-4 py-4 transition active:scale-[0.99]">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-livv-accent/30 bg-livv-accent-soft text-livv-accent"><Icon size={16} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[rgb(var(--livv-ink))]">{mod.title}</h3>
            {mod.downloadable ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-livv-muted"><Download size={10} /> PDF</span> : null}
          </div>
          <p className="mt-1 text-[12px] leading-5 text-livv-muted">{mod.blurb}</p>
          <p className="mt-1.5 text-[11px] text-livv-muted">{mod.meta}</p>
        </div>
      </div>
    </Link>
  );
}
