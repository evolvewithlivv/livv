"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Bookmark, Check, ChevronRight } from "lucide-react";
import { articleBySlug, deskMeta, nextArticle, type WikiDesk } from "@/lib/wiki";
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

function deskAccent(desk: WikiDesk): string {
  const map: Record<WikiDesk, string> = {
    body: "#3ecf8e",
    mind: "#b794f6",
    career: "#63b3ed",
    finance: "#f6e05e",
    social: "#fc8181",
    system: "#4fd1c5",
    sufficiency: "#c4a574",
  };
  return map[desk] || "#a0aec0";
}

export default function MindArticlePage() {
  const params = useParams();
  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
        ? params.slug[0]
        : "";
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
        <p className="text-[15px] text-livv-muted">Article not found.</p>
        <Link
          href="/home/mind"
          className="mt-4 inline-block text-[13px] font-semibold text-[rgb(var(--livv-ink))] underline-offset-4 hover:underline"
        >
          Back to Mind
        </Link>
      </main>
    );
  }

  const meta = deskMeta(article.desk);
  const accent = deskAccent(article.desk);

  const toggleSaved = () => {
    setSaved((prev) => {
      const current = readSaved();
      const nextSaved = prev
        ? current.filter((s) => s !== article.slug)
        : [article.slug, ...current.filter((s) => s !== article.slug)];
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
    logCustomAction({
      title: `Read: ${article.title}`,
      pillar: "Mind",
      size: "small",
    });
    feedback("tick");
    setDone(true);
  };

  return (
    <main className="livv-page min-h-full pb-28">
      <div className="sticky top-0 z-20 h-0.5 w-full bg-transparent">
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%`, background: accent }}
        />
      </div>

      <article className="mx-auto w-full max-w-[40rem] px-5 pt-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/home/mind"
            className="grid h-9 w-9 place-items-center rounded-full text-[rgb(var(--livv-ink))]"
            aria-label="Back to Mind"
          >
            <ArrowLeft size={16} />
          </Link>
          <button
            type="button"
            onClick={toggleSaved}
            aria-label={saved ? "Remove bookmark" : "Save article"}
            aria-pressed={saved}
            className="grid h-9 w-9 place-items-center rounded-full text-[rgb(var(--livv-ink))]"
          >
            <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        <p className="mt-8 text-[15px] font-semibold tracking-[-0.01em]" style={{ color: accent }}>
          {meta.label}
        </p>

        <h1 className="mt-2 text-[32px] font-bold leading-[1.12] tracking-[-0.04em] text-[rgb(var(--livv-ink))] sm:text-[38px]">
          {article.title}
        </h1>

        <p className="mt-4 text-[17px] leading-relaxed text-livv-muted sm:text-[18px]">{article.hook}</p>

        <p className="mt-4 text-[12px] text-livv-muted">{article.readMins} min read</p>

        <div className="mt-10 space-y-6">
          {article.beats.map((beat) => (
            <p
              key={beat.k}
              className="text-[17px] leading-[1.7] text-[rgb(var(--livv-ink))] sm:text-[18px]"
            >
              {beat.t}
            </p>
          ))}
        </div>

        {article.sources && article.sources.length > 0 ? (
          <footer className="mt-12 border-t border-livv-border pt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-livv-muted">Sources</p>
            <ul className="mt-2 space-y-1.5">
              {article.sources.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-livv-muted underline-offset-2 hover:text-[rgb(var(--livv-ink))] hover:underline"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </footer>
        ) : null}

        <section className="mt-12 border-t border-livv-border pt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
            Put it into motion
          </p>
          <p className="mt-3 text-[16px] leading-relaxed text-[rgb(var(--livv-ink))]">{article.move}</p>
          <button
            type="button"
            onClick={markDone}
            disabled={done}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-semibold transition ${
              done
                ? "border border-livv-border text-livv-muted"
                : "bg-[rgb(var(--livv-ink))] text-[rgb(var(--livv-bg))]"
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
          className="mb-6 mt-12 block border-t border-livv-border pt-8 transition active:opacity-80"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-livv-muted">Next story</p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-bold leading-snug tracking-[-0.025em] text-[rgb(var(--livv-ink))]">
                {next.title}
              </p>
              <p className="mt-1 text-[12px] text-livv-muted">
                {deskMeta(next.desk).label} · {next.readMins} min
              </p>
            </div>
            <ChevronRight size={18} className="mt-1 shrink-0 text-livv-muted" />
          </div>
        </Link>
      </article>
    </main>
  );
}
