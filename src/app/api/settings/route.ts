import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function GET() {
  const settings = await repository.getSettings();
  const socialLinks = await repository.getSocialLinks(true);
  const heroSlides = await repository.getHeroSlides(true);

  return NextResponse.json({
    settings,
    socialLinks,
    heroSlides,
  });
}
