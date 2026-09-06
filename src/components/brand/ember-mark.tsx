/** Official LIVV Ember — ruby teardrop, no ring. */

import { useId } from "react";

type Props = {
  size?: number;
  className?: string;
};

export function EmberMark({ size = 28, className }: Props) {
  const id = useId().replace(/:/g, "");
  const body = `emberBody-${id}`;
  const shine = `emberShine-${id}`;
  const deep = `emberDeep-${id}`;

  return (
    <svg
      width={size}
      height={Math.round(size * 1.28)}
      viewBox="0 0 80 100"
      fill="none"
      aria-hidden
      className={className}
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={body} x1="22" y1="4" x2="68" y2="96">
          <stop offset="0%" stopColor="#FFD0DC" />
          <stop offset="22%" stopColor="#FF6B8A" />
          <stop offset="52%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#9F1239" />
        </linearGradient>
        <linearGradient id={shine} x1="18" y1="6" x2="40" y2="42">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#FFB4C4" />
          <stop offset="100%" stopColor="#E11D48" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={deep} x1="40" y1="40" x2="70" y2="96">
          <stop offset="0%" stopColor="#BE123C" stopOpacity="0" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
      </defs>
      <path
        d="M40 3C31 16 18 32 16 52c-2.2 20 10 42 24 45 14-3 26.2-25 24-45C62 32 49 16 40 3Z"
        fill={`url(#${body})`}
      />
      <path d="M40 6 24 38h16L40 6Z" fill={`url(#${shine})`} />
      <path d="M40 6l20 32H40V6Z" fill="#FB7185" opacity="0.7" />
      <path d="M24 38h32L40 94 24 38Z" fill={`url(#${deep})`} opacity="0.55" />
      <path d="M24 38 16 54l24 40L24 38Z" fill="#E11D48" opacity="0.35" />
      <path d="M56 38l8 16-24 40 16-56Z" fill="#9F1239" opacity="0.4" />
      <path d="M28 20 22 34l10 6 8-20-12 0Z" fill="#FFF1F2" opacity="0.55" />
    </svg>
  );
}

export function EmberCount({
  value,
  size = 26,
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
