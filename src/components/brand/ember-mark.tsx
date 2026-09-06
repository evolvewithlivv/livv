/** Official LIVV Ember — gold coal, no ring, no sparkles. */

type Props = {
  size?: number;
  className?: string;
};

export function EmberMark({ size = 18, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 80"
      fill="none"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id="emberBody" x1="18" y1="6" x2="52" y2="76">
          <stop offset="0%" stopColor="#FFE9A0" />
          <stop offset="28%" stopColor="#F5C542" />
          <stop offset="58%" stopColor="#F08A2A" />
          <stop offset="100%" stopColor="#E05A5A" />
        </linearGradient>
        <linearGradient id="emberShine" x1="16" y1="8" x2="34" y2="36">
          <stop offset="0%" stopColor="#FFF6D2" />
          <stop offset="100%" stopColor="#F5C542" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M32 4C24 14 14 26 12 42c-2 16 8 32 20 34 12-2 22-18 20-34C50 26 40 14 32 4Z"
        fill="url(#emberBody)"
      />
      <path d="M32 8 20 30h12L32 8Z" fill="url(#emberShine)" opacity="0.95" />
      <path d="M32 8l14 24H32V8Z" fill="#F6B03A" opacity="0.55" />
      <path d="M20 30h24L32 72 20 30Z" fill="#E87828" opacity="0.28" />
      <path d="M44 30l6 16-18 26 12-42Z" fill="#E06B62" opacity="0.45" />
    </svg>
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
