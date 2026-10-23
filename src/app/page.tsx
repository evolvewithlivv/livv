import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sanitizeTrafficSource } from "@/lib/attribution";

export const metadata: Metadata = {
  title: { absolute: "LIVV · A system for becoming more capable in real life." },
  description: "A system for becoming more capable in real life. The core is free.",
  alternates: { canonical: "https://evolvewithlivv.com" },
};

function first(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
}

/** Send visitors straight into the existing auth/onboarding flow. */
export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string | string[] }>;
}) {
  const params = await searchParams;
  const src = sanitizeTrafficSource(first(params.src));
  redirect(src ? `/auth?mode=create&src=${encodeURIComponent(src)}` : "/auth?mode=create");
}
