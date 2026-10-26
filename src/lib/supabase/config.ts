/**
 * Normalizes Supabase URL to ensure it is always a valid HTTPS URL.
 * Handles bare project reference IDs (e.g., "qdewbkfieloervrhvuml" -> "https://qdewbkfieloervrhvuml.supabase.co")
 * and domains without protocol.
 */
export function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return "";
  let trimmed = rawUrl.trim();
  if (!trimmed) return "";

  // If already full http(s) URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/+$/, "");
  }

  // If it's a domain ending in .supabase.co without protocol
  if (trimmed.includes(".supabase.co")) {
    return `https://${trimmed.replace(/\/+$/, "")}`;
  }

  // If it's just the 20-character project ref ID (e.g. qdewbkfieloervrhvuml)
  if (/^[a-z0-9_-]+$/i.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }

  return `https://${trimmed.replace(/\/+$/, "")}`;
}
