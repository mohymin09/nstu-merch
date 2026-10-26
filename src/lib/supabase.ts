import { createClient as createBrowserClient } from "./supabase/client";
import { createAdminClient, isSupabaseAdminConfigured } from "./supabase/admin";

export { isSupabaseConfigured } from "./supabase/client";
export { isSupabaseAdminConfigured } from "./supabase/admin";

// Client-side singleton (browser-safe)
export const supabase = typeof window !== "undefined" ? createBrowserClient() : null;

// Server-side privileged client
export const getServiceSupabase = () => {
  return createAdminClient();
};
