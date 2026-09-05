"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSignedIn } from "@/lib/auth";

const LOGO =
  "https://raw.githubusercontent.com/evolvewithlivv/livv/main/Photoroom_20260831_123254.png";

export default function OpeningPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isSignedIn()) {
      router.replace("/home");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return <main className="min-h-dvh bg-[#050505]" />;
  }

  return (
    <main className="opening relative min-h-dvh overflow-hidden bg-[#050505] text-white">
      <div aria-hidden className="opening-atmosphere pointer-events-none absolute inset-0" />
      <div aria-hidden className="opening-veil pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-16">
        <div className="opening-wordmark flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO}
            alt="LIVV"
            className="h-16 w-16 object-contain drop-shadow-[0_0_40px_rgb(var(--livv-accent)/0.35)]"
          />
          <p className="mt-6 font-display text-[42px] font-semibold tracking-[-0.04em]">LIVV</p>
        </div>

        <p className="opening-line mt-5 max-w-[18rem] text-center text-[15px] leading-snug text-white/55">
          Your personal operating system for becoming more capable.
        </p>

        <p className="opening-sub mt-3 text-[11px] uppercase tracking-[0.28em] text-white/25">
          Body · Mind · Work · Money · People
        </p>

        <div className="opening-cta mt-12 flex w-full max-w-xs flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className="group flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-semibold text-black shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          >
            Enter LIVV
            <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/auth")}
            className="text-[13px] text-white/40"
          >
            Sign in
          </button>
        </div>
      </div>
    </main>
  );
}
