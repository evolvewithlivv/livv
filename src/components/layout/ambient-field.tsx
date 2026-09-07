"use client";

/** Shared atmospheric layer used across LIVV screens. Decorative only. */
export function AmbientField({ intensity = "normal" }: { intensity?: "normal" | "strong" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${intensity === "strong" ? "opacity-100" : "opacity-80"}`}
    >
      <div className="livv-ambient-aurora" />
      <div className="livv-ambient-backdrop" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-livv-accent/15 to-transparent" />
    </div>
  );
}
