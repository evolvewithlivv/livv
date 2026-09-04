"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/identity/avatar";
import { getThread, sendDm, type DmThread } from "@/lib/messages";
import { feedback } from "@/lib/sensory";

export default function ThreadPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const [thread, setThread] = useState<DmThread | null>(null);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const sync = () => setThread(getThread(id));

  useEffect(() => {
    sync();
    window.addEventListener("livv-dms", sync);
    return () => window.removeEventListener("livv-dms", sync);
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  if (!thread) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#050505] text-white/40">
        Thread not found
      </main>
    );
  }

  const send = () => {
    if (!draft.trim()) return;
    sendDm(thread.id, draft);
    setDraft("");
    feedback("tick");
    sync();
  };

  return (
    <main className="flex h-[100dvh] flex-col bg-[#050505]">
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 pb-3 pt-4">
        <Link href="/home/messages" className="text-[13px] text-white/40">
          ←
        </Link>
        <Avatar
          identity={{
            displayName: thread.peerName,
            photo: thread.peerPhoto,
            accent: thread.peerAccent,
          }}
          size={36}
        />
        <div>
          <p className="text-[15px] font-semibold">{thread.peerName}</p>
          <p className="text-[11px] text-white/35">@{thread.peerUsername}</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {thread.messages.map((m) => (
          <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-[18px] px-4 py-2.5 text-[14px] leading-snug ${
                m.fromMe
                  ? "bg-livv-accent text-white"
                  : "bg-white/[0.06] text-white/85"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2 border-t border-white/[0.06] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message…"
          className="h-11 flex-1 rounded-full bg-white/[0.05] px-4 text-sm outline-none ring-1 ring-white/10 placeholder:text-white/25"
        />
        <button
          type="button"
          onClick={send}
          className="h-11 rounded-full bg-white px-5 text-sm font-semibold text-black"
        >
          Send
        </button>
      </div>
    </main>
  );
}
