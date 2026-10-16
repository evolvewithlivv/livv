import { redirect } from "next/navigation";
import { sanitizeTrafficSource } from "@/lib/attribution";

function first(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
}

/** Send visitors directly to the single account/onboarding experience. */
export default async function RootPage({ searchParams }: { searchParams: Promise<{ src?: string | string[] }> }) {
  const params = await searchParams;
  const src = sanitizeTrafficSource(first(params.src));
  redirect(src ? `/auth?mode=create&src=${encodeURIComponent(src)}` : "/auth?mode=create");
}
