import { loadIdentity, type Identity } from "./identity";

export type SocialAuthor = {
  displayName: string;
  username: string;
  photo: string | null;
  accent: string;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  url: string;
};

export type Reply = {
  id: string;
  author: SocialAuthor;
  text: string;
  createdAt: number;
};

export type Post = {
  id: string;
  createdAt: number;
  editedAt?: number;
  author: SocialAuthor;
  text: string;
  photo: string | null;
  track: Track | null;
  allowReplies: boolean;
  likes: number;
  likedByMe: boolean;
  replies: Reply[];
};

const POSTS_KEY = "livv-social-posts-v1";
export const EDIT_WINDOW_MS = 60_000;

export const SOUND_LIBRARY: Track[] = [
  {
    id: "helix-1",
    title: "First Light",
    artist: "LIVV Sound",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "helix-2",
    title: "No Audience",
    artist: "LIVV Sound",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "helix-3",
    title: "Slow Burn",
    artist: "LIVV Sound",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "helix-8",
    title: "After Hours",
    artist: "LIVV Sound",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  },
  {
    id: "helix-9",
    title: "Keep the Line",
    artist: "LIVV Sound",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
  },
  {
    id: "helix-16",
    title: "Quiet Work",
    artist: "LIVV Sound",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
  },
];

export function authorFromIdentity(me: Identity): SocialAuthor {
  return {
    displayName: me.displayName,
    username: me.username,
    photo: me.photo,
    accent: me.accent,
  };
}

export function canEditPost(post: Post, now = Date.now()) {
  return now - post.createdAt < EDIT_WINDOW_MS;
}

export function editSecondsLeft(post: Post, now = Date.now()) {
  return Math.max(0, Math.ceil((EDIT_WINDOW_MS - (now - post.createdAt)) / 1000));
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

export function fileToPostPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1080;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

function seedPosts(): Post[] {
  const now = Date.now();
  return [
    {
      id: "seed-a",
      createdAt: now - 1000 * 60 * 18,
      author: {
        displayName: "Maya Chen",
        username: "mayatrains",
        photo: null,
        accent: "#3DDC97",
      },
      text: "Did the work before my phone even unlocked. That version of me is the one I trust.",
      photo: null,
      track: SOUND_LIBRARY[1],
      allowReplies: true,
      likes: 24,
      likedByMe: false,
      replies: [
        {
          id: "r1",
          createdAt: now - 1000 * 60 * 11,
          author: {
            displayName: "Jules",
            username: "julesmoves",
            photo: null,
            accent: "#7C9CFF",
          },
          text: "This is the standard.",
        },
      ],
    },
    {
      id: "seed-b",
      createdAt: now - 1000 * 60 * 60 * 5,
      author: {
        displayName: "Andre V",
        username: "andrev",
        photo: null,
        accent: "#FF5C8A",
      },
      text: "Nobody needs to see the session for it to count.",
      photo: null,
      track: null,
      allowReplies: false,
      likes: 61,
      likedByMe: false,
      replies: [],
    },
    {
      id: "seed-c",
      createdAt: now - 1000 * 60 * 60 * 30,
      author: {
        displayName: "Nia",
        username: "nia.runs",
        photo: null,
        accent: "#F5C542",
      },
      text: "Week 3. Still here.",
      photo: null,
      track: SOUND_LIBRARY[0],
      allowReplies: true,
      likes: 40,
      likedByMe: false,
      replies: [],
    },
    {
      id: "seed-d",
      createdAt: now - 1000 * 60 * 60 * 24 * 9,
      author: {
        displayName: "Cole",
        username: "colebuilt",
        photo: null,
        accent: "#FF6A1A",
      },
      text: "If it is not on the record it did not happen. Logging it anyway.",
      photo: null,
      track: null,
      allowReplies: true,
      likes: 18,
      likedByMe: false,
      replies: [],
    },
  ];
}

export function loadPosts(): Post[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(POSTS_KEY);
    if (!raw) {
      const seeded = seedPosts();
      window.localStorage.setItem(POSTS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Post[];
    return Array.isArray(parsed) ? parsed : seedPosts();
  } catch {
    return seedPosts();
  }
}

export function savePosts(posts: Post[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(POSTS_KEY, JSON.stringify(posts.slice(0, 40)));
  } catch {
    const slim = posts.slice(0, 20).map((p, i) =>
      i > 8 ? { ...p, photo: null } : p
    );
    try {
      window.localStorage.setItem(POSTS_KEY, JSON.stringify(slim));
    } catch {
      // quota
    }
  }
}

export function createPost(input: {
  text: string;
  photo: string | null;
  track: Track | null;
  allowReplies: boolean;
}): Post {
  const post: Post = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    author: authorFromIdentity(loadIdentity()),
    text: input.text.trim(),
    photo: input.photo,
    track: input.track,
    allowReplies: input.allowReplies,
    likes: 0,
    likedByMe: false,
    replies: [],
  };
  savePosts([post, ...loadPosts()]);
  return post;
}

export function updatePost(
  id: string,
  patch: Partial<Pick<Post, "text" | "photo" | "track" | "allowReplies">>
) {
  const posts = loadPosts();
  const next = posts.map((p) => {
    if (p.id !== id) return p;
    if (!canEditPost(p)) return p;
    return { ...p, ...patch, editedAt: Date.now() };
  });
  savePosts(next);
  return next;
}

export function deletePost(id: string) {
  const next = loadPosts().filter((p) => p.id !== id);
  savePosts(next);
  return next;
}
