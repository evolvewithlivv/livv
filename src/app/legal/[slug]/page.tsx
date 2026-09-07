"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { LEGAL, LEGAL_DOCS, legalBySlug } from "@/lib/legal";

export default function LegalPage() {
  const params = useParams<{ slug: string }>();
  const doc = legalBySlug(String(params.slug || ""));

  if (!doc) {
    return (
      <main className="min-h-dvh bg-[#050505] px-5 pt-16 text-white">
        <p className="text-white/40">That page does not exist.</p>
        <Link href="/legal/terms" className="mt-4 inline-block text-white/70">Terms</Link>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#050505] pb-20 text-white">
      <div className="mx-auto max-w-lg px-5 pt-8">
        <Link href="/home/settings" className="text-[11px] text-white/35">
          ← Settings
        </Link>
        <p className="mt-6 text-[10px] uppercase tracking-[0.28em] text-white/30">Legal</p>
        <h1 className="font-display mt-2 text-[34px] font-semibold tracking-tight">{doc.title}</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-white/45">{doc.blurb}</p>
        <p className="mt-2 text-[11px] text-white/30">
          {LEGAL.product} · Effective {LEGAL.effective}
        </p>

        <nav className="mt-6 flex flex-wrap gap-2">
          {LEGAL_DOCS.map((d) => (
            <Link
              key={d.slug}
              href={`/legal/${d.slug}`}
              className={d.slug === doc.slug ? "rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-black" : "rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-white/45"}
            >
              {d.title}
            </Link>
          ))}
        </nav>

        <div className="mt-10 space-y-10">
          {doc.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-[16px] font-semibold">{s.h}</h2>
              {s.p.map((para) => (
                <p key={para.slice(0, 40)} className="mt-3 text-[14px] leading-[1.7] text-white/65">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-14 text-[11px] leading-relaxed text-white/25">
          These pages are the live policy for {LEGAL.product}. They are not a substitute for advice from your own lawyer. Questions: {LEGAL.email}
        </p>
      </div>
    </main>
  );
}
