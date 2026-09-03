"use client";

import { useEffect } from "react";
import { feedback } from "@/lib/sensory";

export function Moment({
  title,
  subtitle,
  onDone,
}: {
  title: string;
  subtitle?: string;
  onDone: () => void;
}) {
  useEffect(() => {
    feedback("unlock");
    const t = window.setTimeout(onDone, 2200);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="moment-card px-8 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-livv-accent-soft">
          Locked in
        </p>
        <h2 className="mt-4 text-[34px] font-semibold leading-tight tracking-tight">{title}</h2>
        {subtitle && <p className="mt-3 text-sm text-white/50">{subtitle}</p>}
      </div>
      <style jsx>{`
        .moment-card {
          animation: momentIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes momentIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
