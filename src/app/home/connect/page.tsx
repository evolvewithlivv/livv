"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/identity/avatar";
import { AmbientField } from "@/components/layout/ambient-field";
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
type FeedTab = "for_you" | "following" | "proof";

const PULSE = [
  { name: "You", username: "me", accent: "#4C8DFF", self: true },
  { name: "Maya", username: "mayatrains", accent: "#3DDC97" },
  { name: "Andre", username: "andrev", accent: "#FF5C8A" },
  { name: "Nia", username: "nia.runs", accent: "#F5C542" },
  { name: "Jules", username: "julesmoves", accent: "#7C9CFF" },
  { name: "Cole", username: "colebuilt", accent: "#A78BFA" },
];

export default function ConnectPage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sheet, setSheet] = useState<Sheet>("closed");
  const [tab, setTab] = useState<FeedTab>("for_you");
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
  const [composerFocus, setComposerFocus] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastTap = useRef<{ id: string; t: number } | null>(null);

  useEffect(() => {
    setMe(loadIdentity());
    setPosts(loadPosts());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(id);
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
    setComposerFocus(false);
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
      /* ignore bad image */
    }
  };

  const feed = useMemo(() => {
    let list = [...posts].sort((a, b) => b.createdAt - a.createdAt);
    if (tab === "proof") list = list.filter((p) => p.photo || p.track);
    if (tab === "following" && me) {
      list = list.filter(
        (p) =>
          p.author.username === me.username ||
          ["mayatrains", "andrev", "nia.runs"].includes(p.author.username)
      );
    }
    return list;
  }, [posts, tab, me]);

  const isMine = (post: Post) => Boolean(me && post.author.username === me.username);

  return (
    <main className="relative min-h-full overflow-x-hidden bg-[#050505] pb-28 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-[-8rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgb(var(--livv-accent) / 0.14), transparent 70%)",
          }}
        />
        <AmbientField />
      </div>

      <div className="relative z-10 mx-auto max-w-lg">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#050505]/88 px-5 pb-3 pt-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-livv-accent-soft">
                The room
              </p>
              <h1 className="font-display mt-0.5 text-[26px] font-semibold tracking-tight">Connect</h1>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/home/messages"
                className="flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[11px] font-medium text-white/50"
              >
                <InboxIcon />
                DM
              </Link>
              {me && (
                <Link href="/home/profile">
                  <Avatar identity={me} size={34} showTierRing />
                </Link>
              )}
            </div>
          </div>

          {/* Pulse strip */}
          <div className="-mx-5 mt-4 flex gap-3.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PULSE.map((p) => {
              const self = p.self;
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
                  className="flex w-[64px] shrink-0 flex-col items-center gap-1.5"
                >
                  <span className="relative flex h-[62px] w-[62px] items-center justify-center">
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: self
                          ? "conic-gradient(from 140deg, rgb(var(--livv-accent)), #fff 50%, rgb(var(--livv-accent)))"
                          : `conic-gradient(from 0deg, ${p.accent}, transparent 50%, ${p.accent})`,
                      }}
                    />
                    <span className="absolute inset-[2.5px] rounded-full bg-[#050505]" />
                    <span
                      className="relative flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-full text-[17px] font-semibold text-white"
                      style={{ background: p.accent }}
                    >
                      {self && me?.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={me.photo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (self ? me?.displayName?.[0] : p.name[0]) || "L"
                      )}
                    </span>
                    {self && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white text-[13px] font-bold leading-none text-black shadow">
                        +
                      </span>
                    )}
                  </span>
                  <span className="w-full truncate text-center text-[10px] text-white/45">
                    {self ? "Your pulse" : p.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="mt-3 flex gap-1">
            {(
              [
                { id: "for_you" as const, label: "For you" },
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
                  "rounded-full px-3.5 py-1.5 text-[12px] font-medium transition",
                  tab === t.id ? "bg-white text-black" : "text-white/40"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        {/* Feed */}
        <div className="mt-2 space-y-0">
          {feed.length === 0 && (
            <div className="px-5 py-20 text-center">
              <p className="font-display text-[22px] font-semibold">Empty room</p>
              <p className="mt-2 text-[13px] text-white/35">Be the first signal today.</p>
              <button
                type="button"
                onClick={() => setSheet("compose")}
                className="mt-6 rounded-full bg-white px-5 py-2.5 text-[12px] font-semibold text-black"
              >
                Post something real
              </button>
            </div>
          )}

          {feed.map((post, idx) => {
            const mine = isMine(post);
            const editable = mine && canEditPost(post, now);
            const seconds = editSecondsLeft(post, now);
            const hasMedia = Boolean(post.photo);

            return (
              <article
                key={post.id}
                className={cn(
                  "relative py-5",
                  idx > 0 && "border-t border-white/[0.05]"
                )}
              >
                {/* Author */}
                <div className="flex items-center gap-3 px-5">
                  <span
                    className="shrink-0 rounded-full p-[2px]"
                    style={{
                      background: `linear-gradient(135deg, ${post.author.accent}, transparent 70%)`,
                    }}
                  >
                    <Avatar identity={post.author} size={38} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold leading-tight">
                      {post.author.displayName}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-white/35">
                      @{post.author.username}
                      <span className="mx-1 text-white/15">·</span>
                      {formatSocialTime(post.createdAt, now)}
                      {post.editedAt ? <span className="text-white/25"> · edited</span> : null}
                    </p>
                  </div>
                  {mine && (
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        aria-label="Post options"
                        onClick={() => setMenuId(menuId === post.id ? null : post.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white/35 transition hover:bg-white/[0.05]"
                      >
                        <MoreIcon />
                      </button>
                      {menuId === post.id && (
                        <div className="absolute right-0 top-10 z-20 min-w-[148px] overflow-hidden rounded-2xl border border-white/10 bg-[#12141a] py-1 shadow-2xl">
                          {editable && (
                            <button
                              type="button"
                              onClick={() => openEdit(post)}
                              className="block w-full px-4 py-2.5 text-left text-[13px] text-white/80"
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

                {/* Text-only */}
                {post.text && !hasMedia && (
                  <p className="whitespace-pre-wrap px-5 pt-3 text-[17px] leading-snug tracking-[-0.015em] text-white/92">
                    {post.text}
                  </p>
                )}

                {/* Photo */}
                {post.photo && (
                  <button
                    type="button"
                    onClick={() => onMediaTap(post)}
                    className="relative mt-3 block w-full overflow-hidden bg-black"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.photo}
                      alt=""
                      className="max-h-[520px] w-full object-cover"
                    />
                    {likeBurst === post.id && (
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span className="like-burst text-white drop-shadow-lg">
                          <HeartIcon filled size={64} />
                        </span>
                      </span>
                    )}
                    {post.text && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-5 pb-4 pt-16 text-left">
                        <p className="text-[14px] leading-snug text-white/95">{post.text}</p>
                      </div>
                    )}
                  </button>
                )}

                {/* Music */}
                {post.track && (
                  <button
                    type="button"
                    onClick={() => togglePlay(post)}
                    className="mx-5 mt-3 flex w-[calc(100%-2.5rem)] items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 text-left"
                    style={{
                      background:
                        playingId === post.id
                          ? "linear-gradient(90deg, rgb(var(--livv-accent) / 0.22), rgba(255,255,255,0.04))"
                          : "rgba(255,255,255,0.04)",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                    }}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        playingId === post.id ? "bg-white text-black" : "bg-livv-accent text-white"
                      )}
                    >
                      {playingId === post.id ? <PauseIcon /> : <PlayIcon />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{post.track.title}</span>
                      <span className="block truncate text-[11px] text-white/40">
                        {post.track.artist}
                        {playingId === post.id ? " · playing" : ""}
                      </span>
                    </span>
                    {playingId === post.id && (
                      <span className="flex h-4 items-end gap-[3px] pr-1">
                        {[0, 1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className="eq-bar w-[3px] rounded-full bg-livv-accent"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                )}

                {/* Actions — fixed icon boxes so nothing clips */}
                <div className="mt-3 flex items-center gap-1 px-3">
                  <button
                    type="button"
                    onClick={() => like(post.id)}
                    className={cn(
                      "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] transition",
                      post.likedByMe ? "text-livv-accent" : "text-white/45"
                    )}
                    aria-label={post.likedByMe ? "Unlike" : "Like"}
                  >
                    <span className="flex h-5 w-5 items-center justify-center">
                      <HeartIcon filled={post.likedByMe} />
                    </span>
                    <span className="min-w-[1ch] tabular-nums">{post.likes}</span>
                  </button>

                  {post.allowReplies ? (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenReplies(openReplies === post.id ? null : post.id)
                      }
                      className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] text-white/45"
                      aria-label="Reply"
                    >
                      <span className="flex h-5 w-5 items-center justify-center">
                        <ReplyIcon />
                      </span>
                      <span className="min-w-[1ch] tabular-nums">{post.replies.length}</span>
                    </button>
                  ) : (
                    <span className="px-3 text-[11px] text-white/25">Replies off</span>
                  )}
                </div>

                {/* Replies */}
                {openReplies === post.id && post.allowReplies && (
                  <div className="mt-2 border-t border-white/[0.05] px-5 pt-3">
                    {post.replies.length === 0 && (
                      <p className="mb-3 text-[12px] text-white/30">No replies yet. Start it.</p>
                    )}
                    {post.replies.map((reply) => (
                      <div key={reply.id} className="mb-3 flex gap-2.5">
                        <Avatar identity={reply.author} size={28} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-white/35">
                            {reply.author.displayName}
                            <span className="mx-1 text-white/15">·</span>
                            {formatSocialTime(reply.createdAt, now)}
                          </p>
                          <p className="text-[13px] leading-snug text-white/80">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-2 flex gap-2 pb-1">
                      <input
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        placeholder="Reply…"
                        className="h-10 flex-1 rounded-full bg-white/[0.05] px-4 text-[13px] outline-none ring-1 ring-white/10 placeholder:text-white/25"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") sendReply(post.id);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => sendReply(post.id)}
                        disabled={!replyDraft.trim()}
                        className="h-10 shrink-0 rounded-full bg-white px-4 text-[12px] font-semibold text-black disabled:opacity-30"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Compose FAB */}
      <button
        type="button"
        onClick={() => {
          setEditingId(null);
          setSheet("compose");
          feedback("tick");
        }}
        className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-[0_10px_40px_rgba(0,0,0,0.55)] transition active:scale-95"
        aria-label="New post"
      >
        <PlusIcon />
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPhoto(e.target.files?.[0])}
      />

      {/* Composer sheet */}
      {(sheet === "compose" || sheet === "edit" || sheet === "sound") && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/80 backdrop-blur-sm">
          <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-[#0c0e12] p-5 pb-10 ring-1 ring-white/10">
            {sheet !== "sound" && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <button type="button" className="text-[13px] text-white/45" onClick={resetComposer}>
                    Close
                  </button>
                  <p className="text-[13px] font-semibold">
                    {sheet === "edit" ? "Edit" : "New pulse"}
                  </p>
                  <button
                    type="button"
                    className={cn(
                      "text-[13px] font-semibold",
                      canSubmit ? "text-livv-accent" : "text-white/25"
                    )}
                    onClick={publish}
                    disabled={!canSubmit}
                  >
                    {sheet === "edit" ? "Save" : "Post"}
                  </button>
                </div>

                {sheet === "edit" && editingId && (
                  <p className="mb-3 text-[11px] text-white/35">
                    {editSecondsLeft(
                      posts.find((p) => p.id === editingId) || posts[0],
                      now
                    )}
                    s left to edit
                  </p>
                )}

                <div className="flex gap-3">
                  {me && <Avatar identity={me} size={40} />}
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onFocus={() => setComposerFocus(true)}
                    placeholder="What’s real right now."
                    rows={composerFocus || text ? 5 : 3}
                    className="flex-1 resize-none bg-transparent text-[17px] leading-snug outline-none placeholder:text-white/25"
                    autoFocus
                  />
                </div>

                {photo && (
                  <div className="relative mt-4 overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt="" className="max-h-72 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute right-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {track && (
                  <div className="mt-3 flex items-center justify-between rounded-full px-4 py-2.5 ring-1 ring-white/10">
                    <p className="truncate text-[13px]">
                      {track.title} · {track.artist}
                    </p>
                    <button
                      type="button"
                      className="shrink-0 text-[11px] text-white/40"
                      onClick={() => setTrack(null)}
                    >
                      Clear
                    </button>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] ring-1 ring-white/15"
                  >
                    <PhotoIcon /> Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setSheet("sound")}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] ring-1 ring-white/15"
                  >
                    <MusicIcon /> Sound
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllowReplies((v) => !v)}
                    className={cn(
                      "rounded-full px-4 py-2 text-[12px] ring-1",
                      allowReplies
                        ? "ring-livv-accent/40 text-livv-accent-soft"
                        : "ring-white/15 text-white/40"
                    )}
                  >
                    {allowReplies ? "Replies on" : "Replies off"}
                  </button>
                </div>
              </>
            )}

            {sheet === "sound" && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    className="text-[13px] text-white/45"
                    onClick={() => setSheet(editingId ? "edit" : "compose")}
                  >
                    Back
                  </button>
                  <p className="text-[13px] font-semibold">LIVV Sound</p>
                  <span className="w-10" />
                </div>
                <div className="space-y-2">
                  {SOUND_LIBRARY.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setTrack(item);
                        setSheet(editingId ? "edit" : "compose");
                        feedback("tick");
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left ring-1",
                        track?.id === item.id
                          ? "bg-livv-accent/10 ring-livv-accent/40"
                          : "ring-white/10"
                      )}
                    >
                      <span>
                        <span className="block text-[13px] font-medium">{item.title}</span>
                        <span className="block text-[11px] text-white/40">{item.artist}</span>
                      </span>
                      <span className="text-[11px] text-white/35">Use</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .like-burst {
          animation: burst 0.5s ease-out forwards;
        }
        @keyframes burst {
          0% {
            opacity: 0;
            transform: scale(0.35);
          }
          40% {
            opacity: 1;
            transform: scale(1.12);
          }
          100% {
            opacity: 0;
            transform: scale(1.35);
          }
        }
        .eq-bar {
          height: 6px;
          animation: eq 0.55s ease-in-out infinite alternate;
        }
        @keyframes eq {
          from {
            height: 4px;
          }
          to {
            height: 14px;
          }
        }
      `}</style>
    </main>
  );
}

/* Icons — fixed viewBox, never clipped */
function HeartIcon({ filled, size = 20 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} aria-hidden>
      <path
        d="M12 20s-7-4.35-9.15-8.05C1.2 9.15 2.35 6.1 5.4 5.55c1.75-.3 3.35.55 4.35 1.85C10.75 6.1 12.35 5.25 14.1 5.55c3.05.55 4.2 3.6 2.55 6.4C19 15.65 12 20 12 20z"
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.75}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5L8 5.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 5h3v14H7V5zm7 0h3v14h-3V5z" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 6h16v12H4V6z" strokeLinejoin="round" />
      <path d="m4 8 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="m21 15-4.5-4.5L9 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MusicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
