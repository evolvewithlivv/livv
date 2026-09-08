"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Dumbbell, Home, UserRound, Clock3, Store } from "lucide-react";

const NAV_ITEMS = [
  { href: "/home", label: "Home", color: "#67d8ff", match: (p: string) => p === "/home", Icon: Home },
  { href: "/home/daily", label: "Daily", color: "#ffd43b", match: (p: string) => p.startsWith("/home/daily"), Icon: Clock3 },
  { href: "/home/train", label: "Train", color: "#ff6b91", match: (p: string) => p.startsWith("/home/train"), Icon: Dumbbell },
  { href: "/home/mind", label: "Mind", color: "#b28cff", match: (p: string) => p.startsWith("/home/mind") || p.startsWith("/home/canon") || p.startsWith("/home/lab") || p.startsWith("/home/evala"), Icon: Brain },
  { href: "/home/shop", label: "Shop", color: "#ff9f43", match: (p: string) => p.startsWith("/home/shop") || p.startsWith("/home/packs") || p.startsWith("/home/vault"), Icon: Store },
  { href: "/home/profile", label: "You", color: "#ff72c9", match: (p: string) => p.startsWith("/home/profile") || p.startsWith("/home/settings") || p.startsWith("/home/progress") || p.startsWith("/home/connect") || p.startsWith("/home/messages"), Icon: UserRound },
] as const;

export function BottomNav() {
  const pathname = usePathname() || "";

  return (
    <nav
      className="livv-tabbar fixed inset-x-0 bottom-0 z-[80] shrink-0 px-4"
      style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }}
      aria-label="Primary"
    >
      {/* Single continuous glass dock — icons sit on it, no per-icon boxes */}
      <div className="livv-tabbar-dock mx-auto flex max-w-md items-center justify-between gap-0 px-3 py-2.5">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="livv-tab relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1"
              style={{ color: item.color }}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.7}
                absoluteStrokeWidth={false}
                style={{
                  color: item.color,
                  opacity: active ? 1 : 0.45,
                  filter: active ? `drop-shadow(0 0 10px ${item.color})` : "none",
                }}
              />
              <span
                className="max-w-full truncate text-[9px] font-semibold tracking-[0.1em]"
                style={{
                  color: item.color,
                  opacity: active ? 1 : 0.4,
                  textShadow: active ? `0 0 14px ${item.color}` : "none",
                }}
              >
                {item.label}
              </span>
              {active && (
                <span
                  className="absolute -bottom-0.5 h-0.5 w-3 rounded-full"
                  style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
