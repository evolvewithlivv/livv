"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { articleBySlug, deskMeta, nextArticle } from "@/lib/wiki";

export default function ReadArticlePage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const article = articleBySlug(slug);

  if (!article) {
    return (
      <main className="livv-page min-h-full pb-24">
        <div className="mx-auto w-full max-w-xl px-5 pt-8 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Read</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.04em]">Not found.</h1>
          <p className="mt-3 text-[14px] text-livv-muted">That piece is not in the library.</p>
          <Link href="/home" className="mt-8 inline-block text-[13px] font-semibold underline-offset-4 hover:underline">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const desk = deskMeta(article.desk);
  const next = nextArticle(article.slug);

  return (
    <main className="livv-page min-h-full pb-24">
      <div className="mx-auto w-full max-w-xl px-5 pb-12 pt-6 sm:px-6">
        <Link
          href="/home"
          className="text-[11px] font-semibold text-livv-muted underline-offset-4 hover:underline"
        >
          ← Home
        </Link>

        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
          {desk.label} · {article.readMins} min
        </p>
        <h1 className="mt-2 text-[30px] font-semibold leading-[1.12] tracking-[-0.045em] sm:text-[34px]">
          {article.title}
        </h1>
        <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-livv-muted">{article.hook}</p>

        <div className="mt-10 space-y-8 border-t border-livv-border pt-8">
          {article.beats.map((b) => (
            <div key={b.k}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">{b.k}</p>
              <p className="mt-2 text-[15px] leading-[1.6] text-[rgb(var(--livv-ink))]">{b.t}</p>
            </div>
          ))}
        </div>

        <section className="mt-12 border-t border-livv-border pt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">Move</p>
          <p className="mt-2 text-[15px] leading-relaxed text-[rgb(var(--livv-ink))]">{article.move}</p>
        </section>

        {next ? (
          <Link
            href={`/home/read/${next.slug}`}
            className="mt-12 flex items-start justify-between gap-4 border-t border-livv-border pt-8 transition active:opacity-80"
          >
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
                Next
              </span>
              <span className="mt-1.5 block text-[16px] font-semibold tracking-[-0.02em]">{next.title}</span>
            </span>
            <span className="text-[13px] text-livv-muted">→</span>
          </Link>
        ) : null}
      </div>
    </main>
  );
}
