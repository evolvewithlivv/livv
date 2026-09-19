"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Camera,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
  Send,
  Video,
  X,
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
    setComposer(false);
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

  const pickVideo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhoto(null);
    try {
      setVideo(await fileToPostVideo(file));
    } catch {
      setVideo(null);
    }

    if (videoRef.current) videoRef.current.value = "";
  };

  const edit = (post: Post) => {
    setEditing(post.id);
    setText(post.text);
    setPhoto(post.photo);
    setVideo(post.video);
    setComposer(true);
  };

  const openComposer = () => {
    setEditing(null);
    setText("");
    setPhoto(null);
    setVideo(null);
    setComposer(true);
  };

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
          <div className="border-y border-[var(--livv-pro-line)]" role="tablist">
            <div className="grid grid-cols-3">
              {(["For you", "Following", "Watch"] as Tab[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  role="tab"
                  aria-selected={tab === item}
                  className="relative min-h-12 text-[11px] font-semibold"
                >
                  <span
                    className={
                      tab === item
                        ? "text-[var(--livv-pro-ink)]"
                        : "text-[var(--livv-pro-muted)]"
                    }
                  >
                    {item}
                  </span>
                  {tab === item ? (
                    <span className="absolute inset-x-8 bottom-0 h-0.5 rounded-full bg-[var(--livv-pro-accent)]" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {tab !== "Watch" ? (
            <button
              type="button"
              onClick={openComposer}
              className="group flex w-full items-center gap-3 border-b border-[var(--livv-pro-line)] py-5 text-left"
            >
              <Avatar
                identity={
                  me
                    ? {
                        displayName: me.displayName,
                        photo: me.photo,
                        accent: me.accent,
                        tier: me.tier,
                      }
                    : {
                        displayName: "You",
                        photo: null,
                        accent: "#1769ff",
                        tier: "spark",
                      }
                }
                size={42}
                fit="contain"
              />
              <span className="min-w-0 flex-1 text-[14px] text-[var(--livv-pro-muted)]">
                What are you working on?
              </span>
              <span className="rounded-full bg-[var(--livv-pro-ink)] px-4 py-2.5 text-[10px] font-bold text-[var(--livv-pro-bg)] transition-transform group-active:scale-95">
                POST
              </span>
            </button>
          ) : null}

          <div>
            {filtered.map((post) => (
              <article
                key={post.id}
                className="border-b border-[var(--livv-pro-line)] py-6"
              >
                <div className="flex items-start gap-3">
                  <Avatar identity={post.author} size={44} fit="contain" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13px] font-semibold">
                        {post.author.displayName}
                      </p>
                      <span className="text-[10px] text-[var(--livv-pro-muted)]">
                        @{post.author.username}
                      </span>
                    </div>

                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--livv-pro-muted)]">
                      <span>{formatSocialTime(post.createdAt, Date.now())}</span>
                      {post.editedAt ? <span>· edited</span> : null}
                      <span>·</span>
                      <span className="capitalize">{post.kind}</span>
                    </div>
                  </div>

                  {me?.username === post.author.username ? (
                    <button
                      type="button"
                      onClick={() => edit(post)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[var(--livv-pro-muted)]"
                      aria-label="Edit post"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  ) : null}
                </div>

                {post.text ? (
                  <p className="mt-4 text-[16px] leading-7 tracking-[-.01em]">
                    {post.text}
                  </p>
                ) : null}

                {post.photo && tab !== "Watch" ? (
                  <div className="mt-5 overflow-hidden rounded-[22px] border border-[var(--livv-pro-line)] bg-black">
                    <img
                      src={post.photo}
                      alt="Post media"
                      className="block max-h-[620px] w-full object-cover"
                    />
                  </div>
                ) : null}

                {post.video ? (
                  <div className="relative mt-5 overflow-hidden rounded-[22px] border border-[var(--livv-pro-line)] bg-black">
                    {tab === "Watch" ? (
                      <span className="absolute left-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
                        <Play size={15} fill="currentColor" />
                      </span>
                    ) : null}
                    <video
                      src={post.video}
                      controls
                      playsInline
                      className={
                        tab === "Watch"
                          ? "block max-h-[72vh] min-h-[320px] w-full object-contain"
                          : "block max-h-[620px] w-full object-contain"
                      }
                    />
                  </div>
                ) : null}

                <div className="mt-4 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => like(post.id)}
                    className={
                      "flex min-h-9 items-center gap-1.5 rounded-full px-2 text-[11px] transition " +
                      (post.likedByMe
                        ? "text-[var(--livv-pro-accent)]"
                        : "text-[var(--livv-pro-muted)]")
                    }
                    aria-label="Like post"
                  >
                    <Heart
                      size={17}
                      fill={post.likedByMe ? "currentColor" : "none"}
                    />
                    {post.likes}
                  </button>

                  {post.allowReplies ? (
                    <button
                      type="button"
                      onClick={() =>
                        setReplying(replying === post.id ? null : post.id)
                      }
                      className="flex min-h-9 items-center gap-1.5 rounded-full px-2 text-[11px] text-[var(--livv-pro-muted)]"
                      aria-label="Reply to post"
                    >
                      <MessageCircle size={17} />
                      {post.replies.length}
                    </button>
                  ) : null}

                  {me?.username === post.author.username ? (
                    <button
                      type="button"
                      onClick={() => setPosts(deletePost(post.id))}
                      className="ml-auto min-h-9 px-2 text-[11px] text-[var(--livv-pro-muted)]"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>

                {tab !== "Watch" &&
                (post.replies.length > 0 || replying === post.id) ? (
                  <div className="ml-3 mt-5 border-l border-[var(--livv-pro-line)] pl-4">
                    <p className="mb-3 text-[9px] font-semibold uppercase tracking-[.18em] text-[var(--livv-pro-muted)]">
                      Replies
                    </p>

                    <div className="space-y-4">
                      {post.replies.map((replyItem) => (
                        <div key={replyItem.id} className="flex items-start gap-2.5">
                          <Avatar identity={replyItem.author} size={28} fit="contain" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold">
                                {replyItem.author.displayName}
                              </span>
                              <span className="text-[9px] text-[var(--livv-pro-muted)]">
                                @{replyItem.author.username} ·{" "}
                                {formatSocialTime(replyItem.createdAt, Date.now())}
                              </span>
                            </div>
                            <p className="mt-1.5 text-[12px] leading-5 text-[var(--livv-pro-muted)]">
                              {replyItem.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {replying === post.id ? (
                      <div className="mt-4 flex items-center gap-2">
                        <Avatar
                          identity={
                            me
                              ? {
                                  displayName: me.displayName,
                                  photo: me.photo,
                                  accent: me.accent,
                                  tier: me.tier,
                                }
                              : {
                                  displayName: "You",
                                  photo: null,
                                  accent: "#1769ff",
                                  tier: "spark",
                                }
                          }
                          size={28}
                          fit="contain"
                        />
                        <input
                          autoFocus
                          value={replyText}
                          onChange={(event) => setReplyText(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") reply(post.id);
                          }}
                          placeholder="Write a reply"
                          aria-label="Write a reply"
                          className="min-w-0 flex-1 rounded-full border border-[var(--livv-pro-line)] bg-[var(--livv-pro-surface-2)] px-4 py-2.5 text-[11px] outline-none placeholder:text-[var(--livv-pro-muted)]"
                        />
                        <button
                          type="button"
                          onClick={() => reply(post.id)}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--livv-pro-ink)] text-[var(--livv-pro-bg)]"
                          aria-label="Send reply"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}

            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[22px] font-semibold">Nothing here yet.</p>
                <p className="mx-auto mt-2 max-w-[34ch] text-[12px] leading-5 text-[var(--livv-pro-muted)]">
                  {tab === "Watch"
                    ? "Be the first person to share a video."
                    : "Share the first update and start the conversation."}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {composer ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 p-3 backdrop-blur-md"
          onClick={() => setComposer(false)}
        >
          <div
            className="w-full max-w-xl rounded-[28px] border border-[var(--livv-pro-line)] bg-[var(--livv-pro-surface)] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--livv-pro-line)] pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[var(--livv-pro-accent)]">
                  {editing ? "Edit post" : "Create post"}
                </p>
                <h2 className="mt-1 text-[22px] font-semibold">Say something real.</h2>
              </div>
              <button
                type="button"
                onClick={() => setComposer(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--livv-pro-line)]"
                aria-label="Close composer"
              >
                <X size={17} />
              </button>
            </div>

            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="What are you building, learning, training, or thinking about?"
              aria-label="Post text"
              className="mt-5 min-h-36 w-full resize-none border-b border-[var(--livv-pro-line)] bg-transparent p-1 text-[15px] leading-relaxed outline-none placeholder:text-[var(--livv-pro-muted)]"
            />

            {photo || video ? (
              <div className="mt-4 overflow-hidden rounded-[18px] border border-[var(--livv-pro-line)]">
                {photo ? (
                  <img src={photo} alt="Preview" className="max-h-56 w-full object-cover" />
                ) : null}
                {video ? <video src={video} controls className="max-h-56 w-full" /> : null}
              </div>
            ) : null}

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className="flex items-center gap-2 rounded-full border border-[var(--livv-pro-line)] px-4 py-2.5 text-[11px]"
              >
                <Camera size={15} />
                Photo
              </button>
              <button
                type="button"
                onClick={() => videoRef.current?.click()}
                className="flex items-center gap-2 rounded-full border border-[var(--livv-pro-line)] px-4 py-2.5 text-[11px]"
              >
                <Video size={15} />
                Video
              </button>
              <button
                type="button"
                onClick={submit}
                className="ml-auto rounded-full bg-[var(--livv-pro-ink)] px-5 py-2.5 text-[11px] font-bold text-[var(--livv-pro-bg)]"
              >
                {editing ? "Save" : "Post"}
              </button>
            </div>

            <input ref={photoRef} type="file" accept="image/*" onChange={pickPhoto} className="hidden" />
            <input ref={videoRef} type="file" accept="video/*" onChange={pickVideo} className="hidden" />
          </div>
        </div>
      ) : null}
    </main>
  );
}
