import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function GET() {
  const logs = await repository.getAuditLogs();
  return NextResponse.json({ logs });
}
