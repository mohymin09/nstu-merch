import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";
import { Category } from "@/lib/db/types";

export async function GET() {
  const categories = await repository.getCategories(false);
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.name) {
      return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }

    if (!data.id) {
      data.id = `cat-${Date.now()}`;
    }

    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    const saved = await repository.saveCategory(data as Category, "Admin");
    return NextResponse.json({ success: true, category: saved });
  } catch {
    return NextResponse.json({ message: "Failed to save category" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Category ID required" }, { status: 400 });

    const res = await repository.deleteCategory(id, "Admin");
    if (!res.success) {
      return NextResponse.json({ message: res.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Failed to delete category" }, { status: 500 });
  }
}
