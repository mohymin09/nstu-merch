import { createClient } from "@supabase/supabase-js";
import { normalizeSupabaseUrl } from "./config";

export const getSupabaseUrl = () => normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const getServiceRoleKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseAdminConfigured = Boolean(
  getSupabaseUrl() && getServiceRoleKey()
);

/**
 * Privileged server-only Supabase client.
 * Bypasses RLS for trusted background tasks (order creation, inventory movements, initial seeding).
 * NEVER import or expose in client-side code.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("Security Error: createAdminClient must never be called on the client side.");
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
