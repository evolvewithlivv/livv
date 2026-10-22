import type { CSSProperties } from "react";

/** 0 to 100. The fill scales with --livv-p so the track width never changes. */
export function barStyle(percent: number): CSSProperties {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
  return { "--livv-p": String(clamped / 100) } as CSSProperties;
}
