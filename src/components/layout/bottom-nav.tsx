"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Dumbbell, Home, UserRound, Clock3, Store, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/home", label: "Home", color: "#0F7FFF", match: (p: string) => p === "/home", Icon: Home },
  { href: "/home/daily", label: "Daily", color: "#FCF927", match: (p: string) => p.startsWith("/home/daily"), Icon: Clock3 },
  { href: "/home/train", label: "Train", color: "#F93827", match: (p: string) => p.startsWith("/home/train"), Icon: Dumbbell },
  { href: "/home/mind", label: "Mind", color: "#F61981", match: (p: string) => p.startsWith("/home/mind") || p.startsWith("/home/canon") || p.startsWith("/home/lab") || p.startsWith("/home/evala"), Icon: Brain },
  { href: "/home/shop", label: "Shop", color: "#9A00FF", match: (p: string) => p.startsWith("/home/shop") || p.startsWith("/home/packs") || p.startsWith("/home/vault"), Icon: Store },
  { href: "/home/connect", label: "Social", color: "#4DFF00", match: (p: string) => p.startsWith("/home/connect") || p.startsWith("/home/share") || p.startsWith("/home/messages"), Icon: Users },
  { href: "/home/profile", label: "Profile", color: "#FF9D23", match: (p: string) => p.startsWith("/home/profile") || p.startsWith("/home/settings") || p.startsWith("/home/progress"), Icon: UserRound },
] as const;

export function BottomNav() {
  const pathname = usePathname() || "";
  return <nav className="livv-tabbar fixed inset-x-0 bottom-0 z-[80] shrink-0 px-2" style={{ paddingBottom: "max(0.55rem, env(safe-area-inset-bottom))" }} aria-label="Primary navigation"><div className="livv-tabbar-dock mx-auto flex max-w-xl items-center justify-between gap-0 rounded-[24px] border border-white/10 bg-black px-1.5 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">{NAV_ITEMS.map((item) => { const active = item.match(pathname); const Icon = item.Icon; return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} aria-label={`Open ${item.label}`} className={`livv-tab relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-0.5 py-1.5 ${active ? "bg-white/[0.06]" : ""}`} style={{ color: item.color }}><Icon size={22} strokeWidth={active ? 2.4 : 1.8} absoluteStrokeWidth={false} style={{ color: item.color, opacity: active ? 1 : 0.72, filter: active ? `drop-shadow(0 0 10px ${item.color})` : "none" }} /><span className="livv-social-nav-label max-w-full truncate text-[9px] font-semibold tracking-[0.02em]" style={{ color: item.color, opacity: active ? 1 : 0.78, textShadow: active ? `0 0 14px ${item.color}` : "none" }}>{item.label}</span>{active&&<span className="absolute -bottom-0.5 h-0.5 w-4 rounded-full" style={{background:item.color,boxShadow:`0 0 8px ${item.color}`}} aria-hidden/>}</Link>; })}</div></nav>;
}
