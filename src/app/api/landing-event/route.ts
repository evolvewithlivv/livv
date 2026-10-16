import { NextResponse } from "next/server";

const EVENTS = new Set(["landing_create_account", "landing_sign_in"]);

export const dynamic = "force-dynamic";

/**
 * First-party click counts for the public landing page.
 * Hobby Web Analytics includes pageviews only. Custom events are a Pro feature,
 * so clicks stay on this route: no cookies, no identifiers, no stored payload.
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
