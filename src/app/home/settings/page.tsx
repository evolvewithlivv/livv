"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  CircleUserRound,
  Download,
  Fingerprint,
  LogOut,
  Moon,
  Palette,
  Settings2,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  Volume2,
  Vibrate,
  Zap,
} from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import {
  loadIdentity,
  patchIdentity,
  APP_COLORS,
  type Appearance,
  type Identity,
} from "@/lib/identity";
import { getCurrentAccount, setCurrentAccountEmail, signOut } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { linkEmailPasswordToCurrentUser } from "@/lib/supabase/link-account";
import { getTier } from "@/lib/membership";
import { canAccessTier, getEffectiveTier } from "@/lib/billing";
import { loadPrefs, patchPrefs, type LivvPrefs } from "@/lib/prefs";
import { feedback } from "@/lib/sensory";
import {
  countManagedKeysPresent,
  deleteAllLivvData,
  downloadBackup,
  importBackup,
  parseBackupFile,
} from "@/lib/data-portability";

const APPEARANCES: { id: Appearance; label: string; hint: string; icon: typeof Moon }[] = [
  { id: "dark", label: "Midnight", hint: "Always dark", icon: Moon },
  { id: "light", label: "Daylight", hint: "Always light", icon: Sparkles },
  { id: "system", label: "Device", hint: "Match your device", icon: Settings2 },
];

function canPickColor() {
  return canAccessTier("rise");
}

export default function SettingsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [me, setMe] = useState<Identity | null>(null);
  const [provider, setProvider] = useState("");
  const [prefs, setPrefs] = useState<LivvPrefs>({ sound: true, haptics: true });
  const [keyCount, setKeyCount] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkStatus, setLinkStatus] = useState("");
  const [linkError, setLinkError] = useState("");
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [cloudReady, setCloudReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setMe(loadIdentity());
      setPrefs(loadPrefs());
      const acc = getCurrentAccount();
      setProvider(acc?.provider || "");
      setAccountEmail(acc?.email || null);
      setKeyCount(countManagedKeysPresent());
      setCloudReady(isSupabaseConfigured());
    };
    sync();
    window.addEventListener("livv-identity", sync);
    window.addEventListener("livv-auth", sync);
    window.addEventListener("livv-prefs", sync);
    window.addEventListener("livv-record", sync);
    window.addEventListener("livv-billing", sync);
    return () => {
      window.removeEventListener("livv-identity", sync);
      window.removeEventListener("livv-auth", sync);
      window.removeEventListener("livv-prefs", sync);
      window.removeEventListener("livv-record", sync);
      window.removeEventListener("livv-billing", sync);
    };
  }, []);

  if (!me) return null;
  const tier = getTier(getEffectiveTier());
  const colorUnlocked = canPickColor();

  const onExport = () => {
    setError("");
    try {
      const backup = downloadBackup();
      setStatus(`Exported ${Object.keys(backup.data).length} keys \u00b7 device-local JSON`);
      feedback("tick");
      setKeyCount(countManagedKeysPresent());
    } catch {
      setError("Export failed.");
    }
  };

  const onPickImport = () => {
    setError("");
    setStatus("");
    fileRef.current?.click();
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const parsed = await parseBackupFile(file);
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      const ok = window.confirm(
        `Import will REPLACE LIVV data on this device with this backup (${parsed.keyCount} keys, exported ${parsed.backup.exportedAt.slice(0, 10)}).\n\nProgress, identity, packs, and session on this browser will be overwritten. This cannot be undone unless you exported first.\n\nContinue?`
      );
      if (!ok) {
        setStatus("Import cancelled.");
        return;
      }
      const result = importBackup(parsed.backup);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      feedback("unlock");
      setStatus(`Imported ${parsed.keyCount} keys. Reloading\u2026`);
      window.setTimeout(() => {
        window.location.href = "/home";
      }, 600);
    } catch {
      setError("Import failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setError("");
      setStatus("Tap delete again to confirm. This wipes LIVV data on this device.");
      return;
    }
    setBusy(true);
    try {
      deleteAllLivvData();
      signOut();
      feedback("tick");
      setStatus("All local LIVV data deleted.");
      window.setTimeout(() => {
        router.replace("/");
      }, 400);
    } catch {
      setError("Delete failed.");
      setBusy(false);
    }
  };

  return (
    <main className="livv-page relative min-h-full overflow-hidden pb-16">
      <div className="relative z-10 mx-auto max-w-lg px-5 pt-5">
        <PageHero
          eyebrow="Settings"
          title="Settings"
          subtitle="Sound, haptics, appearance, and local data."
          accent="#ff72c9"
        />

        <section className="livv-glass relative mt-7 overflow-hidden rounded-[28px] p-5">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-livv-accent/10 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-livv-accent/20 bg-livv-accent/10 text-livv-accent-soft">
              <Fingerprint size={23} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-livv-muted">Your identity</p>
              <p className="mt-1 truncate text-[17px] font-semibold text-livv-fg">@{me.username}</p>
              <p className="mt-0.5 text-[11px] capitalize text-livv-muted">{provider || "LIVV account"}</p>
            </div>
            <Link href="/home/profile" className="grid h-9 w-9 place-items-center rounded-full bg-livv-bg text-livv-muted">
              <ChevronRight size={16} />
            </Link>
          </div>
        </section>

        {cloudReady && (
          <SettingGroup label="Save your account" eyebrow="Cloud identity">
            <div className="space-y-3 p-4">
              <p className="text-[12px] leading-relaxed text-livv-muted">
                {accountEmail
                  ? "Email is saved on this device account. Progress still lives on this browser until cloud sync ships."
                  : "Keep the same LIVV identity by adding email and password. Your progress on this device is unchanged."}
              </p>
              {accountEmail && (
                <p className="text-[12px] text-livv-fg">
                  Linked email: <span className="font-medium">{accountEmail}</span>
                </p>
              )}
              <input
                type="email"
                autoComplete="email"
                placeholder="Email"
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                className="w-full rounded-2xl border border-livv-border bg-livv-bg px-4 py-3 text-[14px] text-livv-fg outline-none placeholder:text-livv-muted focus:border-livv-accent/40"
              />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Password (6+ characters)"
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                className="w-full rounded-2xl border border-livv-border bg-livv-bg px-4 py-3 text-[14px] text-livv-fg outline-none placeholder:text-livv-muted focus:border-livv-accent/40"
              />
              {(linkError || linkStatus) && (
                <p className={"text-[12px] leading-relaxed " + (linkError ? "text-red-400" : "text-livv-accent-soft")}>
                  {linkError || linkStatus}
                </p>
              )}
              <button
                type="button"
                disabled={linkBusy}
                onClick={async () => {
                  setLinkBusy(true);
                  setLinkError("");
                  setLinkStatus("");
                  try {
                    const result = await linkEmailPasswordToCurrentUser(linkEmail, linkPassword);
                    if (!result.ok) {
                      setLinkError(result.message);
                      return;
                    }
                    setCurrentAccountEmail(result.email);
                    setAccountEmail(result.email);
                    setLinkPassword("");
                    if (result.confirmationRequired) {
                      setLinkStatus(
                        "Check your inbox to confirm this email. Your account id is unchanged and progress stays on this device."
                      );
                    } else {
                      setLinkStatus("Account protected. Same identity \u2014 progress stays on this device.");
                    }
                  } catch (e) {
                    setLinkError(e instanceof Error ? e.message : "Could not save account.");
                  } finally {
                    setLinkBusy(false);
                  }
                }}
                className="flex w-full items-center justify-center rounded-full border border-livv-accent/30 bg-livv-accent/10 py-3 text-[13px] font-semibold text-livv-accent-soft disabled:opacity-50"
              >
                {linkBusy ? "Saving\u2026" : accountEmail ? "Update email protection" : "Protect with email"}
              </button>
            </div>
          </SettingGroup>
        )}

        <SettingGroup label="Experience" eyebrow="Feedback">
          <ToggleRow
            icon={<Volume2 size={16} />}
            label="Sound"
            hint="Cues when you complete something"
            value={prefs.sound}
            onChange={(v) => {
              setPrefs(patchPrefs({ sound: v }));
              if (v) feedback("tick");
            }}
          />
          <ToggleRow
            icon={<Vibrate size={16} />}
            label="Haptics"
            hint="Tap feedback"
            value={prefs.haptics}
            onChange={(v) => {
              setPrefs(patchPrefs({ haptics: v }));
              if (v) feedback("tick");
            }}
          />
        </SettingGroup>

        <SettingGroup label="Appearance" eyebrow="Look">
          <div className="grid grid-cols-3 gap-2 p-3">
            {APPEARANCES.map((opt) => {
              const Icon = opt.icon;
              const active = me.appearance === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    feedback("tick");
                    setMe(patchIdentity({ appearance: opt.id }));
                  }}
                  className="relative overflow-hidden rounded-2xl border p-3 text-left transition active:scale-[0.98]"
                  style={{
                    borderColor: active ? "rgb(var(--livv-accent) / 0.6)" : "rgb(var(--livv-border) / 1)",
                    background: active ? "rgb(var(--livv-accent) / 0.10)" : "rgb(var(--livv-surface) / 1)",
                  }}
                >
                  <Icon size={15} className={active ? "text-livv-accent-soft" : "text-livv-muted"} />
                  <span className="mt-4 block text-[12px] font-semibold text-livv-fg">{opt.label}</span>
                  <span className="mt-1 block text-[10px] text-livv-muted">{opt.hint}</span>
                  {active && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-livv-accent" />}
                </button>
              );
            })}
          </div>
        </SettingGroup>

        <SettingGroup label="Accent" eyebrow="Color">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-livv-fg">App color</p>
                <p className="mt-1 text-[11px] text-livv-muted">Changes the signal throughout LIVV</p>
              </div>
              <span className="rounded-full border border-livv-border px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-livv-muted">
                {colorUnlocked ? "Rise+" : "Locked"}
              </span>
            </div>
            <div className={"mt-5 grid grid-cols-4 gap-3 " + (!colorUnlocked ? "opacity-40" : "")}>
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
                    className="flex flex-col items-center gap-2 disabled:cursor-not-allowed"
                  >
                    <span
                      className={
                        "h-11 w-11 rounded-full transition " +
                        (active && colorUnlocked
                          ? "ring-2 ring-[rgb(var(--livv-fg))] ring-offset-2 ring-offset-[var(--livv-bg)] scale-110"
                          : "")
                      }
                      style={{
                        backgroundColor: color.value,
                        boxShadow: active ? `0 0 24px ${color.value}66` : undefined,
                      }}
                    />
                    <span className="text-[10px] text-livv-muted">{color.name}</span>
                  </button>
                );
              })}
            </div>
            {!colorUnlocked && (
              <Link
                href="/home/profile"
                className="mt-4 block rounded-xl border border-livv-border px-3 py-2.5 text-[11px] text-livv-accent-soft"
              >
                Unlock colors with Rise
              </Link>
            )}
          </div>
        </SettingGroup>

        <SettingGroup label="Your data" eyebrow="This device">
          <div className="space-y-0 p-0">
            <p className="border-b border-livv-border px-4 py-3 text-[11px] leading-relaxed text-livv-muted">
              LIVV progress lives in this browser. Export a backup before clearing site data or
              switching devices. Import replaces local LIVV data \u2014 not a cloud sync.
            </p>
            <p className="border-b border-livv-border px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-livv-muted">
              {keyCount} storage keys on device
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={onExport}
              className="flex w-full items-center gap-3 border-b border-livv-border px-4 py-4 text-left transition active:bg-white/[0.02] disabled:opacity-50"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-livv-bg text-livv-muted">
                <Download size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-livv-fg">Export my LIVV data</span>
                <span className="mt-0.5 block text-[10px] text-livv-muted">
                  Download versioned JSON backup
                </span>
              </span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onPickImport}
              className="flex w-full items-center gap-3 border-b border-livv-border px-4 py-4 text-left transition active:bg-white/[0.02] disabled:opacity-50"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-livv-bg text-livv-muted">
                <Upload size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-livv-fg">Import LIVV data</span>
                <span className="mt-0.5 block text-[10px] text-livv-muted">
                  Replace this device from a backup file
                </span>
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition active:bg-white/[0.02] disabled:opacity-50"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-400">
                <Trash2 size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-red-400">
                  {confirmDelete ? "Tap again to delete everything" : "Delete all LIVV data"}
                </span>
                <span className="mt-0.5 block text-[10px] text-livv-muted">
                  Wipes progress, identity, packs, and session on this browser
                </span>
              </span>
            </button>
            {(status || error) && (
              <p
                className={
                  "border-t border-livv-border px-4 py-3 text-[11px] leading-relaxed " +
                  (error ? "text-red-400" : "text-livv-accent-soft")
                }
              >
                {error || status}
              </p>
            )}
          </div>
        </SettingGroup>

        <section className="mt-8 overflow-hidden rounded-[26px] border border-livv-border bg-livv-surface">
          <LinkRow href="/home/profile" icon={<CircleUserRound size={16} />} label="Profile & identity" value={me.displayName} />
          <LinkRow href="/home/profile" icon={<Zap size={16} />} label="Membership" value={tier.name} />
          <LinkRow href="/home/messages" icon={<Sparkles size={16} />} label="Messages" value="Inbox" />
          <LinkRow href="/home/shop" icon={<Palette size={16} />} label="Packs & vault" value="Open" />
        </section>

        <section className="mt-8 overflow-hidden rounded-[26px] border border-livv-border bg-livv-surface">
          <LinkRow href="/legal/terms" icon={<Shield size={16} />} label="Terms of Use" value="The contract" />
          <LinkRow href="/legal/privacy" icon={<Shield size={16} />} label="Privacy Policy" value="What we collect" />
          <LinkRow href="/legal/community" icon={<Shield size={16} />} label="Community Guidelines" value="How we treat each other" />
          <LinkRow href="/legal/refunds" icon={<Shield size={16} />} label="Refunds" value="Packs and memberships" />
        </section>
        <button
          type="button"
          onClick={() => {
            signOut();
            router.replace("/auth");
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-red-500/20 bg-red-500/[0.04] py-3.5 text-[13px] font-medium text-red-400"
        >
          <LogOut size={15} /> Sign out
        </button>
        <p className="mt-7 text-center text-[10px] uppercase tracking-[0.22em] text-livv-muted">LIVV</p>
      </div>
    </main>
  );
}

function SettingGroup({ label, eyebrow, children }: { label: string; eyebrow: string; children: ReactNode }) {
  return (
    <section className="mt-9">
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-[0.25em] text-livv-muted">{eyebrow}</p>
        <h2 className="mt-1 text-[17px] font-semibold text-livv-fg">{label}</h2>
      </div>
      <div className="overflow-hidden rounded-[24px] border border-livv-border bg-livv-surface">{children}</div>
    </section>
  );
}

function ToggleRow({
  icon,
  label,
  hint,
  value,
  onChange,
  disabled = false,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
  value: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(!value)}
      className="flex w-full items-center gap-3 border-b border-livv-border px-4 py-4 text-left last:border-b-0 disabled:cursor-default"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-livv-bg text-livv-muted">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-livv-fg">{label}</span>
        <span className="mt-0.5 block text-[10px] text-livv-muted">{hint}</span>
      </span>
      <span className={"flex h-7 w-12 items-center rounded-full p-1 transition " + (value ? "bg-livv-accent" : "bg-livv-bg")}>
        <span className={"h-5 w-5 rounded-full bg-white transition " + (value ? "translate-x-5" : "translate-x-0")} />
      </span>
    </button>
  );
}

function LinkRow({ href, icon, label, value }: { href: string; icon: ReactNode; label: string; value: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 border-b border-livv-border px-4 py-4 last:border-b-0">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-livv-bg text-livv-muted">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-livv-fg">{label}</span>
        <span className="mt-0.5 block truncate text-[10px] text-livv-muted">{value}</span>
      </span>
      <ChevronRight size={16} className="text-livv-muted" />
    </Link>
  );
}
