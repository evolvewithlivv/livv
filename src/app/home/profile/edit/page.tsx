"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import {
  fileToPhoto,
  loadIdentity,
  patchIdentity,
  type Identity,
} from "@/lib/identity";
import {
  changeUsernameOnServer,
  checkUsernameAvailability,
  normalizeUsername,
} from "@/lib/auth";
import { feedback } from "@/lib/sensory";
import "../profile-signal.css";
import "./edit.css";

export default function EditProfilePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
   const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [usernameState, setUsernameState] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const locked = false;
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = loadIdentity();
    setMe(id);
    setDisplayName(id.displayName || "");
    setUsername((id.username || "").replace(/^@/, ""));
    setUsernameState("idle");
    setBio(id.bio || "");
    setPhoto(id.photo);
  }, []);

  if (!me) return <main className="you" aria-hidden />;

  const initial = ((displayName || "L")[0] || "L").toUpperCase();

  async function onPick(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    try {
      const data = await fileToPhoto(file);
      setPhoto(data);
      setError("");
    } catch {
      setError("Could not process that image.");
    }
  }

  async function onSave() {
    setError("");
    setStatus("");
    const name = displayName.trim();
    if (!name) {
      setError("Display name is required.");
      return;
    }
    const nextUser = normalizeUsername(username.trim());
    if (nextUser && nextUser.length < 3) {
      setError("Username needs at least 3 characters.");
      return;
    }
    if (nextUser.length > 24) {
      setError("Username must be 24 characters or fewer.");
      return;
    }
    const currentMe = me;
    if (!currentMe) return;
    setSaving(true);
    try {
      if (nextUser && nextUser !== normalizeUsername(currentMe.username)) {
        const available = await checkUsernameAvailability(nextUser);
        if (!available) {
          setUsernameState("taken");
          throw new Error("That username is already taken.");
        }
      }
      if (nextUser && nextUser !== normalizeUsername(currentMe.username)) {
        await changeUsernameOnServer(nextUser);
      }
      patchIdentity({
        displayName: name,
        bio: bio.trim().slice(0, 160),
        photo,
      });
      feedback("complete");
      setStatus("Saved.");
      setMe(loadIdentity());
      setUsername(loadIdentity().username);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="you" aria-label="Edit profile">
      <div className="you-inner">
        <header className="ed-top">
          <Link href="/home/profile" className="ed-back">
            <ChevronLeft size={16} /> You
          </Link>
          <button
            type="button"
            className="ed-save"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </header>

        <h1 className="ed-title">Edit profile</h1>

        <section className="ed-photo">
          <button
            type="button"
            className="ed-photo-btn"
            onClick={() => fileRef.current?.click()}
            aria-label="Change profile photo"
          >
            <span className="you-photo-wrap" style={{ width: "5rem", height: "5rem" }}>
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" />
              ) : (
                <span className="you-photo-fallback">{initial}</span>
              )}
            </span>
            <span className="ed-photo-label">Change photo</span>
          </button>
          {photo ? (
            <button
              type="button"
              className="ed-remove"
              onClick={() => setPhoto(null)}
            >
              Remove
            </button>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onPick(e.target.files?.[0] || null)}
          />
        </section>

        <section className="ed-fields">
          <label className="ed-field">
            <span>Name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={48}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>
          <label className="ed-field">
            <span>Username</span>
            <input
              value={username}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9_@]/g, "");
                const clean = value.replace(/^@+/, "@");
                setUsername(clean);
                setUsernameState("idle");
                if (normalizeUsername(clean).length >= 3) {
                  setUsernameState("checking");
                  window.clearTimeout((window as Window & { __livvUsernameTimer?: number }).__livvUsernameTimer);
                  (window as Window & { __livvUsernameTimer?: number }).__livvUsernameTimer = window.setTimeout(async () => {
                    try {
                      const normalized = normalizeUsername(clean);
                      setUsernameState((await checkUsernameAvailability(normalized)) ? "available" : "taken");
                    } catch {
                      setUsernameState("idle");
                    }
                  }, 450);
                }
              }}
              maxLength={25}
              placeholder="username"
              disabled={locked}
              autoCapitalize="none"
              autoCorrect="off"
            />
            <em className="ed-hint">3–24 characters · letters, numbers, and underscores · once every 30 days</em>
            {usernameState === "checking" ? <span className="ed-username-state">Checking availability…</span> : null}
            {usernameState === "available" ? <span className="ed-username-state is-good">Username available</span> : null}
            {usernameState === "taken" ? <span className="ed-username-state is-bad">Username already taken</span> : null}
          </label>
          <label className="ed-field">
            <span>Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              placeholder="A short line about you"
            />
            <em className="ed-hint">{bio.length}/160</em>
          </label>
        </section>

        {error ? <p className="ed-error">{error}</p> : null}
        {status ? <p className="ed-status">{status}</p> : null}
      </div>
    </main>
  );
}
