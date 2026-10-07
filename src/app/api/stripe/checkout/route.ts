import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error: "Paid LIVV memberships are not offered in V1.",
      code: "BILLING_DISABLED_V1",
    },
    {
      status: 410,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
