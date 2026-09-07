"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", color: "#7dd3fc", match: (p: string) => p === "/home" },
  { href: "/home/daily", label: "Daily", color: "#fbbf24", match: (p: string) => p.startsWith("/home/daily") },
  { href: "/home/train", label: "Train", color: "#fb7185", match: (p: string) => p.startsWith("/home/train") },
  { href: "/home/mind", label: "Mind", color: "#a78bfa", match: (p: string) => p.startsWith("/home/mind") || p.startsWith("/home/canon") || p.startsWith("/home/lab") || p.startsWith("/home/evala") },
  { href: "/home/packs", label: "Packs", color: "#34d399", match: (p: string) => p.startsWith("/home/packs") || p.startsWith("/home/vault") },
  { href: "/home/profile", label: "You", color: "#f472b6", match: (p: string) => p.startsWith("/home/profile") || p.startsWith("/home/settings") || p.startsWith("/home/progress") || p.startsWith("/home/connect") || p.startsWith("/home/messages") },
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
        className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 rounded-[28px] px-1.5 py-1.5"
        style={{
          background: "rgba(18, 20, 26, 0.48)",
          boxShadow: "0 16px 45px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.09), 0 0 34px rgba(255,255,255,.025)",
          backdropFilter: "blur(30px) saturate(1.7)",
          WebkitBackdropFilter: "blur(30px) saturate(1.7)",
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
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[21px] px-0.5 py-2 transition-all duration-300",
                active ? "opacity-100" : "opacity-55 hover:opacity-85"
              )}
              style={{ color: item.color }}
            >
              {active && (
                <span
                  className="absolute inset-[2px] rounded-[19px]"
                  style={{
                    background: `${item.color}12`,
                    boxShadow: `inset 0 0 18px ${item.color}0d, 0 0 20px ${item.color}12`,
                  }}
                />
              )}
              <span
                className="relative z-10 flex h-6 w-6 items-center justify-center transition-all duration-300"
                style={{ filter: active ? `drop-shadow(0 0 7px ${item.color})` : `drop-shadow(0 0 3px ${item.color}66)` }}
              >
                <NavIcon name={item.label} active={active} />
              </span>
              <span className="relative z-10 max-w-full truncate text-[9px] font-semibold tracking-wide" style={{ color: active ? item.color : "rgba(255,255,255,.58)" }}>
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
  const sw = active ? 2.05 : 1.65;
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
      return <svg {...common}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" /></svg>;
    case "Daily":
      return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 1.5" /></svg>;
    case "Train":
      return (
        <svg {...common}>
          <path d="M6.1 8.2c.9-1.4 2.1-2.1 3.6-2.1 1.1 0 1.8.4 2.3 1.2.5-.8 1.2-1.2 2.3-1.2 1.5 0 2.7.7 3.6 2.1l1.2 2c.4.7.2 1.6-.5 2l-1.8 1.1c-.7.4-1.5.2-1.9-.5l-.7-1.1c-.4-.6-1-.9-1.7-.9h-1c-.7 0-1.3.3-1.7.9l-.7 1.1c-.4.7-1.2.9-1.9.5l-1.8-1.1c-.7-.4-.9-1.3-.5-2l1.2-2Z" />
          <path d="M8 15.2c.6 1.7 1.9 2.8 4 2.8s3.4-1.1 4-2.8" />
          <path d="M9.2 18.2 8 20M14.8 18.2 16 20" />
        </svg>
      );
    case "Mind":
      return (
        <svg {...common}>
          <path d="M9.1 5.2A3.4 3.4 0 0 1 12 7.1a3.4 3.4 0 0 1 2.9-1.9A3.6 3.6 0 0 1 18.4 9c0 .5-.1.9-.2 1.3a3.5 3.5 0 0 1 1.1 6.6 3.4 3.4 0 0 1-3.8 2.7 3.4 3.4 0 0 1-3.5-2.1 3.4 3.4 0 0 1-3.5 2.1 3.4 3.4 0 0 1-3.8-2.7 3.5 3.5 0 0 1 1.1-6.6C5.7 9.9 5.6 9.5 5.6 9a3.6 3.6 0 0 1 3.5-3.8Z" />
          <path d="M12 8v9M8.8 10.1c.8.7 1.8 1 3.2 1M15.2 10.1c-.8.7-1.8 1-3.2 1M8.8 14.2c.8.6 1.8.9 3.2.9M15.2 14.2c-.8.6-1.8.9-3.2.9" />
        </svg>
      );
    case "Packs":
      return <svg {...common}><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M9 4v16M5 10h14" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 19c1.6-3 3.9-4.5 6.5-4.5s4.9 1.5 6.5 4.5" /></svg>;
  }
}
