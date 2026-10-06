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
  getCurrentAccount,
  isUsernameAvailable,
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
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = loadIdentity();
    setMe(id);
    setDisplayName(id.displayName || "");
    setUsername((id.username || "").replace(/^@/, ""));
    setBio(id.bio || "");
    setPhoto(id.photo);
    const acc = getCurrentAccount();
    setLocked(Boolean(acc?.usernameLocked));
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

  function onSave() {
    setError("");
    setStatus("");
    const name = displayName.trim();
    if (!name) {
      setError("Display name is required.");
      return;
    }
    let nextUser = username.trim();
    if (!locked) {
      nextUser = normalizeUsername(nextUser);
      if (nextUser && nextUser.length < 3) {
        setError("Username needs at least 3 characters.");
        return;
      }
      const acc = getCurrentAccount();
      if (nextUser && !isUsernameAvailable(nextUser, acc?.id)) {
        setError("That username is taken.");
        return;
      }
    }
    setSaving(true);
    try {
      patchIdentity({
        displayName: name,
        username: locked ? me!.username : nextUser || me!.username,
        bio: bio.trim().slice(0, 160),
        photo,
      });
      feedback("complete");
      setStatus("Saved.");
      setMe(loadIdentity());
    } catch {
      setError("Could not save. Try again.");
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
              onChange={(e) => setUsername(e.target.value)}
              maxLength={24}
              placeholder="username"
              disabled={locked}
              autoCapitalize="none"
              autoCorrect="off"
            />
            {locked ? (
              <em className="ed-hint">Username is locked to this account.</em>
            ) : null}
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
