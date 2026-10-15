import { redirect } from "next/navigation";
import { sanitizeTrafficSource } from "@/lib/attribution";

type RootSearch = { src?: string | string[] };

function first(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
}

/** Official first-user entry is Signal 001, not a bare sign-in form. */
export default async function RootPage({ searchParams }: { searchParams: Promise<RootSearch> }) {
  const params = await searchParams;
  const src = sanitizeTrafficSource(first(params.src));
  redirect(src ? `/go/001?src=${encodeURIComponent(src)}` : "/go/001");
}
