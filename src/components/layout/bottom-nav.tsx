"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  CalendarCheck2,
  Dumbbell,
  HeartPulse,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { haptic } from "@/lib/sensory";

const NAV = [
  { href: "/home", label: "Home", Icon: Home, match: (p: string) => p === "/home" },
  { href: "/home/daily", label: "Daily", Icon: CalendarCheck2, match: (p: string) => p.startsWith("/home/daily") },
  { href: "/home/train", label: "Train", Icon: Dumbbell, match: (p: string) => p.startsWith("/home/train") },
  { href: "/home/health", label: "Health", Icon: HeartPulse, match: (p: string) => p.startsWith("/home/health") },
  { href: "/home/shop", label: "Shop", Icon: ShoppingBag, match: (p: string) => p.startsWith("/home/shop") },
  {
    href: "/home/profile",
    label: "You",
    Icon: UserRound,
    match: (p: string) =>
      p.startsWith("/home/profile") ||
      p.startsWith("/home/settings") ||
      p.startsWith("/home/settings"),
  },
] as const;

function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => {
      const el = document.activeElement;
      setVisible(
        el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement ||
          el instanceof HTMLSelectElement ||
          el?.getAttribute("contenteditable") === "true"
      );
    };
    const onBlur = () => window.setTimeout(update, 80);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", onBlur);
    return () => {
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", onBlur);
    };
  }, []);
  return visible;
}

export function BottomNav() {
  const pathname = usePathname() || "";
  const keyboard = useKeyboardVisible();

  return (
    <nav
      className={
        "livv-tabbar livv-glass-dock z-[80] shrink-0 " +
        (keyboard ? "is-hidden" : "")
      }
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
      aria-label="Primary navigation"
      aria-hidden={keyboard}
    >
      <div className="livv-glass-dock-inner">
        <div className="livv-glass-dock-grid">
          {NAV.map(({ href, label, Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`livv-tab ${active ? "is-active" : ""}`}
                onClick={() => {
                  if (!active) haptic("light");
                }}
              >
                <span className="livv-tab-icon" aria-hidden>
                  <Icon size={18} strokeWidth={active ? 2.15 : 1.6} />
                </span>
                <span className="livv-tab-label">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
