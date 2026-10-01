"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Download,
  LogOut,
  Trash2,
  Upload,
  Volume2,
  Vibrate,
} from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import {
  loadIdentity,
  patchIdentity,
  applyAppearance,
  type Appearance,
  type Identity,
  type LivvTheme,
} from "@/lib/identity";
import { getCurrentAccount, signOut } from "@/lib/auth";
import { loadPrefs, patchPrefs, type LivvPrefs } from "@/lib/prefs";
import { feedback } from "@/lib/sensory";
import {
  countManagedKeysPresent,
  deleteAllLivvData,
  downloadBackup,
  importBackup,
  parseBackupFile,
} from "@/lib/data-portability";
import { getEffectiveTier } from "@/lib/billing";

type LookOption = {
  id: string;
  label: string;
  hint: string;
  appearance: Appearance;
  theme: LivvTheme;
};

const LOOK_OPTIONS: LookOption[] = [
  { id: "device", label: "Device", hint: "Follow system light or dark", appearance: "system", theme: "ember" },
  { id: "ember", label: "Ember", hint: "Warm dark — original LIVV", appearance: "dark", theme: "ember" },
  { id: "daylight", label: "Daylight", hint: "Clean light mode", appearance: "light", theme: "ember" },
  { id: "midnight", label: "Midnight", hint: "Deep, cool, quiet", appearance: "dark", theme: "midnight" },
];

function isLookActive(me: Identity, opt: LookOption): boolean {
  if (opt.id === "device") return me.appearance === "system";
  if (opt.id === "ember") return me.appearance === "dark" && (me.theme === "ember" || !me.theme);
  if (opt.id === "daylight") return me.appearance === "light" && (me.theme === "ember" || !me.theme);
  if (opt.id === "midnight") return me.appearance === "dark" && me.theme === "midnight";
  return false;
}

function tierDisplay(id: string): string {
  if (!id || id === "spark") return "Spark";
  return id.charAt(0).toUpperCase() + id.slice(1);
}

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [me, setMe] = useState<Identity | null>(null);
  const [prefs, setPrefs] = useState<LivvPrefs>({ sound: true, haptics: true });
  const [keyCount, setKeyCount] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [tierLabel, setTierLabel] = useState("Spark");

  useEffect(() => {
    const sync = () => {
      setMe(loadIdentity());
      setPrefs(loadPrefs());
      setKeyCount(countManagedKeysPresent());
      const acc = getCurrentAccount();
      setAccountEmail(acc?.email || null);
      try {
        setTierLabel(tierDisplay(String(getEffectiveTier() || "spark")));
      } catch {
        setTierLabel("Spark");
      }
    };
    sync();
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  const setLook = (opt: LookOption) => {
    if (!me) return;
    const next = patchIdentity({ appearance: opt.appearance, theme: opt.theme });
    const id = next || loadIdentity();
    applyAppearance(id.appearance, id.accent || "", id.theme || "ember");
    setMe(loadIdentity());
    feedback("tap");
  };

  const togglePref = (key: keyof LivvPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    patchPrefs(next);
    setPrefs(loadPrefs());
    feedback("tap");
  };

  const onExport = () => {
    try {
      downloadBackup();
      setStatus("Backup downloaded.");
      setError("");
      feedback("success");
    } catch {
      setError("Could not export data.");
    }
  };

  const onImport = async (file: File) => {
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const parsed = await parseBackupFile(file);
      importBackup(parsed);
      setMe(loadIdentity());
      setPrefs(loadPrefs());
      setKeyCount(countManagedKeysPresent());
      setStatus("Backup restored.");
      feedback("success");
    } catch {
      setError("Invalid backup file.");
    } finally {
      setBusy(false);
    }
  };

  const onDeleteAll = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteAllLivvData();
    setConfirmDelete(false);
    setMe(loadIdentity());
    setPrefs(loadPrefs());
    setKeyCount(0);
    setStatus("Local data cleared.");
    feedback("success");
  };

  const onSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <main className="livv-account-page livv-page min-h-full pb-32">
      <div className="account-inner mx-auto max-w-xl px-5 pt-5">
        <PageHero
          eyebrow="Settings"
          title="Control the system."
          subtitle="Account, look, data, and how LIVV behaves on this device."
        />

        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-livv-muted">
            Account
          </h2>
          <div className="mt-3 divide-y divide-[var(--livv-pro-border)] border-y border-[var(--livv-pro-border)]">
            <Row label="Signed in" value={accountEmail || "Local only"} />
            <Row label="Membership" value={tierLabel} href="/home/tiers" />
            <button
              type="button"
              onClick={onSignOut}
              className="flex w-full items-center justify-between py-3.5 text-left"
            >
              <span className="flex items-center gap-2 text-[15px]">
                <LogOut className="h-4 w-4 opacity-60" />
                Sign out
              </span>
              <ChevronRight className="h-4 w-4 opacity-40" />
            </button>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-livv-muted">
            Look
          </h2>
          <div className="mt-3 divide-y divide-[var(--livv-pro-border)] border-y border-[var(--livv-pro-border)]">
            {LOOK_OPTIONS.map((opt) => {
              const active = me ? isLookActive(me, opt) : false;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLook(opt)}
                  className="flex w-full items-center justify-between py-3.5 text-left"
                >
                  <span>
                    <span className="block text-[15px]">{opt.label}</span>
                    <span className="block text-[12px] text-livv-muted">{opt.hint}</span>
                  </span>
                  <span
                    className={`h-5 w-5 rounded-full border-2 ${
                      active
                        ? "border-[var(--livv-pro-accent)] bg-[var(--livv-pro-accent)]"
                        : "border-[var(--livv-pro-border)]"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-livv-muted">
            Feedback
          </h2>
          <div className="mt-3 divide-y divide-[var(--livv-pro-border)] border-y border-[var(--livv-pro-border)]">
            <ToggleRow
              icon={<Volume2 className="h-4 w-4 opacity-60" />}
              label="Sound"
              value={!!prefs.sound}
              onToggle={() => togglePref("sound")}
            />
            <ToggleRow
              icon={<Vibrate className="h-4 w-4 opacity-60" />}
              label="Haptics"
              value={!!prefs.haptics}
              onToggle={() => togglePref("haptics")}
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-livv-muted">
            Data
          </h2>
          <p className="mt-2 text-[12px] text-livv-muted">
            {keyCount} local keys on this device.
          </p>
          <div className="mt-3 divide-y divide-[var(--livv-pro-border)] border-y border-[var(--livv-pro-border)]">
            <button
              type="button"
              onClick={onExport}
              className="flex w-full items-center justify-between py-3.5 text-left"
            >
              <span className="flex items-center gap-2 text-[15px]">
                <Download className="h-4 w-4 opacity-60" />
                Export backup
              </span>
              <ChevronRight className="h-4 w-4 opacity-40" />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-between py-3.5 text-left disabled:opacity-50"
            >
              <span className="flex items-center gap-2 text-[15px]">
                <Upload className="h-4 w-4 opacity-60" />
                Import backup
              </span>
              <ChevronRight className="h-4 w-4 opacity-40" />
            </button>
            <button
              type="button"
              onClick={onDeleteAll}
              className="flex w-full items-center justify-between py-3.5 text-left"
            >
              <span className="flex items-center gap-2 text-[15px] text-red-400">
                <Trash2 className="h-4 w-4 opacity-80" />
                {confirmDelete ? "Tap again to confirm delete" : "Delete local data"}
              </span>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImport(f);
              e.target.value = "";
            }}
          />
          {status ? <p className="mt-3 text-[13px] text-livv-muted">{status}</p> : null}
          {error ? <p className="mt-3 text-[13px] text-red-400">{error}</p> : null}
        </section>

        <section className="mt-10 pb-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-livv-muted">
            About
          </h2>
          <div className="mt-3 divide-y divide-[var(--livv-pro-border)] border-y border-[var(--livv-pro-border)]">
            <Row label="LIVV" value="Evolve with purpose." />
            <Link
              href="/home/profile"
              className="flex w-full items-center justify-between py-3.5 text-left"
            >
              <span className="text-[15px]">Back to Profile</span>
              <ChevronRight className="h-4 w-4 opacity-40" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="text-[15px]">{label}</span>
      <span className="flex items-center gap-1 text-[13px] text-livv-muted">
        {value}
        {href ? <ChevronRight className="h-4 w-4 opacity-40" /> : null}
      </span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="flex w-full items-center justify-between py-3.5">
        {inner}
      </Link>
    );
  }
  return <div className="flex w-full items-center justify-between py-3.5">{inner}</div>;
}

function ToggleRow({
  icon,
  label,
  value,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between py-3.5 text-left"
    >
      <span className="flex items-center gap-2 text-[15px]">
        {icon}
        {label}
      </span>
      <span
        aria-hidden
        className={`h-6 w-11 rounded-full p-1 transition-colors ${
          value ? "bg-[var(--livv-pro-accent)]" : "bg-[var(--livv-pro-surface-2)]"
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition-transform ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
