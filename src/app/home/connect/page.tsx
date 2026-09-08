"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { Avatar } from "@/components/identity/avatar";
import { cn } from "@/lib/utils";
import { loadIdentity, type Identity } from "@/lib/identity";
import { SOUND_LIBRARY, canEditPost, createPost, deletePost, fileToPostPhoto, fileToPostVideo, formatSocialTime, loadPosts, savePosts, updatePost, type Post, type Track } from "@/lib/social";
import { feedback } from "@/lib/sensory";

type Sheet = "closed" | "compose" | "sound" | "edit";
type FeedTab = "live" | "following" | "proof" | "watch";
const PULSE = [
  { name: "You", username: "me", accent: "#4C8DFF", self: true },
  { name: "Maya", username: "mayatrains", accent: "#3DDC97" },
  { name: "Andre", username: "andrev", accent: "#FF5C8A" },
  { name: "Nia", username: "nia.runs", accent: "#F5C542" },
  { name: "Jules", username: "julesmoves", accent: "#7C9CFF" },
  { name: "Cole", username: "colebuilt", accent: "#A78BFA" },
];
const LIVE_TICKER = ["Maya finished Daily · Body", "Andre checked in · Day 19", "Nia opened a Signal pack", "Jules hit a 7-day streak", "Cole posted proof"];

export default function ConnectPage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sheet, setSheet] = useState<Sheet>("closed");
  const [tab, setTab] = useState<FeedTab>("live");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [allowReplies, setAllowReplies] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [openReplies, setOpenReplies] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [ticker, setTicker] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMe(loadIdentity()); setPosts(loadPosts());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    const tick = window.setInterval(() => setTicker((t) => (t + 1) % LIVE_TICKER.length), 3200);
    return () => { window.clearInterval(id); window.clearInterval(tick); audioRef.current?.pause(); };
  }, []);
  const canSubmit = text.trim().length > 0 || Boolean(photo) || Boolean(video);
  const stopAudio = () => { audioRef.current?.pause(); audioRef.current = null; setPlayingId(null); };
  const togglePlay = (post: Post) => { if (!post.track) return; if (playingId === post.id) return stopAudio(); stopAudio(); const audio = new Audio(post.track.url); audioRef.current = audio; audio.onended = () => setPlayingId(null); audio.play().catch(() => setPlayingId(null)); setPlayingId(post.id); };
  const submit = () => {
    if (!me || !canSubmit) return;
    if (sheet === "edit" && editingId) setPosts(updatePost(editingId, { text: text.trim(), photo, video, track, allowReplies }));
    else { createPost({ text: text.trim(), photo, video, track, allowReplies }); setPosts(loadPosts()); }
    setText(""); setPhoto(null); setVideo(null); setTrack(null); setEditingId(null); setSheet("closed"); feedback("complete");
  };
  const beginEdit = (post: Post) => { setEditingId(post.id); setText(post.text); setPhoto(post.photo); setVideo(post.video); setTrack(post.track); setAllowReplies(post.allowReplies); setMenuId(null); setSheet("edit"); };
  const remove = (id: string) => { const next = deletePost(id); setPosts(next); setMenuId(null); };
  const like = (id: string) => { const next = posts.map((p) => p.id === id ? { ...p, likes: p.likes + (p.likedByMe ? -1 : 1), likedByMe: !p.likedByMe } : p); savePosts(next); setPosts(next); };
  const reply = (id: string) => {
    if (!me || !replyDraft.trim()) return;
    const next = posts.map((p) => p.id === id ? { ...p, replies: [...p.replies, { id: crypto.randomUUID(), author: { displayName: me.displayName, username: me.username, photo: me.photo, accent: me.accent }, text: replyDraft.trim(), createdAt: Date.now() }] } : p);
    savePosts(next); setPosts(next); setReplyDraft("");
  };
  const filteredPosts = useMemo(() => posts.filter((post) => tab === "proof" ? Boolean(post.photo || post.video) || post.text.toLowerCase().includes("proof") : true), [posts, tab]);
  const watchPosts = useMemo(() => { const media = posts.filter((p) => Boolean(p.video || p.photo)); return media.length ? media : posts; }, [posts]);
  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; setVideo(null); try { setPhoto(await fileToPostPhoto(f)); } catch {} };
  const pickVideo = async (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; setPhoto(null); try { setVideo(await fileToPostVideo(f)); } catch {} };

  return <main className="relative min-h-full overflow-hidden pb-28">
    <PageHero eyebrow="Connect" title="Community" subtitle="Post. Watch. Find people who keep moving." />
    <section className="relative z-10 mx-auto max-w-xl px-4 pt-2">
      <div className="mb-3 flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 scrollbar-none">{PULSE.map((person) => <div key={person.username} className="shrink-0 text-center"><div className="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.035]" style={{ boxShadow: `0 0 18px ${person.accent}22` }}><span className="text-[10px] font-bold" style={{ color: person.accent }}>{person.name.slice(0, 1)}</span></div><span className="text-[9px] text-white/45">{person.name}</span></div>)}</div><a href="/home/share" className="shrink-0 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-white/45">Share</a></div>
      <div className="mb-4 flex items-center gap-1 overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1">{(["live", "following", "proof", "watch"] as FeedTab[]).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={cn("shrink-0 rounded-xl px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em]", tab === item ? "bg-white/[0.08] text-white" : "text-white/35")}>{item === "watch" ? "Watch" : item}</button>)}</div>

      {tab === "watch" ? <div className="space-y-3 snap-y snap-mandatory">{watchPosts.map((post) => <article key={post.id} className="relative min-h-[72vh] snap-start overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#0a0c11]">{post.video ? <video src={post.video} className="absolute inset-0 h-full w-full object-cover" playsInline controls loop /> : post.photo ? <img src={post.photo} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-black"><div className="flex h-full items-center justify-center p-8 text-center"><p className="max-w-sm text-3xl font-semibold leading-tight text-white/85">{post.text}</p></div></div>}<div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-5"><div className="flex items-end gap-3"><Avatar identity={post.author} size={40} /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{post.author.displayName}</p><p className="text-[10px] text-white/45">@{post.author.username} · {formatSocialTime(post.createdAt, now)}</p><p className="mt-2 line-clamp-3 text-[13px] leading-5 text-white/75">{post.text}</p></div><div className="flex shrink-0 flex-col items-center gap-3"><button type="button" onClick={() => like(post.id)} className="text-center text-white"><span className="block text-2xl">{post.likedByMe ? "♥" : "♡"}</span><span className="text-[9px] text-white/55">{post.likes}</span></button><button type="button" onClick={() => setOpenReplies(openReplies === post.id ? null : post.id)} className="text-center text-white"><span className="block text-xl">◌</span><span className="text-[9px] text-white/55">{post.replies.length}</span></button></div></div></div></article>)}</div> : <>
        <button type="button" onClick={() => setSheet("compose")} className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 text-left"><Avatar identity={me ?? { displayName: "You", photo: null, accent: "#4C8DFF" }} size={38} /><span className="text-[12px] text-white/35">Share something real...</span><span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-[9px] font-semibold text-white/55">POST</span></button>
        <div className="mb-4 text-center text-[9px] font-medium uppercase tracking-[0.2em] text-white/25">{LIVE_TICKER[ticker]}</div>
        <div className="space-y-4">{filteredPosts.map((post) => <article key={post.id} className="overflow-hidden rounded-3xl border border-white/[0.075] bg-white/[0.025]"><div className="flex items-center gap-3 px-4 py-3"><Avatar identity={post.author} size={36} /><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-semibold text-white/85">{post.author.displayName}</p><p className="text-[10px] text-white/30">@{post.author.username} · {formatSocialTime(post.createdAt, now)}</p></div>{me?.username === post.author.username && canEditPost(post, now) && <button type="button" onClick={() => beginEdit(post)} className="text-[10px] text-white/30">Edit</button>}</div>{post.text && <p className="px-4 pb-3 text-[14px] leading-6 text-white/75">{post.text}</p>}{post.video && <video src={post.video} className="block max-h-[520px] w-full bg-black object-cover" controls playsInline loop />}{post.photo && <img src={post.photo} alt="" className="block max-h-[520px] w-full object-cover" />}{post.track && <button type="button" onClick={() => togglePlay(post)} className="mx-4 mt-3 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl border border-white/[0.06] bg-black/20 px-3 py-3 text-left"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">{playingId === post.id ? "Ⅱ" : "▶"}</span><span className="min-w-0 flex-1 truncate text-[12px] font-medium text-white/70">{post.track.title}</span></button>}<div className="flex items-center gap-1 px-3 py-3"><button type="button" onClick={() => like(post.id)} className="rounded-full px-2 py-1 text-[12px] text-white/50">{post.likedByMe ? "♥" : "♡"} {post.likes}</button>{post.allowReplies && <button type="button" onClick={() => setOpenReplies(openReplies === post.id ? null : post.id)} className="rounded-full px-2 py-1 text-[12px] text-white/50">Reply {post.replies.length}</button>}{me?.username === post.author.username && <button type="button" onClick={() => setMenuId(menuId === post.id ? null : post.id)} className="ml-auto rounded-full px-2 py-1 text-[12px] text-white/35">•••</button>}</div>{menuId === post.id && <div className="flex gap-2 border-t border-white/[0.06] px-4 py-3"><button type="button" onClick={() => beginEdit(post)} className="text-[11px] text-white/55">Edit</button><button type="button" onClick={() => remove(post.id)} className="text-[11px] text-red-300/70">Delete</button></div>}{openReplies === post.id && <div className="border-t border-white/[0.06] px-4 py-3"><div className="space-y-2">{post.replies.map((r) => <p key={r.id} className="text-[11px] leading-5 text-white/55"><b className="text-white/70">{r.author.displayName}</b> {r.text}</p>)}</div><div className="mt-3 flex gap-2"><input value={replyDraft} onChange={(e) => setReplyDraft(e.target.value)} placeholder="Reply..." className="min-w-0 flex-1 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[11px] outline-none"/><button type="button" onClick={() => reply(post.id)} className="rounded-xl bg-white/10 px-3 text-[10px] font-semibold">Send</button></div></div>}</article>)}</div>
      </>}
    </section>

    {sheet !== "closed" && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => setSheet("closed")}><div className="w-full max-w-xl rounded-3xl border border-white/[0.08] bg-[#101116] p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="mb-3 flex items-center justify-between"><p className="font-display text-[18px] font-semibold">{sheet === "edit" ? "Edit post" : "Share"}</p><button type="button" onClick={() => setSheet("closed")} className="text-white/40">×</button></div><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What's real right now?" className="min-h-32 w-full resize-none rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 text-[13px] outline-none" /><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => fileRef.current?.click()} className="rounded-xl bg-white/[0.06] px-3 py-2 text-[10px]">Photo</button><button type="button" onClick={() => videoRef.current?.click()} className="rounded-xl bg-white/[0.06] px-3 py-2 text-[10px]">Video</button><button type="button" onClick={() => setSheet("sound")} className="rounded-xl bg-white/[0.06] px-3 py-2 text-[10px]">Sound</button><button type="button" onClick={() => setAllowReplies((v) => !v)} className="rounded-xl bg-white/[0.06] px-3 py-2 text-[10px]">Replies {allowReplies ? "On" : "Off"}</button></div><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} /><input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={pickVideo} />{photo && <img src={photo} alt="Preview" className="mt-3 max-h-48 w-full rounded-2xl object-cover" />}{video && <video src={video} className="mt-3 max-h-48 w-full rounded-2xl bg-black object-cover" controls playsInline />}{video && <p className="mt-2 text-[10px] text-white/30">Local MVP limit: 6 MB per video.</p>}<button type="button" disabled={!canSubmit} onClick={submit} className="mt-4 w-full rounded-2xl bg-white py-3 text-[11px] font-bold text-black disabled:opacity-30">{sheet === "edit" ? "SAVE CHANGES" : "POST"}</button></div></div>}
    {sheet === "sound" && <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 p-3" onClick={() => setSheet("compose")}><div className="w-full max-w-xl rounded-3xl border border-white/[0.08] bg-[#101116] p-4" onClick={(e) => e.stopPropagation()}><p className="mb-3 font-display text-[18px] font-semibold">Choose a sound</p><div className="space-y-2">{SOUND_LIBRARY.map((s) => <button key={s.id} type="button" onClick={() => { setTrack(s); setSheet("compose"); }} className="flex w-full items-center justify-between rounded-2xl bg-white/[0.04] px-3 py-3 text-left"><span><span className="block text-[12px] text-white/75">{s.title}</span><span className="text-[10px] text-white/30">{s.artist}</span></span><span className="text-[10px] text-white/35">ADD</span></button>)}</div></div></div>}
  </main>;
}
