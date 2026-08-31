"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import {
  APP_COLORS,
  loadIdentity,
  patchIdentity,
  type Identity,
} from "@/lib/identity";
import { getTier } from "@/lib/membership";

export default function SettingsPage() {
  const [me, setMe] = useState<Identity | null>(null);

  useEffect(() => {
    const sync = () => setMe(loadIdentity());
    sync();
    window.addEventListener("livv-identity", sync);
    return () => window.removeEventListener("livv-identity", sync);
  }, []);

  if (!me) return null;

  const tier = getTier(me.tier);

  return (
    <main className="pt-8 pb-10">
      <Container>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          Account
        </p>
        <h1 className="mt-1 text-[30px] font-semibold tracking-tight">Settings</h1>

        <section className="mt-8">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            App color
          </p>
          <p className="mb-4 text-sm leading-relaxed text-white/45">
            This is the color of buttons, streaks, likes, and active tabs. It follows you everywhere.
          </p>
          <div className="grid grid-cols-4 gap-3">
            {APP_COLORS.map((color) => {
              const active = me.accent === color.value;
              return (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setMe(patchIdentity({ accent: color.value }))}
                  className="flex flex-col items-center gap-2"
                >
                  <span
                    className={cn(
                      "h-12 w-12 rounded-full",
                      active && "ring-2 ring-white ring-offset-2 ring-offset-black"
                    )}
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-[11px] text-white/45">{color.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-[22px] border border-livv-border bg-livv-surface">
          <Row href="/home/profile" label="Identity" value={me.displayName} />
          <Row href="/home/profile#membership" label="Membership" value={tier.name} />
          <Row href="/home/profile" label="Vault" value={`${me.embers} Embers`} />
        </section>

        <section className="mt-4 overflow-hidden rounded-[22px] border border-livv-border bg-livv-surface">
          <DummyRow label="Notifications" value="On" />
          <DummyRow label="Private account" value="Off" />
          <DummyRow label="Downloads over Wi-Fi" value="On" />
        </section>

        <p className="mt-8 text-center text-[12px] text-white/28">LIVV · 0.1</p>
      </Container>
    </main>
  );
}

function Row({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border-b border-white/5 px-4 py-4 last:border-b-0"
    >
      <span className="text-sm">{label}</span>
      <span className="text-sm text-white/35">{value} ›</span>
    </Link>
  );
}

function DummyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 px-4 py-4 last:border-b-0">
      <span className="text-sm">{label}</span>
      <span className="text-sm text-white/35">{value}</span>
    </div>
  );
}
