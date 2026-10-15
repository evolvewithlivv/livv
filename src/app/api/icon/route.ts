import { NextRequest } from "next/server";
import { getLivvIconPng } from "@/lib/brand-logo";
import { resizePng } from "@/lib/png-resize";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sizeParam = request.nextUrl.searchParams.get("s");
  const size = Math.min(512, Math.max(16, Number(sizeParam) || 32));
  const body = resizePng(getLivvIconPng(size), size);

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
