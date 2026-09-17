"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, CalendarCheck2, Dumbbell, Users, UserRound } from "lucide-react";

const NAV = [
  { href: "/home", label: "Home", Icon: Home, match: (p: string) => p === "/home" },
  { href: "/home/daily", label: "Daily", Icon: CalendarCheck2, match: (p: string) => p.startsWith("/home/daily") },
  { href: "/home/train", label: "Train", Icon: Dumbbell, match: (p: string) => p.startsWith("/home/train") },
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
    <nav className={`livv-tabbar fixed inset-x-0 bottom-0 z-[80] px-3 transition duration-200 ${keyboard ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100"}`} style={{ paddingBottom: "max(.65rem, env(safe-area-inset-bottom))" }} aria-label="Primary navigation">
      <div className="livv-tabbar-dock mx-auto grid max-w-2xl grid-cols-5 items-center rounded-[20px] border px-1.5 py-1.5">
        {NAV.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`livv-tab flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-[15px] px-1 py-2 transition-colors ${active ? "is-active" : ""}`}>
              <Icon size={19} strokeWidth={active ? 2.15 : 1.7} />
              <span className="text-[10px] font-medium tracking-[-.01em]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
