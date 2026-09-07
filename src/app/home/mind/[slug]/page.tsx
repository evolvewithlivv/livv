"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AmbientField } from "@/components/layout/ambient-field";
import { articleBySlug, WIKI } from "@/lib/wiki";
import { logCustomAction } from "@/lib/record";
import { feedback } from "@/lib/sensory";
import { useState } from "react";

export default function WikiArticlePage() {
  const params = useParams<{ slug: string }>();
  const article = articleBySlug(String(params.slug || ""));
  const [did, setDid] = useState(false);

  if (!article) {
    return (
      <main className="min-h-dvh bg-[#050505] px-5 pt-16 text-white">
        <p className="text-white/40">That page is not in the wiki.</p>
        <Link href="/home/mind" className="mt-4 inline-block text-livv-accent-soft">Back to Mind →</Link>
      </main>
    );
  }

  const related = WIKI.filter((a) => a.desk === article.desk && a.slug !== article.slug).slice(0, 3);

  const markRead = () => {
    if (did) return;
    logCustomAction({ title: `Wiki · ${article.title}`, pillar: "Mind", size: "small" });
    feedback("complete");
    setDid(true);
  };

  return (
    <main className="relative min-h-full overflow-hidden pb-20">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <AmbientField />
      </div>
      <article className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <Link href="/home/mind" className="text-[10px] uppercase tracking-[0.28em] text-white/30">Mind → {article.desk}</Link>
        <h1 className="font-display mt-3 text-[32px] font-semibold leading-[1.05] tracking-tight">{article.title}</h1>
        <p className="mt-3 text-[16px] leading-relaxed text-white/50">{article.hook}</p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-white/25">{article.readMins} min read</p>

        <div className="mt-8 space-y-5">
          {article.body.map((p) => (
            <p key={p.slice(0, 24)} className="text-[15px] leading-[1.65] text-white/72">{p}</p>
          ))}
        </div>

        <section className="mt-10 rounded-[24px] border border-livv-accent/25 bg-livv-accent/[0.07] p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-livv-accent-soft">The move</p>
          <p className="mt-2 text-[15px] leading-relaxed text-white/85">{article.move}</p>
          <button
            type="button"
            onClick={markRead}
            className="mt-4 w-full rounded-full bg-white py-3 text-[13px] font-semibold text-black"
          >
            {did ? "Logged to Mind" : "I did the move · log it"}
          </button>
        </section>

        <section className="mt-10">
          <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">Sources</p>
          <ul className="mt-3 space-y-2">
            {article.sources.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target={s.href.startsWith("/") ? undefined : "_blank"}
                  rel={s.href.startsWith("/") ? undefined : "noreferrer"}
                  className="block rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-[13px] text-white/70"
                >
                  {s.label}
                  <span className="mt-1 block truncate text-[10px] text-white/25">{s.href}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">Same desk</p>
            <div className="mt-3 space-y-2">
              {related.map((a) => (
                <Link key={a.slug} href={`/home/mind/${a.slug}`} className="block text-[14px] text-white/55">
                  {a.title} →
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
