"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/identity/avatar";
import { cn } from "@/lib/utils";
import { loadIdentity, type Identity } from "@/lib/identity";
import {
  SOUND_LIBRARY,
  createPost,
  fileToPostPhoto,
  formatSocialTime,
  loadPosts,
  savePosts,
  type Post,
  type Track,
} from "@/lib/social";

type Sheet = "closed" | "compose" | "sound";

export default function ConnectPage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sheet, setSheet] = useState<Sheet>("closed");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [allowReplies, setAllowReplies] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [openReplies, setOpenReplies] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMe(loadIdentity());
    setPosts(loadPosts());
  }, []);

  const canPost = text.trim().length > 0 || Boolean(photo);

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

  const publish = () => {
    if (!canPost) return;
    const post = createPost({
      text,
      photo,
      track,
      allowReplies,
    });
    setPosts(loadPosts());
    setText("");
    setPhoto(null);
    setTrack(null);
    setAllowReplies(true);
    setSheet("closed");
    void post;
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
    setSheet("compose");
  };

  const feed = useMemo(
    () => [...posts].sort((a, b) => b.createdAt - a.createdAt),
    [posts]
  );

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
          onClick={() => setSheet("compose")}
          className="mb-5 flex w-full items-center gap-3 rounded-[22px] border border-livv-border bg-livv-surface px-4 py-3 text-left"
        >
          {me && <Avatar identity={me} size={36} />}
          <span className="text-sm text-white/35">Say it, or show it.</span>
        </button>

        <div className="space-y-4">
          {feed.map((post) => (
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
                    @{post.author.username} · {formatSocialTime(post.createdAt)}
                  </p>
                </div>
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

              <div className="flex items-center gap-5 px-4 py-3 text-[13px]">
                <button
                  type="button"
                  onClick={() => like(post.id)}
                  className={post.likedByMe ? "font-semibold text-livv-accent" : "text-white/50"}
                >
                  {post.likedByMe ? "Liked" : "Like"} {post.likes}
                </button>
                {post.allowReplies ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenReplies(openReplies === post.id ? null : post.id)
                    }
                    className="text-white/50"
                  >
                    Reply {post.replies.length}
                  </button>
                ) : (
                  <span className="text-white/25">Replies off</span>
                )}
              </div>

              {openReplies === post.id && post.allowReplies && (
                <div className="border-t border-white/5 px-4 py-3">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="mb-3 flex gap-2.5">
                      <Avatar identity={reply.author} size={28} />
                      <div>
                        <p className="text-[12px] text-white/40">
                          {reply.author.displayName} · {formatSocialTime(reply.createdAt)}
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
          ))}
        </div>
      </Container>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPhoto(e.target.files?.[0])}
      />

      {sheet !== "closed" && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/70">
          <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-livv-border bg-[#0c0c0e] p-5 pb-8">
            {sheet === "compose" && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <button className="text-sm text-white/45" onClick={() => setSheet("closed")}>
                    Close
                  </button>
                  <p className="text-sm font-semibold">New post</p>
                  <button
                    className={cn(
                      "text-sm font-semibold",
                      canPost ? "text-livv-accent" : "text-white/25"
                    )}
                    onClick={publish}
                    disabled={!canPost}
                  >
                    Post
                  </button>
                </div>

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
                  <button className="text-sm text-white/45" onClick={() => setSheet("compose")}>
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
                        setSheet("compose");
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
                <p className="mt-4 text-[11px] leading-relaxed text-white/30">
                  This is LIVV’s own library, stored on the post the same way a track chip is stored
                  on IG. Licensed catalogs come later.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
