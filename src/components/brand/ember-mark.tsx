/** Official LIVV Ember — glossy dual-flame, transparent. Do not flatten. */

import { EMBER_SRC } from "./ember-src";

type Props = {
  size?: number;
  className?: string;
  glow?: boolean;
};

/** Source aspect of the official Photoroom dual-flame mark. */
const RATIO = 442 / 720;

const GLOW =
  "drop-shadow(0 0 4px rgba(255, 190, 70, 0.85)) drop-shadow(0 0 10px rgba(255, 120, 10, 0.55)) drop-shadow(0 0 22px rgba(255, 80, 0, 0.28))";

export function EmberMark({ size = 56, className, glow = true }: Props) {
  const h = Math.max(size, 10);
  const w = Math.max(7, Math.round(h * RATIO));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={EMBER_SRC}
      alt=""
      width={w}
      height={h}
      className={className}
      style={{
        display: "block",
        flexShrink: 0,
        background: "transparent",
        objectFit: "contain",
        filter: glow ? GLOW : undefined,
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
