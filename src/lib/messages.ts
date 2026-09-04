/** Local direct messages — demo threads. */

import { loadIdentity } from "./identity";

export type DmMessage = {
  id: string;
  fromMe: boolean;
  text: string;
  at: number;
};

export type DmThread = {
  id: string;
  peerName: string;
  peerUsername: string;
  peerPhoto: string | null;
  peerAccent: string;
  messages: DmMessage[];
  updatedAt: number;
};

const KEY = "livv-dms-v1";

function seed(): DmThread[] {
  const now = Date.now();
  return [
    {
      id: "t_livv",
      peerName: "LIVV",
      peerUsername: "livv",
      peerPhoto: null,
      peerAccent: "#4C8DFF",
      updatedAt: now - 3600_000,
      messages: [
        {
          id: "m1",
          fromMe: false,
          text: "Welcome in. When you’re ready to build in public, say so here.",
          at: now - 7200_000,
        },
        {
          id: "m2",
          fromMe: false,
          text: "Packs, training, and Evala all feed the same record.",
          at: now - 3600_000,
        },
      ],
    },
  ];
}

export function loadThreads(): DmThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as DmThread[];
  } catch {
    return seed();
  }
}

function save(threads: DmThread[]) {
  window.localStorage.setItem(KEY, JSON.stringify(threads));
  window.dispatchEvent(new Event("livv-dms"));
}

export function getThread(id: string) {
  return loadThreads().find((t) => t.id === id) || null;
}

export function sendDm(threadId: string, text: string) {
  const threads = loadThreads();
  const t = threads.find((x) => x.id === threadId);
  if (!t || !text.trim()) return threads;
  t.messages.push({
    id: `m_${Date.now()}`,
    fromMe: true,
    text: text.trim(),
    at: Date.now(),
  });
  t.updatedAt = Date.now();
  save(threads);
  return threads;
}

export function unreadCount() {
  // demo: none until real backend
  return 0;
}

void loadIdentity;
