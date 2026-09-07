"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Avatar } from "@/components/identity/avatar";
import { loadIdentity, type Identity } from "@/lib/identity";
import { useEffect, useState } from "react";

const LOGO =
  "https://raw.githubusercontent.com/evolvewithlivv/livv/main/Photoroom_20260831_123254.png";

/** Shared chrome for authenticated LIVV screens. The home screen owns its own identical header. */
export function AppHeader() {
  const pathname = usePathname() || "";
  const [me, setMe] = useState<Identity | null>(null);

  useEffect(() => {
    const sync = () => setMe(loadIdentity());
    sync();
    window.addEventListener("livv-identity", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("livv-identity", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (pathname === "/home" || pathname === "") return null;

  return (
    <header className="livv-app-header sticky top-0 z-[70] border-b border-white/[0.055] bg-[#030405]/55 px-5 backdrop-blur-2xl">
      <div className="mx-auto flex h-[72px] max-w-xl items-center justify-between">
        <Link href="/home" aria-label="LIVV home" className="flex items-center gap-2.5">
          <img src={LOGO} alt="LIVV" className="h-8 w-8 object-contain" />
          <span className="text-[10px] font-semibold tracking-[0.34em] text-white/45">LIVV</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <Link
            href="/home/messages"
            aria-label="Inbox"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-white/55"
          >
            <Bell size={16} strokeWidth={1.8} />
          </Link>
          {me && (
            <Link href="/home/profile" aria-label="Profile" className="rounded-full">
              <Avatar identity={me} size={34} showTierRing />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
