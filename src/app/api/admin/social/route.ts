import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";
import { SocialLink } from "@/lib/db/types";

export async function GET() {
  const links = await repository.getSocialLinks(false);
  return NextResponse.json({ links });
}

export async function POST(req: Request) {
  try {
    const { links } = await req.json();
    if (!Array.isArray(links)) {
      return NextResponse.json({ message: "Invalid payload format" }, { status: 400 });
    }
    const saved = await repository.saveSocialLinks(links as SocialLink[], "Admin");
    return NextResponse.json({ success: true, links: saved });
  } catch {
    return NextResponse.json({ message: "Failed to update social links" }, { status: 500 });
  }
}
