"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { articleBySlug, deskMeta, nextArticle } from "@/lib/wiki";
import { logCustomAction } from "@/lib/record";
import { feedback } from "@/lib/sensory";
import { useState } from "react";

const ARTICLE_COLORS = ["#60a5fa", "#c084fc", "#34d399", "#fbbf24", "#fb7185", "#22d3ee", "#f472b6", "#a3e635"];
function articleColor(slug: string) {
  let n = 0;
  for (let i = 0; i < slug.length; i++) n = (n * 31 + slug.charCodeAt(i)) >>> 0;
  return ARTICLE_COLORS[n % ARTICLE_COLORS.length];
}

export default function WikiArticlePage() {
  const params = useParams<{ slug: string }>();
  const article = articleBySlug(String(params.slug || ""));
  const [did, setDid] = useState(false);

  if (!article) return <main className="livv-page min-h-dvh px-5 pt-8 text-white"><p className="text-white/40">That page is not in the wiki.</p><Link href="/home/mind" className="mt-4 inline-block text-livv-accent-soft">Back to Mind</Link></main>;

  const desk = deskMeta(article.desk);
  const accent = articleColor(article.slug);
  const nxt = nextArticle(article.slug);
  const markRead = () => {
    if (did) return;
    logCustomAction({ title: `Wiki · ${article.title}`, pillar: "Mind", size: "small" });
    feedback("complete");
    setDid(true);
  };

  return (
    <main className="livv-page relative min-h-full overflow-hidden pb-24">
      <article className="relative z-10 mx-auto max-w-lg px-5 pt-5">
        <div className="flex items-center justify-between">
          <Link href="/home/mind" className="text-[11px] text-white/40">← Field</Link>
          <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.16em]" style={{ color: accent, background: `${accent}15`, boxShadow: `0 0 24px ${accent}18` }}>{desk.label}</span>
        </div>
        <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full w-2/5 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, ${desk.hex})`, boxShadow: `0 0 16px ${accent}` }} /></div>
        <h1 className="font-display mt-6 text-[34px] font-semibold leading-[1.02] tracking-tight">{article.title}</h1>
        <p className="mt-3 text-[17px] leading-snug" style={{ color: accent }}>{article.hook}</p>
        <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[.16em] text-white/25"><span>{article.readMins} min read</span><span>·</span><span>field note</span></div>

        <div className="mt-8 space-y-4">
          {article.beats.map((b, i) => (
            <div key={b.k} className="rounded-[22px] border bg-white/[.035] p-4" style={{ borderColor: `${accent}${i % 2 === 0 ? "30" : "20"}`, boxShadow: i === 0 ? `inset 3px 0 0 ${accent}` : "none" }}>
              <p className="text-[10px] font-semibold tabular-nums" style={{ color: accent }}>{b.k}</p>
              <p className="mt-2 text-[15px] leading-[1.6] text-white/80">{b.t}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 overflow-hidden rounded-[26px] border p-5" style={{ borderColor: `${accent}55`, background: `linear-gradient(180deg, ${accent}18, rgba(255,255,255,.025))` }}>
          <p className="text-[10px] font-semibold uppercase tracking-[.22em]" style={{ color: accent }}>Put it into motion</p>
          <p className="mt-2 text-[16px] leading-relaxed text-white">{article.move}</p>
          <button type="button" onClick={markRead} className="mt-5 w-full rounded-full py-3.5 text-[14px] font-semibold text-black" style={{ background: accent, boxShadow: `0 10px 28px ${accent}25` }}>{did ? "Logged · keep moving ↓" : "I did it · log + embers"}</button>
        </section>

        <section className="mt-10"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.22em] text-white/30">Sources</p><span className="text-[9px] uppercase tracking-[.18em] text-white/15">Read deeper</span></div><ul className="mt-3 space-y-2">{article.sources.map((s) => <li key={s.href}><a href={s.href} target={s.href.startsWith("/") ? undefined : "_blank"} rel={s.href.startsWith("/") ? undefined : "noreferrer"} className="flex items-center gap-3 rounded-2xl border bg-white/[.035] px-4 py-3.5 active:scale-[.98]" style={{ borderColor: `${accent}22` }}><span className="min-w-0 flex-1"><span className="block text-[14px] font-medium text-white/85">{s.label}</span><span className="mt-0.5 block truncate text-[10px] text-white/30">{s.href.replace("https://", "")}</span></span><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-black" style={{ background: accent }}>↗</span></a></li>)}</ul></section>

        <Link href={`/home/mind/${nxt.slug}`} onClick={() => feedback("tick")} className="mt-10 flex items-center gap-4 rounded-[26px] border bg-white/[.035] p-4 active:scale-[.98]" style={{ borderColor: `${articleColor(nxt.slug)}30` }}><div className="min-w-0 flex-1"><p className="text-[10px] uppercase tracking-[.2em] text-white/30">Continue exploring</p><p className="mt-1 text-[17px] font-semibold leading-snug">{nxt.title}</p></div><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-semibold text-black" style={{ background: articleColor(nxt.slug) }}>→</span></Link>
      </article>
    </main>
  );
}
