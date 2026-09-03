"use client";

/** Soft floating particles + accent glow. Decorative only. */
export function AmbientField({
  intensity = "normal",
}: {
  intensity?: "normal" | "strong";
}) {
  const dots = [
    { t: "8%", l: "12%", s: 3, d: "0s", a: 18 },
    { t: "18%", l: "78%", s: 2, d: "1.2s", a: 22 },
    { t: "32%", l: "22%", s: 4, d: "2.4s", a: 16 },
    { t: "44%", l: "88%", s: 2, d: "0.6s", a: 20 },
    { t: "58%", l: "8%", s: 3, d: "3.1s", a: 24 },
    { t: "66%", l: "62%", s: 2, d: "1.8s", a: 17 },
    { t: "78%", l: "34%", s: 3, d: "2.9s", a: 21 },
    { t: "14%", l: "48%", s: 2, d: "4s", a: 19 },
    { t: "50%", l: "50%", s: 5, d: "0.3s", a: 26 },
    { t: "86%", l: "72%", s: 2, d: "3.6s", a: 15 },
    { t: "24%", l: "6%", s: 2, d: "5s", a: 23 },
    { t: "70%", l: "90%", s: 3, d: "2s", a: 18 },
  ];

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${intensity === "strong" ? "opacity-100" : "opacity-80"}`}
    >
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />
      {dots.map((d, i) => (
        <span
          key={i}
          className="ambient-dot"
          style={{
            top: d.t,
            left: d.l,
            width: d.s,
            height: d.s,
            animationDuration: `${d.a}s`,
            animationDelay: d.d,
          }}
        />
      ))}
    </div>
  );
}
