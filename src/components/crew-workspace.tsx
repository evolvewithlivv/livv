"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Copy,
  Heart,
  Plus,
  Users,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CrewUpdate, CrewUpdateKind } from "@/lib/crew/types";
import "./crew-workspace.css";

type Crew = {
  id: string;
  name: string;
  description: string | null;
  role: string;
  joined_at: string;
};

type Member = {
  user_id: string;
  role: string;
  display_name: string;
  joined_at: string;
};

async function api(path: string, init?: RequestInit) {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("LIVV secure sign-in is not configured on this device.");
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Your secure session is unavailable. Sign out and back in, then try again.");
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || "Something went wrong. Try again.");
  return payload;
}

function extractToken(raw: string) {
  const v = raw.trim();
  if (!v) return "";
  try {
    if (v.startsWith("http")) return new URL(v).searchParams.get("token") || "";
  } catch {
    /* ignore */
  }
  return v;
}

function relativeTime(iso: string) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const KIND_LABEL: Record<CrewUpdateKind, string> = {
  growth: "Growth",
  goal: "Goal",
  support: "Needs support",
};

const PROMPTS: Record<CrewUpdateKind, string> = {
  growth: "What are you learning or working on?",
  goal: "What are you committing to?",
  support: "Where could you use encouragement?",
};

export function CrewWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [crews, setCrews] = useState<Crew[]>([]);
  const [selected, setSelected] = useState<Crew | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [updates, setUpdates] = useState<CrewUpdate[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [compose, setCompose] = useState("");
  const [kind, setKind] = useState<CrewUpdateKind>("growth");
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [joinHandled, setJoinHandled] = useState(false);

  const loadCrews = useCallback(async () => {
    const r = await api("/api/crews");
    setCrews(r.crews || []);
  }, []);

  const loadCrewDetail = useCallback(async (crew: Crew) => {
    const [mem, act] = await Promise.all([
      api(`/api/crews/${crew.id}/members`),
      api(`/api/crews/${crew.id}/updates`),
    ]);
    setMembers(mem.members || []);
    setUpdates(act.updates || []);
  }, []);

  useEffect(() => {
    loadCrews().catch((e) => setError(e.message));
  }, [loadCrews]);

  useEffect(() => {
    if (selected) {
      loadCrewDetail(selected).catch((e) => setError(e.message));
    } else {
      setMembers([]);
      setUpdates([]);
      setInviteUrl("");
      setShowInvite(false);
    }
  }, [selected, loadCrewDetail]);

  useEffect(() => {
    if (!tokenFromUrl || joinHandled) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      setError("");
      setMessage("");
      try {
        const token = extractToken(tokenFromUrl);
        if (!token) throw new Error("This invitation link is invalid.");
        await api("/api/crews/join", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        if (cancelled) return;
        await loadCrews();
        setMessage("You joined the Crew.");
        setJoinHandled(true);
        router.replace("/home/crew");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Could not join this Crew.");
        setJoinHandled(true);
        router.replace("/home/crew");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenFromUrl, joinHandled, loadCrews, router]);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const canManage = selected && ["owner", "admin"].includes(selected.role);

  return (
    <section className="crew" aria-label="Crew">
      <div className="crew-inner">
        <Link href="/home/profile" className="crew-back">
          <ArrowLeft size={17} strokeWidth={1.7} />
          You
        </Link>

        <header className="crew-mast">
          <p className="crew-k">Your circle</p>
          <h1 className="crew-title">
            Crew<span className="crew-dot">.</span>
          </h1>
          <p className="crew-sub">
            Grow together. Share what you’re learning. Support each other.
          </p>
        </header>

        {error ? (
          <p role="alert" className="crew-banner crew-banner-error">
            {error}
          </p>
        ) : null}
        {message ? (
          <p role="status" className="crew-banner">
            {message}
          </p>
        ) : null}

        {selected ? (
          <div className="crew-detail">
            <button
              type="button"
              className="crew-back-inline"
              onClick={() => {
                setSelected(null);
                setError("");
                setMessage("");
              }}
            >
              ← All Crews
            </button>

            <div className="crew-identity">
              <p className="crew-role-tag">{selected.role}</p>
              <h2 className="crew-name">{selected.name}</h2>
              {selected.description ? (
                <p className="crew-desc">{selected.description}</p>
              ) : null}
            </div>

            <section className="crew-section" aria-label="Members">
              <p className="crew-section-k">
                {members.length} {members.length === 1 ? "member" : "members"}
              </p>
              <div className="crew-members">
                {members.map((m) => (
                  <div key={m.user_id} className="crew-member">
                    <span className="crew-avatar" aria-hidden>
                      {(m.display_name || "M")[0]?.toUpperCase()}
                    </span>
                    <span className="crew-member-name">{m.display_name}</span>
                    {m.role !== "member" ? (
                      <span className="crew-member-role">{m.role}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            {canManage ? (
              <section className="crew-section" aria-label="Invite">
                <button
                  type="button"
                  className="crew-action-row"
                  onClick={() => setShowInvite((v) => !v)}
                >
                  <span>
                    <span className="crew-action-t">Invite someone</span>
                    <span className="crew-action-s">Private link for people you trust</span>
                  </span>
                  <Plus size={18} />
                </button>
                {showInvite ? (
                  <div className="crew-invite-panel">
                    <button
                      type="button"
                      className="crew-btn"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          const r = await api(`/api/crews/${selected.id}/invitations`, {
                            method: "POST",
                            body: JSON.stringify({ maxUses: 10, expiresInHours: 168 }),
                          });
                          if (!r.inviteUrl) throw new Error("Invite was created but no link was returned.");
                          setInviteUrl(r.inviteUrl);
                          setMessage("Invite link ready.");
                        })
                      }
                    >
                      Create invite link
                    </button>
                    {inviteUrl ? (
                      <div className="crew-invite-result">
                        <input
                          readOnly
                          value={inviteUrl}
                          className="crew-field"
                          aria-label="Invite link"
                        />
                        <button
                          type="button"
                          className="crew-btn crew-btn-secondary"
                          disabled={busy}
                          onClick={() =>
                            run(async () => {
                              await navigator.clipboard.writeText(inviteUrl);
                              setMessage("Invite link copied.");
                            })
                          }
                        >
                          <Copy size={15} />
                          Copy
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>
            ) : null}

            <section className="crew-section" aria-label="Share">
              <p className="crew-section-k">Share with your Crew</p>
              <div className="crew-kind-row" role="group" aria-label="Update type">
                {(["growth", "goal", "support"] as CrewUpdateKind[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={"crew-kind" + (kind === k ? " is-active" : "")}
                    onClick={() => setKind(k)}
                    aria-pressed={kind === k}
                  >
                    {KIND_LABEL[k]}
                  </button>
                ))}
              </div>
              <textarea
                className="crew-compose"
                value={compose}
                onChange={(e) => setCompose(e.target.value)}
                placeholder={PROMPTS[kind]}
                maxLength={800}
                rows={3}
                aria-label="Share an update"
              />
              <div className="crew-compose-row">
                <span className="crew-hint">{compose.trim().length}/800</span>
                <button
                  type="button"
                  className="crew-btn"
                  disabled={busy || compose.trim().length < 1}
                  onClick={() =>
                    run(async () => {
                      const r = await api(`/api/crews/${selected.id}/updates`, {
                        method: "POST",
                        body: JSON.stringify({ body: compose.trim(), kind }),
                      });
                      if (r.update) setUpdates((prev) => [r.update, ...prev]);
                      setCompose("");
                      setMessage("Shared with your Crew.");
                    })
                  }
                >
                  Share
                </button>
              </div>
            </section>

            <section className="crew-section" aria-label="Activity">
              <p className="crew-section-k">What’s happening</p>
              {updates.length === 0 ? (
                <div className="crew-empty-feed">
                  <p className="crew-empty-feed-t">No updates yet</p>
                  <p className="crew-empty-feed-s">
                    Be the first to share what you’re working on or ask for support.
                  </p>
                </div>
              ) : (
                <ul className="crew-feed">
                  {updates.map((u) => (
                    <li key={u.id} className="crew-post">
                      <div className="crew-post-head">
                        <span className="crew-avatar crew-avatar-sm" aria-hidden>
                          {(u.author_display_name || "M")[0]?.toUpperCase()}
                        </span>
                        <div className="crew-post-meta">
                          <strong>{u.author_display_name}</strong>
                          <span>
                            {KIND_LABEL[u.kind as CrewUpdateKind] || "Growth"} ·{" "}
                            {relativeTime(u.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className="crew-post-body">{u.body}</p>
                      <button
                        type="button"
                        className={
                          "crew-encourage" + (u.encouraged_by_me ? " is-on" : "")
                        }
                        disabled={busy}
                        aria-pressed={u.encouraged_by_me}
                        onClick={() =>
                          run(async () => {
                            const r = await api(
                              `/api/crews/updates/${u.id}/encourage`,
                              { method: "POST", body: "{}" },
                            );
                            setUpdates((prev) =>
                              prev.map((item) =>
                                item.id === u.id
                                  ? {
                                      ...item,
                                      encouraged_by_me: Boolean(r.encouraged),
                                      encouragement_count:
                                        typeof r.encouragement_count === "number"
                                          ? r.encouragement_count
                                          : item.encouragement_count,
                                    }
                                  : item,
                              ),
                            );
                          })
                        }
                      >
                        <Heart
                          size={15}
                          strokeWidth={1.8}
                          fill={u.encouraged_by_me ? "currentColor" : "none"}
                        />
                        {u.encouragement_count > 0
                          ? `${u.encouragement_count} encourage${u.encouragement_count === 1 ? "" : "s"}`
                          : "Encourage"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : (
          <div className="crew-home">
            {crews.length === 0 ? (
              <div className="crew-empty">
                <span className="crew-empty-mark" aria-hidden>
                  <Users size={22} strokeWidth={1.6} />
                </span>
                <p className="crew-empty-k">Start small</p>
                <h2 className="crew-empty-t">Progress is better shared</h2>
                <p className="crew-empty-s">
                  Create a private Crew with people you trust. Share what you’re
                  learning, set goals, and encourage each other.
                </p>
              </div>
            ) : (
              <section className="crew-section" aria-label="Your Crews">
                <p className="crew-section-k">Your Crews</p>
                <div className="crew-list">
                  {crews.map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      className="crew-list-item"
                      onClick={() => {
                        setSelected(c);
                        setError("");
                        setMessage("");
                      }}
                    >
                      <span className="crew-index">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="crew-list-main">
                        <strong>{c.name}</strong>
                        <small>{c.description || "Shared growth"}</small>
                      </span>
                      <span className="crew-list-role">{c.role}</span>
                      <ChevronRight size={17} className="crew-chev" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="crew-section" aria-label="Start a Crew">
              <button
                type="button"
                className="crew-action-row"
                onClick={() => setShowCreate((v) => !v)}
              >
                <span>
                  <span className="crew-action-t">Start a Crew</span>
                  <span className="crew-action-s">Private. Free. Yours to lead.</span>
                </span>
                <Plus size={18} />
              </button>
              {showCreate ? (
                <form
                  className="crew-create-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void run(async () => {
                      const result = await api("/api/crews", {
                        method: "POST",
                        body: JSON.stringify({
                          name: name.trim(),
                          description: description.trim(),
                        }),
                      });
                      setName("");
                      setDescription("");
                      setShowCreate(false);
                      await loadCrews();
                      setMessage("Crew created.");
                      if (result.crew) {
                        setSelected({
                          ...result.crew,
                          role: "owner",
                          joined_at: new Date().toISOString(),
                        });
                      }
                    });
                  }}
                >
                  <input
                    className="crew-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Crew name"
                    maxLength={40}
                    required
                    minLength={2}
                    aria-label="Crew name"
                  />
                  <input
                    className="crew-field"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional — what you’re growing toward"
                    maxLength={240}
                    aria-label="Description"
                  />
                  <button
                    type="submit"
                    className="crew-btn"
                    disabled={busy || name.trim().length < 2}
                  >
                    Create Crew
                  </button>
                </form>
              ) : null}
            </section>

            <section className="crew-section" aria-label="Join with invite">
              <p className="crew-section-k">Have an invite?</p>
              <p className="crew-hint-block">Paste the link or token from someone you trust.</p>
              <form
                className="crew-join-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(async () => {
                    const token = extractToken(inviteToken);
                    if (!token) throw new Error("That invite does not contain a valid token.");
                    await api("/api/crews/join", {
                      method: "POST",
                      body: JSON.stringify({ token }),
                    });
                    setInviteToken("");
                    await loadCrews();
                    setMessage("You joined the Crew.");
                  });
                }}
              >
                <input
                  className="crew-field"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  placeholder="Paste invite link"
                  autoCapitalize="none"
                  autoCorrect="off"
                  aria-label="Invite link or token"
                />
                <button
                  type="submit"
                  className="crew-btn"
                  disabled={busy || !inviteToken.trim()}
                >
                  Join
                  <ChevronRight size={16} />
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </section>
  );
}
