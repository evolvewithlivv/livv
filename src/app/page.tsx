"use client";

import { useRouter } from "next/navigation";

export default function OpeningPage() {
  const router = useRouter();

  return (
    <main className="opening relative min-h-dvh overflow-hidden bg-[#050505] text-white">
      <div aria-hidden className="opening-atmosphere pointer-events-none absolute inset-0" />
      <div aria-hidden className="opening-veil pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="flex w-full max-w-md flex-col items-center text-center sm:max-w-lg">
          <div className="opening-wordmark select-none">
            <div
              className="flex h-[clamp(6rem,26vw,10rem)] w-[clamp(6rem,26vw,10rem)] items-center justify-center"
              aria-label="LIVV"
            >
              <svg
                viewBox="0 0 160 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
                aria-hidden
              >
                <defs>
                  <linearGradient id="livvFlame" x1="100" y1="30" x2="115" y2="130" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#C4B5FD" />
                    <stop offset="0.45" stopColor="#8B5CF6" />
                    <stop offset="1" stopColor="#5B21B6" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Bold L */}
                <path
                  d="M42 36h22v68h40v20H42V36z"
                  fill="#FFFFFF"
                />
                {/* Flame */}
                <path
                  d="M108 38c1.5 14 4 24 4 36 0 18-12 32-26 32-8 0-14-4-18-10 6 2 12 2 16-2 6-6 8-16 6-26-8 8-20 10-28 4 10-2 18-10 22-22 2-6 4-12 4-12s10 6 20 0z"
                  fill="url(#livvFlame)"
                  filter="url(#glow)"
                />
              </svg>
            </div>
          </div>

          <p className="opening-line mt-10 text-[11px] font-medium uppercase tracking-[0.42em] text-white/55 sm:text-xs sm:tracking-[0.48em]">
            Evolve with LIVV
          </p>

          <p className="opening-sub mt-4 max-w-[16rem] text-sm font-normal leading-relaxed tracking-wide text-white/35 sm:max-w-xs sm:text-[0.9375rem]">
            Your evolution starts here.
          </p>

          <div className="opening-cta mt-14 w-full sm:mt-16 sm:w-auto">
            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="opening-enter group relative inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.04] px-10 text-[13px] font-medium uppercase tracking-[0.28em] text-white transition-all duration-300 ease-out hover:border-white/25 hover:bg-white/[0.08] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] sm:h-12 sm:w-auto sm:min-w-[14rem]"
            >
              <span>Enter LIVV</span>
              <span
                aria-hidden
                className="inline-block translate-x-0 transition-transform duration-300 ease-out group-hover:translate-x-1"
              >
                →
              </span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .opening-atmosphere {
          background:
            radial-gradient(
              ellipse 90% 55% at 50% -15%,
              rgba(255, 255, 255, 0.045),
              transparent 55%
            ),
            radial-gradient(
              ellipse 50% 40% at 50% 110%,
              rgba(124, 92, 255, 0.04),
              transparent 50%
            );
          opacity: 0;
          animation: openingAtmosphere 1.4s ease-out 0.05s forwards;
        }

        .opening-veil {
          background: radial-gradient(
            circle at 50% 42%,
            rgba(255, 255, 255, 0.018),
            transparent 42%
          );
          opacity: 0;
          animation: openingAtmosphere 1.8s ease-out 0.15s forwards;
        }

        .opening-wordmark {
          opacity: 0;
          transform: translateY(18px);
          animation: openingRise 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards;
        }

        .opening-line {
          opacity: 0;
          transform: translateY(12px);
          animation: openingRise 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.45s forwards;
        }

        .opening-sub {
          opacity: 0;
          transform: translateY(10px);
          animation: openingRise 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.58s forwards;
        }

        .opening-cta {
          opacity: 0;
          transform: translateY(12px);
          animation: openingRise 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.75s forwards;
        }

        @keyframes openingAtmosphere {
          to {
            opacity: 1;
          }
        }

        @keyframes openingRise {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .opening-atmosphere,
          .opening-veil,
          .opening-wordmark,
          .opening-line,
          .opening-sub,
          .opening-cta {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </main>
  );
}
