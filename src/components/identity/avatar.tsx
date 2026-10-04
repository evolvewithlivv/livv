import { cn } from "@/lib/utils";
import type { Identity } from "@/lib/identity";

/** LIVV signal blue — universal identity ring (tiers removed from V1). */
const LIVV_RING = "#0F7FFF";
const LIVV_GLOW = "rgba(15, 127, 255, 0.55)";

export function Avatar({
  identity,
  size = 40,
  className,
  showTierRing = true,
  fit = "cover",
}: {
  identity: Pick<Identity, "displayName" | "photo" | "accent">;
  size?: number;
  className?: string;
  /** Soft glowing outline in LIVV blue for every member */
  showTierRing?: boolean;
  /** Image fit mode for avatars where the full source photo should remain visible. */
  fit?: "cover" | "contain";
}) {
  const initial = (identity.displayName?.[0] || "L").toUpperCase();
  const ring = showTierRing ? Math.max(3, Math.round(size * 0.055)) : 0;
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
            background: `conic-gradient(from 0deg, ${LIVV_RING}, transparent 38%, ${LIVV_RING} 72%, transparent)`,
            boxShadow: `0 0 ${size * 0.22}px ${LIVV_GLOW}, 0 0 ${size * 0.1}px ${LIVV_RING}`,
            animation: "tierSpin 10s linear infinite",
            opacity: 0.9,
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
            ? `0 0 0 2px #050505, 0 0 0 ${ring}px ${LIVV_RING}`
            : "0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        {identity.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={identity.photo} alt="" className={`h-full w-full object-${fit}`} />
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
