"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  { id: "device", label: "Device", hint: "Apple appearance", appearance: "system", theme: "daylight" },
  { id: "daylight", label: "Daylight", hint: "LIVV light", appearance: "light", theme: "daylight" },
  { id: "midnight", label: "Midnight", hint: "LIVV dark", appearance: "dark", theme: "midnight" },
];

function isLookActive(me: Identity, opt: LookOption): boolean {
  if (opt.id === "device") return me.appearance === "system";
  if (opt.id === "daylight") return me.appearance === "light" && me.theme === "daylight";
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
    setKeyCount(countManagedKeysPresent());
    setMe(loadIdentity());
    setPrefs(loadPrefs());
    setStatus("Local data cleared.");
    setError("");
    feedback("complete");
  };

  const onSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
      window.location.href = "/auth";
    } catch {
      setError("Could not sign out.");
      setBusy(false);
    }
  };

  if (!me) return <main className="st" aria-hidden />;

  const accountLine = [
    me.displayName || null,
    me.username ? (me.username.startsWith("@") ? me.username : `@${me.username}`) : null,
    accountEmail,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="st" aria-label="Settings">
      <div className="st-inner">
        <Link href="/home/profile" className="st-back">
          You
        </Link>
        <div className="st-heading"><div><p className="st-kicker">ACCOUNT / CONTROL</p><h1 className="st-title">Settings</h1></div></div>

        <section className="st-group st-account">
          <p className="st-group-k">Account</p>
          <div className="st-list">
            <Link href="/home/profile/edit" className="st-row">
              <div className="st-row-main">
                <p className="st-row-t">Edit profile</p>
                <p className="st-row-s">{accountLine || "Name, username, photo"}</p>
              </div>
              <span className="st-chev" aria-hidden>
                ›
              </span>
            </Link>
          </div>
        </section>

        <section className="st-group st-appearance">
          <p className="st-group-k">Appearance</p>
          <div className="st-list" role="radiogroup" aria-label="Appearance">
            {LOOK_OPTIONS.map((opt) => {
              const active = isLookActive(me, opt);
              return (
                <button
                  key={opt.id}
                  type="button"
                  className="st-row"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setLook(opt)}
                >
                  <div className="st-row-main">
                    <p className="st-row-t">{opt.label}</p>
                    <p className="st-row-s">{opt.hint}</p>
                  </div>
                  <span className={"st-check" + (active ? " on" : "")} aria-hidden>
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="st-group st-preferences">
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

          </div>
        </section>

        <section className="st-group st-data">
          <p className="st-group-k">Data</p>
          <div className="st-list">
            <button type="button" className="st-row" onClick={onExport} disabled={busy}>
              <div className="st-row-main">
                <p className="st-row-t">Export backup</p>
                <p className="st-row-s">{keyCount} keys on this device</p>
              </div>
              <span className="st-chev" aria-hidden>
                ›
              </span>
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
              <span className="st-chev" aria-hidden>
                ›
              </span>
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

        <section className="st-group st-session">
          <p className="st-group-k">Session</p>
          <div className="st-list">
            <button type="button" className="st-row st-danger" onClick={onSignOut} disabled={busy}>
              <div className="st-row-main">
                <p className="st-row-t">Sign out</p>
                <p className="st-row-s">End this session on the device</p>
              </div>
            </button>
          </div>
        </section>

        {status ? <p className="st-msg">{status}</p> : null}
        {error ? <p className="st-err">{error}</p> : null}

        <p className="st-foot">LIVV · CONTROL YOUR EXPERIENCE</p>
      </div>
    </main>
  );
}
