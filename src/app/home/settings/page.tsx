"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { loadIdentity, type Identity } from "@/lib/identity";
import { signOut } from "@/lib/auth";
import { canAccessTier, getEffectiveTier } from "@/lib/billing";
import { getTier } from "@/lib/membership";

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Identity | null>(null);

  useEffect(() => {
    const sync = () => setMe(loadIdentity());
    sync();
    window.addEventListener("livv-identity", sync);
    window.addEventListener("livv-billing", sync);
    return () => {
      window.removeEventListener("livv-identity", sync);
      window.removeEventListener("livv-billing", sync);
    };
  }, []);

  if (!me) return null;
  const tier = getTier(getEffectiveTier());
  const colorUnlocked = canAccessTier("rise");

  return (
    <main className="livv-page relative min-h-full overflow-hidden pb-16">
      <div className="relative z-10 mx-auto max-w-lg px-5 pt-5">
        <PageHero
          eyebrow="Settings"
          title="Settings"
          subtitle="Sound, haptics, appearance, and local data."
          accent="#ff72c9"
        />
        <p className="mt-6 text-[13px] text-livv-muted">
          Settings UI temporarily simplified while full page is restored. Membership: {tier.name}.
          Accent colors: {colorUnlocked ? "unlocked" : "locked (Rise+)"}.
        </p>
        <Link href="/home/profile" className="mt-4 block text-[13px] text-livv-accent-soft">
          Profile & membership
        </Link>
        <button
          type="button"
          onClick={() => {
            signOut();
            router.replace("/auth");
          }}
          className="mt-8 flex w-full items-center justify-center rounded-full border border-red-500/20 py-3.5 text-[13px] font-medium text-red-400"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
