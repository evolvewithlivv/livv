/** Official LIVV Ember — ruby stone, transparent, large. */

type Props = {
  size?: number;
  className?: string;
};

export function EmberMark({ size = 56, className }: Props) {
  const px = Math.max(size, 40);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/ember.svg"
      alt=""
      width={px}
      height={Math.round(px * 1.25)}
      className={className}
      style={{ display: "block", flexShrink: 0, background: "transparent" }}
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
