import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "merchandise-images";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}-${sanitizedName}`;

    // 1. Try Supabase Storage if configured
    const adminSupabase = createAdminClient();
    if (adminSupabase) {
      try {
        const { data: uploadData, error: uploadError } = await adminSupabase.storage
          .from(bucket)
          .upload(uniqueFileName, buffer, {
            contentType: file.type || "application/octet-stream",
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicData } = adminSupabase.storage.from(bucket).getPublicUrl(uniqueFileName);
          return NextResponse.json({
            success: true,
            url: publicData.publicUrl,
            provider: "supabase",
            path: uniqueFileName,
            bucket,
          });
        } else {
          console.warn("Supabase storage upload failed, falling back to local:", uploadError?.message);
        }
      } catch (storageErr) {
        console.warn("Supabase storage exception, falling back to local:", storageErr);
      }
    }

    // 2. Fallback: Save to public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const localFilePath = path.join(uploadDir, uniqueFileName);
    fs.writeFileSync(localFilePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${uniqueFileName}`,
      provider: "local",
      path: uniqueFileName,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Failed to process image upload",
      },
      { status: 500 }
    );
  }
}
