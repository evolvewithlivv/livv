"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
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
    return () => {
      window.removeEventListener("livv-identity", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <header className="livv-app-header sticky top-0 z-[70] px-4">
      <div
        className="relative mx-auto flex min-h-[56px] max-w-2xl items-center justify-end gap-4"
        style={{ paddingTop: "max(.5rem, env(safe-area-inset-top))" }}
      >
        <Link
          href="/home"
          aria-label="LIVV home"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        >
          {/* Dark theme → white icon */}
          <img
            src="/brand/livv-icon-white.png"
            alt="LIVV"
            width={36}
            height={36}
            className="livv-header-logo livv-header-logo-dark h-9 w-9 object-contain"
            draggable={false}
          />
          {/* Light theme → black icon */}
          <img
            src="/brand/livv-icon-black.png"
            alt="LIVV"
            width={36}
            height={36}
            className="livv-header-logo livv-header-logo-light h-9 w-9 object-contain"
            draggable={false}
          />
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/home/mind" aria-label="Search" className="livv-icon-button" title="Search">
            <Search size={20} strokeWidth={1.8} />
          </Link>
          <Link href="/home/messages" aria-label="Notifications" className="livv-icon-button" title="Notifications">
            <Bell size={20} strokeWidth={1.8} />
          </Link>
          {me && (
            <Link href="/home/profile" aria-label="Profile" className="ml-1 rounded-full">
              <Avatar identity={me} size={34} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
