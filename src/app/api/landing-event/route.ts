import { NextResponse } from "next/server";
import { readJsonLimited, requestActor, takeRateLimit } from "@/lib/request-guards";

const EVENTS = new Set(["landing_create_account", "landing_sign_in"]);

export const dynamic = "force-dynamic";

/**
 * Legacy landing click counts. New funnel events go to PostHog.
 * Cached pages may still POST the old names. The route stays a no-store 204
 * with no cookies and no stored payload.
 */
export async function POST(request: Request) {
  const limited = takeRateLimit(`landing:${requestActor(request.headers)}`, 20, 60_000);
  if (!limited.ok) {
    return new NextResponse(null, {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": String(limited.retryAfterSec) },
    });
  }

  const parsed = await readJsonLimited(request, 200);
  if (!parsed.ok) {
    return new NextResponse(null, { status: parsed.status, headers: { "Cache-Control": "no-store" } });
  }
  const body = parsed.value as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name : "";

  if (!EVENTS.has(name)) {
    return new NextResponse(null, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  console.info(JSON.stringify({ source: "landing", event: name, path: "/" }));
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
