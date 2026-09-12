import { getSupabaseBrowserClient } from "./client";

export async function isCloudOnboardingComplete(): Promise<boolean> {
  const client = getSupabaseBrowserClient();
  if (!client) return false;

  const { data: userData, error: userError } = await client.auth.getUser();
  const user = userData?.user;
  if (userError || !user || user.is_anonymous) return false;

  const { data, error } = await client
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error("Could not verify your LIVV account. Please try again.");
  return Boolean(data?.onboarding_completed_at);
}

export async function markCloudOnboardingComplete(displayName: string): Promise<void> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("LIVV account sync is unavailable. Please try again.");

  const { data: userData, error: userError } = await client.auth.getUser();
  const user = userData?.user;
  if (userError || !user || user.is_anonymous) {
    throw new Error("Your email session could not be verified. Please sign in again.");
  }

  const { error } = await client
    .from("profiles")
    .update({
      display_name: displayName.trim() || "Member",
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw new Error("Could not save your LIVV account. Please try again.");
}
