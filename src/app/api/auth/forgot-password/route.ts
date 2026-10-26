import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";

// Rate limit map: email -> last request timestamp
const resetRateLimits = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ message: "A valid email address is required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Prevent abuse: allow max 1 reset request every 30 seconds per email
    const now = Date.now();
    const lastRequest = resetRateLimits.get(cleanEmail);
    if (lastRequest && now - lastRequest < 30 * 1000) {
      return NextResponse.json(
        { message: "A reset request was recently submitted. Please check your inbox or wait 30 seconds." },
        { status: 429 }
      );
    }
    resetRateLimits.set(cleanEmail, now);

    const tokenRes = db.createPasswordResetToken(cleanEmail);

    // Uniform response to prevent account enumeration
    const genericResponse: any = {
      success: true,
      message:
        "If an account matching this email exists, instructions to reset your password have been sent.",
    };

    // In local development / non-production environment, return reset URL directly for easy testing
    if (tokenRes.success && tokenRes.rawToken) {
      const resetUrl = `/reset-password?token=${tokenRes.rawToken}`;
      genericResponse.developmentResetUrl = resetUrl;
      console.log(`[AUTH NOTICE] Password reset link for ${cleanEmail}: ${resetUrl}`);
    }

    return NextResponse.json(genericResponse);
  } catch (error) {
    return NextResponse.json(
      { message: "Error processing password recovery request." },
      { status: 500 }
    );
  }
}
