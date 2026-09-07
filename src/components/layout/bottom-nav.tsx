"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Dumbbell, Home, Package, UserRound, Clock3, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", color: "#67d8ff", match: (p: string) => p === "/home", Icon: Home },
  { href: "/home/daily", label: "Daily", color: "#ffd43b", match: (p: string) => p.startsWith("/home/daily"), Icon: Clock3 },
  { href: "/home/train", label: "Train", color: "#ff6b91", match: (p: string) => p.startsWith("/home/train"), Icon: Dumbbell },
  { href: "/home/mind", label: "Mind", color: "#b28cff", match: (p: string) => p.startsWith("/home/mind") || p.startsWith("/home/canon") || p.startsWith("/home/lab") || p.startsWith("/home/evala"), Icon: Brain },
  { href: "/home/packs", label: "Packs", color: "#36e0a3", match: (p: string) => p.startsWith("/home/packs") || p.startsWith("/home/vault"), Icon: Package },
  { href: "/home/shop", label: "Shop", color: "#ff9f43", match: (p: string) => p.startsWith("/home/shop"), Icon: Store },
  { href: "/home/profile", label: "You", color: "#ff73bb", match: (p: string) => p.startsWith("/home/profile") || p.startsWith("/home/settings") || p.startsWith("/home/progress") || p.startsWith("/home/connect") || p.startsWith("/home/messages"), Icon: UserRound },
] as const;

export function BottomNav() {
  const pathname = usePathname() || "";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[80] shrink-0 px-2 pt-2"
      style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }}
      aria-label="Primary"
    >
      <div
        className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 rounded-[30px] px-1.5 py-1.5"
        style={{
          background: "rgba(7, 10, 16, 0.30)",
          boxShadow: "0 24px 70px rgba(0,0,0,.58), 0 0 42px rgba(92,145,255,.075), inset 0 1px 0 rgba(255,255,255,.035)",
          backdropFilter: "blur(38px) saturate(1.9)",
          WebkitBackdropFilter: "blur(38px) saturate(1.9)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[22px] px-0.5 py-2 transition-all duration-300",
                active ? "opacity-100" : "opacity-60 hover:opacity-95"
              )}
              style={{ color: item.color }}
            >
              {active && (
                <span
                  className="absolute inset-[1px] rounded-[20px]"
                  style={{
                    background: `radial-gradient(circle at 50% 25%, ${item.color}1f, ${item.color}08 48%, transparent 78%)`,
                    boxShadow: `0 0 28px ${item.color}16, inset 0 0 24px ${item.color}0d`,
                  }}
                />
              )}
              <span
                className="relative z-10 flex h-6 w-6 items-center justify-center transition-all duration-300"
                style={{
                  filter: `drop-shadow(0 0 ${active ? 7 : 3}px ${item.color}) drop-shadow(0 0 ${active ? 16 : 7}px ${item.color}${active ? "66" : "30"})`,
                }}
              >
                <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              <span
                className="relative z-10 max-w-full truncate text-[9px] font-semibold tracking-wide"
                style={{ color: active ? item.color : "rgba(255,255,255,.58)" }}
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
