"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Send, Share2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/identity/avatar";
import { loadIdentity, type Identity } from "@/lib/identity";
import { formatSocialTime, loadPosts, savePosts, type Post } from "@/lib/social";
import { feedback } from "@/lib/sensory";

export default function SocialPostPage() {
  const params = useParams<{ id: string }>();
  const [me, setMe] = useState<Identity | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const sync = () => {
      const found = loadPosts().find((item) => item.id === params.id) ?? null;
      setMe(loadIdentity());
      setPost(found);
    };
    sync();
    window.addEventListener("livv-social", sync);
    window.addEventListener("livv-identity", sync);
    return () => {
      window.removeEventListener("livv-social", sync);
      window.removeEventListener("livv-identity", sync);
    };
  }, [params.id]);

  const avatarIdentity = useMemo(
    () =>
      me
        ? { displayName: me.displayName, photo: me.photo, accent: me.accent, tier: me.tier }
        : { displayName: "You", photo: null, accent: "#1769ff", tier: "spark" as const },
    [me],
  );

  const like = () => {
    if (!post) return;
    const next = {
      ...post,
      likes: post.likes + (post.likedByMe ? -1 : 1),
      likedByMe: !post.likedByMe,
    };
    const posts = loadPosts().map((item) => item.id === post.id ? next : item);
    savePosts(posts);
    setPost(next);
  };

  const reply = () => {
    if (!post || !me || !replyText.trim()) return;
    const next: Post = {
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
    };
    savePosts(loadPosts().map((item) => item.id === post.id ? next : item));
    setPost(next);
    setReplyText("");
    feedback("tick");
  };

  if (!post) {
    return (
      <main className="livv-page min-h-full pb-28">
        <div className="mx-auto max-w-xl px-5 pt-6">
          <Link href="/home/connect" className="inline-flex items-center gap-2 text-sm text-[var(--livv-pro-muted)]">
            <ArrowLeft size={18} /> Back to Community
          </Link>
          <div className="py-20 text-center">
            <h1 className="text-2xl font-semibold">Post not found.</h1>
            <p className="mt-2 text-sm text-[var(--livv-pro-muted)]">This post may have been removed from this device.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="livv-page min-h-full pb-28">
      <div className="mx-auto max-w-xl px-5">
        <header className="flex items-center justify-between py-4">
          <Link href="/home/connect" className="grid h-10 w-10 place-items-center rounded-full text-[var(--livv-pro-muted)]" aria-label="Back to Community">
            <ArrowLeft size={21} />
          </Link>
          <p className="text-[15px] font-semibold">Post</p>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full text-[var(--livv-pro-muted)]" aria-label="Post options">
            <MoreHorizontal size={19} />
          </button>
        </header>

        <article className="py-6">
          <div className="flex items-start gap-3">
            <Avatar identity={post.author} size={46} fit="contain" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">{post.author.displayName}</p>
              <p className="mt-0.5 text-[11px] text-[var(--livv-pro-muted)]">@{post.author.username}</p>
            </div>
          </div>

          {post.text ? <p className="mt-6 whitespace-pre-wrap text-[18px] leading-8 tracking-[-.015em]">{post.text}</p> : null}

          {post.photo ? (
            <div className="mt-6 overflow-hidden rounded-[20px] bg-black">
              <img src={post.photo} alt="Post media" className="block max-h-[720px] w-full object-contain" />
            </div>
          ) : null}

          {post.video ? (
            <div className="mt-6 overflow-hidden rounded-[20px] bg-black">
              <video src={post.video} controls playsInline className="block max-h-[720px] w-full" />
            </div>
          ) : null}

          <div className="mt-6 py-2">
            <p className="text-[11px] text-[var(--livv-pro-muted)]">
              {new Date(post.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {new Date(post.createdAt).toLocaleDateString()} · {post.likes + (post.likedByMe ? 1 : 0)} likes
            </p>
          </div>

          <div className="flex items-center gap-2 py-3">
            <button type="button" onClick={like} className={"livv-connect-action " + (post.likedByMe ? "is-liked" : "")} aria-label="Like post">
              <Heart size={20} fill={post.likedByMe ? "currentColor" : "none"} />
              <span>{post.likes}</span>
            </button>
            <div className="livv-connect-action">
              <MessageCircle size={20} />
              <span>{post.replies.length}</span>
            </div>
          </div>
        </article>

        <section className="py-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[var(--livv-pro-muted)]">Replies</p>
            <span className="text-[10px] text-[var(--livv-pro-muted)]">{post.replies.length}</span>
          </div>
          <div className="mt-5 space-y-5">
            {post.replies.length ? post.replies.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <Avatar identity={item.author} size={36} fit="contain" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold">{item.author.displayName}</span>
                    <span className="text-[10px] text-[var(--livv-pro-muted)]">@{item.author.username} · {formatSocialTime(item.createdAt, Date.now())}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-5">{item.text}</p>
                </div>
              </div>
            )) : (
              <p className="py-6 text-[13px] text-[var(--livv-pro-muted)]">No replies yet. Start the conversation.</p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-2">
            <Avatar identity={avatarIdentity} size={36} fit="contain" />
            <input
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") reply(); }}
              placeholder="Post your reply"
              aria-label="Post your reply"
              className="livv-connect-reply-input"
            />
            <button type="button" onClick={reply} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--livv-pro-ink)] text-[var(--livv-pro-bg)]" aria-label="Send reply">
              <Send size={15} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
