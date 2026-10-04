"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, Check, Printer } from "lucide-react";
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

  const guide = mod.guide;

  return (
    <main className="livv-page min-h-full pb-28">
      <div className="mx-auto w-full max-w-2xl px-5 pt-5 sm:px-6">
        <div className="flex items-center justify-between">
          <Link
            href="/home/vault"
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-livv-muted"
          >
            <ArrowLeft size={12} /> Vault
          </Link>
          <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-livv-muted">
            {mod.kind}
          </span>
        </div>

        <header className="mt-8">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-livv-accent">
            FIELD GUIDE / {mod.meta}
          </p>
          <h1 className="mt-2 max-w-xl text-[32px] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-[40px]">
            {mod.title}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-6 text-livv-muted">
            {mod.blurb}
          </p>
        </header>

        <nav className="mt-7 flex gap-2 overflow-x-auto pb-1" aria-label="Guide sections">
          {[
            ["overview", "Overview"],
            ["run", "Run it"],
            ["field", "Field notes"],
            ["check", "Checkpoints"],
            ["review", "Review"],
          ].map(([anchor, label]) => (
            <a
              key={anchor}
              href={"#" + anchor}
              className="shrink-0 border border-[rgb(var(--livv-border))] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-livv-muted"
            >
              {label}
            </a>
          ))}
        </nav>

        <section id="overview" className="mt-8 grid gap-3 sm:grid-cols-2">
          <article className="border border-[rgb(var(--livv-border))] p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-livv-accent">The objective</p>
            <p className="mt-2 text-[14px] leading-6">{guide?.objective ?? mod.blurb}</p>
          </article>
          <article className="border border-[rgb(var(--livv-border))] p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-livv-accent">Why this exists</p>
            <p className="mt-2 text-[14px] leading-6">{guide?.why ?? mod.body?.[0]}</p>
          </article>
        </section>

        {guide?.before?.length ? (
          <section className="mt-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-livv-muted">Before you start</p>
                <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.03em]">Set the conditions.</h2>
              </div>
              <BookOpen size={17} className="text-livv-muted" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {guide.before.map((item, i) => (
                <div key={item} className="bg-[rgb(var(--livv-accent-soft))] p-4">
                  <span className="text-[9px] font-bold text-livv-accent">0{i + 1}</span>
                  <p className="mt-3 text-[13px] leading-5">{item}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {guide?.principles?.length ? (
          <section className="mt-9 border-y border-[rgb(var(--livv-border))] py-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-livv-muted">Operating principles</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {guide.principles.map((item) => (
                <div key={item} className="flex gap-3">
                  <Check size={14} className="mt-0.5 shrink-0 text-livv-accent" />
                  <p className="text-[13px] leading-5">{item}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section id="run" className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-livv-muted">The run</p>
              <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.03em]">Do the work.</h2>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-livv-muted">
              {mod.steps?.length ?? 0} actions
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {mod.steps?.map((step, i) => (
              <article key={i} className="border border-[rgb(var(--livv-border))] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center border border-[rgb(var(--livv-border))] text-[10px] font-bold text-livv-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[13px] leading-5">{step}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {guide?.fieldNotes?.length ? (
          <section id="field" className="mt-10">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-livv-muted">Field notes</p>
            <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.03em]">What matters in practice.</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {guide.fieldNotes.map((note, i) => (
                <div key={note} className="bg-[rgb(var(--livv-panel))] p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-livv-accent">NOTE {String(i + 1).padStart(2, "0")}</p>
                  <p className="mt-2 text-[13px] leading-5">{note}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {guide?.checkpoints?.length ? (
          <section id="check" className="mt-10">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-livv-muted">Checkpoints</p>
            <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.03em]">Do not drift.</h2>
            <div className="mt-4 space-y-2">
              {guide.checkpoints.map((checkpoint) => (
                <div key={checkpoint} className="flex gap-3 border-b border-[rgb(var(--livv-border))] py-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-livv-accent" />
                  <p className="text-[13px] leading-5">{checkpoint}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {guide?.review?.length ? (
          <section id="review" className="mt-10">
            <div className="border border-[rgb(var(--livv-border))] p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-livv-accent">End review</p>
              <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.03em]">Keep the signal.</h2>
              <div className="mt-5 space-y-4">
                {guide.review.map((question, i) => (
                  <div key={question} className="flex gap-3">
                    <span className="text-[9px] font-bold text-livv-muted">{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-[14px] leading-6">{question}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <div className="mt-10 flex gap-2">
          {mod.downloadable ? (
            <Link
              href={"/home/vault/" + mod.id + "/print"}
              className="flex flex-1 items-center justify-center gap-2 bg-[rgb(var(--livv-ink))] py-3.5 text-[12px] font-semibold text-[rgb(var(--livv-bg))]"
            >
              <Printer size={15} /> Open printable guide
            </Link>
          ) : null}
          <Link
            href="/home/vault"
            className="grid w-12 shrink-0 place-items-center border border-[rgb(var(--livv-border))]"
            aria-label="Back to Vault"
          >
            <ArrowUpRight size={15} className="rotate-[225deg]" />
          </Link>
        </div>

        <p className="mt-3 text-center text-[10px] text-livv-muted">
          The printable guide opens a clean print layout. From your browser, you can print it if you need a paper copy.
        </p>
      </div>
    </main>
  );
}
