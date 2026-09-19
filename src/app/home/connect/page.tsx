"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import {
  Camera,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
  Send,
  Video,
} from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Avatar } from "@/components/identity/avatar";
import { loadIdentity, type Identity } from "@/lib/identity";
import {
  createPost,
  deletePost,
  fileToPostPhoto,
  fileToPostVideo,
  formatSocialTime,
  loadPosts,
  savePosts,
  updatePost,
  type Post,
} from "@/lib/social";
import { feedback } from "@/lib/sensory";

type Tab = "For you" | "Following" | "Watch";

export default function SocialPage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<Tab>("For you");
  const [composerOpen, setComposerOpen] = useState(false);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [replying, setReplying] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const composerRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => {
      setMe(loadIdentity());
      setPosts(loadPosts());
    };
    sync();
    window.addEventListener("livv-social", sync);
    window.addEventListener("livv-identity", sync);
    return () => {
      window.removeEventListener("livv-social", sync);
      window.removeEventListener("livv-identity", sync);
    };
  }, []);

  useEffect(() => {
    if (!composerOpen) return;
    requestAnimationFrame(() => composerRef.current?.focus());
  }, [composerOpen]);

  useEffect(() => {
    if (!replying) return;
    requestAnimationFrame(() => replyRef.current?.focus());
  }, [replying]);

  const filtered = useMemo(
    () =>
      posts.filter((post) =>
        tab === "For you"
          ? true
          : tab === "Following"
            ? post.author.username === me?.username
            : Boolean(post.video),
      ),
    [posts, tab, me],
  );

  const submit = () => {
    if (!me || (!text.trim() && !photo && !video)) return;

    if (editing) {
      setPosts(updatePost(editing, { text: text.trim(), photo, video }));
    } else {
      createPost({
        text: text.trim(),
        photo,
        video,
        track: null,
        allowReplies: true,
      });
      setPosts(loadPosts());
    }

    setText("");
    setPhoto(null);
    setVideo(null);
    setEditing(null);
    setComposerOpen(false);
    feedback("complete");
  };

  const like = (id: string) => {
    const next = posts.map((post) =>
      post.id === id
        ? {
            ...post,
            likes: post.likes + (post.likedByMe ? -1 : 1),
            likedByMe: !post.likedByMe,
          }
        : post,
    );
    savePosts(next);
    setPosts(next);
  };

  const reply = (id: string) => {
    if (!me || !replyText.trim()) return;

    const next = posts.map((post) =>
      post.id === id
        ? {
            ...post,
            replies: [
              ...post.replies,
              {
                id: crypto.randomUUID(),
                author: {
                  displayName: me.displayName,
                  username: me.username,
                  photo: me.photo,
                  accent: me.accent,
                },
                text: replyText.trim(),
                createdAt: Date.now(),
              },
            ],
          }
        : post,
    );

    savePosts(next);
    setPosts(next);
    setReplyText("");
    setReplying(null);
    feedback("tick");
  };

  const pickPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVideo(null);
    try {
      setPhoto(await fileToPostPhoto(file));
    } catch {
      setPhoto(null);
    }
    if (photoRef.current) photoRef.current.value = "";
  };

  const pickMedia = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("video/")) {
      setPhoto(null);
      try { setVideo(await fileToPostVideo(file)); } catch { setVideo(null); }
    } else if (file.type.startsWith("image/")) {
      setVideo(null);
      try { setPhoto(await fileToPostPhoto(file)); } catch { setPhoto(null); }
    }
    if (videoRef.current) videoRef.current.value = "";
  };

  const sharePost = async (post: Post) => {
    const url = `${window.location.origin}/home/connect/post/${post.id}`;
    if (navigator.share) { try { await navigator.share({ title: `${post.author.displayName} on LIVV`, text: post.text || "A post from LIVV Community", url }); } catch {} }
    else { await navigator.clipboard?.writeText(url); }
    setMenuOpen(null);
  };

  const savePostToDevice = async (post: Post) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080; canvas.height = 1350;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#f7f7f5"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111111"; ctx.font = "600 42px Arial"; ctx.fillText("LIVV", 72, 92);
    ctx.font = "600 34px Arial"; ctx.fillText(post.author.displayName.slice(0, 32), 72, 170);
    ctx.fillStyle = "#666666"; ctx.font = "24px Arial"; ctx.fillText(`@${post.author.username} · ${formatSocialTime(post.createdAt, Date.now())}`, 72, 208);
    ctx.fillStyle = "#111111"; ctx.font = "34px Arial";
    const words = (post.text || "LIVV Community").split(" "); let line = "", y = 310;
    for (const word of words) { const test = line ? `${line} ${word}` : word; if (ctx.measureText(test).width > 900) { ctx.fillText(line, 72, y); y += 52; line = word; } else line = test; }
    if (line) ctx.fillText(line, 72, y);
    if (post.photo) { try { const img = new Image(); img.crossOrigin = "anonymous"; img.src = post.photo; await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject();}); const scale=Math.min(900/img.width,700/img.height); ctx.drawImage(img,72,y+50,img.width*scale,img.height*scale); } catch {} }
    canvas.toBlob((blob)=>{ if(!blob)return; const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`livv-post-${post.id}.png`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); },"image/png");
    setMenuOpen(null);
  };

  const edit = (post: Post) => {
    setEditing(post.id);
    setText(post.text);
    setPhoto(post.photo);
    setVideo(post.video);
    setComposerOpen(true);
  };

  const openComposer = () => {
    setEditing(null);
    setText("");
    setPhoto(null);
    setVideo(null);
    setComposerOpen(true);
  };

  const avatarIdentity = me
    ? { displayName: me.displayName, photo: me.photo, accent: me.accent, tier: me.tier }
    : { displayName: "You", photo: null, accent: "#1769ff", tier: "spark" as const };

  return (
    <main className="livv-social-page min-h-full pb-28">
      <div className="mx-auto w-full max-w-xl px-5 sm:px-6">
        <PageHero
          eyebrow="Connect"
          title="Community"
          subtitle={
            tab === "Watch"
              ? "Watch what the LIVV community is sharing."
              : "Share the work. Follow the people. Keep moving."
          }
        />

        <section className="pt-5" aria-label="Community feed">
          <div className="livv-connect-tabs" role="tablist">
            <div className="grid grid-cols-3">
              {(["For you", "Following", "Watch"] as Tab[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  role="tab"
                  aria-selected={tab === item}
                  className="relative min-h-12 text-[12px] font-semibold"
                >
                  <span className={tab === item ? "text-[var(--livv-pro-ink)]" : "text-[var(--livv-pro-muted)]"}>
                    {item}
                  </span>
                  {tab === item ? (
                    <span className="absolute inset-x-10 bottom-0 h-0.5 rounded-full bg-[var(--livv-pro-accent)]" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {tab !== "Watch" ? (
            <div className="livv-connect-composer">
              <Avatar identity={avatarIdentity} size={44} fit="contain" />
              <div className="min-w-0 flex-1">
                <textarea
                  ref={composerRef}
                  value={text}
                  onFocus={() => setComposerOpen(true)}
                  onChange={(event) => setText(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") submit();
                  }}
                  rows={composerOpen ? 3 : 1}
                  placeholder="What are you working on?"
                  aria-label="Create a post"
                  className="livv-connect-composer-input"
                />
                {composerOpen ? (
                  <>
                    {photo || video ? (
                      <div className="mt-3 overflow-hidden rounded-[16px] border border-[var(--livv-pro-line)]">
                        {photo ? <img src={photo} alt="Post preview" className="max-h-48 w-full object-cover" /> : null}
                        {video ? <video src={video} controls className="max-h-48 w-full" /> : null}
                      </div>
                    ) : null}
                    <div className="mt-3 flex items-center gap-2">
                      <button type="button" onClick={() => photoRef.current?.click()} className="livv-connect-media-button">
                        <Camera size={15} /> Photo
                      </button>
                      <button type="button" onClick={() => videoRef.current?.click()} className="livv-connect-media-button">
                        <Video size={15} /> Video
                      </button>
                      <button type="button" onClick={submit} className="ml-auto rounded-full bg-[var(--livv-pro-ink)] px-5 py-2.5 text-[11px] font-bold text-[var(--livv-pro-bg)]">
                        {editing ? "Save" : "Post"}
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
              {!composerOpen ? (
                <button type="button" onClick={openComposer} className="rounded-full bg-[var(--livv-pro-ink)] px-5 py-2.5 text-[10px] font-bold text-[var(--livv-pro-bg)]">
                  POST
                </button>
              ) : null}
            </div>
          ) : null}

          <div>
            {filtered.map((post) => {
              const previewReplies = post.replies.slice(0, 5);
              const hasMoreReplies = post.replies.length > 5;

              return (
                <article key={post.id} className="livv-connect-post">
                  <Link href={`/home/connect/post/${post.id}`} className="block">
                    <div className="flex items-start gap-3">
                      <Avatar identity={post.author} size={44} fit="contain" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[13px] font-semibold">{post.author.displayName}</p>
                          <span className="text-[10px] text-[var(--livv-pro-muted)]">@{post.author.username}</span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--livv-pro-muted)]">
                          <span>{formatSocialTime(post.createdAt, Date.now())}</span>
                          {post.editedAt ? <span>· edited</span> : null}
                        </div>
                      </div>
                      {me?.username === post.author.username ? (
                        <button
                          type="button"
                          onClick={(event) => { event.preventDefault(); event.stopPropagation(); edit(post); }}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--livv-pro-muted)]"
                          aria-label="Edit post"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      ) : null}
                    </div>

                    {post.text ? <p className="mt-4 text-[16px] leading-7 tracking-[-.01em]">{post.text}</p> : null}

                    {post.photo && tab !== "Watch" ? (
                      <div className="mt-5 overflow-hidden rounded-[20px] bg-black">
                        <img src={post.photo} alt="Post media" className="block max-h-[620px] w-full object-cover" />
                      </div>
                    ) : null}

                    {post.video ? (
                      <div className="relative mt-5 overflow-hidden rounded-[20px] bg-black">
                        {tab === "Watch" ? (
                          <span className="absolute left-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white">
                            <Play size={15} fill="currentColor" />
                          </span>
                        ) : null}
                        <video src={post.video} controls playsInline className={tab === "Watch" ? "block max-h-[72vh] min-h-[320px] w-full object-contain" : "block max-h-[620px] w-full object-contain"} onClick={(event) => event.stopPropagation()} />
                      </div>
                    ) : null}
                  </Link>

                  <div className="mt-3 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => like(post.id)}
                      className={"livv-connect-action " + (post.likedByMe ? "is-liked" : "")}
                      aria-label="Like post"
                    >
                      <Heart size={18} fill={post.likedByMe ? "currentColor" : "none"} />
                      <span>{post.likes}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplying(replying === post.id ? null : post.id)}
                      className="livv-connect-action"
                      aria-label="Reply to post"
                    >
                      <MessageCircle size={18} />
                      <span>{post.replies.length}</span>
                    </button>
                    {hasMoreReplies ? (
                      <Link href={`/home/connect/post/${post.id}`} className="ml-2 text-[11px] font-semibold text-[var(--livv-pro-accent)]">
                        View all {post.replies.length} replies
                      </Link>
                    ) : null}
                    {me?.username === post.author.username ? (
                      <button type="button" onClick={() => setPosts(deletePost(post.id))} className="ml-auto min-h-9 px-2 text-[11px] text-[var(--livv-pro-muted)]">
                        Delete
                      </button>
                    ) : null}
                  </div>

                  {post.replies.length > 0 ? (
                    <div className="livv-connect-replies !ml-0 !pl-0">
                      <p className="mb-3 text-[9px] font-semibold uppercase tracking-[.18em] text-[var(--livv-pro-muted)]">
                        Latest replies
                      </p>
                      <div className="space-y-4">
                        {previewReplies.map((replyItem) => (
                          <div key={replyItem.id} className="flex items-start gap-2.5">
                            <Avatar identity={replyItem.author} size={28} fit="contain" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold">{replyItem.author.displayName}</span>
                                <span className="text-[9px] text-[var(--livv-pro-muted)]">
                                  @{replyItem.author.username} · {formatSocialTime(replyItem.createdAt, Date.now())}
                                </span>
                              </div>
                              <p className="mt-1.5 text-[12px] leading-5 text-[var(--livv-pro-muted)]">{replyItem.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {replying === post.id ? (
                    <div className="livv-connect-reply-composer">
                      <Avatar identity={avatarIdentity} size={28} fit="contain" />
                      <input
                        ref={replyRef}
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        onKeyDown={(event) => { if (event.key === "Enter") reply(post.id); }}
                        placeholder="Post your reply"
                        aria-label="Post your reply"
                        className="livv-connect-reply-input"
                      />
                      <button type="button" onClick={() => reply(post.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--livv-pro-ink)] text-[var(--livv-pro-bg)]" aria-label="Send reply">
                        <Send size={14} />
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}

            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[22px] font-semibold">Nothing here yet.</p>
                <p className="mx-auto mt-2 max-w-[34ch] text-[12px] leading-5 text-[var(--livv-pro-muted)]">
                  {tab === "Watch" ? "Be the first person to share a video." : "Share the first update and start the conversation."}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <input ref={photoRef} type="file" accept="image/*" onChange={pickPhoto} className="hidden" />
      <input ref={videoRef} type="file" accept="video/*" onChange={pickMedia} className="hidden" />
    </main>
  );
}
