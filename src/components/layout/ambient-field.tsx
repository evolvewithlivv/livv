"use client";

/** Soft floating particles + layered accent atmosphere. Decorative only. */
export function AmbientField({ intensity = "normal" }: { intensity?: "normal" | "strong" }) {
  const dots = [
    ["8%", "12%", 3, "0s", 18], ["18%", "78%", 2, "1.2s", 22], ["32%", "22%", 4, "2.4s", 16],
    ["44%", "88%", 2, "0.6s", 20], ["58%", "8%", 3, "3.1s", 24], ["66%", "62%", 2, "1.8s", 17],
    ["78%", "34%", 3, "2.9s", 21], ["14%", "48%", 2, "4s", 19], ["50%", "50%", 5, "0.3s", 26],
    ["86%", "72%", 2, "3.6s", 15], ["24%", "6%", 2, "5s", 23], ["70%", "90%", 3, "2s", 18],
    ["92%", "18%", 2, "1s", 20], ["39%", "68%", 2, "4.4s", 18], ["61%", "40%", 3, "3.4s", 22],
    ["11%", "91%", 2, "5.5s", 16], ["82%", "54%", 2, "2.7s", 20], ["47%", "31%", 2, "1.7s", 19],
  ] as const;

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${intensity === "strong" ? "opacity-100" : "opacity-80"}`}>
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />
      <div className="absolute left-1/2 top-1/3 h-[320px] w-[320px] -translate-x-1/2 rounded-full border border-livv-accent/[0.04] opacity-70" />
      <div className="absolute left-1/2 top-1/3 h-[220px] w-[220px] -translate-x-1/2 rounded-full border border-white/[0.025] opacity-70 livv-breathe" />
      {dots.map(([t, l, s, d, a], i) => (
        <span key={i} className="ambient-dot" style={{ top: t, left: l, width: s, height: s, animationDuration: `${a}s`, animationDelay: d }} />
      ))}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-livv-accent/20 to-transparent" />
    </div>
  );
}
