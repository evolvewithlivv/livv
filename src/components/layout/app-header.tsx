"use client";

import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { Avatar } from "@/components/identity/avatar";
import { InstallApp } from "@/components/layout/install-app";
import { loadIdentity, type Identity } from "@/lib/identity";
import { useEffect, useState } from "react";

const LOGO = "https://raw.githubusercontent.com/evolvewithlivv/livv/main/Photoroom_20260831_123254.png";

export function AppHeader() {
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

  return (
    <header className="livv-app-header relative z-[70] px-4">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 py-2.5" style={{ marginTop: "max(0.35rem, env(safe-area-inset-top))" }}>
        <Link href="/home" aria-label="LIVV home" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[13px] border border-white/10 bg-white/[0.035]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="LIVV" className="h-7 w-7 object-contain" />
          </span>
          <span className="text-[11px] font-bold tracking-[0.34em] text-white/65">LIVV</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/home/mind" aria-label="Search LIVV" className="grid h-10 w-10 place-items-center rounded-full text-white/50 hover:bg-white/[0.05] hover:text-white">
            <Search size={18} strokeWidth={1.8} />
          </Link>
          <Link href="/home/messages" aria-label="Inbox" className="relative grid h-10 w-10 place-items-center rounded-full text-white/50 hover:bg-white/[0.05] hover:text-white">
            <Bell size={18} strokeWidth={1.8} />
          </Link>
          <InstallApp />
          {me ? <Link href="/home/profile" aria-label="Profile" className="ml-1 rounded-full"><Avatar identity={me} size={34} /></Link> : null}
        </div>
      </div>
      <div className="mx-auto max-w-xl border-b border-white/[0.055]" />
    </header>
  );
}
