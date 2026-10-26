import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { validatePasswordPolicy } from "@/lib/auth-security";

export async function POST(req: Request) {
  try {
    const { token, new_password, confirm_password } = await req.json();

    if (!token || !new_password || !confirm_password) {
      return NextResponse.json(
        { message: "Recovery token, new password, and confirmation are required." },
        { status: 400 }
      );
    }

    if (new_password !== confirm_password) {
      return NextResponse.json(
        { message: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    const policy = validatePasswordPolicy(new_password);
    if (!policy.isValid) {
      return NextResponse.json(
        { message: policy.errors[0] || "Password does not meet complexity requirements." },
        { status: 400 }
      );
    }

    const result = db.verifyAndConsumeResetToken(token, new_password);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error processing password reset." },
      { status: 500 }
    );
  }
}
