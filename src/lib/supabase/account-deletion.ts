import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";

export async function deleteSupabaseAccount(): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Account deletion is temporarily unavailable." };
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false, message: "Account deletion is temporarily unavailable." };

  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user || user.is_anonymous) return { ok: false, message: "Please sign in again before deleting your account." };

  const { error } = await client.functions.invoke("delete-account", { method: "POST" });
  if (error) return { ok: false, message: "We couldn't delete your account. Please try again." };

  await client.auth.signOut({ scope: "local" }).catch(() => undefined);
  return { ok: true };
}
