"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import {
  APP_COLORS,
  loadIdentity,
  patchIdentity,
  type Appearance,
  type Identity,
  type LivvTier,
} from "@/lib/identity";
import { getCurrentAccount, signOut } from "@/lib/auth";
import { getTier, hasTier } from "@/lib/membership";
import { loadPrefs, patchPrefs, type LivvPrefs } from "@/lib/prefs";
import { feedback } from "@/lib/sensory";

const APPEARANCES: { id: Appearance; label: string; hint: string }[] = [
  { id: "dark", label: "Dark", hint: "Always dark" },
  { id: "light", label: "Light", hint: "Always light" },
  { id: "system", label: "Device", hint: "Match iPhone setting" },
];

/** App color picker requires Rise+ */
function canPickColor(tier: LivvTier) {
  return hasTier(tier, "rise");
}

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Identity | null>(null);
  const [provider, setProvider] = useState("");
  const [prefs, setPrefs] = useState<LivvPrefs>({ sound: true, haptics: true });

  useEffect(() => {
    const sync = () => {
      setMe(loadIdentity());
      setPrefs(loadPrefs());
      const acc = getCurrentAccount();
      setProvider(acc?.provider || "");
    };
    sync();
    window.addEventListener("livv-identity", sync);
    window.addEventListener("livv-auth", sync);
    window.addEventListener("livv-prefs", sync);
    return () => {
      window.removeEventListener("livv-identity", sync);
      window.removeEventListener("livv-auth", sync);
      window.removeEventListener("livv-prefs", sync);
    };
  }, []);

  if (!me) return null;

  const tier = getTier(me.tier);
  const colorUnlocked = canPickColor(me.tier);

  return (
    <main className="pt-8 pb-10">
      <Container>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">Account</p>
        <h1 className="mt-1 text-[30px] font-semibold tracking-tight">Settings</h1>

        <section className="mt-6 overflow-hidden rounded-[22px] border border-livv-border bg-livv-surface">
          <div className="border-b border-white/5 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">Signed in</p>
            <p className="mt-1 text-sm font-medium">@{me.username}</p>
            <p className="mt-0.5 text-xs capitalize text-white/40">{provider || "account"}</p>
          </div>
          <div className="px-4 py-4">
            <p className="text-[12px] text-white/40">Username is locked.</p>
          </div>
        </section>

        <section className="mt-8">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">Sensory</p>
          <div className="overflow-hidden rounded-[22px] border border-livv-border bg-livv-surface">
            <ToggleRow
              label="Sound"
              value={prefs.sound}
              onChange={(v) => {
                setPrefs(patchPrefs({ sound: v }));
                if (v) feedback("tick");
              }}
            />
            <ToggleRow
              label="Haptics"
              value={prefs.haptics}
              onChange={(v) => {
                setPrefs(patchPrefs({ haptics: v }));
                if (v) feedback("tick");
              }}
            />
          </div>
        </section>

        <section className="mt-8">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            Appearance
          </p>
          <p className="mb-3 text-[12px] text-white/35">Dark / Light / Device — free for everyone.</p>
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
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            App color
          </p>
          <p className="mb-3 text-[12px] text-white/35">
            {colorUnlocked
              ? "Accent color across the app."
              : "Locked to Rise and above. Upgrade to unlock."}
          </p>
          <div className={cn("grid grid-cols-4 gap-3", !colorUnlocked && "opacity-40")}>
            {APP_COLORS.map((color) => {
              const active = me.accent === color.value;
              return (
                <button
                  key={color.value}
                  type="button"
                  disabled={!colorUnlocked}
                  onClick={() => {
                    if (!colorUnlocked) return;
                    setMe(patchIdentity({ accent: color.value }));
                    feedback("tick");
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  <span
                    className={cn(
                      "h-12 w-12 rounded-full",
                      active && colorUnlocked && "ring-2 ring-white ring-offset-2 ring-offset-[var(--livv-bg)]"
                    )}
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-[11px] text-white/45">{color.name}</span>
                </button>
              );
            })}
          </div>
          {!colorUnlocked && (
            <Link
              href="/home/profile"
              className="mt-4 inline-block text-[13px] text-livv-accent-soft"
            >
              View membership →
            </Link>
          )}
        </section>

        <section className="mt-10 overflow-hidden rounded-[22px] border border-livv-border bg-livv-surface">
          <Row href="/home/profile" label="Identity" value={me.displayName} />
          <Row href="/home/profile" label="Membership" value={tier.name} />
          <Row href="/home/messages" label="Messages" value="Inbox" />
          <Row href="/home/packs" label="Packs" value="Open" />
        </section>

        <button
          type="button"
          onClick={() => {
            signOut();
            router.replace("/auth");
          }}
          className="mt-8 w-full rounded-full border border-red-500/30 py-3.5 text-sm text-red-400"
        >
          Sign out
        </button>

        <p className="mt-8 text-center text-[12px] text-white/28">LIVV · 0.1</p>
      </Container>
    </main>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between border-b border-white/5 px-4 py-4 last:border-b-0"
    >
      <span className="text-sm">{label}</span>
      <span
        className={cn(
          "flex h-7 w-12 items-center rounded-full px-1 transition",
          value ? "bg-livv-accent" : "bg-white/15"
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-white transition",
            value ? "translate-x-5" : "translate-x-0"
          )}
        />
      </span>
    </button>
  );
}

function Row({ href, label, value }: { href: string; label: string; value: string }) {
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
