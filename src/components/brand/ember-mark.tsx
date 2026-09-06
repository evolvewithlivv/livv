/** Official LIVV Ember — glossy dual-flame, transparent. Do not flatten. */

import { EMBER_SRC } from "./ember-src";

type Props = {
  size?: number;
  className?: string;
};

/** Source aspect: width / height of the official mark. */
const RATIO = 74 / 120;

export function EmberMark({ size = 56, className }: Props) {
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
