import { NextResponse } from "next/server";
import { appUrl } from "@/lib/stripe-server";

export const runtime = "nodejs";

/** Legacy compatibility route. The current client uses the bundled ember asset directly. */
export async function GET() {
  return NextResponse.redirect(new URL("/ember.svg", appUrl()), 307);
}
