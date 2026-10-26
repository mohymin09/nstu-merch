import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function GET() {
  const settings = await repository.getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  try {
    const updatedSettings = await req.json();
    const saved = await repository.updateSettings(updatedSettings, "Admin");
    return NextResponse.json({ success: true, settings: saved });
  } catch {
    return NextResponse.json({ message: "Failed to update store settings" }, { status: 500 });
  }
}
