"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Download,
  LogOut,
  Trash2,
  Upload,
  Volume2,
  Vibrate,
  UserRound,
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

type LookOption = {
  id: string;
  label: string;
  hint: string;
  appearance: Appearance;
  theme: LivvTheme;
};

const LOOK_OPTIONS: LookOption[] = [
  { id: "device", label: "Device", hint: "Match system", appearance: "system", theme: "ember" },
  { id: "ember", label: "Ember", hint: "Warm dark", appearance: "dark", theme: "ember" },
  { id: "daylight", label: "Daylight", hint: "Clean light", appearance: "light", theme: "ember" },
  { id: "midnight", label: "Midnight", hint: "Deep cool", appearance: "dark", theme: "midnight" },
];

function isLookActive(me: Identity, opt: LookOption): boolean {
  if (opt.id === "device") return me.appearance === "system";
  if (opt.id === "ember") return me.appearance === "dark" && (me.theme === "ember" || !me.theme);
  if (opt.id === "daylight") return me.appearance === "light" && (me.theme === "ember" || !me.theme);
  if (opt.id === "midnight") return me.appearance === "dark" && me.theme === "midnight";
  return false;
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

  useEffect(() => {
    const sync = () => {
      setMe(loadIdentity());
      setPrefs(loadPrefs());
      setKeyCount(countManagedKeysPresent());
      const acc = getCurrentAccount();
      setAccountEmail(acc?.email || null);
    };
    sync();
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  const setLook = (opt: LookOption) => {
    if (!me) return;
    const next = patchIdentity({ appearance: opt.appearance, theme: opt.theme });
    applyAppearance(next.appearance, next.accent || "", next.theme || "ember");
    setMe(loadIdentity());
    feedback("tick");
  };

  const togglePref = (key: keyof LivvPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    patchPrefs(next);
    setPrefs(loadPrefs());
    feedback("tick");
  };

  const onExport = () => {
    try {
      downloadBackup();
      setStatus("Backup downloaded.");
      setError("");
      feedback("complete");
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
      if (!parsed.ok) {
        setError(parsed.error || "Invalid backup file.");
        return;
      }
      const result = importBackup(parsed.backup);
      if (!result.ok) {
        setError(result.error || "Import failed.");
        return;
      }
      setMe(loadIdentity());
      setPrefs(loadPrefs());
      setKeyCount(countManagedKeysPresent());
      setStatus("Backup restored.");
      feedback("complete");
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
    feedback("complete");
  };

  const onSignOut = () => {
    signOut();
    window.location.href = "/";
  };

  const username = me?.username ? `@${me.username}` : "Member";

  return (
    <main className="livv-page min-h-full text-livv-ink pb-32">
      <div className="livv-stagger mx-auto w-full max-w-2xl px-5 pt-6 sm:px-6">
        <PageHero
          eyebrow="Settings"
          title="Control the system."
          subtitle="Account, look, data, and how LIVV behaves on this device."
        />

        <section className="mt-8 overflow-hidden rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)]">
          <div className="flex items-center gap-4 px-5 py-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-livv-border text-livv-muted">
              <UserRound size={20} strokeWidth={1.7} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-livv-muted">
                Signed in as
              </p>
              <p className="mt-1 truncate text-[16px] font-semibold tracking-tight">{username}</p>
              <p className="mt-0.5 truncate text-[12px] text-livv-muted">
                {accountEmail || "Local account on this device"}
              </p>
            </div>
            <Link
              href="/home/profile"
              aria-label="Open profile"
              className="livv-press grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-border text-livv-muted transition hover:text-livv-ink"
            >
              <ChevronRight size={16} strokeWidth={1.8} />
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-livv-muted">Look</p>
          <div className="mt-3 overflow-hidden rounded-[22px] border border-livv-border">
            {LOOK_OPTIONS.map((opt, i) => {
              const active = me ? isLookActive(me, opt) : false;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLook(opt)}
                  className={
                    "livv-press flex w-full items-center justify-between px-5 py-4 text-left transition " +
                    (i < LOOK_OPTIONS.length - 1 ? "border-b border-livv-border " : "") +
                    (active ? "bg-[color-mix(in_srgb,rgb(var(--livv-ink))_3.5%,transparent)]" : "")
                  }
                >
                  <span>
                    <span className="block text-[15px] font-semibold tracking-tight">{opt.label}</span>
                    <span className="mt-0.5 block text-[12px] text-livv-muted">{opt.hint}</span>
                  </span>
                  <span
                    className={
                      "grid h-5 w-5 place-items-center rounded-full border-2 " +
                      (active
                        ? "border-livv-accent bg-livv-accent"
                        : "border-livv-border bg-transparent")
                    }
                  >
                    {active ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--livv-bg))]" />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-livv-muted">
            Feedback
          </p>
          <div className="mt-3 overflow-hidden rounded-[22px] border border-livv-border">
            <ToggleRow
              icon={<Volume2 size={16} strokeWidth={1.7} />}
              label="Sound"
              hint="Quiet tones on actions"
              value={!!prefs.sound}
              onToggle={() => togglePref("sound")}
              last={false}
            />
            <ToggleRow
              icon={<Vibrate size={16} strokeWidth={1.7} />}
              label="Haptics"
              hint="Light vibration on confirm"
              value={!!prefs.haptics}
              onToggle={() => togglePref("haptics")}
              last
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-livv-muted">Data</p>
            <p className="text-[11px] text-livv-muted">{keyCount} keys on this device</p>
          </div>
          <div className="mt-3 overflow-hidden rounded-[22px] border border-livv-border">
            <ActionRow
              icon={<Download size={16} strokeWidth={1.7} />}
              label="Export backup"
              hint="Download a JSON of your progress"
              onClick={onExport}
            />
            <ActionRow
              icon={<Upload size={16} strokeWidth={1.7} />}
              label="Import backup"
              hint="Restore from a LIVV backup file"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            />
            <ActionRow
              icon={<Trash2 size={16} strokeWidth={1.7} />}
              label={confirmDelete ? "Tap again to confirm" : "Delete local data"}
              hint={confirmDelete ? "This cannot be undone on this device" : "Clears progress stored here"}
              onClick={onDeleteAll}
              danger
              last
            />
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
          {status ? <p className="mt-3 text-[12px] text-livv-muted">{status}</p> : null}
          {error ? <p className="mt-3 text-[12px] text-red-400">{error}</p> : null}
        </section>

        <section className="mt-8 mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-livv-muted">
            Session
          </p>
          <div className="mt-3 overflow-hidden rounded-[22px] border border-livv-border">
            <button
              type="button"
              onClick={onSignOut}
              className="livv-press flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[color-mix(in_srgb,rgb(var(--livv-ink))_3%,transparent)]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-livv-border text-livv-muted">
                <LogOut size={16} strokeWidth={1.7} />
              </span>
              <span className="flex-1">
                <span className="block text-[15px] font-semibold tracking-tight">Sign out</span>
                <span className="mt-0.5 block text-[12px] text-livv-muted">End this session on the device</span>
              </span>
            </button>
          </div>
          <p className="mt-6 text-center text-[11px] tracking-wide text-livv-muted">
            LIVV · Evolve with purpose
          </p>
        </section>
      </div>
    </main>
  );
}

function ToggleRow({
  icon,
  label,
  hint,
  value,
  onToggle,
  last,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
  value: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={value}
      className={
        "livv-press flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[color-mix(in_srgb,rgb(var(--livv-ink))_3%,transparent)] " +
        (last ? "" : "border-b border-livv-border")
      }
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-livv-border text-livv-muted">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold tracking-tight">{label}</span>
        <span className="mt-0.5 block text-[12px] text-livv-muted">{hint}</span>
      </span>
      <span
        aria-hidden
        className={
          "relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors " +
          (value ? "bg-livv-accent" : "bg-[color-mix(in_srgb,rgb(var(--livv-ink))_12%,transparent)]")
        }
      >
        <span
          className={
            "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform " +
            (value ? "translate-x-5" : "translate-x-0")
          }
        />
      </span>
    </button>
  );
}

function ActionRow({
  icon,
  label,
  hint,
  onClick,
  disabled,
  danger,
  last,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        "livv-press flex w-full items-center gap-3 px-5 py-4 text-left transition disabled:opacity-50 hover:bg-[color-mix(in_srgb,rgb(var(--livv-ink))_3%,transparent)] " +
        (last ? "" : "border-b border-livv-border")
      }
    >
      <span
        className={
          "grid h-9 w-9 place-items-center rounded-xl border border-livv-border " +
          (danger ? "text-red-400" : "text-livv-muted")
        }
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={
            "block text-[15px] font-semibold tracking-tight " + (danger ? "text-red-400" : "")
          }
        >
          {label}
        </span>
        <span className="mt-0.5 block text-[12px] text-livv-muted">{hint}</span>
      </span>
      {!danger ? <ChevronRight size={16} strokeWidth={1.8} className="shrink-0 text-livv-muted" /> : null}
    </button>
  );
}
