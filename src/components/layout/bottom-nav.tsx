"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/home/train", label: "Train", icon: TrainIcon },
  { href: "/home/packs", label: "Packs", icon: PacksIcon },
  { href: "/home/connect", label: "Connect", icon: ConnectIcon },
  { href: "/home/profile", label: "Profile", icon: ProfileIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="relative z-50 shrink-0 px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto flex max-w-lg items-center justify-around rounded-[26px] border border-white/[0.08] bg-[#0a0c10]/75 px-1.5 py-1.5 shadow-[0_18px_60px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-2xl backdrop-saturate-150">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex min-w-[60px] flex-col items-center gap-1 rounded-[20px] px-2.5 py-2.5",
                isActive ? "text-white" : "text-white/35"
              )}
            >
              {isActive && <span className="absolute inset-0 rounded-[20px] bg-livv-accent/10 shadow-[0_0_28px_rgb(var(--livv-accent)/.16)]" />}
              <span className="absolute top-1 h-0.5 w-5 rounded-full bg-livv-accent opacity-0 shadow-[0_0_10px_rgb(var(--livv-accent)/.8)] transition-opacity group-hover:opacity-40" />
              <span className="relative transition-transform duration-200 group-hover:-translate-y-0.5">
                <item.icon active={isActive} />
              </span>
              <span className={cn("relative text-[9px] font-medium tracking-[0.12em]", isActive ? "text-livv-accent-soft" : "text-white/30")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}><path d="M3 10.5L12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function TrainIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}><path d="M6.5 6.5h11v4h-11z" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 10.5h16" strokeLinecap="round" /><path d="M8 6.5V4.5a1 1 0 011-1h6a1 1 0 011 1v2" strokeLinecap="round" /><path d="M6.5 14.5v3M17.5 14.5v3" strokeLinecap="round" /><path d="M4 17.5h16" strokeLinecap="round" /></svg>;
}

function PacksIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}><rect x="6" y="3" width="12" height="18" rx="2" /><path d="M6 7h12M6 17h12" strokeLinecap="round" /></svg>;
}

function ConnectIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}><circle cx="9" cy="8" r="3" /><circle cx="16" cy="15" r="3" /><path d="M11.5 10.5l2 2" strokeLinecap="round" /></svg>;
}

function ProfileIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}><circle cx="12" cy="8" r="3.5" /><path d="M5 19.5c1.8-3.2 4.2-4.8 7-4.8s5.2 1.6 7 4.8" strokeLinecap="round" /></svg>;
}
