"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", match: (p: string) => p === "/home" },
  { href: "/home/daily", label: "Daily", match: (p: string) => p.startsWith("/home/daily") },
  { href: "/home/train", label: "Train", match: (p: string) => p.startsWith("/home/train") },
  { href: "/home/packs", label: "Packs", match: (p: string) => p.startsWith("/home/packs") || p.startsWith("/home/vault") },
  { href: "/home/connect", label: "Connect", match: (p: string) => p.startsWith("/home/connect") || p.startsWith("/home/messages") },
  { href: "/home/profile", label: "You", match: (p: string) => p.startsWith("/home/profile") || p.startsWith("/home/settings") || p.startsWith("/home/progress") },
] as const;

export function BottomNav() {
  const pathname = usePathname() || "";

  return (
    <nav
      className="relative z-50 shrink-0 px-2.5 pt-1.5"
      style={{ paddingBottom: "max(0.55rem, env(safe-area-inset-bottom))" }}
      aria-label="Primary"
    >
      <div
        className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 rounded-[26px] border border-white/[0.09] px-1 py-1 shadow-[0_18px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.07)]"
        style={{
          background: "rgba(8, 10, 14, 0.62)",
          backdropFilter: "blur(28px) saturate(1.4)",
          WebkitBackdropFilter: "blur(28px) saturate(1.4)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[20px] px-0.5 py-2 transition-colors",
                active ? "text-white" : "text-white/35"
              )}
            >
              {active && (
                <span
                  className="absolute inset-[2px] rounded-[18px] border border-livv-accent/20"
                  style={{
                    background: "rgb(var(--livv-accent) / 0.12)",
                    boxShadow: "0 0 24px rgb(var(--livv-accent) / 0.12)",
                  }}
                />
              )}
              <span className="relative z-10 flex h-6 w-6 items-center justify-center">
                <NavIcon name={item.label} active={active} />
              </span>
              <span
                className={cn(
                  "relative z-10 max-w-full truncate text-[9px] font-medium tracking-wide",
                  active ? "text-white" : "text-white/35"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const sw = active ? 2.1 : 1.7;
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "Home":
      return (
        <svg {...common}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
        </svg>
      );
    case "Daily":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 1.5" />
        </svg>
      );
    case "Train":
      return (
        <svg {...common}>
          <path d="M6.5 9.5h11M6.5 14.5h11M9 6.5v11M15 6.5v11" />
        </svg>
      );
    case "Packs":
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M9 4v16M5 10h14" />
        </svg>
      );
    case "Connect":
      return (
        <svg {...common}>
          <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          <path d="M11 10.5 14 15.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19c1.6-3 3.9-4.5 6.5-4.5s4.9 1.5 6.5 4.5" />
        </svg>
      );
  }
}
