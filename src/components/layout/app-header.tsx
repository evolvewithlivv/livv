"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/identity/avatar";
import { loadIdentity, type Identity } from "@/lib/identity";
import { useEffect, useState } from "react";

const LOGO = "https://raw.githubusercontent.com/evolvewithlivv/livv/main/Photoroom_20260831_123254.png";

/** Shared chrome for authenticated LIVV screens. The home screen owns the same visual header. */
export function AppHeader() {
  const pathname = usePathname() || "";
  const [me, setMe] = useState<Identity | null>(null);

  useEffect(() => {
    const sync = () => setMe(loadIdentity());
    sync(); window.addEventListener("livv-identity", sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener("livv-identity", sync); window.removeEventListener("storage", sync); };
  }, []);

  if (pathname === "/home" || pathname === "") return null;

  return (
    <header className="livv-app-header sticky top-0 z-[70] border-b border-white/[0.055] bg-[#030405]/55 px-5 backdrop-blur-2xl">
      <div className="mx-auto flex h-[72px] max-w-xl items-center justify-between">
        <Link href="/home" aria-label="LIVV home" className="group flex items-center gap-2">
          <img src={LOGO} alt="LIVV" className="h-8 w-8 object-contain transition group-active:scale-95" />
          <span className="text-[10px] font-semibold tracking-[0.32em] text-white/35">LIVV</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/home/messages" className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">Inbox</Link>
          {me && <Link href="/home/profile" aria-label="Profile"><Avatar identity={me} size={34} showTierRing /></Link>}
        </div>
      </div>
    </header>
  );
}
