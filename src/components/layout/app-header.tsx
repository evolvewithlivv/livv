"use client";

import Link from "next/link";
import { Avatar } from "@/components/identity/avatar";
import { loadIdentity, type Identity } from "@/lib/identity";
import { useEffect, useState } from "react";

const LOGO = "https://raw.githubusercontent.com/evolvewithlivv/livv/main/Photoroom_20260831_123254.png";

/** Same top chrome on every authenticated screen. */
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
    <header className="livv-app-header relative z-[70] px-5">
      <div
        className="mx-auto flex max-w-xl items-center justify-between"
        style={{ height: "2.75rem", marginTop: "max(0.55rem, env(safe-area-inset-top))" }}
      >
        <Link href="/home" aria-label="LIVV home" className="group flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="LIVV" className="h-8 w-8 object-contain transition group-active:scale-95" />
          <span className="text-[10px] font-semibold tracking-[0.32em] text-white/35">LIVV</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/home/messages"
            className="px-1 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/45 transition hover:text-white/70"
          >
            Inbox
          </Link>
          {me ? (
            <Link href="/home/profile" aria-label="Profile" className="shrink-0">
              <Avatar identity={me} size={34} showTierRing />
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
