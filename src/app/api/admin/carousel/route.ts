import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";
import { HeroSlide } from "@/lib/db/types";

export async function GET() {
  const slides = await repository.getHeroSlides(false);
  return NextResponse.json({ slides });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.title) {
      return NextResponse.json({ message: "Slide title is required" }, { status: 400 });
    }

    if (!data.id) {
      data.id = `slide-${Date.now()}`;
    }

    const saved = await repository.saveHeroSlide(data as HeroSlide, "Admin");
    return NextResponse.json({ success: true, slide: saved });
  } catch {
    return NextResponse.json({ message: "Failed to save carousel slide" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Slide ID required" }, { status: 400 });

    const ok = await repository.deleteHeroSlide(id, "Admin");
    return NextResponse.json({ success: ok });
  } catch {
    return NextResponse.json({ message: "Failed to delete slide" }, { status: 500 });
  }
}
