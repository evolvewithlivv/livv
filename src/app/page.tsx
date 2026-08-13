"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OpeningPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden bg-livv-black">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-livv-gradient" />
      <div className="pointer-events-none absolute inset-0 bg-livv-glow" />

      {/* Soft center glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-livv-accent/20 blur-[100px] animate-pulse-soft" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center animate-fade-in">
        {/* Logo mark */}
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-livv-surface/80 backdrop-blur-sm">
          <span className="text-2xl font-bold tracking-tighter text-white">
            L
          </span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          LIVV
        </h1>

        <p className="mt-4 max-w-xs text-base text-livv-muted leading-relaxed">
          Evolve. Train. Connect.
          <br />
          Become who you&apos;re meant to be.
        </p>

        <div className="mt-12 w-full max-w-xs animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Button
            variant="accent"
            size="lg"
            className="w-full"
            onClick={() => router.push("/onboarding")}
          >
            Enter LIVV
          </Button>
        </div>

        <p className="mt-8 text-xs text-white/30 tracking-wide">
          Personal Evolution Ecosystem
        </p>
      </div>
    </main>
  );
}