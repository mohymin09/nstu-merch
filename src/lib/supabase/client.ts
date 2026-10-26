import { createBrowserClient } from "@supabase/ssr";
import { normalizeSupabaseUrl } from "./config";

export const getSupabaseUrl = () => normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const getSupabaseAnonKey = () =>
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

export const isSupabaseConfigured = Boolean(
  getSupabaseUrl() && getSupabaseAnonKey()
);

export function createClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    return null;
  }
  return createBrowserClient(url, key);
}
