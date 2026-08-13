"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity/activity-card";
import { cn } from "@/lib/utils";
import {
  MOCK_FEED,
  MOCK_USERS,
  MOCK_CONVERSATIONS,
  MOCK_CHALLENGES,
  type FeedItem,
  type ConnectUser,
  type Conversation,
  type Challenge,
} from "@/lib/connect-data";
import { loadActivities, formatRelativeTime, type Activity } from "@/lib/activity";

type ConnectTab = "activity" | "people" | "messages" | "challenges";

export default function ConnectPage() {
  const [tab, setTab] = useState<ConnectTab>("activity");
  const [feed, setFeed] = useState<FeedItem[]>(MOCK_FEED);
  const [users, setUsers] = useState<ConnectUser[]>(MOCK_USERS);
  const [peopleQuery, setPeopleQuery] = useState("");
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES);
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messageQuery, setMessageQuery] = useState("");
  const [myActivities, setMyActivities] = useState<Activity[]>([]);

  useEffect(() => {
    setMyActivities(loadActivities());
  }, [tab]);

  // Merge current user local activities into feed (top)
  const combinedFeed = useMemo(() => {
    const mineAsFeed: FeedItem[] = myActivities.slice(0, 5).map((a) => ({
      ...a,
      likes: 0,
      comments: 0,
      likedByMe: false,
    }));
    // Dedupe by id
    const ids = new Set(mineAsFeed.map((m) => m.id));
    const rest = feed.filter((f) => !ids.has(f.id));
    return [...mineAsFeed, ...rest].sort((a, b) => b.timestamp - a.timestamp);
  }, [myActivities, feed]);

  const toggleLike = (id: string) => {
    setFeed((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const liked = !item.likedByMe;
        return {
          ...item,
          likedByMe: liked,
          likes: liked ? item.likes + 1 : Math.max(0, item.likes - 1),
        };
      })
    );
  };

  const toggleFollow = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u
      )
    );
  };

  const toggleChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              joined: !c.joined,
              participants: c.joined
                ? Math.max(0, c.participants - 1)
                : c.participants + 1,
              progress: c.joined ? 0 : c.progress || 5,
            }
          : c
      )
    );
  };

  const filteredPeople = users.filter((u) => {
    const q = peopleQuery.toLowerCase();
    if (!q) return true;
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  });

  const suggested = filteredPeople.filter((u) => !u.isFollowing);
  const following = filteredPeople.filter((u) => u.isFollowing);

  const filteredConversations = conversations.filter((c) => {
    const q = messageQuery.toLowerCase();
    if (!q) return true;
    return (
      c.user.displayName.toLowerCase().includes(q) ||
      c.user.username.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  // ─── Conversation detail ──────────────────────────────────
  if (activeConversation) {
    return (
      <main className="pt-6 pb-4 min-h-[70dvh] flex flex-col">
        <Container className="flex-1 flex flex-col">
          <button
            onClick={() => setActiveConversation(null)}
            className="text-sm text-livv-muted hover:text-white mb-4 self-start"
          >
            ← Messages
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: activeConversation.user.avatarColor }}
            >
              {activeConversation.user.avatarInitial}
            </div>
            <div>
              <p className="font-semibold">{activeConversation.user.displayName}</p>
              <p className="text-xs text-livv-muted">
                @{activeConversation.user.username} · Lv{" "}
                {activeConversation.user.level}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="rounded-2xl border border-livv-border bg-livv-surface p-4 max-w-[85%]">
              <p className="text-sm text-white/90">
                {activeConversation.lastMessage}
              </p>
              <p className="mt-1.5 text-[10px] text-livv-muted">
                {formatRelativeTime(activeConversation.timestamp)}
              </p>
            </div>
            <div className="rounded-2xl border border-livv-border bg-livv-accent/10 p-4 max-w-[85%] ml-auto">
              <p className="text-sm text-white/90">
                Appreciate you. Keep building.
              </p>
              <p className="mt-1.5 text-[10px] text-livv-muted text-right">
                Just now
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-livv-border bg-livv-surface px-4 py-3 text-sm text-livv-muted">
            Messaging is a frontend shell — not connected yet.
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="pt-8 pb-4">
      <Container>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Connect</h1>
          <p className="mt-1 text-sm text-livv-muted">
            What are the people around you doing to evolve?
          </p>
        </div>

        {/* Segmented nav */}
        <div className="flex gap-1 rounded-xl border border-livv-border bg-livv-surface p-1 mb-6">
          {(
            [
              { id: "activity", label: "Activity" },
              { id: "people", label: "People" },
              { id: "messages", label: "Messages" },
              { id: "challenges", label: "Challenges" },
            ] as { id: ConnectTab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs font-medium transition-all",
                tab === t.id
                  ? "bg-livv-accent text-white shadow-sm"
                  : "text-livv-muted hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── ACTIVITY ───────────────────────────────────── */}
        {tab === "activity" && (
          <div className="space-y-3 animate-fade-in">
            {combinedFeed.map((item) => (
              <div key={item.id}>
                <ActivityCard activity={item} />
                <div className="flex items-center gap-4 px-1 pt-2 pb-1">
                  <button
                    onClick={() => toggleLike(item.id)}
                    className={cn(
                      "text-xs transition-colors",
                      item.likedByMe
                        ? "text-livv-accent-soft"
                        : "text-livv-muted hover:text-white"
                    )}
                  >
                    {item.likedByMe ? "Liked" : "Like"} · {item.likes}
                  </button>
                  <span className="text-xs text-livv-muted">
                    {item.comments} comments
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── PEOPLE ─────────────────────────────────────── */}
        {tab === "people" && (
          <div className="animate-fade-in space-y-6">
            <input
              type="search"
              placeholder="Search people..."
              value={peopleQuery}
              onChange={(e) => setPeopleQuery(e.target.value)}
              className="w-full rounded-xl border border-livv-border bg-livv-surface px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-livv-accent/40"
            />

            {following.length > 0 && (
              <section>
                <p className="text-xs uppercase tracking-wider text-livv-muted mb-3">
                  Following
                </p>
                <div className="space-y-2">
                  {following.map((user) => (
                    <PersonRow
                      key={user.id}
                      user={user}
                      onToggleFollow={() => toggleFollow(user.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <p className="text-xs uppercase tracking-wider text-livv-muted mb-3">
                Suggested
              </p>
              <div className="space-y-2">
                {suggested.length === 0 ? (
                  <p className="text-sm text-livv-muted py-4 text-center">
                    No matches
                  </p>
                ) : (
                  suggested.map((user) => (
                    <PersonRow
                      key={user.id}
                      user={user}
                      onToggleFollow={() => toggleFollow(user.id)}
                    />
                  ))
                )}
              </div>
            </section>

            <section>
              <p className="text-xs uppercase tracking-wider text-livv-muted mb-3">
                Friends · Followers
              </p>
              <p className="text-sm text-livv-muted leading-relaxed">
                Friend graphs and follower lists will connect here once accounts
                are live. For now, use Following and Suggested to explore the
                community model.
              </p>
            </section>
          </div>
        )}

        {/* ─── MESSAGES ───────────────────────────────────── */}
        {tab === "messages" && (
          <div className="animate-fade-in space-y-4">
            <input
              type="search"
              placeholder="Search conversations..."
              value={messageQuery}
              onChange={(e) => setMessageQuery(e.target.value)}
              className="w-full rounded-xl border border-livv-border bg-livv-surface px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-livv-accent/40"
            />

            <div className="space-y-1">
              {filteredConversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => setActiveConversation(convo)}
                  className="w-full flex items-center gap-3 rounded-xl border border-transparent hover:border-livv-border hover:bg-livv-surface p-3 text-left transition-all"
                >
                  <div className="relative">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: convo.user.avatarColor }}
                    >
                      {convo.user.avatarInitial}
                    </div>
                    {convo.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-livv-accent text-[9px] font-bold">
                        {convo.unread}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">
                        {convo.user.displayName}
                      </p>
                      <span className="text-[10px] text-livv-muted shrink-0">
                        {formatRelativeTime(convo.timestamp)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-xs truncate mt-0.5",
                        convo.unread > 0 ? "text-white/80" : "text-livv-muted"
                      )}
                    >
                      {convo.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-center text-[11px] text-white/25 pt-2">
              Messages are a UX shell only — no real-time backend yet.
            </p>
          </div>
        )}

        {/* ─── CHALLENGES ─────────────────────────────────── */}
        {tab === "challenges" && (
          <div className="animate-fade-in space-y-3">
            {challenges.map((ch) => (
              <div
                key={ch.id}
                className="rounded-2xl border border-livv-border bg-livv-surface p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{ch.name}</p>
                    <p className="mt-1 text-sm text-livv-muted leading-relaxed">
                      {ch.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-livv-black/60 px-2.5 py-1 text-livv-muted">
                    {ch.pillar}
                  </span>
                  <span className="rounded-full bg-livv-black/60 px-2.5 py-1 text-livv-muted">
                    {ch.duration}
                  </span>
                  <span className="rounded-full bg-livv-black/60 px-2.5 py-1 text-livv-muted">
                    {ch.participants.toLocaleString()} joined
                  </span>
                </div>

                {ch.joined && (
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] text-livv-muted mb-1">
                      <span>Your progress</span>
                      <span>{ch.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-livv-black overflow-hidden">
                      <div
                        className="h-full bg-livv-accent"
                        style={{ width: `${ch.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    variant={ch.joined ? "secondary" : "accent"}
                    size="sm"
                    className="w-full"
                    onClick={() => toggleChallenge(ch.id)}
                  >
                    {ch.joined ? "Leave Challenge" : "Join Challenge"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}

function PersonRow({
  user,
  onToggleFollow,
}: {
  user: ConnectUser;
  onToggleFollow: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-livv-border bg-livv-surface p-3">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: user.avatarColor }}
      >
        {user.avatarInitial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{user.displayName}</p>
        <p className="text-xs text-livv-muted truncate">
          @{user.username} · Lv {user.level} · {user.streak}d streak
        </p>
      </div>
      <Button
        variant={user.isFollowing ? "secondary" : "accent"}
        size="sm"
        onClick={onToggleFollow}
      >
        {user.isFollowing ? "Following" : "Follow"}
      </Button>
    </div>
  );
}