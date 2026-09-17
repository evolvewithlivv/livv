"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Camera, Heart, MessageCircle, MoreHorizontal, Play, Send, Video, X } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Avatar } from "@/components/identity/avatar";
import { loadIdentity, type Identity } from "@/lib/identity";
import { createPost, deletePost, fileToPostPhoto, fileToPostVideo, formatSocialTime, loadPosts, savePosts, updatePost, type Post } from "@/lib/social";
import { feedback } from "@/lib/sensory";

type Tab = "For you" | "Following" | "Watch";

export default function SocialPage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<Tab>("For you");
  const [composer, setComposer] = useState(false);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [replying, setReplying] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMe(loadIdentity());
    setPosts(loadPosts());
    const sync = () => setPosts(loadPosts());
    window.addEventListener("livv-social", sync);
    return () => window.removeEventListener("livv-social", sync);
  }, []);

  const filtered = useMemo(
    () => posts.filter((p) => (tab === "For you" ? true : tab === "Following" ? p.author.username === me?.username : Boolean(p.video))),
    [posts, tab, me]
  );

  const submit = () => {
    if (!me || (!text.trim() && !photo && !video)) return;
    if (editing) {
      setPosts(updatePost(editing, { text: text.trim(), photo, video }));
    } else {
      createPost({ text: text.trim(), photo, video, track: null, allowReplies: true });
      setPosts(loadPosts());
    }
    setText("");
    setPhoto(null);
    setVideo(null);
    setEditing(null);
    setComposer(false);
    feedback("complete");
  };

  const like = (id: string) => {
    const next = posts.map((p) => p.id === id ? { ...p, likes: p.likes + (p.likedByMe ? -1 : 1), likedByMe: !p.likedByMe } : p);
    savePosts(next);
    setPosts(next);
  };

  const reply = (id: string) => {
    if (!me || !replyText.trim()) return;
    const next = posts.map((p) => p.id === id ? {
      ...p,
      replies: [...p.replies, {
        id: crypto.randomUUID(),
        author: { displayName: me.displayName, username: me.username, photo: me.photo, accent: me.accent },
        text: replyText.trim(),
        createdAt: Date.now(),
      }],
    } : p);
    savePosts(next);
    setPosts(next);
    setReplyText("");
    setReplying(null);
  };

  const pickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setVideo(null);
    try { setPhoto(await fileToPostPhoto(f)); } catch {}
    if (photoRef.current) photoRef.current.value = "";
  };

  const pickVideo = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(null);
    try { setVideo(await fileToPostVideo(f)); } catch {}
    if (videoRef.current) videoRef.current.value = "";
  };

  const edit = (p: Post) => {
    setEditing(p.id);
    setText(p.text);
    setPhoto(p.photo);
    setVideo(p.video);
    setComposer(true);
  };

  return (
    <main className="livv-social-page relative min-h-full overflow-hidden pb-28 text-white">
      <div className="px-4 pt-5">
        <PageHero
          eyebrow="Social"
          title="Community"
          subtitle={tab === "Watch" ? "Watch what the LIVV community is sharing." : "Share the work. Follow the people. Keep moving."}
          accent="#4DFF00"
        />
      </div>

      <section className="relative z-10 px-4 pt-4">
        <div className="sticky top-0 z-20 -mx-1 border-y border-white/[0.08] bg-[#030405]/90 px-1 py-2 backdrop-blur-xl" role="tablist" aria-label="Social feed">
          <div className="grid grid-cols-3">
            {(["For you", "Following", "Watch"] as Tab[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                role="tab"
                aria-selected={tab === item}
                className="relative min-h-10 text-[11px] font-semibold"
                style={{ color: tab === item ? "#4DFF00" : "rgba(255,255,255,.5)" }}
              >
                {item}
                {tab === item ? <span className="absolute inset-x-5 bottom-0 h-0.5 rounded-full bg-[#4DFF00]" /> : null}
              </button>
            ))}
          </div>
        </div>

        {tab !== "Watch" && (
          <button
            type="button"
            onClick={() => setComposer(true)}
            className="mt-4 flex w-full items-center gap-3 border-b border-white/[0.08] pb-4 text-left"
          >
            <Avatar identity={me ? { displayName: me.displayName, photo: me.photo, accent: me.accent, tier: me.tier } : { displayName: "You", photo: null, accent: "#0F7FFF", tier: "spark" }} size={42} />
            <span className="flex-1 text-[14px] text-white/45">What are you working on?</span>
            <span className="rounded-full bg-white px-4 py-2 text-[10px] font-bold text-black">POST</span>
          </button>
        )}

        <div className="mt-2 divide-y divide-white/[0.08]">
          {filtered.map((p) => (
            <article key={p.id} className={tab === "Watch" ? "py-5" : "py-5"}>
              <div className="flex items-center gap-3">
                <Avatar identity={p.author} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{p.author.displayName}</p>
                  <p className="text-[10px] text-white/40">@{p.author.username} · {formatSocialTime(p.createdAt, Date.now())}</p>
                </div>
                {me?.username === p.author.username && (
                  <button type="button" onClick={() => edit(p)} className="grid h-9 w-9 place-items-center rounded-full text-white/45" aria-label="Edit post">
                    <MoreHorizontal size={18} />
                  </button>
                )}
              </div>

              {p.text && <p className="mt-4 text-[15px] leading-6 text-white/88">{p.text}</p>}

              {p.photo && tab !== "Watch" && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
                  <img src={p.photo} alt="Post media" className="block max-h-[620px] w-full object-cover" />
                </div>
              )}

              {p.video && (
                <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
                  {tab === "Watch" && <span className="absolute left-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur-md"><Play size={15} fill="white" /></span>}
                  <video src={p.video} controls playsInline className={tab === "Watch" ? "block max-h-[72vh] min-h-[380px] w-full object-contain" : "block max-h-[620px] w-full object-contain"} />
                </div>
              )}

              <div className="mt-3 flex items-center gap-1">
                <button type="button" onClick={() => like(p.id)} className="flex min-h-10 items-center gap-1.5 rounded-full px-2.5 text-[11px] text-[#F61981]" aria-label="Like post">
                  <Heart size={17} fill={p.likedByMe ? "currentColor" : "none"} /> {p.likes}
                </button>
                {p.allowReplies && (
                  <button type="button" onClick={() => setReplying(replying === p.id ? null : p.id)} className="flex min-h-10 items-center gap-1.5 rounded-full px-2.5 text-[11px] text-white/55" aria-label="Reply to post">
                    <MessageCircle size={17} /> {p.replies.length}
                  </button>
                )}
                {me?.username === p.author.username && (
                  <button type="button" onClick={() => setPosts(deletePost(p.id))} className="ml-auto min-h-10 px-2.5 text-[11px] text-[#F93827]">Delete</button>
                )}
              </div>

              {tab !== "Watch" && (p.replies.length > 0 || replying === p.id) && (
                <div className="mt-2 border-l border-white/[0.1] pl-4">
                  {p.replies.map((r) => (
                    <p key={r.id} className="mb-2 text-[12px] leading-5 text-white/60">
                      <b className="text-white/85">{r.author.displayName}</b> {r.text}
                    </p>
                  ))}
                  {replying === p.id && (
                    <div className="mt-3 flex gap-2">
                      <input autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply" aria-label="Write a reply" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5 text-[12px] outline-none" />
                      <button type="button" onClick={() => reply(p.id)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-black" aria-label="Send reply"><Send size={15} /></button>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}

          {filtered.length === 0 && (
            <div className="py-14 text-center">
              <p className="font-display text-[22px]">Nothing here yet.</p>
              <p className="mt-2 text-[12px] text-white/40">{tab === "Watch" ? "Be the first person to share a video." : "Share the first update and start the conversation."}</p>
            </div>
          )}
        </div>
      </section>

      {composer && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-3 backdrop-blur-md" onClick={() => setComposer(false)}>
          <div className="w-full max-w-xl border border-white/10 bg-[#101116] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4DFF00]">{editing ? "Edit post" : "Create post"}</p>
                <h2 className="font-display mt-1 text-[22px] font-semibold">Say something real.</h2>
              </div>
              <button type="button" onClick={() => setComposer(false)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10" aria-label="Close composer"><X size={17} /></button>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What are you building, learning, training, or thinking about?" aria-label="Post text" className="mt-5 min-h-36 w-full resize-none border-b border-white/10 bg-transparent p-1 text-[15px] leading-relaxed outline-none placeholder:text-white/30" />
            {(photo || video) && <div className="mt-4 overflow-hidden rounded-xl border border-white/10">{photo && <img src={photo} alt="Preview" className="max-h-56 w-full object-cover" />}{video && <video src={video} controls className="max-h-56 w-full" />}</div>}
            <div className="mt-4 flex items-center gap-2">
              <button type="button" onClick={() => photoRef.current?.click()} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-[11px]"><Camera size={15} /> Photo</button>
              <button type="button" onClick={() => videoRef.current?.click()} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-[11px]"><Video size={15} /> Video</button>
              <button type="button" onClick={submit} className="ml-auto rounded-full bg-white px-5 py-2.5 text-[11px] font-bold text-black">{editing ? "Save" : "Post"}</button>
            </div>
            <input ref={photoRef} type="file" accept="image/*" onChange={pickPhoto} className="hidden" />
            <input ref={videoRef} type="file" accept="video/*" onChange={pickVideo} className="hidden" />
          </div>
        </div>
      )}
    </main>
  );
}
