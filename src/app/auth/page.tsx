import AuthScreen from "./auth-screen";
import { authModeFromParam, sanitizeTrafficSource } from "@/lib/attribution";

type AuthSearch = {
  mode?: string | string[];
  src?: string | string[];
};

function first(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
}

export default async function AuthPage({ searchParams }: { searchParams: Promise<AuthSearch> }) {
  const params = await searchParams;
  return (
    <AuthScreen
      initialMode={authModeFromParam(first(params.mode))}
      initialSrc={sanitizeTrafficSource(first(params.src))}
    />
  );
}
