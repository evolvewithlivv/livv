"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Check, ChevronRight } from "lucide-react";
import { articleBySlug, deskMeta, nextArticle } from "@/lib/wiki";
import { logCustomAction } from "@/lib/record";
import { feedback } from "@/lib/sensory";

const SAVED_KEY = "livv-mind-saved-v1";

function readSaved(): string[] {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export default function MindArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : "";
  const article = useMemo(() => (slug ? articleBySlug(slug) : null), [slug]);
  const next = useMemo(() => (slug ? nextArticle(slug) : null), [slug]);

  const [saved, setSaved] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setSaved(readSaved().includes(slug));
    setDone(false);
    setProgress(0);
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min(100, Math.round((el.scrollTop / max) * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  if (!article || !next) {
    return (
      <main className="livv-page min-h-full px-5 pt-10">
        <p className="text-[15px] text-[var(--livv-pro-muted)]">Article not found.</p>
        <Link href="/home/mind" className="mt-4 inline-block text-[13px] font-semibold text-[var(--livv-pro-ink)] underline-offset-4 hover:underline">
          Back to Mind
        </Link>
      </main>
    );
  }

  const meta = deskMeta(article.desk);

  const toggleSaved = () => {
    setSaved((prev) => {
      const current = readSaved();
      const nextSaved = prev ? current.filter((s) => s !== article.slug) : [article.slug, ...current.filter((s) => s !== article.slug)];
      try {
        window.localStorage.setItem(SAVED_KEY, JSON.stringify(nextSaved));
      } catch {
        /* ignore */
      }
      return !prev;
    });
  };

  const markDone = () => {
    if (done) return;
    logCustomAction({ title: `LIVV · ${article.title}`, pillar: "Mind", size: "small" });
    feedback("complete");
    setDone(true);
  };

  return (
    <main className="livv-page min-h-full pb-28">
      <div
        className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-[var(--livv-pro-line)]"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      >
        <div
          className="h-full bg-[var(--livv-pro-ink)] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="sticky top-0 z-50 border-b border-[var(--livv-pro-line)] bg-[var(--livv-pro-bg)]/92 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-[42rem] items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.push("/home/mind")}
            className="flex items-center gap-1.5 py-2 text-[13px] font-medium text-[var(--livv-pro-muted)]"
            aria-label="Back to Mind"
          >
            <ArrowLeft size={16} />
            Mind
          </button>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--livv-pro-muted)]">
            {meta.label}
          </p>
          <button
            type="button"
            onClick={toggleSaved}
            aria-label={saved ? "Remove bookmark" : "Save article"}
            aria-pressed={saved}
            className="grid h-10 w-10 place-items-center text-[var(--livv-pro-muted)]"
          >
            <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <article className="mx-auto w-full max-w-[38rem] px-5 pt-8 sm:px-6">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--livv-pro-muted)]">
            {meta.label}
            <span className="mx-2 text-[var(--livv-pro-line)]">·</span>
            {article.readMins} min read
            <span className="mx-2 text-[var(--livv-pro-line)]">·</span>
            LIVV Original
          </p>
          <h1 className="mt-4 text-[32px] font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--livv-pro-ink)] sm:text-[40px]">
            {article.title}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[var(--livv-pro-muted)] sm:text-[18px]">
            {article.hook}
          </p>
        </header>

        <div className="mt-10 space-y-9 border-t border-[var(--livv-pro-line)] pt-10">
          {article.beats.map((beat) => (
            <section key={beat.k} className="max-w-[36rem]">
              <p className="text-[11px] font-semibold tabular-nums tracking-[0.12em] text-[var(--livv-pro-muted)]">
                {beat.k}
              </p>
              <p className="mt-3 text-[17px] leading-[1.7] text-[var(--livv-pro-ink)] sm:text-[18px] sm:leading-[1.75]">
                {beat.t}
              </p>
            </section>
          ))}
        </div>

        {article.sources && article.sources.length > 0 ? (
          <footer className="mt-12 border-t border-[var(--livv-pro-line)] pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--livv-pro-muted)]">
              Sources
            </p>
            <ul className="mt-3 space-y-2">
              {article.sources.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-[var(--livv-pro-muted)] underline-offset-2 hover:text-[var(--livv-pro-ink)] hover:underline"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </footer>
        ) : null}

        <section className="mt-12 border-y border-[var(--livv-pro-line)] py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--livv-pro-muted)]">
            Put it into motion
          </p>
          <p className="mt-3 text-[17px] leading-relaxed text-[var(--livv-pro-ink)]">{article.move}</p>
          <button
            type="button"
            onClick={markDone}
            disabled={done}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-semibold transition ${
              done
                ? "border border-[var(--livv-pro-line)] text-[var(--livv-pro-muted)]"
                : "bg-[var(--livv-pro-ink)] text-[var(--livv-pro-bg)]"
            }`}
          >
            {done ? (
              <>
                <Check size={16} />
                Logged to your progress
              </>
            ) : (
              "I did it. Log this read."
            )}
          </button>
        </section>

        <Link
          href={`/home/mind/${next.slug}`}
          className="mt-10 flex items-center gap-4 border-b border-[var(--livv-pro-line)] pb-10"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--livv-pro-muted)]">
              Next read
            </p>
            <p className="mt-1.5 text-[18px] font-semibold leading-snug tracking-[-0.02em] text-[var(--livv-pro-ink)]">
              {next.title}
            </p>
            <p className="mt-1 text-[12px] text-[var(--livv-pro-muted)]">
              {deskMeta(next.desk).label} · {next.readMins} min
            </p>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--livv-pro-line)] text-[var(--livv-pro-ink)]">
            <ChevronRight size={18} />
          </span>
        </Link>
      </article>
    </main>
  );
}
