// Edge Function: user management for the Vision Express internal portal.
// Creating Auth accounts and banning users need the service role key, so these
// actions run here instead of in the browser. Callers must be active users who
// are ADMIN or hold the "users" permission.
//
// Deploy: supabase functions deploy admin-users

import { createClient } from "npm:@supabase/supabase-js@2";

const ADMIN_ONLY_PERMISSION = "users";
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{2,64}$/;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function fail(message: string, status = 400) {
  return json({ error: message }, status);
}

export function emailForUsername(username: string) {
  return `${username.trim().toLowerCase()}@ve-internal.local`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return fail("Method not allowed.", 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Who is calling?
  const token = (request.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: caller, error: callerError } = await admin.auth.getUser(token);
  if (callerError || !caller?.user) {
    return fail("You must be signed in.", 401);
  }
  const { data: callerProfile } = await admin
    .from("profiles")
    .select("id, role, active, user_permissions(permissions(name))")
    .eq("id", caller.user.id)
    .maybeSingle();
  const callerPermissions: string[] = (callerProfile?.user_permissions ?? [])
    .map((row: { permissions: { name: string } | null }) => row.permissions?.name)
    .filter(Boolean);
  const allowed = callerProfile?.active &&
    (callerProfile.role === "ADMIN" || callerPermissions.includes(ADMIN_ONLY_PERMISSION));
  if (!allowed) {
    return fail("You do not have permission to manage users.", 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request body.");
  }

  // Permission ids the caller may grant (everything except "users").
  async function grantablePermissionIds(requested: unknown): Promise<number[]> {
    const ids = Array.isArray(requested) ? requested.map(Number).filter(Number.isFinite) : [];
    if (ids.length === 0) return [];
    const { data } = await admin
      .from("permissions")
      .select("id")
      .in("id", ids)
      .neq("name", ADMIN_ONLY_PERMISSION);
    return (data ?? []).map((row: { id: number }) => row.id);
  }

  switch (body.action) {
    case "create": {
      const displayName = String(body.displayName ?? "").trim();
      const username = String(body.username ?? "").trim();
      const password = String(body.password ?? "");
      if (!displayName || !username || !password) {
        return fail("Display name, username, and password are required.");
      }
      if (!USERNAME_PATTERN.test(username)) {
        return fail("Username may only use letters, numbers, dots, dashes and underscores.");
      }
      if (password.length < 6) {
        return fail("Password must be at least 6 characters.");
      }
      const { data: existing } = await admin
        .from("profiles")
        .select("id")
        .ilike("username", username)
        .maybeSingle();
      if (existing) {
        return fail("Username already exists.");
      }

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: emailForUsername(username),
        password,
        email_confirm: true,
      });
      if (createError || !created.user) {
        return fail(createError?.message ?? "Unable to create user.");
      }

      const { error: profileError } = await admin.from("profiles").insert({
        id: created.user.id,
        username,
        display_name: displayName,
        role: "NON_ADMIN",
        active: true,
      });
      if (profileError) {
        await admin.auth.admin.deleteUser(created.user.id);
        return fail(profileError.message);
      }

      const permissionIds = await grantablePermissionIds(body.permissionIds);
      if (permissionIds.length > 0) {
        await admin.from("user_permissions").insert(
          permissionIds.map((permissionId) => ({ user_id: created.user.id, permission_id: permissionId })),
        );
      }
      return json({ ok: true, id: created.user.id });
    }

    case "update": {
      const userId = String(body.userId ?? "");
      const displayName = String(body.displayName ?? "").trim();
      if (!displayName) {
        return fail("Display name is required.");
      }
      const { data: target } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();
      if (!target) {
        return fail("User was not found.", 404);
      }

      await admin.from("profiles").update({ display_name: displayName }).eq("id", userId);

      // Replace grantable permissions; a held "users" permission is kept as-is.
      const { data: usersPermission } = await admin
        .from("permissions")
        .select("id")
        .eq("name", ADMIN_ONLY_PERMISSION)
        .single();
      await admin
        .from("user_permissions")
        .delete()
        .eq("user_id", userId)
        .neq("permission_id", usersPermission!.id);
      const permissionIds = await grantablePermissionIds(body.permissionIds);
      if (permissionIds.length > 0) {
        await admin.from("user_permissions").insert(
          permissionIds.map((permissionId) => ({ user_id: userId, permission_id: permissionId })),
        );
      }
      return json({ ok: true });
    }

    case "setActive": {
      const userId = String(body.userId ?? "");
      const active = Boolean(body.active);
      const { data: target } = await admin.from("profiles").select("id, role").eq("id", userId).maybeSingle();
      if (!target) {
        return fail("User was not found.", 404);
      }
      if (target.role === "ADMIN") {
        return fail("Admin users cannot be activated or deactivated.");
      }
      await admin.from("profiles").update({ active }).eq("id", userId);
      // Banning blocks sign-in and token refresh for deactivated users.
      await admin.auth.admin.updateUserById(userId, { ban_duration: active ? "none" : "876000h" });
      return json({ ok: true });
    }

    default:
      return fail("Unknown action.");
  }
});
