import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function POST() {
  try {
    const result = await repository.syncLocalToSupabase();
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to sync local data to Supabase",
          synced: result.synced,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully synchronized local merchandise, categories, slides, and settings to Supabase!",
      synced: result.synced,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Unexpected server error during sync",
      },
      { status: 500 }
    );
  }
}
