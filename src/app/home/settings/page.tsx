"use client";

import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";

export default function SettingsPage() {
  return (
    <main className="livv-account-page livv-page min-h-full pb-32">
      <div className="account-inner mx-auto max-w-xl px-5 pt-5">
        <PageHero
          eyebrow="Settings"
          title="Control the system."
          subtitle="Account, look, data, and how LIVV behaves on this device."
        />
        <p className="mt-8 text-[13px] text-livv-muted">
          Settings is being restored. Pull the latest build or refresh shortly.
        </p>
        <Link href="/home/profile" className="mt-6 inline-block text-[13px] font-semibold">
          Back to Profile
        </Link>
      </div>
    </main>
  );
}
