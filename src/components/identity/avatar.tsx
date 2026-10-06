import { cn } from "@/lib/utils";
import type { Identity } from "@/lib/identity";

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
  showTierRing?: boolean;
  fit?: "cover" | "contain";
}) {
  const initial = (identity.displayName?.[0] || "L").toUpperCase();
  const ring = showTierRing ? Math.max(2, Math.round(size * 0.04)) : 0;
  const outer = size + ring * 2;

  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: outer, height: outer }}
    >
      <span
        className="absolute overflow-hidden rounded-full bg-livv-surface text-white"
        style={{
          width: size,
          height: size,
          left: ring,
          top: ring,
          backgroundColor: identity.photo ? undefined : identity.accent,
          boxShadow: showTierRing
            ? `0 0 0 ${ring}px rgb(var(--livv-accent))`
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
