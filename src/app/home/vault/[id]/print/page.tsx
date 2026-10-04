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

  const guide = mod.guide;

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-[760px] px-7 py-8 sm:px-10 sm:py-12">
        <div className="mb-8 flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-black px-5 py-2.5 text-[13px] font-semibold text-white"
          >
            Print this guide
          </button>
          <Link
            href={"/home/vault/" + mod.id}
            className="border border-black/20 px-5 py-2.5 text-[13px] font-semibold"
          >
            Back to record
          </Link>
        </div>

        <header className="border-b border-black/15 pb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            LIVV FIELD GUIDE / {mod.kind}
          </p>
          <h1 className="mt-3 text-[34px] font-bold leading-[1.02] tracking-[-0.04em]">
            {mod.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-6 text-neutral-600">{mod.blurb}</p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-500">
            <span>{mod.meta}</span>
            <span>Personal field guide</span>
            <span>evolvewithlivv.com</span>
          </div>
        </header>

        {guide ? (
          <>
            <section className="grid gap-5 border-b border-black/10 py-7 sm:grid-cols-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">Objective</p>
                <p className="mt-2 text-[14px] leading-6">{guide.objective}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">Why it works</p>
                <p className="mt-2 text-[14px] leading-6">{guide.why}</p>
              </div>
            </section>

            <section className="border-b border-black/10 py-7">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">Before you start</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {guide.before.map((item, i) => (
                  <div key={item}>
                    <p className="text-[10px] font-bold text-neutral-400">0{i + 1}</p>
                    <p className="mt-2 text-[13px] leading-5">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-b border-black/10 py-7">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">Operating principles</p>
              <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {guide.principles.map((item) => (
                  <p key={item} className="text-[13px] leading-5">• {item}</p>
                ))}
              </div>
            </section>
          </>
        ) : null}

        <section className="py-7">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">The run</p>
          <div className="mt-4 space-y-4">
            {mod.steps?.map((step, i) => (
              <div key={i} className="flex gap-4">
                <span className="w-7 shrink-0 text-[10px] font-bold text-neutral-400">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-[14px] leading-6">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {guide?.fieldNotes?.length ? (
          <section className="break-inside-avoid border-t border-black/10 py-7">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">Field notes</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {guide.fieldNotes.map((note, i) => (
                <div key={note}>
                  <p className="text-[9px] font-bold text-neutral-400">NOTE {String(i + 1).padStart(2, "0")}</p>
                  <p className="mt-2 text-[13px] leading-5">{note}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {guide?.checkpoints?.length ? (
          <section className="break-inside-avoid border-t border-black/10 py-7">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">Checkpoints</p>
            <div className="mt-4 space-y-3">
              {guide.checkpoints.map((checkpoint) => (
                <p key={checkpoint} className="text-[13px] leading-5">• {checkpoint}</p>
              ))}
            </div>
          </section>
        ) : null}

        {guide?.review?.length ? (
          <section className="break-inside-avoid border-t border-black/10 py-7">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">End review</p>
            <div className="mt-4 space-y-4">
              {guide.review.map((question, i) => (
                <div key={question} className="flex gap-4">
                  <span className="text-[9px] font-bold text-neutral-400">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[14px] leading-6">{question}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="mt-8 border-t border-black/15 pt-4 text-[9px] leading-5 text-neutral-400">
          LIVV · Evolve with purpose. · Personal use by LIVV users.
        </footer>
      </div>
    </main>
  );
}
