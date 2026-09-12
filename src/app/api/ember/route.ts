import { NextResponse } from "next/server";
import { appUrl } from "@/lib/stripe-server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.redirect(new URL("/embers.jpeg", appUrl()), 307);
}
