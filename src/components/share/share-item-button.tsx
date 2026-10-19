"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareItemButton({ url, title }: { url: string; title: string }) {
  const [status, setStatus] = useState<"idle" | "copied">("idle");
  async function share() {
    const href = new URL(url, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url: href });
        return;
      }
      await navigator.clipboard.writeText(href);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2200);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(href);
        setStatus("copied");
        window.setTimeout(() => setStatus("idle"), 2200);
      } catch {
        window.prompt("Copy this public link", href);
      }
    }
  }
  return <button type="button" onClick={share} aria-label={`Share ${title}`} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,minHeight:40,padding:"0 14px",border:"1px solid rgb(var(--livv-border))",borderRadius:999,background:"transparent",color:"inherit",font:"inherit",fontSize:13,cursor:"pointer"}}>{status === "copied" ? <Check size={15}/> : <Share2 size={15}/>} {status === "copied" ? "Link copied" : "Share"}</button>;
}
