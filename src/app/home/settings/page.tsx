"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import "./settings.css";

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
    window.addEventListener("livv-identity", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("livv-identity", sync);
    };
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

  const name = me?.displayName || me?.username || "Account";
  const handle = me?.username ? `@${me.username.replace(/^@/, "")}` : null;

  return (
    <main className="st" aria-label="Settings">
      <div className="st-inner">
        <Link href="/home/profile" className="st-back">
          <ChevronLeft size={14} /> You
        </Link>
        <h1 className="st-title">Settings</h1>

        <section className="st-group">
          <p className="st-group-k">Account</p>
          <div className="st-list">
            <Link href="/home/profile/edit" className="st-row">
              <div className="st-row-main">
                <p className="st-row-t">Edit profile</p>
                <p className="st-row-s">
                  {name}
                  {handle ? ` · ${handle}` : ""}
                  {accountEmail ? ` · ${accountEmail}` : ""}
                </p>
              </div>
              <ChevronRight size={16} className="st-chev" />
            </Link>
          </div>
        </section>

        <section className="st-group">
          <p className="st-group-k">Appearance</p>
          <div className="st-list">
            {LOOK_OPTIONS.map((opt) => {
              const active = me ? isLookActive(me, opt) : false;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className="st-row"
                  onClick={() => setLook(opt)}
                >
                  <div className="st-row-main">
                    <p className="st-row-t">{opt.label}</p>
                    <p className="st-row-s">{opt.hint}</p>
                  </div>
                  <span className={"st-row-v" + (active ? " on" : "")}>
                    {active ? "On" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="st-group">
          <p className="st-group-k">Preferences</p>
          <div className="st-list">
            <button type="button" className="st-row" onClick={() => togglePref("sound")}>
              <div className="st-row-main">
                <p className="st-row-t">Sound</p>
                <p className="st-row-s">Feedback tones</p>
              </div>
              <span className={"st-row-v" + (prefs.sound ? " on" : "")}>
                {prefs.sound ? "On" : "Off"}
              </span>
            </button>
            <button type="button" className="st-row" onClick={() => togglePref("haptics")}>
              <div className="st-row-main">
                <p className="st-row-t">Haptics</p>
                <p className="st-row-s">Vibration feedback</p>
              </div>
              <span className={"st-row-v" + (prefs.haptics ? " on" : "")}>
                {prefs.haptics ? "On" : "Off"}
              </span>
            </button>
          </div>
        </section>

        <section className="st-group">
          <p className="st-group-k">Data</p>
          <div className="st-list">
            <button type="button" className="st-row" onClick={onExport} disabled={busy}>
              <div className="st-row-main">
                <p className="st-row-t">Export backup</p>
                <p className="st-row-s">{keyCount} keys on this device</p>
              </div>
              <ChevronRight size={16} className="st-chev" />
            </button>
            <button
              type="button"
              className="st-row"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              <div className="st-row-main">
                <p className="st-row-t">Import backup</p>
                <p className="st-row-s">Restore from a LIVV file</p>
              </div>
              <ChevronRight size={16} className="st-chev" />
            </button>
            <button type="button" className="st-row st-danger" onClick={onDeleteAll}>
              <div className="st-row-main">
                <p className="st-row-t">
                  {confirmDelete ? "Tap again to confirm" : "Clear local data"}
                </p>
                <p className="st-row-s">Removes progress stored on this device</p>
              </div>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImport(f);
              e.target.value = "";
            }}
          />
        </section>

        <section className="st-group">
          <p className="st-group-k">Session</p>
          <div className="st-list">
            <button type="button" className="st-row st-danger" onClick={onSignOut}>
              <div className="st-row-main">
                <p className="st-row-t">Sign out</p>
                <p className="st-row-s">End this session on the device</p>
              </div>
            </button>
          </div>
        </section>

        {status ? <p className="st-msg">{status}</p> : null}
        {error ? <p className="st-err">{error}</p> : null}
        <p className="st-foot">LIVV · V1</p>
      </div>
    </main>
  );
}
