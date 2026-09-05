"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, ChevronRight, CircleUserRound, Fingerprint, LogOut, Moon, Palette, Settings2, Shield, Sparkles, Volume2, Vibrate, Zap } from "lucide-react";
import { loadIdentity, patchIdentity, APP_COLORS, type Appearance, type Identity, type LivvTier } from "@/lib/identity";
import { getCurrentAccount, signOut } from "@/lib/auth";
import { getTier, hasTier } from "@/lib/membership";
import { loadPrefs, patchPrefs, type LivvPrefs } from "@/lib/prefs";
import { feedback } from "@/lib/sensory";

const APPEARANCES: { id: Appearance; label: string; hint: string; icon: typeof Moon }[] = [
  { id: "dark", label: "Midnight", hint: "Always dark", icon: Moon },
  { id: "light", label: "Daylight", hint: "Always light", icon: Sparkles },
  { id: "system", label: "Device", hint: "Match your device", icon: Settings2 },
];

function canPickColor(tier: LivvTier) { return hasTier(tier, "rise"); }

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Identity | null>(null);
  const [provider, setProvider] = useState("");
  const [prefs, setPrefs] = useState<LivvPrefs>({ sound: true, haptics: true });

  useEffect(() => {
    const sync = () => { setMe(loadIdentity()); setPrefs(loadPrefs()); setProvider(getCurrentAccount()?.provider || ""); };
    sync();
    window.addEventListener("livv-identity", sync); window.addEventListener("livv-auth", sync); window.addEventListener("livv-prefs", sync);
    return () => { window.removeEventListener("livv-identity", sync); window.removeEventListener("livv-auth", sync); window.removeEventListener("livv-prefs", sync); };
  }, []);

  if (!me) return null;
  const tier = getTier(me.tier);
  const colorUnlocked = canPickColor(me.tier);

  return (
    <main className="relative min-h-full overflow-hidden pb-16">
      <div className="pointer-events-none fixed inset-0 bg-[var(--livv-bg)]" />
      <div className="pointer-events-none fixed left-1/2 top-[-140px] h-[430px] w-[430px] -translate-x-1/2 rounded-full bg-livv-accent/10 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <header className="flex items-center gap-3">
          <Link href="/home/profile" aria-label="Back to profile" className="grid h-10 w-10 place-items-center rounded-full border border-livv-border bg-livv-surface text-livv-muted"><ArrowLeft size={17} /></Link>
          <div><p className="text-[10px] uppercase tracking-[0.32em] text-livv-muted">Control room</p><h1 className="font-display mt-0.5 text-[28px] font-semibold tracking-tight text-livv-fg">Settings</h1></div>
        </header>

        <section className="relative mt-7 overflow-hidden rounded-[28px] border border-livv-border bg-livv-surface p-5 backdrop-blur-xl">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-livv-accent/10 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-livv-accent/20 bg-livv-accent/10 text-livv-accent-soft"><Fingerprint size={23} /></div>
            <div className="min-w-0 flex-1"><p className="text-[10px] uppercase tracking-[0.2em] text-livv-muted">Your identity</p><p className="mt-1 truncate text-[17px] font-semibold text-livv-fg">@{me.username}</p><p className="mt-0.5 text-[11px] capitalize text-livv-muted">{provider || "LIVV account"}</p></div>
            <Link href="/home/profile" className="grid h-9 w-9 place-items-center rounded-full bg-livv-bg text-livv-muted"><ChevronRight size={16} /></Link>
          </div>
        </section>

        <SettingGroup label="Experience" eyebrow="How LIVV feels">
          <ToggleRow icon={<Volume2 size={16} />} label="Sound" hint="Ambient feedback & cues" value={prefs.sound} onChange={(v) => { setPrefs(patchPrefs({ sound: v })); if (v) feedback("tick"); }} />
          <ToggleRow icon={<Vibrate size={16} />} label="Haptics" hint="Tactile feedback on actions" value={prefs.haptics} onChange={(v) => { setPrefs(patchPrefs({ haptics: v })); if (v) feedback("tick"); }} />
          <ToggleRow icon={<Bell size={16} />} label="Notifications" hint="Ready for the real notification layer" value={true} disabled />
        </SettingGroup>

        <SettingGroup label="Appearance" eyebrow="Make it yours">
          <div className="grid grid-cols-3 gap-2 p-3">
            {APPEARANCES.map((opt) => {
              const Icon = opt.icon;
              const active = me.appearance === opt.id;
              return (
                <button key={opt.id} type="button" onClick={() => { feedback("tick"); setMe(patchIdentity({ appearance: opt.id })); }} className="relative overflow-hidden rounded-2xl border p-3 text-left transition active:scale-[0.98]" style={{ borderColor: active ? "rgb(var(--livv-accent) / 0.6)" : "rgb(var(--livv-border) / 1)", background: active ? "rgb(var(--livv-accent) / 0.10)" : "rgb(var(--livv-surface) / 1)" }}>
                  <Icon size={15} className={active ? "text-livv-accent-soft" : "text-livv-muted"} />
                  <span className="mt-4 block text-[12px] font-semibold text-livv-fg">{opt.label}</span>
                  <span className="mt-1 block text-[10px] text-livv-muted">{opt.hint}</span>
                  {active && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-livv-accent" />}
                </button>
              );
            })}
          </div>
        </SettingGroup>

        <SettingGroup label="Accent" eyebrow="Your signal">
          <div className="p-4">
            <div className="flex items-center justify-between"><div><p className="text-[13px] font-medium text-livv-fg">App color</p><p className="mt-1 text-[11px] text-livv-muted">Changes the signal throughout LIVV</p></div><span className="rounded-full border border-livv-border px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-livv-muted">{colorUnlocked ? "Rise+" : "Locked"}</span></div>
            <div className={"mt-5 grid grid-cols-4 gap-3 " + (!colorUnlocked ? "opacity-40" : "")}>
              {APP_COLORS.map((color) => {
                const active = me.accent === color.value;
                return (
                  <button key={color.value} type="button" disabled={!colorUnlocked} onClick={() => { if (!colorUnlocked) return; setMe(patchIdentity({ accent: color.value })); feedback("tick"); }} className="flex flex-col items-center gap-2 disabled:cursor-not-allowed">
                    <span className={"h-11 w-11 rounded-full transition " + (active && colorUnlocked ? "ring-2 ring-[rgb(var(--livv-fg))] ring-offset-2 ring-offset-[var(--livv-bg)] scale-110" : "")} style={{ backgroundColor: color.value, boxShadow: active ? `0 0 24px ${color.value}66` : undefined }} />
                    <span className="text-[10px] text-livv-muted">{color.name}</span>
                  </button>
                );
              })}
            </div>
            {!colorUnlocked && <Link href="/home/profile" className="mt-4 block rounded-xl border border-livv-border px-3 py-2.5 text-[11px] text-livv-accent-soft">Unlock custom signal colors with Rise →</Link>}
          </div>
        </SettingGroup>

        <section className="mt-8 overflow-hidden rounded-[26px] border border-livv-border bg-livv-surface">
          <LinkRow href="/home/profile" icon={<CircleUserRound size={16} />} label="Profile & identity" value={me.displayName} />
          <LinkRow href="/home/profile" icon={<Zap size={16} />} label="Membership" value={tier.name} />
          <LinkRow href="/home/messages" icon={<Sparkles size={16} />} label="Messages" value="Inbox" />
          <LinkRow href="/home/packs" icon={<Palette size={16} />} label="Packs & vault" value="Open" />
        </section>

        <section className="mt-8 rounded-[24px] border border-livv-border bg-livv-surface p-4"><div className="flex items-start gap-3"><Shield size={16} className="mt-0.5 text-livv-muted" /><div><p className="text-[12px] font-semibold text-livv-fg">Privacy & security</p><p className="mt-1 text-[11px] leading-relaxed text-livv-muted">Your local V1 account and activity data stay on this device until the real sync layer is connected.</p></div></div></section>
        <button type="button" onClick={() => { signOut(); router.replace("/auth"); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-red-500/20 bg-red-500/[0.04] py-3.5 text-[13px] font-medium text-red-400"><LogOut size={15} /> Sign out</button>
        <p className="mt-7 text-center text-[10px] uppercase tracking-[0.22em] text-livv-muted">LIVV · 0.1 · Built to evolve</p>
      </div>
    </main>
  );
}

function SettingGroup({ label, eyebrow, children }: { label: string; eyebrow: string; children: ReactNode }) {
  return <section className="mt-9"><div className="mb-3"><p className="text-[10px] uppercase tracking-[0.25em] text-livv-muted">{eyebrow}</p><h2 className="mt-1 text-[17px] font-semibold text-livv-fg">{label}</h2></div><div className="overflow-hidden rounded-[24px] border border-livv-border bg-livv-surface">{children}</div></section>;
}

function ToggleRow({ icon, label, hint, value, onChange, disabled = false }: { icon: ReactNode; label: string; hint: string; value: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return <button type="button" disabled={disabled} onClick={() => onChange?.(!value)} className="flex w-full items-center gap-3 border-b border-livv-border px-4 py-4 text-left last:border-b-0 disabled:cursor-default"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-livv-bg text-livv-muted">{icon}</span><span className="min-w-0 flex-1"><span className="block text-[13px] font-medium text-livv-fg">{label}</span><span className="mt-0.5 block text-[10px] text-livv-muted">{hint}</span></span><span className={"flex h-7 w-12 items-center rounded-full p-1 transition " + (value ? "bg-livv-accent" : "bg-livv-bg")}><span className={"h-5 w-5 rounded-full bg-white transition " + (value ? "translate-x-5" : "translate-x-0")} /></span></button>;
}

function LinkRow({ href, icon, label, value }: { href: string; icon: ReactNode; label: string; value: string }) {
  return <Link href={href} className="flex items-center gap-3 border-b border-livv-border px-4 py-4 last:border-b-0"><span className="grid h-9 w-9 place-items-center rounded-xl bg-livv-bg text-livv-muted">{icon}</span><span className="min-w-0 flex-1"><span className="block text-[13px] font-medium text-livv-fg">{label}</span><span className="mt-0.5 block truncate text-[10px] text-livv-muted">{value}</span></span><ChevronRight size={16} className="text-livv-muted" /></Link>;
}
