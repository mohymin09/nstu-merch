import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await repository.getStatus();
    const envStatus = {
      hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== ""),
      hasAnonKey: Boolean(
        (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() !== "") ||
        (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.trim() !== "")
      ),
      hasServiceRoleKey: Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim() !== ""
      ),
      isConfigured: isSupabaseConfigured,
      isAdminConfigured: isSupabaseAdminConfigured,
    };

    return NextResponse.json({
      ...status,
      env: envStatus,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        configured: false,
        connected: false,
        provider: "local",
        error: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
