import { sanitizeTrafficSource } from "@/lib/attribution";
import Signal001 from "./signal-screen";

type GoSearch = { src?: string | string[] };

function first(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
}

export default async function Signal001Page({ searchParams }: { searchParams: Promise<GoSearch> }) {
  const params = await searchParams;
  return <Signal001 initialSrc={sanitizeTrafficSource(first(params.src))} />;
}
