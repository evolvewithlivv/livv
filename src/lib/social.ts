/**
 * LIVV Social Foundation — production source of truth is Supabase.
 * Ownership is always auth.uid(). Client display fields are presentation only.
 */

import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type SocialPostKind = "text" | "proof" | "photo" | "video";

export type SocialProof = {
  source: "train" | "daily";
  title: string;
  summary: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type SocialAuthor = {
  id: string;
  displayName: string;
  username: string;
  photo: string | null;
  accent: string;
};

export type SocialReply = {
  id: string;
  postId: string;
  author: SocialAuthor;
  text: string;
  createdAt: number;
};

export type SocialPost = {
  id: string;
  author: SocialAuthor;
  text: string;
  kind: SocialPostKind;
  proof: SocialProof | null;
  allowReplies: boolean;
  createdAt: number;
  editedAt: number | null;
  likes: number;
  likedByMe: boolean;
  replies: SocialReply[];
  replyCount: number;
};

export type FeedPage = {
  posts: SocialPost[];
  nextCursor: string | null;
};

const FEED_PAGE_SIZE = 20;
const EDIT_WINDOW_MS = 60_000;

type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  photo_url: string | null;
  accent: string | null;
};

type PostRow = {
  id: string;
  author_id: string;
  kind: string;
  body: string;
  proof: SocialProof | null;
  allow_replies: boolean;
  created_at: string;
  edited_at: string | null;
};

type ReplyRow = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

function authorFromProfile(row: ProfileRow | null | undefined, fallbackId: string): SocialAuthor {
  return {
    id: row?.id || fallbackId,
    displayName: (row?.display_name || "").trim() || "LIVV member",
    username: (row?.username || "").trim() || "member",
    photo: row?.photo_url || null,
    accent: row?.accent || "#4DFF00",
  };
}

function mapPost(
  row: PostRow,
  profile: ProfileRow | null | undefined,
  likes: number,
  likedByMe: boolean,
  replyCount: number,
  replies: SocialReply[] = []
): SocialPost {
  return {
    id: row.id,
    author: authorFromProfile(profile, row.author_id),
    text: row.body || "",
    kind: (row.kind as SocialPostKind) || "text",
    proof: row.proof || null,
    allowReplies: row.allow_replies !== false,
    createdAt: new Date(row.created_at).getTime(),
    editedAt: row.edited_at ? new Date(row.edited_at).getTime() : null,
    likes,
    likedByMe,
    replies,
    replyCount,
  };
}

export function isSocialBackendReady() {
  return isSupabaseConfigured();
}

export async function getSocialUserId(): Promise<string | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

export function formatSocialTime(timestamp: number, now = Date.now()) {
  const diff = Math.max(0, now - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const d = new Date(timestamp);
  return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
}

export function canEditPost(post: SocialPost, now = Date.now()) {
  return now - post.createdAt < EDIT_WINDOW_MS;
}

async function loadProfiles(ids: string[]): Promise<Map<string, ProfileRow>> {
  const map = new Map<string, ProfileRow>();
  if (!ids.length) return map;
  const client = getSupabaseBrowserClient();
  if (!client) return map;
  const unique = Array.from(new Set(ids));
  const { data, error } = await client
    .from("profiles")
    .select("id, username, display_name, photo_url, accent")
    .in("id", unique);
  if (error || !data) return map;
  for (const row of data as ProfileRow[]) map.set(row.id, row);
  return map;
}

export async function fetchFeedPage(options?: {
  cursor?: string | null;
  mineOnly?: boolean;
  userId?: string | null;
}): Promise<FeedPage> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Social is not available right now.");

  const userId = options?.userId ?? (await getSocialUserId());
  let query = client
    .from("social_posts")
    .select("id, author_id, kind, body, proof, allow_replies, created_at, edited_at")
    .order("created_at", { ascending: false })
    .limit(FEED_PAGE_SIZE);

  if (options?.mineOnly && userId) {
    query = query.eq("author_id", userId);
  }
  if (options?.cursor) {
    query = query.lt("created_at", options.cursor);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message || "Could not load the community feed.");
  const rows = (data || []) as PostRow[];
  if (!rows.length) return { posts: [], nextCursor: null };

  const postIds = rows.map((r) => r.id);
  const authorIds = rows.map((r) => r.author_id);
  const profiles = await loadProfiles(authorIds);

  const [{ data: reactionRows }, { data: replyCountRows }, { data: myReactions }] = await Promise.all([
    client.from("social_reactions").select("post_id").in("post_id", postIds),
    client.from("social_replies").select("post_id").in("post_id", postIds),
    userId
      ? client.from("social_reactions").select("post_id").eq("user_id", userId).in("post_id", postIds)
      : Promise.resolve({ data: [] as { post_id: string }[] }),
  ]);

  const likeCounts = new Map<string, number>();
  for (const r of reactionRows || []) {
    likeCounts.set(r.post_id, (likeCounts.get(r.post_id) || 0) + 1);
  }
  const replyCounts = new Map<string, number>();
  for (const r of replyCountRows || []) {
    replyCounts.set(r.post_id, (replyCounts.get(r.post_id) || 0) + 1);
  }
  const likedSet = new Set((myReactions || []).map((r) => r.post_id));

  const posts = rows.map((row) =>
    mapPost(
      row,
      profiles.get(row.author_id),
      likeCounts.get(row.id) || 0,
      likedSet.has(row.id),
      replyCounts.get(row.id) || 0
    )
  );

  const last = rows[rows.length - 1];
  const nextCursor = rows.length === FEED_PAGE_SIZE ? last.created_at : null;
  return { posts, nextCursor };
}

export async function fetchReplies(postId: string): Promise<SocialReply[]> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Social is not available right now.");

  const { data, error } = await client
    .from("social_replies")
    .select("id, post_id, author_id, body, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) throw new Error(error.message || "Could not load replies.");
  const rows = (data || []) as ReplyRow[];
  const profiles = await loadProfiles(rows.map((r) => r.author_id));

  return rows.map((row) => ({
    id: row.id,
    postId: row.post_id,
    author: authorFromProfile(profiles.get(row.author_id), row.author_id),
    text: row.body,
    createdAt: new Date(row.created_at).getTime(),
  }));
}

export async function createSocialPost(input: {
  text: string;
  kind?: SocialPostKind;
  proof?: SocialProof | null;
  allowReplies?: boolean;
}): Promise<SocialPost> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Social is not available right now.");
  const userId = await getSocialUserId();
  if (!userId) throw new Error("Sign in to share with the community.");

  const body = input.text.trim();
  if (!body && !input.proof) throw new Error("Write something before posting.");

  const kind: SocialPostKind = input.kind || (input.proof ? "proof" : "text");
  const { data, error } = await client
    .from("social_posts")
    .insert({
      author_id: userId,
      kind,
      body,
      proof: input.proof || null,
      allow_replies: input.allowReplies !== false,
    })
    .select("id, author_id, kind, body, proof, allow_replies, created_at, edited_at")
    .single();

  if (error || !data) throw new Error(error?.message || "Could not create your post.");
  const profiles = await loadProfiles([userId]);
  return mapPost(data as PostRow, profiles.get(userId), 0, false, 0);
}

export async function updateSocialPost(
  postId: string,
  patch: { text?: string; allowReplies?: boolean }
): Promise<void> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Social is not available right now.");
  const userId = await getSocialUserId();
  if (!userId) throw new Error("Sign in to edit.");

  const updates: Record<string, unknown> = { edited_at: new Date().toISOString() };
  if (typeof patch.text === "string") updates.body = patch.text.trim();
  if (typeof patch.allowReplies === "boolean") updates.allow_replies = patch.allowReplies;

  const { error } = await client
    .from("social_posts")
    .update(updates)
    .eq("id", postId)
    .eq("author_id", userId);

  if (error) throw new Error(error.message || "Could not update post.");
}

export async function deleteSocialPost(postId: string): Promise<void> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Social is not available right now.");
  const userId = await getSocialUserId();
  if (!userId) throw new Error("Sign in to delete.");

  const { error } = await client.from("social_posts").delete().eq("id", postId).eq("author_id", userId);
  if (error) throw new Error(error.message || "Could not delete post.");
}

export async function createSocialReply(postId: string, text: string): Promise<SocialReply> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Social is not available right now.");
  const userId = await getSocialUserId();
  if (!userId) throw new Error("Sign in to reply.");

  const body = text.trim();
  if (!body) throw new Error("Write a reply first.");

  const { data, error } = await client
    .from("social_replies")
    .insert({ post_id: postId, author_id: userId, body })
    .select("id, post_id, author_id, body, created_at")
    .single();

  if (error || !data) throw new Error(error?.message || "Could not post reply.");
  const profiles = await loadProfiles([userId]);
  const row = data as ReplyRow;
  return {
    id: row.id,
    postId: row.post_id,
    author: authorFromProfile(profiles.get(userId), userId),
    text: row.body,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function deleteSocialReply(replyId: string): Promise<void> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Social is not available right now.");
  const userId = await getSocialUserId();
  if (!userId) throw new Error("Sign in to delete.");

  const { error } = await client.from("social_replies").delete().eq("id", replyId).eq("author_id", userId);
  if (error) throw new Error(error.message || "Could not delete reply.");
}

export async function toggleReaction(postId: string, currentlyLiked: boolean): Promise<boolean> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Social is not available right now.");
  const userId = await getSocialUserId();
  if (!userId) throw new Error("Sign in to acknowledge.");

  if (currentlyLiked) {
    const { error } = await client
      .from("social_reactions")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message || "Could not remove acknowledgment.");
    return false;
  }

  const { error } = await client.from("social_reactions").insert({ post_id: postId, user_id: userId });
  if (error) throw new Error(error.message || "Could not acknowledge.");
  return true;
}

/** Pending proof draft for optional share after Train/Daily (sessionStorage). */
const PROOF_DRAFT_KEY = "livv-social-proof-draft-v1";

export function stashProofDraft(proof: SocialProof, suggestedText?: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      PROOF_DRAFT_KEY,
      JSON.stringify({ proof, suggestedText: suggestedText || "", at: Date.now() })
    );
  } catch {
    // ignore
  }
}

export function consumeProofDraft(): { proof: SocialProof; suggestedText: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PROOF_DRAFT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PROOF_DRAFT_KEY);
    const parsed = JSON.parse(raw) as { proof: SocialProof; suggestedText?: string; at?: number };
    if (!parsed?.proof?.source || !parsed.proof.title) return null;
    if (parsed.at && Date.now() - parsed.at > 30 * 60 * 1000) return null;
    return { proof: parsed.proof, suggestedText: parsed.suggestedText || "" };
  } catch {
    return null;
  }
}

export function proofSharePath(proof: SocialProof, suggestedText?: string) {
  stashProofDraft(proof, suggestedText);
  return "/home/connect?compose=1&proof=1";
}
