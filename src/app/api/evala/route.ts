import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSupabaseUser, isSupabaseServerConfigured } from "@/lib/supabase/server-auth";

type Body = {
  question: string;
  snapshot?: {
    name?: string;
    level?: number;
    streak?: number;
    embers?: number;
    evo?: string;
    strong?: string;
    weak?: string;
    open?: string[];
    lastWorkout?: string | null;
    evidence?: string[];
  };
};

const MAX_BODY_BYTES = 32 * 1024;

const SYSTEM = `You are Evala, the intelligence layer inside LIVV.
LIVV is a life-evolution app: Daily drop, Train, Mind wiki, Packs/Embers, Connect, streaks, levels, six pillars (Body, Mind, Career, Finance, Social, Life).

Voice: direct, short, specific. No corporate wellness. No fake hype. No em dashes. Talk like a sharp coach who read their record.
Answer what they actually asked. Use the snapshot if it helps. If the snapshot is thin, say so and tell them the smallest next action in the app.
2 to 6 sentences. End with one concrete move inside LIVV when it fits.`;

function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers || {}),
    },
  });
}

function text(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

function boundedSnapshot(snapshot: Body["snapshot"]): Body["snapshot"] | undefined {
  if (!snapshot || typeof snapshot !== "object") return undefined;
  return {
    name: text(snapshot.name, 80),
    level: Number.isFinite(snapshot.level) ? Math.max(0, Math.min(999, Number(snapshot.level))) : undefined,
    streak: Number.isFinite(snapshot.streak) ? Math.max(0, Math.min(99999, Number(snapshot.streak))) : undefined,
    embers: Number.isFinite(snapshot.embers) ? Math.max(0, Math.min(999999, Number(snapshot.embers))) : undefined,
    evo: text(snapshot.evo, 240),
    strong: text(snapshot.strong, 360),
    weak: text(snapshot.weak, 360),
    open: Array.isArray(snapshot.open)
      ? snapshot.open.filter((item): item is string => typeof item === "string").slice(0, 20).map((item) => item.slice(0, 240))
      : [],
    lastWorkout: text(snapshot.lastWorkout, 160) || null,
    evidence: Array.isArray(snapshot.evidence)
      ? snapshot.evidence.filter((item): item is string => typeof item === "string").slice(0, 20).map((item) => item.slice(0, 300))
      : [],
  };
}

function fallback(question: string, snapshot: Body["snapshot"]) {
  const q = question.toLowerCase();
  const open = snapshot?.open?.[0];
  if (/sleep|tired|energy/.test(q)) {
    return "Sleep is the first lever. If nights are short, Train and Daily will keep slipping and it will look like a motivation problem. Open Mind and read Sleep first. Then pick a lights-out time tonight.";
  }
  if (/train|workout|gym|lift/.test(q)) {
    return snapshot?.lastWorkout
      ? `Last session on record: ${snapshot.lastWorkout}. Do not redesign the plan. Open Train and beat one number from that session.`
      : "No session on record. Open Train. Ten minutes counts. Log it so I have something real to work with.";
  }
  if (/money|broke|spend|save|invest/.test(q)) {
    return "Finance only moves when it is logged. Open Mind, read Move the first dollar on autopilot, then set one transfer even if it is small.";
  }
  if (/lonely|friend|social|connect/.test(q)) {
    return "A pair beats an audience. Send one specific check-in today. Time, place, or a real question. Hope you are well is noise.";
  }
  if (open) {
    return `I heard you. Highest leverage thing still sitting on today is: ${open}. Do that before inventing new work. Then ask me again with what actually happened.`;
  }
  return `I heard: ${question.trim()}. Your record is thin on that topic, so I will not invent a story. Log one real action in the matching pillar, then ask again and I can be specific.`;
}

async function callModel(question: string, snapshot: Body["snapshot"]) {
  const xai = process.env.XAI_API_KEY;
  const openai = process.env.OPENAI_API_KEY;
  if (!xai && !openai) return null;

  const url = xai ? "https://api.x.ai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
  const key = xai || openai;
  const model = xai ? "grok-3-mini" : "gpt-4o-mini";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: 280,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Snapshot: ${JSON.stringify(snapshot || {})}\n\nQuestion: ${question}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err.slice(0, 240));
  }
  const jsonBody = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return jsonBody.choices?.[0]?.message?.content?.trim() || null;
}

export async function POST(req: NextRequest) {
  try {
    if (isSupabaseServerConfigured()) {
      const verified = await getVerifiedSupabaseUser(req);
      if (!verified) {
        return json({ error: "Authenticated session required" }, { status: 401 });
      }
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return json({ error: "Request body too large" }, { status: 413 });
    }

    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return json({ error: "Request body too large" }, { status: 413 });
    }

    let body: Body;
    try {
      body = JSON.parse(rawBody) as Body;
    } catch {
      return json({ error: "Invalid JSON" }, { status: 400 });
    }

    const question = text(body.question, 2000) || "";
    if (question.length < 2) {
      return json({ text: "Ask something real." }, { status: 400 });
    }
    if (typeof body.question === "string" && body.question.trim().length > 2000) {
      return json({ text: "Keep the question under 2,000 characters." }, { status: 413 });
    }

    const snapshot = boundedSnapshot(body.snapshot);

    try {
      const live = await callModel(question, snapshot);
      if (live) return json({ text: live, live: true });
    } catch {
      // fall through
    }

    return json({
      text: fallback(question, snapshot),
      live: false,
    });
  } catch {
    return json({ text: "Evala could not answer that pass. Try again." }, { status: 500 });
  }
}
