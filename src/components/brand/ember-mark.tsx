/** Official LIVV Ember — dual-flame. */

import { EMBER_SRC } from "./ember-src";

type Props = {
  size?: number;
  className?: string;
  glow?: boolean;
};

const RATIO = 140 / 360;

const GLOW =
  "drop-shadow(0 0 3px rgba(255, 170, 40, 0.9)) drop-shadow(0 0 8px rgba(255, 100, 0, 0.45))";

export function EmberMark({ size = 56, className, glow = true }: Props) {
  const h = Math.max(size, 10);
  const w = Math.max(8, Math.round(h * RATIO));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${EMBER_SRC}?v=3`}
      alt=""
      width={w}
      height={h}
      className={className}
      style={{
        display: "block",
        flexShrink: 0,
        background: "transparent",
        objectFit: "contain",
        filter: glow && size >= 18 ? GLOW : undefined,
      }}
    />
  );
}

export function EmberCount({
  value,
  size = 48,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <EmberMark size={size} />
      <span className="tabular-nums">{value}</span>
    </span>
  );
}
