import { cn } from "@/lib/utils";
import type { Identity, LivvTier } from "@/lib/identity";
import { tierColor } from "@/lib/tier-style";

export function Avatar({
  identity,
  size = 40,
  className,
  showTierRing = false,
}: {
  identity: Pick<Identity, "displayName" | "photo" | "accent"> & { tier?: LivvTier };
  size?: number;
  className?: string;
  /** Glowing ring matching membership tier color */
  showTierRing?: boolean;
}) {
  const initial = (identity.displayName?.[0] || "L").toUpperCase();
  const tier = identity.tier || "spark";
  const tc = tierColor(tier);
  const ring = showTierRing ? Math.max(3, Math.round(size * 0.06)) : 0;
  const outer = size + ring * 2;

  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: outer, height: outer }}
    >
      {showTierRing && (
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, ${tc.hex}, transparent 40%, ${tc.hex} 70%, transparent)`,
            boxShadow: `0 0 ${size * 0.25}px ${tc.glow}, 0 0 ${size * 0.12}px ${tc.hex}`,
            animation: "tierSpin 8s linear infinite",
            opacity: 0.95,
          }}
        />
      )}
      <span
        className="absolute overflow-hidden rounded-full bg-livv-surface text-white"
        style={{
          width: size,
          height: size,
          left: ring,
          top: ring,
          backgroundColor: identity.photo ? undefined : identity.accent,
          boxShadow: showTierRing
            ? `0 0 0 2px #050505, 0 0 0 ${ring}px ${tc.hex}`
            : "0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        {identity.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={identity.photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center"
            style={{ fontSize: size * 0.38, fontWeight: 650 }}
          >
            {initial}
          </span>
        )}
      </span>
    </span>
  );
}
