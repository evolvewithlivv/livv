"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowUp, RotateCcw, Sparkles } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Message = { role: "user" | "assistant"; content: string };
const STARTER: Message = { role: "assistant", content: "I'm EVALA. Tell me what's going on, what you're trying to change, or what you need to figure out." };
const CHAT_KEY = "livv-evala-chat-v1";

export default function EvalaPage() {
  const [messages, setMessages] = useState<Message[]>([STARTER]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {\n    try {\n      const raw = window.localStorage.getItem(CHAT_KEY);\n      if (!raw) return;\n      const saved = JSON.parse(raw);\n      if (Array.isArray(saved)) {\n        const clean = saved.filter((m): m is Message => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-40);\n        if (clean.length) setMessages(clean);\n      }\n    } catch { /* keep fresh conversation */ }\n  }, []);\n\n  useEffect(() => {\n    try { window.localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-40))); } catch { /* best effort */ }\n    endRef.current?.scrollIntoView({ behavior: "smooth" });\n  }, [messages, busy]);\n\n  function resetChat() {\n    setMessages([STARTER]);\n    setInput("");\n    setError("");\n    try { window.localStorage.setItem(CHAT_KEY, JSON.stringify([STARTER])); } catch { /* best effort */ }\n  }

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput(""); setError("");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next); setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
      const token = data.session?.access_token;
      if (!token) throw new Error("Sign in to use EVALA.");
      const res = await fetch("/api/evala/chat", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ messages: next }) });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "EVALA couldn't respond.");
      setMessages(current => [...current, { role: "assistant", content: payload.message }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "EVALA couldn't respond.");
    } finally { setBusy(false); }
  }

  return (
    <main className="livv-page min-h-full pb-24">
      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-xl flex-col px-5 pb-8 sm:px-6">
        <section className="pt-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full border border-livv-border"><Sparkles size={17} /></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-livv-muted">LIVV Intelligence</p><h1 className="mt-1 text-[30px] font-semibold tracking-[-.05em]">EVALA</h1></div>
          </div>
          <div className="mt-3 flex items-start justify-between gap-4"><p className="max-w-[40ch] text-[13px] leading-relaxed text-livv-muted">Think clearly. Make the next move. EVALA is the intelligence layer inside LIVV.</p><button type="button" onClick={resetChat} className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-livv-muted" aria-label="Start a new EVALA conversation"><RotateCcw size={12} /> New</button></div>
        </section>
        <section className="mt-7 flex-1 space-y-5" aria-live="polite">
          {messages.map((m, i) => <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}><div className={m.role === "user" ? "max-w-[86%] rounded-2xl bg-livv-ink px-4 py-3 text-[13px] leading-relaxed text-livv-bg" : "max-w-[92%]"}>{m.role === "assistant" && <p className="mb-1 text-[9px] font-semibold uppercase tracking-[.18em] text-livv-muted">EVALA</p>}<p className="whitespace-pre-wrap">{m.content}</p></div></div>)}
          {busy && <div className="flex items-center gap-2 text-[12px] text-livv-muted"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />Thinking…</div>}
          {error && <p className="border-y border-livv-border py-3 text-[12px] text-livv-muted">{error}</p>}
          <div ref={endRef} />
        </section>
        <form onSubmit={send} className="sticky bottom-0 mt-6 border-t border-livv-border bg-livv-bg pt-3">
          <div className="flex items-end gap-2 rounded-2xl border border-livv-border bg-livv-surface px-3 py-2">
            <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();void send();}}} rows={1} maxLength={6000} placeholder="Talk to EVALA…" className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-[13px] outline-none placeholder:text-livv-muted" aria-label="Message EVALA" />
            <button type="submit" disabled={busy||!input.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-livv-ink text-livv-bg disabled:opacity-30" aria-label="Send message"><ArrowUp size={17}/></button>
          </div>
          <p className="mt-2 text-center text-[9px] text-livv-muted">EVALA can make mistakes. Verify important information.</p>
        </form>
      </div>
    </main>
  );
}