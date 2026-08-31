"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
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

type Sheet = "closed" | "compose" | "sound" | "edit";

export default function ConnectPage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sheet, setSheet] = useState<Sheet>("closed");
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMe(loadIdentity());
    setPosts(loadPosts());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
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
    void audioRef.current.play();
    setPlayingId(post.id);
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

  const sendReply = (id: string) => {
    if (!me || !replyDraft.trim()) return;
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
    setPhoto(await fileToPostPhoto(file));
    setSheet(editingId ? "edit" : "compose");
  };

  const feed = useMemo(
    () => [...posts].sort((a, b) => b.createdAt - a.createdAt),
    [posts]
  );

  const isMine = (post: Post) => me && post.author.username === me.username;

  return (
    <main className="pt-7 pb-8">
      <Container>
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
              The room
            </p>
            <h1 className="mt-1 text-[30px] font-semibold tracking-tight">Connect</h1>
          </div>
          {me && <Avatar identity={me} size={36} />}
        </header>

        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setSheet("compose");
          }}
          className="mb-5 flex w-full items-center gap-3 rounded-[22px] border border-livv-border bg-livv-surface px-4 py-3 text-left"
        >
          {me && <Avatar identity={me} size={36} />}
          <span className="text-sm text-white/35">Say it, or show it.</span>
        </button>

        <div className="space-y-4">
          {feed.map((post) => {
            const mine = Boolean(isMine(post));
            const editable = mine && canEditPost(post, now);
            const seconds = editSecondsLeft(post, now);

            return (
              <article
                key={post.id}
                className="overflow-hidden rounded-[24px] border border-livv-border bg-livv-surface"
              >
                <div className="flex items-center gap-3 px-4 pt-4">
                  <Avatar identity={post.author} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {post.author.displayName}
                    </p>
                    <p className="text-[12px] text-white/35">
                      @{post.author.username} · {formatSocialTime(post.createdAt, now)}
                      {post.editedAt ? " · edited" : ""}
                    </p>
                  </div>
                  {mine && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMenuId(menuId === post.id ? null : post.id)}
                        className="px-2 text-lg leading-none text-white/40"
                        aria-label="Post actions"
                      >
                        ⋯
                      </button>
                      {menuId === post.id && (
                        <div className="absolute right-0 top-7 z-10 min-w-[148px] overflow-hidden rounded-2xl border border-livv-border bg-[#111113] py-1 shadow-xl">
                          {editable && (
                            <button
                              type="button"
                              onClick={() => openEdit(post)}
                              className="block w-full px-4 py-2.5 text-left text-sm"
                            >
                              Edit · {seconds}s
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => remove(post.id)}
                            className="block w-full px-4 py-2.5 text-left text-sm text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {post.text && (
                  <p className="whitespace-pre-wrap px-4 pt-3 text-[16px] leading-relaxed tracking-[-0.016em]">
                    {post.text}
                  </p>
                )}

                {post.photo && (
                  <div className="relative mt-3 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.photo} alt="" className="max-h-[420px] w-full object-cover" />
                  </div>
                )}

                {post.track && (
                  <button
                    type="button"
                    onClick={() => togglePlay(post)}
                    className="mx-4 mt-3 flex w-[calc(100%-2rem)] items-center gap-3 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-left"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-livv-accent text-xs font-semibold">
                      {playingId === post.id ? "||" : "▶"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">
                        {post.track.title}
                      </span>
                      <span className="block truncate text-[11px] text-white/40">
                        {post.track.artist}
                      </span>
                    </span>
                  </button>
                )}

                <div className="flex items-center gap-5 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => like(post.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[13px]",
                      post.likedByMe ? "text-livv-accent" : "text-white/50"
                    )}
                    aria-label="Like"
                  >
                    <HeartIcon filled={post.likedByMe} />
                    {post.likes}
                  </button>
                  {post.allowReplies ? (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenReplies(openReplies === post.id ? null : post.id)
                      }
                      className="inline-flex items-center gap-1.5 text-[13px] text-white/50"
                      aria-label="Reply"
                    >
                      <ReplyIcon />
                      {post.replies.length}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-white/25">
                      <ReplyIcon />
                    </span>
                  )}
                </div>

                {openReplies === post.id && post.allowReplies && (
                  <div className="border-t border-white/5 px-4 py-3">
                    {post.replies.map((reply) => (
                      <div key={reply.id} className="mb-3 flex gap-2.5">
                        <Avatar identity={reply.author} size={28} />
                        <div>
                          <p className="text-[12px] text-white/40">
                            {reply.author.displayName} · {formatSocialTime(reply.createdAt, now)}
                          </p>
                          <p className="text-sm leading-snug">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-2 flex gap-2">
                      <input
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        placeholder="Reply"
                        className="h-10 flex-1 rounded-full border border-livv-border bg-black/30 px-4 text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => sendReply(post.id)}
                        className="h-10 rounded-full bg-white px-4 text-sm font-medium text-black"
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
      </Container>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPhoto(e.target.files?.[0])}
      />

      {(sheet === "compose" || sheet === "edit" || sheet === "sound") && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/70">
          <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-livv-border bg-[#0c0c0e] p-5 pb-8">
            {sheet !== "sound" && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <button className="text-sm text-white/45" onClick={resetComposer}>
                    Close
                  </button>
                  <p className="text-sm font-semibold">
                    {sheet === "edit" ? "Edit post" : "New post"}
                  </p>
                  <button
                    className={cn(
                      "text-sm font-semibold",
                      canSubmit ? "text-livv-accent" : "text-white/25"
                    )}
                    onClick={publish}
                    disabled={!canSubmit}
                  >
                    {sheet === "edit" ? "Save" : "Post"}
                  </button>
                </div>

                {sheet === "edit" && editingId && (
                  <p className="mb-3 text-[12px] text-white/35">
                    {editSecondsLeft(
                      posts.find((p) => p.id === editingId) || posts[0],
                      now
                    )}
                    s left to edit
                  </p>
                )}

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What’s in your head."
                  rows={5}
                  className="w-full resize-none bg-transparent text-[20px] leading-snug outline-none placeholder:text-white/25"
                />

                {photo && (
                  <div className="relative mt-3 overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt="" className="max-h-64 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {track && (
                  <div className="mt-3 flex items-center justify-between rounded-full border border-white/10 px-4 py-2">
                    <p className="text-sm">
                      {track.title} · {track.artist}
                    </p>
                    <button className="text-xs text-white/40" onClick={() => setTrack(null)}>
                      Clear
                    </button>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-full border border-livv-border px-4 py-2 text-sm"
                  >
                    Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setSheet("sound")}
                    className="rounded-full border border-livv-border px-4 py-2 text-sm"
                  >
                    Sound
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllowReplies((v) => !v)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm",
                      allowReplies
                        ? "border-livv-accent/40 text-livv-accent-soft"
                        : "border-livv-border text-white/40"
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
                    className="text-sm text-white/45"
                    onClick={() => setSheet(editingId ? "edit" : "compose")}
                  >
                    Back
                  </button>
                  <p className="text-sm font-semibold">LIVV Sound</p>
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
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left",
                        track?.id === item.id
                          ? "border-livv-accent bg-livv-accent/10"
                          : "border-livv-border bg-livv-surface"
                      )}
                    >
                      <span>
                        <span className="block text-sm font-medium">{item.title}</span>
                        <span className="block text-xs text-white/40">{item.artist}</span>
                      </span>
                      <span className="text-xs text-white/35">Use</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20s-7-4.4-9.2-8.2C1.2 9.2 2.4 6 5.6 5.4c1.8-.3 3.4.5 4.4 1.8C11 5.9 12.6 5.1 14.4 5.4c3.2.6 4.4 3.8 2.8 6.4C19 15.6 12 20 12 20z" strokeLinejoin="round" />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 12a7 7 0 01-7 7H8l-4 3v-5.2A7 7 0 0111 5h2a7 7 0 017 7z" strokeLinejoin="round" />
    </svg>
  );
}
