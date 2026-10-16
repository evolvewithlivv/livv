import { NextResponse } from "next/server";

const EVENTS = new Set(["landing_create_account", "landing_sign_in"]);

export const dynamic = "force-dynamic";

/**
 * Legacy landing click counts. New funnel events go to PostHog.
 * Cached pages may still POST the old names. The route stays a no-store 204
 * with no cookies and no stored payload.
 */
export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") || "0");
  if (length > 200) {
    return new NextResponse(null, { status: 413, headers: { "Cache-Control": "no-store" } });
  }

  let name = "";
  try {
    const body = (await request.json()) as { name?: unknown };
    name = typeof body?.name === "string" ? body.name : "";
  } catch {
    return new NextResponse(null, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

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
