"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Avatar } from "@/components/identity/avatar";
import { cn } from "@/lib/utils";
import { loadIdentity, type Identity } from "@/lib/identity";
import {
  SOUND_LIBRARY,
  canEditPost,
  createPost,
  deletePost,
  editSecondsLeft,
  fileToPostPhoto,
  formatSocialTime,
  loadPosts,
  savePosts,
  updatePost,
  type Post,
  type Track,
} from "@/lib/social";
import { feedback } from "@/lib/sensory";

type Sheet = "closed" | "compose" | "sound" | "edit";
type FeedTab = "live" | "following" | "proof";

const PULSE = [
  { name: "You", username: "me", accent: "#4C8DFF", self: true },
  { name: "Maya", username: "mayatrains", accent: "#3DDC97" },
  { name: "Andre", username: "andrev", accent: "#FF5C8A" },
  { name: "Nia", username: "nia.runs", accent: "#F5C542" },
  { name: "Jules", username: "julesmoves", accent: "#7C9CFF" },
  { name: "Cole", username: "colebuilt", accent: "#A78BFA" },
];

const LIVE_TICKER = [
  "Maya finished Daily · Body",
  "Andre checked in · Day 19",
  "Nia opened a Signal pack",
  "Jules hit a 7-day streak",
  "Cole posted proof",
];

export default function ConnectPage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sheet, setSheet] = useState<Sheet>("closed");
  const [tab, setTab] = useState<FeedTab>("live");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [allowReplies, setAllowReplies] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [openReplies, setOpenReplies] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [likeBurst, setLikeBurst] = useState<string | null>(null);
  const [ticker, setTicker] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastTap = useRef<{ id: string; t: number } | null>(null);

  useEffect(() => {
    setMe(loadIdentity());
    setPosts(loadPosts());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    const tick = window.setInterval(() => setTicker((t) => (t + 1) % LIVE_TICKER.length), 3200);
    return () => {
      window.clearInterval(id);
      window.clearInterval(tick);
      audioRef.current?.pause();
    };
  }, []);

  const canSubmit = text.trim().length > 0 || Boolean(photo);

  const stopAudio = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPlayingId(null);
  };

  const togglePlay = (post: Post) => {
    if (!post.track) return;
    if (playingId === post.id) {
      stopAudio();
      return;
    }
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = post.track.url;
    audioRef.current.loop = true;
    void audioRef.current.play().catch(() => undefined);
    setPlayingId(post.id);
    feedback("tick");
  };

  const resetComposer = () => {
    setText("");
    setPhoto(null);
    setTrack(null);
    setAllowReplies(true);
    setEditingId(null);
    setSheet("closed");
  };

  const publish = () => {
    if (!canSubmit) return;
    feedback("complete");
    if (editingId) {
      const current = posts.find((p) => p.id === editingId);
      if (!current || !canEditPost(current, now)) {
        resetComposer();
        return;
      }
      setPosts(updatePost(editingId, { text, photo, track, allowReplies }));
      resetComposer();
      return;
    }
    createPost({ text, photo, track, allowReplies });
    setPosts(loadPosts());
    resetComposer();
  };

  const openEdit = (post: Post) => {
    if (!canEditPost(post, now)) return;
    setEditingId(post.id);
    setText(post.text);
    setPhoto(post.photo);
    setTrack(post.track);
    setAllowReplies(post.allowReplies);
    setMenuId(null);
    setSheet("edit");
  };

  const remove = (id: string) => {
    setPosts(deletePost(id));
    setMenuId(null);
    if (playingId === id) stopAudio();
  };

  const like = (id: string) => {
    feedback("tick");
    setLikeBurst(id);
    window.setTimeout(() => setLikeBurst(null), 520);
    const next = posts.map((p) => {
      if (p.id !== id) return p;
      const liked = !p.likedByMe;
      return {
        ...p,
        likedByMe: liked,
        likes: liked ? p.likes + 1 : Math.max(0, p.likes - 1),
      };
    });
    setPosts(next);
    savePosts(next);
  };

  const onMediaTap = (post: Post) => {
    const t = Date.now();
    if (lastTap.current?.id === post.id && t - lastTap.current.t < 320) {
      if (!post.likedByMe) like(post.id);
      lastTap.current = null;
      return;
    }
    lastTap.current = { id: post.id, t };
  };

  const sendReply = (id: string) => {
    if (!me || !replyDraft.trim()) return;
    feedback("tick");
    const next = posts.map((p) => {
      if (p.id !== id || !p.allowReplies) return p;
      return {
        ...p,
        replies: [
          ...p.replies,
          {
            id: `r_${Date.now()}`,
            createdAt: Date.now(),
            author: {
              displayName: me.displayName,
              username: me.username,
              photo: me.photo,
              accent: me.accent,
            },
            text: replyDraft.trim(),
          },
        ],
      };
    });
    setPosts(next);
    savePosts(next);
    setReplyDraft("");
  };

  const onPhoto = async (file?: File) => {
    if (!file) return;
    try {
      setPhoto(await fileToPostPhoto(file));
      setSheet(editingId ? "edit" : "compose");
    } catch {
      /* ignore */
    }
  };

  const feed = useMemo(() => {
    let list = [...posts].sort((a, b) => b.createdAt - a.createdAt);
    if (tab === "proof") list = list.filter((p) => p.photo || p.track);
    if (tab === "following" && me) {
      list = list.filter(
        (p) =>
          p.author.username === me.username ||
          ["mayatrains", "andrev", "nia.runs", "julesmoves"].includes(p.author.username)
      );
    }
    return list;
  }, [posts, tab, me]);

  const isMine = (post: Post) => Boolean(me && post.author.username === me.username);

  return (
    <main className="livv-page relative min-h-full overflow-x-hidden text-white">
      <div className="relative z-10 mx-auto max-w-lg">
        <div className="px-5 pt-5">
          <header>
            <PageHero
              eyebrow="Live room"
              title="Signals"
              subtitle="Proof from people building the same standard."
              accent="#ff72c9"
            />

            <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5">
              <p className="flex items-center gap-2 text-[12px] text-white/55">
                <span className="text-livv-accent">●</span>
                <span key={ticker} className="truncate">
                  {LIVE_TICKER[ticker]}
                </span>
              </p>
            </div>

            <div className="-mx-5 mt-5 flex gap-4 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {PULSE.map((p) => {
                const self = Boolean(p.self);
                return (
                  <button
                    key={p.username}
                    type="button"
                    onClick={() => {
                      if (self) {
                        setSheet("compose");
                        feedback("tick");
                      }
                    }}
                    className="flex w-[72px] shrink-0 flex-col items-center gap-2"
                  >
                    <span className="relative flex h-[72px] w-[72px] items-center justify-center">
                      <span
                        className="absolute inset-0 rounded-full p-[2px]"
                        style={{
                          background: self
                            ? "linear-gradient(135deg, #4C8DFF, #fff, #4C8DFF)"
                            : `linear-gradient(135deg, ${p.accent}, transparent 55%, ${p.accent})`,
                        }}
                      >
                        <span className="block h-full w-full rounded-full bg-[#030405] p-[3px]">
                          <span
                            className="flex h-full w-full items-center justify-center overflow-hidden rounded-full text-[18px] font-semibold text-white"
                            style={{ background: p.accent }}
                          >
                            {self && me?.photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={me.photo} alt="" className="h-full w-full object-cover" />
                            ) : (
                              (self ? me?.displayName?.[0] : p.name[0]) || "L"
                            )}
                          </span>
                        </span>
                      </span>
                      {self && (
                        <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[14px] font-bold leading-none text-black">
                          +
                        </span>
                      )}
                    </span>
                    <span className="w-full truncate text-center text-[11px] font-medium text-white/50">
                      {self ? "Your pulse" : p.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex gap-1 rounded-full bg-white/[0.04] p-1 ring-1 ring-white/[0.06]">
              {(
                [
                  { id: "live" as const, label: "Live" },
                  { id: "following" as const, label: "Following" },
                  { id: "proof" as const, label: "Proof" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTab(t.id);
                    feedback("tick");
                  }}
                  className={cn(
                    "flex-1 rounded-full py-2 text-[12px] font-semibold transition",
                    tab === t.id ? "bg-white text-black shadow" : "text-white/40"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </header>

          <div className="mt-4">
            {feed.length === 0 && (
              <div className="px-5 py-16 text-center">
                <p className="font-display text-[24px] font-semibold">No signals yet</p>
                <p className="mt-2 text-[13px] text-white/35">Post the first one.</p>
                <button
                  type="button"
                  onClick={() => setSheet("compose")}
                  className="mt-6 rounded-full bg-white px-6 py-3 text-[13px] font-semibold text-black"
                >
                  Drop a signal
                </button>
              </div>
            )}

            {feed.map((post) => {
              const mine = isMine(post);
              const editable = mine && canEditPost(post, now);
              const seconds = editSecondsLeft(post, now);
              const hasMedia = Boolean(post.photo);

              return (
                <article key={post.id} className="relative mb-3">
                  {/* Card shell — NO overflow-hidden so icons never clip */}
                  <div className="mx-3 rounded-[22px] border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.02]">
                    <div className="flex items-center gap-3 px-4 pt-4">
                      <span
                        className="shrink-0 rounded-full p-[2px]"
                        style={{
                          background: `linear-gradient(135deg, ${post.author.accent}, transparent 65%)`,
                        }}
                      >
                        <Avatar identity={post.author} size={40} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold">{post.author.displayName}</p>
                        <p className="text-[11px] text-white/35">
                          @{post.author.username}
                          <span className="mx-1.5 text-white/15">·</span>
                          {formatSocialTime(post.createdAt, now)}
                          {post.editedAt ? <span className="text-white/25"> · edited</span> : null}
                        </p>
                      </div>
                      {mine && (
                        <div className="relative">
                          <button
                            type="button"
                            aria-label="Options"
                            onClick={() => setMenuId(menuId === post.id ? null : post.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-white/40"
                          >
                            <MoreIcon />
                          </button>
                          {menuId === post.id && (
                            <div className="absolute right-0 top-10 z-30 min-w-[150px] overflow-hidden rounded-2xl border border-white/10 bg-[#12141a] py-1 shadow-2xl">
                              {editable && (
                                <button
                                  type="button"
                                  onClick={() => openEdit(post)}
                                  className="block w-full px-4 py-2.5 text-left text-[13px]"
                                >
                                  Edit · {seconds}s
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => remove(post.id)}
                                className="block w-full px-4 py-2.5 text-left text-[13px] text-red-400"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {post.text && !hasMedia && (
                      <p className="whitespace-pre-wrap px-4 pt-3 text-[16px] leading-snug tracking-[-0.01em] text-white/92">
                        {post.text}
                      </p>
                    )}

                    {post.photo && (
                      <button
                        type="button"
                        onClick={() => onMediaTap(post)}
                        className="mt-3 block w-full"
                        aria-label="Post photo"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.photo} alt="" className="block max-h-[620px] w-full object-cover" />
                      </button>
                    )}

                    {post.track && (
                      <button
                        type="button"
                        onClick={() => togglePlay(post)}
                        className="mx-4 mt-3 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl border border-white/[0.06] bg-black/20 px-3 py-3 text-left"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                          {playingId === post.id ? "Ⅱ" : "▶"}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-white/70">{post.track.name}</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1 px-3 py-3">
                      <button type="button" onClick={() => like(post.id)} className="rounded-full px-2 py-1 text-[12px] text-white/50">
                        ♥ {post.likes}
                      </button>
                      {post.allowReplies && (
                        <button
                          type="button"
                          onClick={() => setOpenReplies(openReplies === post.id ? null : post.id)}
                          className="rounded-full px-2 py-1 text-[12px] text-white/50"
                        >
                          Replies {post.replies.length}
                        </button>
                      )}
                    </div>

                    {openReplies === post.id && post.allowReplies && (
                      <div className="border-t border-white/[0.06] px-4 py-3">
                        {post.replies.map((reply) => (
                          <div key={reply.id} className="mb-2 flex gap-2 last:mb-0">
                            <Avatar identity={reply.author} size={28} />
                            <div className="min-w-0">
                              <p className="text-[11px] text-white/45">@{reply.author.username}</p>
                              <p className="text-[13px] text-white/80">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                        <div className="mt-3 flex gap-2">
                          <input
                            value={replyDraft}
                            onChange={(e) => setReplyDraft(e.target.value)}
                            placeholder="Reply…"
                            className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] text-white outline-none placeholder:text-white/25"
                          />
                          <button type="button" onClick={() => sendReply(post.id)} className="rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-black">
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}
