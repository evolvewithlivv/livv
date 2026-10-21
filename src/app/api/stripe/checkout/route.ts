import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** New subscription checkout is disabled: LIVV core access is free and no paid tiers are offered. */
export async function POST() {
  return NextResponse.json(
    { error: "LIVV no longer offers paid tiers. Core access is free." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
