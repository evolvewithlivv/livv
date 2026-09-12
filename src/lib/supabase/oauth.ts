import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";
import { finishSupabaseCallback } from "./real-auth";

export type SocialProvider = "apple" | "google" | "twitter";

export async function signInWithSocial(provider: SocialProvider) {
  if (!isSupabaseConfigured()) {
    throw new Error("LIVV authentication is not configured. Please try again shortly.");
  }

  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("LIVV authentication is not configured.");

  const { error } = await client.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
      queryParams: provider === "google" ? { access_type: "offline", prompt: "select_account" } : undefined,
    },
  });

  if (error) throw new Error(error.message || `Could not start ${provider} sign-in.`);
}

export async function completeSocialSignIn(code?: string) {
  return finishSupabaseCallback(code);
}
