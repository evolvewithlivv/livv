import { cn } from "@/lib/utils";
import type { Identity } from "@/lib/identity";

export function Avatar({
  identity,
  size = 40,
  className,
}: {
  identity: Pick<Identity, "displayName" | "photo" | "accent">;
  size?: number;
  className?: string;
}) {
  const initial = (identity.displayName?.[0] || "L").toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-livv-surface text-white",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: identity.photo ? undefined : identity.accent,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.08)`,
      }}
    >
      {identity.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={identity.photo}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <span style={{ fontSize: size * 0.38, fontWeight: 650 }}>{initial}</span>
      )}
    </span>
  );
}
