import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/embers.jpeg", "https://evolvewithlivv.vercel.app"), 307);
}
