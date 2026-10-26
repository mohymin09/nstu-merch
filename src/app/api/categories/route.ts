import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function GET() {
  const categories = await repository.getCategories(true);
  return NextResponse.json({ categories });
}
