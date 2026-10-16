"use client";

import Link from "next/link";
import { Avatar } from "@/components/identity/avatar";
import { LivvMark } from "@/components/brand/livv-mark";
import { loadIdentity, type Identity } from "@/lib/identity";
import { useEffect, useState } from "react";

export function AppHeader() {
  const [me, setMe] = useState<Identity | null>(null);
  useEffect(() => {
    const sync = () => setMe(loadIdentity());
    sync();
    window.addEventListener("livv-identity", sync);
    window.addEventListener("livv-billing", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("livv-identity", sync);
      window.removeEventListener("livv-billing", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <header className="livv-app-header sticky top-0 z-[70] px-4">
      <div
        className="relative mx-auto flex min-h-[56px] max-w-2xl items-center justify-between gap-4"
        style={{ paddingTop: "max(.5rem, env(safe-area-inset-top))" }}
      >
        <Link
          href="/home"
          aria-label="LIVV home"
          className="flex min-h-11 items-center"
        >
          <LivvMark kind="flame" alt="LIVV" className="livv-header-icon" />
        </Link>
        {me && (
          <Link href="/home/profile" aria-label="Profile" className="rounded-full">
            <Avatar identity={me} size={34} />
          </Link>
        )}
      </div>
    </header>
  );
}
