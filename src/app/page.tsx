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

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="flex w-full max-w-md flex-col items-center text-center sm:max-w-lg">
          <div className="opening-wordmark select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO}
              alt="LIVV"
              width={360}
              height={360}
              className="h-[clamp(12rem,52vw,20rem)] w-[clamp(12rem,52vw,20rem)] object-contain"
              draggable={false}
            />
          </div>

          <p className="opening-line mt-8 font-sans text-[11px] font-medium uppercase tracking-[0.42em] text-white/55 sm:text-xs sm:tracking-[0.48em]">
            Evolve with LIVV
          </p>

          <p className="opening-sub mt-4 max-w-[17rem] text-[1.35rem] leading-snug text-white/70 sm:max-w-xs sm:text-[1.5rem]">
            Your evolution starts here.
          </p>

          <div className="opening-cta mt-14 w-full space-y-3 sm:mt-16 sm:w-auto">
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="opening-enter group relative inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.04] px-10 font-sans text-[13px] font-medium uppercase tracking-[0.28em] text-white transition-all duration-300 ease-out hover:border-livv-accent/50 hover:bg-livv-accent/10 active:scale-[0.985] sm:h-12 sm:w-auto sm:min-w-[14rem]"
            >
              <span>Enter LIVV</span>
              <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="text-[12px] text-white/40"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .opening-atmosphere {
          background:
            radial-gradient(ellipse 90% 55% at 50% -15%, rgb(var(--livv-accent) / 0.16), transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 110%, rgb(var(--livv-accent) / 0.08), transparent 50%);
          opacity: 0;
          animation: openingAtmosphere 1.4s ease-out 0.05s forwards;
        }
        .opening-veil {
          background: radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.018), transparent 42%);
          opacity: 0;
          animation: openingAtmosphere 1.8s ease-out 0.15s forwards;
        }
        .opening-wordmark,
        .opening-line,
        .opening-sub,
        .opening-cta {
          opacity: 0;
          transform: translateY(16px);
          animation: openingRise 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .opening-wordmark { animation-delay: 0.2s; }
        .opening-line { animation-delay: 0.45s; }
        .opening-sub { animation-delay: 0.58s; }
        .opening-cta { animation-delay: 0.75s; }
        @keyframes openingAtmosphere { to { opacity: 1; } }
        @keyframes openingRise { to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}
