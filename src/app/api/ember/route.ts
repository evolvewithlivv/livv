import { getEmberPng } from "@/lib/ember-asset";

export async function GET() {
  const body = getEmberPng();
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
