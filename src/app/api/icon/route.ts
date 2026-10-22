import { NextRequest } from "next/server";
import { getLivvIconPng, type IconColor } from "@/lib/brand-logo";
import { flattenPng, resizePng } from "@/lib/png-resize";

export const runtime = "nodejs";

const BACKGROUNDS: Record<IconColor, [number, number, number]> = {
  black: [247, 247, 245],
  white: [9, 10, 12],
};

function pngSize(png: Uint8Array) {
  const view = new DataView(png.buffer, png.byteOffset, 24);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

const rendered = new Map<string, Uint8Array>();

export async function GET(request: NextRequest) {
  const sizeParam = request.nextUrl.searchParams.get("s");
  const parsedSize = Number(sizeParam);
  const size = Number.isFinite(parsedSize) ? Math.min(512, Math.max(16, Math.trunc(parsedSize))) : 32;
  const color: IconColor = request.nextUrl.searchParams.get("c") === "white" ? "white" : "black";
  const opaque = request.nextUrl.searchParams.get("bg") === "1";
  const key = `${size}:${color}:${opaque ? "bg" : "clear"}`;
  let body = rendered.get(key);
  if (!body) {
    body = resizePng(getLivvIconPng(color), size);
    if (opaque) body = flattenPng(body, BACKGROUNDS[color]);
    const actual = pngSize(body);
    if (actual.width !== size || actual.height !== size) {
      return new Response("icon size mismatch", { status: 500, headers: { "Cache-Control": "no-store" } });
    }
    rendered.set(key, body);
  }

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
