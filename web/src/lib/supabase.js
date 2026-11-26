import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && anonKey);

export const supabase = isConfigured
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

// Users sign in with a username; the Supabase Auth account behind it uses this e-mail.
export function emailForUsername(username) {
  return `${username.trim().toLowerCase()}@ve-internal.local`;
}

// Calls the admin-users Edge Function and turns its error replies into exceptions.
export async function callAdminUsers(body) {
  const { data, error } = await supabase.functions.invoke("admin-users", { body });
  if (error) {
    let message = error.message;
    try {
      const payload = await error.context.json();
      if (payload?.error) message = payload.error;
    } catch {
      // keep the generic message
    }
    throw new Error(message);
  }
  return data;
}
