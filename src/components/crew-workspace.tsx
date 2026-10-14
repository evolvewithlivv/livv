"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Plus, Copy, RefreshCw, ShieldCheck, ChevronRight, Link2, CheckCircle2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Crew = { id: string; name: string; description: string | null; role: string; joined_at: string };
type Challenge = { id: string; title: string; description: string | null; challenge_type: string; target_count: number; starts_at: string; ends_at: string; status: string };
type Progress = { challenge_id: string; enrolled: boolean; accepted_count: number; target_count: number; completed: boolean };

async function api(path: string, init?: RequestInit) {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("LIVV secure sign-in is not configured on this device.");
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Your secure session is unavailable. Sign out and back in, then try again.");
  const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init?.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Something went wrong. Try again.");
  return payload;
}

const field = "w-full rounded-xl border border-[var(--livv-border,#333)] bg-transparent px-4 py-3 text-base outline-none";
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50";

export function CrewWorkspace({ embedded = false }: { embedded?: boolean }) {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selected, setSelected] = useState<Crew | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeType, setChallengeType] = useState("daily_action_days");
  const [target, setTarget] = useState("7");
  const [start, setStart] = useState(() => new Date(Date.now() + 5 * 60000).toISOString().slice(0,16));
  const [end, setEnd] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().slice(0,16));
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [members, setMembers] = useState<{user_id:string;display_name:string;role:string}[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadCrews = useCallback(async () => {
    const result = await api("/api/crews");
    setCrews(result.crews || []);
  }, []);

  const loadChallenges = useCallback(async (crew: Crew) => {
    const [result, roster] = await Promise.all([api(`/api/crews/${crew.id}/challenges`), api(`/api/crews/${crew.id}/members`)]);
    setChallenges(result.challenges || []);
    setProgress(result.progress || []);
    setMembers(roster.members || []);
  }, []);

  useEffect(() => { loadCrews().catch(e => setError(e.message)); }, [loadCrews]);
  useEffect(() => { if (selected) loadChallenges(selected).catch(e => setError(e.message)); }, [selected, loadChallenges]);

  async function run(action: () => Promise<void>) {
    setBusy(true); setError(""); setMessage("");
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  return <section className={embedded ? "mt-9 border-t border-current/15 pt-7" : "min-h-full px-5 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))]"}>
    <div className="mx-auto w-full max-w-2xl">
      {!embedded && <Link href="/home" className="mb-7 inline-flex items-center gap-2 text-sm opacity-70"><ArrowLeft size={17}/> Home</Link>}
      <div className={`mb-6 flex items-start justify-between gap-4 ${embedded ? "items-center" : ""}`}>
        <div>{!embedded && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] opacity-55">Evolve With LIVV</p>}<h1 className={embedded ? "text-2xl font-semibold tracking-tight" : "text-4xl font-semibold tracking-tight"}>{embedded ? "Crew" : "Your circle, built with intention."}</h1><p className="mt-2 max-w-md text-sm leading-6 opacity-65">{embedded ? "People who show up. Progress you can share." : "Build a small circle that keeps its word."}</p></div>
        <div className="mt-1 rounded-full border border-current/15 p-3 opacity-80"><Users size={22}/></div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-500/40 px-4 py-3 text-sm text-red-600">{error}</p>}
      {message && <p role="status" className="mb-4 rounded-xl border border-current/15 px-4 py-3 text-sm">{message}</p>}

      {selected ? <section className="space-y-6">
        <button className="text-sm opacity-65" onClick={() => { setSelected(null); setInviteUrl(""); }}>← All Crews</button>
        <div className="border-b border-current/15 pb-5"><p className="text-xs uppercase tracking-widest opacity-50">{selected.role} · {members.length || 1} {members.length === 1 ? "member" : "members"}</p><h3 className="mt-1 text-2xl font-semibold tracking-tight">{selected.name}</h3>{selected.description && <p className="mt-2 text-sm opacity-65">{selected.description}</p>}<div className="mt-4 flex flex-wrap gap-2">{members.slice(0,6).map((m,i)=><span key={m.user_id} title={m.display_name} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-current/15 text-xs font-semibold">{(m.display_name || "M").trim().charAt(0).toUpperCase()}</span>)}{members.length > 6 && <span className="inline-flex h-9 items-center rounded-full border border-current/15 px-3 text-xs opacity-65">+{members.length-6}</span>}</div></div>
        {["owner","admin"].includes(selected.role) && <div className="space-y-3 rounded-2xl border border-current/15 p-4">
          <h3 className="font-semibold">Invite your people</h3><p className="text-sm opacity-65">Create a private invite link for people you trust.</p>
          <button className={button} disabled={busy} onClick={() => run(async () => { const r = await api(`/api/crews/${selected.id}/invitations`, { method:"POST", body:JSON.stringify({maxUses:10,expiresInHours:168}) }); const url = r.inviteUrl || r.invitation?.inviteUrl; if (!url) throw new Error("Invite was created but no link was returned."); setInviteUrl(url); setMessage("Invite link created."); })}>Create invite link</button>
          {inviteUrl && <div className="space-y-2"><input readOnly value={inviteUrl} className={field}/><button className={button} onClick={() => run(async () => { await navigator.clipboard.writeText(inviteUrl); setMessage("Invite link copied."); })}><Copy size={16}/> Copy link</button></div>}
        </div>}
        <section className="space-y-4">
          <div><h3 className="text-xl font-semibold">Challenges</h3><p className="mt-1 text-sm opacity-60">Shared goals. Progress is recorded by LIVV and labeled honestly.</p></div>
          {challenges.length === 0 ? <p className="rounded-2xl border border-dashed border-current/20 p-5 text-sm opacity-60">No challenges yet. Create the first one below.</p> : challenges.map(c => { const p = progress.find(x => x.challenge_id === c.id); return <article key={c.id} className="space-y-3 rounded-2xl border border-current/15 p-4"><div className="flex items-start justify-between gap-3"><div><h4 className="font-semibold">{c.title}</h4>{c.description && <p className="mt-1 text-sm opacity-65">{c.description}</p>}</div><span className="rounded-full border border-current/15 px-2.5 py-1 text-xs">{c.status}</span></div><p className="text-sm opacity-60">Target: {c.target_count} {c.challenge_type === "daily_action_days" ? "days" : "sessions"} · Ends {new Date(c.ends_at).toLocaleDateString()}</p>{p && <p className="text-sm">{p.enrolled ? `${p.accepted_count} / ${p.target_count} recorded` : "Not enrolled yet"}</p>}{c.status === "active" && !p?.enrolled && <button className={button} disabled={busy} onClick={() => run(async () => { await api(`/api/crews/challenges/${c.id}/enroll`,{method:"POST",body:"{}"}); await loadChallenges(selected); setMessage("You’re enrolled."); })}>Join challenge</button>}{p?.enrolled && c.status === "active" && <button className={button} disabled={busy} onClick={() => run(async () => { const keys:Record<string,string>={daily_action_days:"daily_action",workout_sessions:"workout",learning_sessions:"learning",custom_checkin:"checkin"}; await api(`/api/crews/challenges/${c.id}/completions`,{method:"POST",body:JSON.stringify({activityKey:keys[c.challenge_type] || "checkin",idempotencyKey:crypto.randomUUID()})}); await loadChallenges(selected); setMessage("Progress recorded as self-reported."); })}>Record progress</button>}{["owner","admin"].includes(selected.role) && c.status === "draft" && <button className={button} disabled={busy} onClick={() => run(async () => { await api(`/api/crews/${selected.id}/challenges`,{method:"PATCH",body:JSON.stringify({challengeId:c.id,action:"activate"})}); await loadChallenges(selected); setMessage("Challenge activated."); })}>Activate challenge</button>}</article>; })}
        </section>
        {["owner","admin"].includes(selected.role) && <section className="space-y-4 border-t border-current/15 pt-5"><button className="flex w-full items-center justify-between text-left" onClick={() => setShowChallengeForm(v=>!v)}><span><span className="block font-semibold">Create a challenge</span><span className="mt-1 block text-sm opacity-60">Set a shared target and timeline</span></span><Plus size={20} className={showChallengeForm ? "rotate-45 transition-transform" : "transition-transform"}/></button>{showChallengeForm && <div className="space-y-4"><input className={field} value={challengeTitle} onChange={e=>setChallengeTitle(e.target.value)} placeholder="Challenge name" maxLength={80}/><textarea className={field} value={challengeDescription} onChange={e=>setChallengeDescription(e.target.value)} placeholder="What are you committing to?" maxLength={500} rows={3}/><label className="block text-sm opacity-70">Type<select className={field+" mt-1"} value={challengeType} onChange={e=>setChallengeType(e.target.value)}><option value="daily_action_days">Daily action days</option><option value="workout_sessions">Workout sessions</option><option value="learning_sessions">Learning sessions</option><option value="custom_checkin">Custom check-ins</option></select></label><label className="block text-sm opacity-70">Target<input className={field+" mt-1"} type="number" min="1" max="100" value={target} onChange={e=>setTarget(e.target.value)}/></label><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-sm opacity-70">Starts<input className={field+" mt-1"} type="datetime-local" value={start} onChange={e=>setStart(e.target.value)}/></label><label className="text-sm opacity-70">Ends<input className={field+" mt-1"} type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)}/></label></div><p className="text-xs opacity-55">New challenges start as drafts. The owner activates them when the group is ready.</p><button className={button} disabled={busy || !challengeTitle.trim()} onClick={() => run(async () => { await api(`/api/crews/${selected.id}/challenges`,{method:"POST",body:JSON.stringify({title:challengeTitle,description:challengeDescription,challengeType,targetCount:Number(target),startsAt:new Date(start).toISOString(),endsAt:new Date(end).toISOString()})}); await loadChallenges(selected); setChallengeTitle(""); setChallengeDescription(""); setMessage("Draft challenge created."); })}>Create challenge</button></div>}</section>}
      </section> : <section className="space-y-6">
        <div className="flex items-end justify-between"><div><h2 className="text-xl font-semibold">Your Crews</h2><p className="mt-1 text-sm opacity-60">Small circles. Real commitments.</p></div><button aria-label="Refresh Crews" className="rounded-full border border-current/15 p-3" onClick={() => run(loadCrews)}><RefreshCw size={17}/></button></div>
        {crews.length ? <div className="space-y-3">{crews.map(c=><button key={c.id} onClick={()=>{setSelected(c);setError("");}} className="block w-full rounded-2xl border border-current/15 p-4 text-left transition hover:bg-current/[0.03]"><div className="flex items-center justify-between gap-3"><span className="text-lg font-semibold">{c.name}</span><span className="text-xs uppercase tracking-wider opacity-50">{c.role}</span></div>{c.description && <p className="mt-1 text-sm opacity-60">{c.description}</p>}<p className="mt-3 text-xs opacity-50">Open Crew →</p></button>)}</div> : <div className="rounded-2xl border border-dashed border-current/20 px-5 py-8 text-center"><Users size={26} className="mx-auto mb-3 opacity-50"/><h3 className="font-semibold">Your circle starts here</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 opacity-60">Create a Crew for friends, family, or training partners. Invite people and build challenges together.</p></div>}
        <section className="border-t border-current/15 pt-5">
          <button className="flex w-full items-center justify-between text-left" onClick={() => setShowCreate(v=>!v)}><span><span className="block font-semibold">Start a Crew</span><span className="mt-1 block text-sm opacity-60">Create a private space for your people</span></span><Plus size={20} className={showCreate ? "rotate-45 transition-transform" : "transition-transform"}/></button>
          {showCreate && <form className="mt-4 space-y-3" onSubmit={e=>{e.preventDefault();void run(async()=>{const result=await api("/api/crews",{method:"POST",body:JSON.stringify({name,description})});setName("");setDescription("");setShowCreate(false);await loadCrews();setMessage("Crew created.");setSelected(result.crew ? {...result.crew,role:"owner",joined_at:new Date().toISOString()} : null);});}}>
            <input className={field} value={name} onChange={e=>setName(e.target.value)} placeholder="Crew name" maxLength={40} required minLength={2}/><textarea className={field} value={description} onChange={e=>setDescription(e.target.value)} placeholder="What are you working toward together? (optional)" rows={3} maxLength={240}/><button className={button} type="submit" disabled={busy || name.trim().length<2}><Plus size={16}/> Create Crew</button>
          </form>}
        </section>
        <section className="border-t border-current/15 pt-5">
          <div className="flex items-start gap-3"><Link2 size={18} className="mt-0.5 shrink-0 opacity-60"/><div className="flex-1"><h3 className="font-semibold">Have an invite?</h3><p className="mt-1 text-sm opacity-60">Paste the invitation link or token you received.</p></div></div>
          <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={e=>{e.preventDefault();void run(async()=>{const raw=inviteToken.trim();let token=raw;try { if(raw.startsWith("http")) token=new URL(raw).searchParams.get("token") || ""; } catch {} if(!token) throw new Error("That invite link does not contain a valid token.");await api("/api/crews/join",{method:"POST",body:JSON.stringify({token})});setInviteToken("");await loadCrews();setMessage("You joined the Crew.");});}}>
            <input className={field+" min-w-0 flex-1"} value={inviteToken} onChange={e=>setInviteToken(e.target.value)} placeholder="Paste invite link" autoCapitalize="none" autoCorrect="off"/><button className={button} disabled={busy || !inviteToken.trim()} type="submit">Join Crew <ChevronRight size={16}/></button>
          </form>
        </section>
        <div className="flex gap-3 pt-2 text-sm"><ShieldCheck size={18} className="shrink-0 opacity-50"/><p className="opacity-60">Crew progress is self-reported unless explicitly verified. Only authorized members can access private Crew activity.</p></div>
      </section>}
    </div>
  </section>;
}
