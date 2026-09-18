import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const SYSTEM = `You are EVALA, the intelligence layer of LIVV.

LIVV is a system for helping people evolve through practical action across body, mind, work, money, people, and life. You are not a motivational quote generator. Be calm, direct, useful, and human. Help the user think clearly and choose their own actions.

Principles:
- Prefer practical next steps over vague encouragement.
- Ask a focused question when important context is missing.
- Never pretend to know user data you were not given.
- Do not diagnose medical or mental-health conditions.
- For high-stakes health, legal, financial, or safety questions, encourage appropriate professional help and be transparent about limits.
- Keep responses concise unless the user asks for depth.
- Treat the user's agency as primary: inform and support, don't make life decisions for them.
- You are EVALA, inside LIVV. Do not claim to be human or conscious.`;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  try {
    if (!url || !anonKey) return jsonError("LIVV authentication is not configured.", 503);

    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!token) return jsonError("Sign in to use EVALA.", 401);

    const supabase = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: authData, error } = await supabase.auth.getUser(token);
    if (error || !authData.user || authData.user.is_anonymous) return jsonError("Sign in to use EVALA.", 401);

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const clean = messages
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-20)
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, 6000) }));

    if (!clean.length) return jsonError("Send a message to EVALA.", 400);\n    const totalChars = clean.reduce((sum: number, m: { content: string }) => sum + m.content.length, 0);\n    if (totalChars > 30000) return jsonError("That conversation is too large. Start a new EVALA conversation and try again.", 413);

    const apiKey = process.env.EVALA_API_KEY?.trim();
    const baseUrl = (process.env.EVALA_BASE_URL || "https://models.github.ai/inference").trim().replace(/\/$/, "");
    const model = (process.env.EVALA_MODEL || "openai/gpt-4.1-mini").trim();

    if (!apiKey) return jsonError("EVALA is built into LIVV, but its model connection still needs to be configured.", 503);

    const response = await fetch(baseUrl + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: SYSTEM }, ...clean],
        temperature: 0.7,
        max_tokens: 900,
      }),
      cache: "no-store",\n      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[EVALA] provider error", response.status, detail.slice(0, 500));
      return jsonError("EVALA couldn't reach its model right now. Try again in a moment.", 502);
    }

    const providerData = await response.json();
    const message = providerData?.choices?.[0]?.message?.content;
    if (typeof message !== "string" || !message.trim()) return jsonError("EVALA returned an empty response.", 502);

    return NextResponse.json({ message: message.trim(), model });
  } catch (error) {
    console.error("[EVALA] request error", error);
    return jsonError("Something went wrong while talking to EVALA.", 500);
  }
}
