/** Ember mark — Lucide flame, same system as streak / level. */

import { Flame } from "lucide-react";

type Props = {
  size?: number;
  className?: string;
  glow?: boolean;
};

export function EmberMark({ size = 16, className = "", glow = true }: Props) {
  return (
    <Flame
      size={size}
      strokeWidth={2.2}
      className={className}
      style={{
        color: "#ff8a2a",
        flexShrink: 0,
        filter: glow
          ? "drop-shadow(0 0 6px rgba(255, 120, 20, 0.55))"
          : undefined,
      }}
    />
  );
}

export function EmberCount({
  value,
  size = 16,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <EmberMark size={size} />
      <span className="tabular-nums">{value}</span>
    </span>
  );
}
