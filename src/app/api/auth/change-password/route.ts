import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { getSessionFromCookie, validatePasswordPolicy } from "@/lib/auth-security";
import { isSupabaseConfigured, getServiceSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // 1. Authenticate session from trusted httpOnly cookie
    const session = getSessionFromCookie(req);

    if (!session || !session.userId) {
      return NextResponse.json(
        { message: "Authentication required. Please log in." },
        { status: 401 }
      );
    }

    // 2. Enforce Administrator Authorization
    if (session.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden. Only an authorized administrator can perform this action." },
        { status: 403 }
      );
    }

    const adminUser = db.getAdminUser();
    if (!adminUser || !adminUser.is_active) {
      return NextResponse.json(
        { message: "Administrator account is inactive or not found." },
        { status: 403 }
      );
    }

    // 3. Parse and validate payload fields
    const body = await req.json();
    const { current_password, new_password, confirm_password } = body;

    if (!current_password || !new_password || !confirm_password) {
      return NextResponse.json(
        { message: "All fields (current password, new password, and confirmation) are required." },
        { status: 400 }
      );
    }

    // 4. Verify Current Password
    const isCurrentValid = db.verifyAdminPassword(current_password);
    if (!isCurrentValid) {
      return NextResponse.json(
        { message: "The current password you entered is incorrect." },
        { status: 400 }
      );
    }

    // 5. Confirm matching confirmation
    if (new_password !== confirm_password) {
      return NextResponse.json(
        { message: "New password and confirmation password do not match." },
        { status: 400 }
      );
    }

    // 6. Reject identical new password
    if (current_password === new_password) {
      return NextResponse.json(
        { message: "New password cannot be identical to your current password." },
        { status: 400 }
      );
    }

    // 7. Enforce Password Security Policy (min 12 chars, uppercase, lowercase, number/symbol)
    const policyResult = validatePasswordPolicy(new_password);
    if (!policyResult.isValid) {
      return NextResponse.json(
        { message: policyResult.errors[0] || "Password does not meet complexity requirements." },
        { status: 400 }
      );
    }

    // 8. Update in Supabase Auth if configured
    if (isSupabaseConfigured) {
      try {
        const serviceSupabase = getServiceSupabase();
        if (serviceSupabase) {
          // If admin has a Supabase auth user record, update it
          await serviceSupabase.auth.admin.updateUserById(adminUser.id, {
            password: new_password,
          });
        }
      } catch (sbErr) {
        console.warn("Supabase auth sync notice (optional):", sbErr);
      }
    }

    // 9. Update password in persistent database store
    const updateResult = db.updateAdminPassword(new_password, adminUser.email);
    if (!updateResult.success) {
      return NextResponse.json(
        { message: updateResult.message || "Failed to update password." },
        { status: 400 }
      );
    }

    // 10. Rotate session token & set refreshed session cookie
    const response = NextResponse.json({
      success: true,
      message: "Administrator password has been successfully updated.",
    });

    response.cookies.set(
      "nstu_session",
      JSON.stringify({
        userId: adminUser.id,
        role: "admin",
        email: adminUser.email,
        rotatedAt: Date.now(),
      }),
      {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      }
    );

    return response;
  } catch (err) {
    return NextResponse.json(
      { message: "An unexpected server error occurred while updating password." },
      { status: 500 }
    );
  }
}
