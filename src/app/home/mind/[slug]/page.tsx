"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AmbientField } from "@/components/layout/ambient-field";
import { articleBySlug, deskMeta, nextArticle } from "@/lib/wiki";
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
        <Link href="/home/mind" className="mt-4 inline-block text-livv-accent-soft">Back to Mind</Link>
      </main>
    );
  }

  const desk = deskMeta(article.desk);
  const nxt = nextArticle(article.slug);

  const markRead = () => {
    if (did) return;
    logCustomAction({ title: `Wiki · ${article.title}`, pillar: "Mind", size: "small" });
    feedback("complete");
    setDid(true);
  };

  return (
    <main className="relative min-h-full overflow-hidden pb-24">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div
          className="absolute left-1/2 top-[-160px] h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-2xl"
          style={{ background: `radial-gradient(circle, ${desk.glow}, transparent 68%)` }}
        />
        <AmbientField intensity="strong" />
      </div>

      <article className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <div className="flex items-center justify-between">
          <Link href="/home/mind" className="text-[11px] text-white/40">← Wiki</Link>
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: desk.hex, background: `${desk.hex}22`, boxShadow: `0 0 24px ${desk.glow}` }}
          >
            {desk.label}
          </span>
        </div>

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div className="h-full w-2/5 rounded-full" style={{ background: desk.hex, boxShadow: `0 0 16px ${desk.hex}` }} />
        </div>

        <h1 className="font-display mt-6 text-[34px] font-semibold leading-[1.02] tracking-tight">{article.title}</h1>
        <p className="mt-3 text-[17px] leading-snug" style={{ color: desk.hex }}>
          {article.hook}
        </p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-white/30">{article.readMins} min</p>

        <div className="mt-8 space-y-4">
          {article.beats.map((b) => (
            <div
              key={b.k}
              className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4"
              style={{ boxShadow: `inset 3px 0 0 ${desk.hex}` }}
            >
              <p className="text-[10px] font-semibold tabular-nums" style={{ color: desk.hex }}>
                {b.k}
              </p>
              <p className="mt-2 text-[15px] leading-[1.6] text-white/80">{b.t}</p>
            </div>
          ))}
        </div>

        <section
          className="mt-8 overflow-hidden rounded-[26px] border p-5"
          style={{ borderColor: `${desk.hex}55`, background: `linear-gradient(180deg, ${desk.hex}22, rgba(255,255,255,0.03))` }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: desk.hex }}>
            Do this now
          </p>
          <p className="mt-2 text-[16px] leading-relaxed text-white">{article.move}</p>
          <button
            type="button"
            onClick={markRead}
            className="mt-5 w-full rounded-full py-3.5 text-[14px] font-semibold text-black"
            style={{ background: desk.hex }}
          >
            {did ? "Logged. Next page ↓" : "I did it · log + embers"}
          </button>
        </section>

        <section className="mt-10">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Read the source</p>
          <ul className="mt-3 space-y-2">
            {article.sources.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target={s.href.startsWith("/") ? undefined : "_blank"}
                  rel={s.href.startsWith("/") ? undefined : "noreferrer"}
                  className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3.5 active:scale-[0.98]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-white/85">{s.label}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-white/30">{s.href.replace("https://", "")}</span>
                  </span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-black" style={{ background: desk.hex }}>
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <Link
          href={`/home/mind/${nxt.slug}`}
          onClick={() => feedback("tick")}
          className="mt-10 flex items-center gap-4 rounded-[26px] border border-white/12 bg-white/[0.05] p-4 active:scale-[0.98]"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Next page</p>
            <p className="mt-1 text-[17px] font-semibold leading-snug">{nxt.title}</p>
          </div>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-semibold text-black" style={{ background: deskMeta(nxt.desk).hex }}>
            →
          </span>
        </Link>
      </article>
    </main>
  );
}
