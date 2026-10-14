"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Copy, Plus, Users } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import "./crew-workspace.css";

type Crew = { id: string; name: string; description: string | null; role: string; joined_at: string };
type Challenge = { id: string; title: string; description: string | null; challenge_type: string; target_count: number; starts_at: string; ends_at: string; status: string };
type Progress = { challenge_id: string; enrolled: boolean; accepted_count: number; target_count: number; completed: boolean };

async function api(path: string, init?: RequestInit) {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("LIVV secure sign-in is not configured on this device.");
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Your secure session is unavailable. Sign out and back in, then try again.");
  const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init?.headers || {}) } });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || "Something went wrong. Try again.");
  return payload;
}

function extractToken(raw: string) {
  const v = raw.trim();
  if (!v) return "";
  try { if (v.startsWith("http")) return new URL(v).searchParams.get("token") || ""; } catch {}
  return v;
}

const field = "w-full rounded-xl border border-[var(--livv-border,#333)] bg-transparent px-4 py-3 text-base outline-none";
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-50";

export function CrewWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selected, setSelected] = useState<Crew | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [name, setName] = useState("");
  const [challengeTitle, setChallengeTitle] = useState("");
  const [target, setTarget] = useState("7");
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [joinHandled, setJoinHandled] = useState(false);

  const loadCrews = useCallback(async () => { setCrews((await api("/api/crews")).crews || []); }, []);
  const loadChallenges = useCallback(async (crew: Crew) => {
    const r = await api(`/api/crews/${crew.id}/challenges`);
    setChallenges(r.challenges || []); setProgress(r.progress || []);
  }, []);

  useEffect(() => { loadCrews().catch(e => setError(e.message)); }, [loadCrews]);
  useEffect(() => { if (selected) loadChallenges(selected).catch(e => setError(e.message)); }, [selected, loadChallenges]);
  useEffect(() => {
    if (!tokenFromUrl || joinHandled) return;
    let c = false;
    (async () => {
      setBusy(true); setError(""); setMessage("");
      try {
        const token = extractToken(tokenFromUrl);
        if (!token) throw new Error("This invitation link is invalid.");
        await api("/api/crews/join", { method: "POST", body: JSON.stringify({ token }) });
        if (c) return;
        await loadCrews(); setMessage("You joined the Crew."); setJoinHandled(true); router.replace("/home/crew");
      } catch (e) {
        if (c) return;
        setError(e instanceof Error ? e.message : "Could not join this Crew."); setJoinHandled(true); router.replace("/home/crew");
      } finally { if (!c) setBusy(false); }
    })();
    return () => { c = true; };
  }, [tokenFromUrl, joinHandled, loadCrews, router]);

  async function run(fn: () => Promise<void>) {
    setBusy(true); setError(""); setMessage("");
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  const canManage = selected && ["owner", "admin"].includes(selected.role);

  return (
    <section className="min-h-full px-5 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="crew-shell mx-auto w-full max-w-2xl">
        <Link href="/home/profile" className="mb-6 inline-flex items-center gap-2 text-sm opacity-65"><ArrowLeft size={17}/> You</Link>
        <div className="crew-masthead mb-8">
          <div className="crew-overline"><span className="crew-live-dot"/> YOUR CIRCLE</div>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-[2.35rem] font-semibold leading-none tracking-[-0.055em]">Crew<span className="crew-period">.</span></h1>
              <p className="mt-2 text-sm opacity-60">Private groups. Shared commitments. Participation is self-reported.</p>
            </div>
            <div className="crew-emblem"><Users size={22} strokeWidth={1.6}/></div>
          </div>
        </div>
        {error && <p role="alert" className="mb-4 rounded-xl border border-red-500/40 px-4 py-3 text-sm text-red-600">{error}</p>}
        {message && <p role="status" className="mb-4 rounded-xl border border-current/15 px-4 py-3 text-sm">{message}</p>}

        {selected ? (
          <section className="space-y-6">
            <button type="button" className="text-sm opacity-65" onClick={() => { setSelected(null); setInviteUrl(""); }}>← All Crews</button>
            <div className="border-b border-current/15 pb-5">
              <p className="text-[10px] uppercase tracking-[0.18em] opacity-50">{selected.role}</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">{selected.name}</h2>
            </div>
            {canManage && (
              <div className="crew-challenge">
                <h3 className="font-semibold">Invite</h3>
                <p className="text-sm opacity-65">Private link for people you trust.</p>
                <button type="button" className={button + " mt-3"} disabled={busy} onClick={() => run(async () => {
                  const r = await api(`/api/crews/${selected.id}/invitations`, { method: "POST", body: JSON.stringify({ maxUses: 10, expiresInHours: 168 }) });
                  if (!r.inviteUrl) throw new Error("Invite was created but no link was returned.");
                  setInviteUrl(r.inviteUrl); setMessage("Invite link ready.");
                })}>Create invite link</button>
                {inviteUrl && (
                  <div className="mt-3 space-y-2">
                    <input readOnly value={inviteUrl} className={field} aria-label="Invite link"/>
                    <button type="button" className={button} disabled={busy} onClick={() => run(async () => { await navigator.clipboard.writeText(inviteUrl); setMessage("Invite link copied."); })}><Copy size={16}/> Copy</button>
                  </div>
                )}
              </div>
            )}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Challenges</h3>
              <p className="text-sm opacity-60">Your progress is self-reported.</p>
              {challenges.length === 0 ? <p className="text-sm opacity-60">No challenges yet.</p> : challenges.map(c => {
                const p = progress.find(x => x.challenge_id === c.id);
                return (
                  <article key={c.id} className="space-y-3 rounded-xl border border-current/12 p-4">
                    <div className="flex justify-between gap-3"><h4 className="font-semibold">{c.title}</h4><span className={`crew-status crew-status-${c.status}`}>{c.status}</span></div>
                    <p className="crew-challenge-meta">{c.target_count} days · ends {new Date(c.ends_at).toLocaleDateString(undefined,{month:"short",day:"numeric"})}</p>
                    {p?.enrolled && (
                      <div className="crew-progress-wrap">
                        <div className="flex justify-between text-xs"><span className="opacity-65">Self-reported</span><strong>{p.accepted_count}/{p.target_count}</strong></div>
                        <div className="crew-progress-track"><span style={{width:`${Math.min(100,Math.round((p.accepted_count/Math.max(1,p.target_count))*100))}%`}}/></div>
                      </div>
                    )}
                    {c.status === "active" && !p?.enrolled && <button type="button" className={button} disabled={busy} onClick={() => run(async () => { await api(`/api/crews/challenges/${c.id}/enroll`,{method:"POST",body:"{}"}); await loadChallenges(selected); setMessage("Enrolled."); })}>Join challenge</button>}
                    {p?.enrolled && c.status === "active" && <button type="button" className={button} disabled={busy} onClick={() => run(async () => { await api(`/api/crews/challenges/${c.id}/completions`,{method:"POST",body:JSON.stringify({activityKey:"daily_action",idempotencyKey:crypto.randomUUID()})}); await loadChallenges(selected); setMessage("Recorded as self-reported."); })}>Record participation</button>}
                    {canManage && c.status === "draft" && <button type="button" className={button} disabled={busy} onClick={() => run(async () => { await api(`/api/crews/${selected.id}/challenges`,{method:"PATCH",body:JSON.stringify({challengeId:c.id,action:"activate"})}); await loadChallenges(selected); setMessage("Activated."); })}>Activate</button>}
                  </article>
                );
              })}
            </section>
            {canManage && (
              <section className="border-t border-current/15 pt-5 space-y-3">
                <button type="button" className="flex w-full justify-between text-left" onClick={() => setShowChallengeForm(v => !v)}>
                  <span><span className="block font-semibold">Create a challenge</span><span className="mt-1 block text-sm opacity-60">Daily action days</span></span>
                  <Plus size={20}/>
                </button>
                {showChallengeForm && (
                  <div className="space-y-3">
                    <input className={field} value={challengeTitle} onChange={e => setChallengeTitle(e.target.value)} placeholder="Challenge name" maxLength={80}/>
                    <input className={field} type="number" min={1} max={100} value={target} onChange={e => setTarget(e.target.value)} placeholder="Target days"/>
                    <button type="button" className={button} disabled={busy || !challengeTitle.trim()} onClick={() => run(async () => {
                      await api(`/api/crews/${selected.id}/challenges`, { method: "POST", body: JSON.stringify({
                        title: challengeTitle.trim(), description: "", challengeType: "daily_action_days",
                        targetCount: Number(target) || 7,
                        startsAt: new Date(Date.now() + 120000).toISOString(),
                        endsAt: new Date(Date.now() + 10 * 86400000).toISOString(),
                      })});
                      await loadChallenges(selected); setChallengeTitle(""); setShowChallengeForm(false); setMessage("Draft created.");
                    })}>Create draft</button>
                  </div>
                )}
              </section>
            )}
          </section>
        ) : (
          <section className="space-y-6">
            <div><h2 className="text-xl font-semibold">Your Crews</h2><p className="mt-1 text-sm opacity-60">Small circles. Real commitments.</p></div>
            {crews.length ? (
              <div className="crew-list">
                {crews.map((c, i) => (
                  <button key={c.id} type="button" className="crew-list-item" onClick={() => { setSelected(c); setError(""); setMessage(""); }}>
                    <span className="crew-index">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1"><strong>{c.name}</strong><small>{c.description || "Shared commitment"}</small></span>
                    <span className="crew-role">{c.role}</span>
                    <ChevronRight size={17} className="opacity-45"/>
                  </button>
                ))}
              </div>
            ) : (
              <div className="crew-empty">
                <span className="crew-empty-mark"><Users size={22}/></span>
                <p className="crew-kicker mt-4">START SMALL</p>
                <h3 className="mt-2 text-lg font-semibold">Progress is better shared.</h3>
                <p className="mt-1 max-w-xs text-sm leading-6 opacity-60">Create a private Crew and invite someone you trust.</p>
              </div>
            )}
            <section className="border-t border-current/15 pt-5">
              <button type="button" className="flex w-full justify-between text-left" onClick={() => setShowCreate(v => !v)}>
                <span><span className="block font-semibold">Start a Crew</span><span className="mt-1 block text-sm opacity-60">Private. Free.</span></span>
                <Plus size={20}/>
              </button>
              {showCreate && (
                <form className="mt-4 space-y-3" onSubmit={e => { e.preventDefault(); void run(async () => {
                  const result = await api("/api/crews", { method: "POST", body: JSON.stringify({ name: name.trim(), description: "" }) });
                  setName(""); setShowCreate(false); await loadCrews(); setMessage("Crew created.");
                  if (result.crew) setSelected({ ...result.crew, role: "owner", joined_at: new Date().toISOString() });
                }); }}>
                  <input className={field} value={name} onChange={e => setName(e.target.value)} placeholder="Crew name" maxLength={40} required minLength={2}/>
                  <button type="submit" className={button} disabled={busy || name.trim().length < 2}>Create Crew</button>
                </form>
              )}
            </section>
            <section className="border-t border-current/15 pt-5">
              <h3 className="font-semibold">Have an invite?</h3>
              <p className="mt-1 text-sm opacity-60">Paste the link or token.</p>
              <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={e => { e.preventDefault(); void run(async () => {
                const token = extractToken(inviteToken);
                if (!token) throw new Error("That invite does not contain a valid token.");
                await api("/api/crews/join", { method: "POST", body: JSON.stringify({ token }) });
                setInviteToken(""); await loadCrews(); setMessage("You joined the Crew.");
              }); }}>
                <input className={field + " min-w-0 flex-1"} value={inviteToken} onChange={e => setInviteToken(e.target.value)} placeholder="Paste invite link" autoCapitalize="none"/>
                <button type="submit" className={button} disabled={busy || !inviteToken.trim()}>Join <ChevronRight size={16}/></button>
              </form>
            </section>
          </section>
        )}
      </div>
    </section>
  );
}
