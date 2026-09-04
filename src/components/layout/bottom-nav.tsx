"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/home/daily", label: "Daily", icon: DailyIcon },
  { href: "/home/train", label: "Train", icon: TrainIcon },
  { href: "/home/packs", label: "Packs", icon: PacksIcon },
  { href: "/home/connect", label: "Connect", icon: ConnectIcon },
  { href: "/home/profile", label: "Profile", icon: ProfileIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  return <nav className="relative z-50 shrink-0 px-2 pb-[max(.6rem,env(safe-area-inset-bottom))] pt-2"><div className="mx-auto flex max-w-lg items-center justify-around rounded-[27px] border border-white/[.1] bg-[#090b10]/75 px-1 py-1.5 shadow-[0_22px_70px_rgba(0,0,0,.58),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl backdrop-saturate-150">{NAV_ITEMS.map((item) => { const active = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href)); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("group relative flex min-w-[48px] flex-col items-center gap-1 rounded-[20px] px-1.5 py-2.5 transition-all duration-300", active ? "text-white" : "text-white/30")}>{active && <span className="absolute inset-0 rounded-[20px] border border-livv-accent/15 bg-livv-accent/[.11] shadow-[0_0_30px_rgb(var(--livv-accent)/.14)]" />}<span className="absolute top-1 h-0.5 w-5 rounded-full bg-livv-accent opacity-0 shadow-[0_0_12px_rgb(var(--livv-accent)/.9)] transition-opacity group-hover:opacity-50"/><span className="relative transition-transform duration-300 group-hover:-translate-y-0.5"><item.icon active={active}/></span><span className={cn("relative text-[8px] font-medium uppercase tracking-[.11em]", active ? "text-livv-accent-soft" : "text-white/25")}>{item.label}</span></Link>; })}</div></nav>;
}

function HomeIcon({active}:{active:boolean}){return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.2:1.7}><path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round"/></svg>}
function DailyIcon({active}:{active:boolean}){return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.2:1.7}><path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9-1.9 5.7-1.9-5.7-5.6-1.9L10.1 9 12 3.5Z" strokeLinecap="round" strokeLinejoin="round"/><path d="m19 3 .5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5L19 3Z" strokeLinecap="round" strokeLinejoin="round"/></svg>}
function TrainIcon({active}:{active:boolean}){return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.2:1.7}><path d="M6 6.5h12v5H6zM4 11.5h16M8 6.5V4.2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2.3M6.5 16v2.5M17.5 16v2.5M4 18.5h16" strokeLinecap="round" strokeLinejoin="round"/></svg>}
function PacksIcon({active}:{active:boolean}){return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.2:1.7}><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 7h12M6 17h12" strokeLinecap="round" strokeLinejoin="round"/></svg>}
function ConnectIcon({active}:{active:boolean}){return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.2:1.7}><circle cx="9" cy="8" r="3"/><circle cx="16" cy="15" r="3"/><path d="m11.5 10.5 2 2" strokeLinecap="round"/></svg>}
function ProfileIcon({active}:{active:boolean}){return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.2:1.7}><circle cx="12" cy="8" r="3.5"/><path d="M5 19.5c1.8-3.2 4.2-4.8 7-4.8s5.2 1.6 7 4.8" strokeLinecap="round"/></svg>}
