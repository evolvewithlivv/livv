"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, CalendarCheck2, Dumbbell, ShoppingBag, Users, UserRound } from "lucide-react";

const NAV = [
  { href: "/home", label: "Home", Icon: Home, match: (p: string) => p === "/home" },
  { href: "/home/daily", label: "Daily", Icon: CalendarCheck2, match: (p: string) => p.startsWith("/home/daily") },
  { href: "/home/train", label: "Train", Icon: Dumbbell, match: (p: string) => p.startsWith("/home/train") },
  { href: "/home/shop", label: "Shop", Icon: ShoppingBag, match: (p: string) => p.startsWith("/home/shop") },
  { href: "/home/connect", label: "Connect", Icon: Users, match: (p: string) => p.startsWith("/home/connect") || p.startsWith("/home/messages") || p.startsWith("/home/share") },
  { href: "/home/profile", label: "You", Icon: UserRound, match: (p: string) => p.startsWith("/home/profile") || p.startsWith("/home/settings") || p.startsWith("/home/progress") },
] as const;

function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => {
      const el = document.activeElement;
      setVisible(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || el?.getAttribute("contenteditable") === "true");
    };
    const onBlur = () => window.setTimeout(update, 80);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", onBlur);
    return () => { document.removeEventListener("focusin", update); document.removeEventListener("focusout", onBlur); };
  }, []);
  return visible;
}

export function BottomNav() {
  const pathname = usePathname() || "";
  const keyboard = useKeyboardVisible();
  return (
    <nav className={`livv-tabbar fixed inset-x-0 bottom-0 z-[80] border-t border-[var(--livv-pro-line)] bg-[var(--livv-pro-bg)]/96 px-2 transition duration-200 ${keyboard ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100"}`} style={{ paddingBottom: "max(.4rem, env(safe-area-inset-bottom))" }} aria-label="Primary navigation">
      <div className="mx-auto grid w-full max-w-[44rem] grid-cols-6 items-center py-1">
        {NAV.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`livv-tab flex min-h-[54px] flex-col items-center justify-center gap-1 px-1 py-2 ${active ? "is-active" : ""}`}
            >
              <span className="livv-tab-icon flex h-8 w-10 items-center justify-center">
                <Icon size={20} strokeWidth={active ? 2.2 : 1.65} />
              </span>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
