"use client";

import { useEffect, useRef, useState } from "react";

const DUR = 320;

function formatValue(value: number, digits: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Counts to a number with transform-free text. The hidden sizer holds the final width. */
export function CountUp({
  value,
  digits = 0,
  suffix = "",
  className,
}: {
  value: number;
  digits?: number;
  suffix?: string;
  className?: string;
}) {
  const safe = Number.isFinite(value) ? value : 0;
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      shownRef.current = safe;
      setShown(safe);
      return;
    }
    const from = shownRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      const eased = 1 - (1 - t) ** 3;
      const next = t === 1 ? safe : from + (safe - from) * eased;
      shownRef.current = next;
      setShown(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [safe]);

  const finalText = formatValue(safe, digits) + suffix;
  const live = digits === 0 ? Math.round(shown) : shown;
  const liveText = formatValue(live, digits) + suffix;

  return (
    <span className={"livv-count" + (className ? " " + className : "")} aria-label={finalText}>
      <span className="livv-count-sizer" aria-hidden="true">{finalText}</span>
      <span className="livv-count-value" aria-hidden="true">{liveText}</span>
    </span>
  );
}
