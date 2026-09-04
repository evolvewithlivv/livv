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
      <div className="pointer-events-none fixed inset-0 bg-[#050505]" />
      <div className="pointer-events-none fixed left-1/2 top-[-140px] h-[430px] w-[430px] -translate-x-1/2 rounded-full bg-livv-accent/10 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <header className="flex items-center gap-3">
          <Link href="/home/profile" aria-label="Back to profile" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/55"><ArrowLeft size={17} /></Link>
          <div><p className="text-[10px] uppercase tracking-[0.32em] text-white/30">Control room</p><h1 className="font-display mt-0.5 text-[28px] font-semibold tracking-tight">Settings</h1></div>
        </header>

        <section className="relative mt-7 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-livv-accent/10 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-livv-accent/20 bg-livv-accent/10 text-livv-accent-soft"><Fingerprint size={23} /></div>
            <div className="min-w-0 flex-1"><p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Your identity</p><p className="mt-1 truncate text-[17px] font-semibold">@{me.username}</p><p className="mt-0.5 text-[11px] capitalize text-white/35">{provider || "LIVV account"}</p></div>
            <Link href="/home/profile" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-white/35"><ChevronRight size={16} /></Link>
          </div>
          <div className="relative mt-5 flex items-center justify-between border-t border-white/8 pt-4"><span className="text-[11px] text-white/30">Username</span><span className="text-[11px] text-white/50">Locked for now</span></div>
        </section>

        <SettingGroup label="Experience" eyebrow="How LIVV feels">
          <ToggleRow icon={<Volume2 size={16} />} label="Sound" hint="Ambient feedback & cues" value={prefs.sound} onChange={(v) => { setPrefs(patchPrefs({ sound: v })); if (v) feedback("tick"); }} />
          <ToggleRow icon={<Vibrate size={16} />} label="Haptics" hint="Tactile feedback on actions" value={prefs.haptics} onChange={(v) => { setPrefs(patchPrefs({ haptics: v })); if (v) feedback("tick"); }} />
          <ToggleRow icon={<Bell size={16} />} label="Notifications" hint="Ready for the real notification layer" value={true} disabled />
        </SettingGroup>

        <SettingGroup label="Appearance" eyebrow="Make it yours">
          <div className="grid grid-cols-3 gap-2">
            {APPEARANCES.map((opt) => { const Icon = opt.icon; const active = me.appearance === opt.id; return <button key={opt.id} type="button" onClick={() => setMe(patchIdentity({ appearance: opt.id }))} className="relative overflow-hidden rounded-2xl border p-3 text-left transition active:scale-[0.98]" style={{ borderColor: active ? "rgb(var(--livv-accent) / 0.6)" : "rgba(255,255,255,0.08)", background: active ? "rgb(var(--livv-accent) / 0.10)" : "rgba(255,255,255,0.025)" }}><Icon size={15} className={active ? "text-livv-accent-soft" : "text-white/30"} /><span className="mt-4 block text-[12px] font-semibold">{opt.label}</span><span className="mt-1 block text-[10px] text-white/30">{opt.hint}</span>{active && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-livv-accent" />}</button>; })}
          </div>
        </SettingGroup>

        <SettingGroup label="Accent" eyebrow="Your signal">
          <div className="flex items-center justify-between"><div><p className="text-[13px] font-medium">App color</p><p className="mt-1 text-[11px] text-white/30">Changes the signal throughout LIVV</p></div><span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-white/30">{colorUnlocked ? "Rise+" : "Locked"}</span></div>
          <div className={"mt-5 grid grid-cols-4 gap-3 " + (!colorUnlocked ? "opacity-40" : "")}>
            {APP_COLORS.map((color) => { const active = me.accent === color.value; return <button key={color.value} type="button" disabled={!colorUnlocked} onClick={() => { if (!colorUnlocked) return; setMe(patchIdentity({ accent: color.value })); feedback("tick"); }} className="flex flex-col items-center gap-2 disabled:cursor-not-allowed"><span className={"h-11 w-11 rounded-full transition " + (active && colorUnlocked ? "ring-2 ring-white ring-offset-2 ring-offset-[#050505] scale-110" : "")} style={{ backgroundColor: color.value, boxShadow: active ? `0 0 24px ${color.value}66` : undefined }} /><span className="text-[10px] text-white/35">{color.name}</span></button>; })}
          </div>
          {!colorUnlocked && <Link href="/home/profile" className="mt-4 block rounded-xl border border-white/7 bg-white/[0.025] px-3 py-2.5 text-[11px] text-livv-accent-soft">Unlock custom signal colors with Rise →</Link>}
        </SettingGroup>

        <section className="mt-8 overflow-hidden rounded-[26px] border border-white/8 bg-white/[0.025]">
          <LinkRow href="/home/profile" icon={<CircleUserRound size={16} />} label="Profile & identity" value={me.displayName} />
          <LinkRow href="/home/profile" icon={<Zap size={16} />} label="Membership" value={tier.name} />
          <LinkRow href="/home/messages" icon={<Sparkles size={16} />} label="Messages" value="Inbox" />
          <LinkRow href="/home/packs" icon={<Palette size={16} />} label="Packs & vault" value="Open" />
        </section>

        <section className="mt-8 rounded-[24px] border border-white/7 bg-white/[0.02] p-4"><div className="flex items-start gap-3"><Shield size={16} className="mt-0.5 text-white/30" /><div><p className="text-[12px] font-semibold">Privacy & security</p><p className="mt-1 text-[11px] leading-relaxed text-white/30">Your local V1 account and activity data stay on this device until the real sync layer is connected.</p></div></div></section>
        <button type="button" onClick={() => { signOut(); router.replace("/auth"); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-red-500/20 bg-red-500/[0.04] py-3.5 text-[13px] font-medium text-red-300/80"><LogOut size={15} /> Sign out</button>
        <p className="mt-7 text-center text-[10px] uppercase tracking-[0.22em] text-white/15">LIVV · 0.1 · Built to evolve</p>
      </div>
    </main>
  );
}

function SettingGroup({ label, eyebrow, children }: { label: string; eyebrow: string; children: ReactNode }) {
  return <section className="mt-9"><div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[0.25em] text-white/25">{eyebrow}</p><h2 className="mt-1 text-[17px] font-semibold">{label}</h2></div></div><div className="overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.025]">{children}</div></section>;
}

function ToggleRow({ icon, label, hint, value, onChange, disabled = false }: { icon: ReactNode; label: string; hint: string; value: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return <button type="button" disabled={disabled} onClick={() => onChange?.(!value)} className="flex w-full items-center gap-3 border-b border-white/7 px-4 py-4 text-left last:border-b-0 disabled:cursor-default"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.045] text-white/40">{icon}</span><span className="min-w-0 flex-1"><span className="block text-[13px] font-medium">{label}</span><span className="mt-0.5 block text-[10px] text-white/30">{hint}</span></span><span className={"flex h-7 w-12 items-center rounded-full p-1 transition " + (value ? "bg-livv-accent" : "bg-white/10")}><span className={"h-5 w-5 rounded-full bg-white transition " + (value ? "translate-x-5" : "translate-x-0")} /></span></button>;
}

function LinkRow({ href, icon, label, value }: { href: string; icon: ReactNode; label: string; value: string }) {
  return <Link href={href} className="flex items-center gap-3 border-b border-white/7 px-4 py-4 last:border-b-0"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.04] text-white/35">{icon}</span><span className="min-w-0 flex-1"><span className="block text-[13px] font-medium">{label}</span><span className="mt-0.5 block truncate text-[10px] text-white/25">{value}</span></span><ChevronRight size={16} className="text-white/20" /></Link>;
}
