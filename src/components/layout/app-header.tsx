"use client";

import Link from "next/link";
import { Bell, Search, Plus } from "lucide-react";
import { Avatar } from "@/components/identity/avatar";
import { loadIdentity, type Identity } from "@/lib/identity";
import { useEffect, useState } from "react";

export function AppHeader() {
  const [me, setMe] = useState<Identity | null>(null);
  useEffect(() => {
    const sync = () => setMe(loadIdentity());
    sync();
    window.addEventListener("livv-identity", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("livv-identity", sync); window.removeEventListener("storage", sync); };
  }, []);

  return (
    <header className="livv-app-header sticky top-0 z-[70] px-4">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 py-3" style={{ paddingTop: "max(.75rem, env(safe-area-inset-top))" }}>
        <Link href="/home" aria-label="LIVV home" className="flex min-h-11 items-center gap-2.5">
          <span className="livv-wordmark">LIVV</span>
        </Link>
        <div className="flex items-center gap-0.5">
          <Link href="/home/mind" aria-label="Search" className="livv-icon-button h-11 w-11"><Search size={21} strokeWidth={1.8} /></Link>
          <Link href="/home/messages" aria-label="Notifications" className="livv-icon-button h-11 w-11"><Bell size={21} strokeWidth={1.8} /></Link>
          <Link href="/home/share" aria-label="Create" className="livv-icon-button h-11 w-11"><Plus size={22} strokeWidth={1.8} /></Link>
          {me && <Link href="/home/profile" aria-label="Profile" className="ml-1 rounded-full"><Avatar identity={me} size={34} /></Link>}
        </div>
      </div>
    </header>
  );
}
