"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import {
  APP_COLORS,
  loadIdentity,
  patchIdentity,
  type Appearance,
  type Identity,
} from "@/lib/identity";
import { getTier } from "@/lib/membership";

const APPEARANCES: { id: Appearance; label: string; hint: string }[] = [
  { id: "dark", label: "Dark", hint: "Always dark" },
  { id: "light", label: "Light", hint: "Always light" },
  { id: "system", label: "Device", hint: "Match iPhone setting" },
];

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
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">Account</p>
        <h1 className="mt-1 text-[30px] font-semibold tracking-tight">Settings</h1>

        <section className="mt-8">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            Appearance
          </p>
          <div className="grid grid-cols-3 gap-2">
            {APPEARANCES.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMe(patchIdentity({ appearance: opt.id }))}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-left",
                  me.appearance === opt.id
                    ? "border-livv-accent bg-livv-accent/10"
                    : "border-livv-border bg-livv-surface"
                )}
              >
                <span className="block text-sm font-medium">{opt.label}</span>
                <span className="mt-1 block text-[11px] text-white/40">{opt.hint}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            App color
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
                      active && "ring-2 ring-white ring-offset-2 ring-offset-[var(--livv-bg)]"
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
