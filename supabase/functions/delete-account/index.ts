// LR-02. Account deletion. verify_jwt must stay true.
// Do not deploy until this draft is approved. Settings does not call this.
//
// public.delete_account_data runs in one database transaction. auth.admin.deleteUser
// cannot join that transaction: GoTrue uses a second connection, so it still sees
// ON DELETE RESTRICT rows until the cleanup commits. If deleteUser fails, the same
// function restores the returned snapshot.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGIN = "https://evolvewithlivv.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
};

const KNOWN_ERRORS = [
  "Account deletion is not available.",
  "Account not found.",
  "Anonymous accounts cannot be deleted.",
  "Crew ownership could not be reassigned.",
  "Account restore payload does not match this user.",
];

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function knownError(message: string | undefined): string | null {
  if (!message) return null;
  return KNOWN_ERRORS.find((item) => message.includes(item)) ?? null;
}

function statusFor(message: string): number {
  if (message === "Account not found.") return 404;
  if (message === "Anonymous accounts cannot be deleted.") return 403;
  if (message === "Crew ownership could not be reassigned.") return 409;
  return 500;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization");
  if (!url || !serviceRoleKey || !authHeader?.startsWith("Bearer ")) {
    return json({ error: "A valid signed-in session is required." }, 401);
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return json({ error: "A valid signed-in session is required." }, 401);

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) return json({ error: "A valid signed-in session is required." }, 401);
  if (user.is_anonymous) return json({ error: "Anonymous accounts cannot be deleted." }, 403);

  const { data: snapshot, error: cleanupError } = await admin.rpc("delete_account_data", {
    p_user_id: user.id,
  });
  if (cleanupError || !snapshot || typeof snapshot !== "object") {
    const message = knownError(cleanupError?.message);
    console.error("[delete-account] cleanup failed", cleanupError?.message ?? "empty snapshot");
    if (message) return json({ error: message }, statusFor(message));
    return json({ error: "Account deletion could not be completed." }, 500);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (!deleteError) return json({ deleted: true }, 200);

  console.error("[delete-account] auth user delete failed", deleteError.message);
  const { error: restoreError } = await admin.rpc("delete_account_data", {
    p_user_id: user.id,
    p_restore: snapshot,
  });
  if (restoreError) {
    console.error("[delete-account] rollback failed", restoreError.message);
    return json({
      error: "Account data was removed, but the login could not be deleted and automatic rollback failed. Email privacy@evolvewithlivv.com.",
    }, 500);
  }

  return json({
    error: "Account deletion was rolled back because the login could not be removed. No account data was left deleted.",
  }, 503);
});
