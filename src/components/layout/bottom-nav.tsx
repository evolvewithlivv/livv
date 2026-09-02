"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/home/train", label: "Train", icon: TrainIcon },
  { href: "/home/evolve", label: "Evolve", icon: EvolveIcon },
  { href: "/home/connect", label: "Connect", icon: ConnectIcon },
  { href: "/home/progress", label: "Progress", icon: ProgressIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="relative z-50 shrink-0 border-t border-livv-border bg-[var(--livv-nav)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/home" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-2",
                isActive ? "text-livv-accent" : "text-livv-muted"
              )}
            >
              <item.icon active={isActive} />
              <span className="text-[10px] font-medium uppercase tracking-[0.14em]">
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
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <path d="M3 10.5L12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrainIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <path d="M6.5 6.5h11v4h-11z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 10.5h16" strokeLinecap="round" />
      <path d="M8 6.5V4.5a1 1 0 011-1h6a1 1 0 011 1v2" strokeLinecap="round" />
      <path d="M6.5 14.5v3M17.5 14.5v3" strokeLinecap="round" />
      <path d="M4 17.5h16" strokeLinecap="round" />
    </svg>
  );
}

function EvolveIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" strokeLinecap="round" />
    </svg>
  );
}

function ConnectIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="15" r="3" />
      <path d="M11.5 10.5l2 2" strokeLinecap="round" />
    </svg>
  );
}

function ProgressIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <path d="M4 19V5" strokeLinecap="round" />
      <path d="M4 19h16" strokeLinecap="round" />
      <path d="M8 16v-5M12 16V8M16 16v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
