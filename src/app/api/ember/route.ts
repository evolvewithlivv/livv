import { NextResponse } from "next/server";
import { EMBER_PNG_B64 } from "@/lib/ember-png";

export const runtime = "nodejs";

export async function GET() {
  if (!EMBER_PNG_B64) {
    return NextResponse.redirect(new URL("/ember.svg", "https://livv-app-v1-tau.vercel.app"), 302);
  }
  const buf = Buffer.from(EMBER_PNG_B64, "base64");
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
