"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/home/train", label: "Train", icon: TrainIcon },
  { href: "/home/evala", label: "Evala", icon: EvalaIcon },
  { href: "/home/connect", label: "Connect", icon: ConnectIcon },
  { href: "/home/profile", label: "Profile", icon: ProfileIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="relative z-50 shrink-0 px-3 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2">
      <div
        className="mx-auto flex max-w-lg items-center justify-around rounded-[22px] px-1 py-1.5"
        style={{
          background: "rgba(12, 14, 18, 0.62)",
          backdropFilter: "blur(22px) saturate(1.4)",
          WebkitBackdropFilter: "blur(22px) saturate(1.4)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.08), 0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/home" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-w-[58px] flex-col items-center gap-0.5 rounded-2xl px-2.5 py-2 transition",
                isActive ? "text-white" : "text-white/35"
              )}
            >
              {isActive && (
                <span
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "rgb(var(--livv-accent) / 0.14)",
                    boxShadow: "0 0 20px rgb(var(--livv-accent) / 0.18)",
                  }}
                />
              )}
              <span className="relative">
                <item.icon active={isActive} />
              </span>
              <span
                className={cn(
                  "relative text-[9px] font-medium tracking-[0.12em]",
                  isActive ? "text-livv-accent-soft" : "text-white/30"
                )}
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

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}>
      <path d="M3 10.5L12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrainIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}>
      <path d="M6.5 6.5h11v4h-11z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 10.5h16" strokeLinecap="round" />
      <path d="M8 6.5V4.5a1 1 0 011-1h6a1 1 0 011 1v2" strokeLinecap="round" />
      <path d="M6.5 14.5v3M17.5 14.5v3" strokeLinecap="round" />
      <path d="M4 17.5h16" strokeLinecap="round" />
    </svg>
  );
}

function EvalaIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M4.5 12H2M22 12h-2.5M6.2 6.2l1.8 1.8M16 16l1.8 1.8M6.2 17.8l1.8-1.8M16 8l1.8-1.8" strokeLinecap="round" />
    </svg>
  );
}

function ConnectIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="15" r="3" />
      <path d="M11.5 10.5l2 2" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5c1.8-3.2 4.2-4.8 7-4.8s5.2 1.6 7 4.8" strokeLinecap="round" />
    </svg>
  );
}
