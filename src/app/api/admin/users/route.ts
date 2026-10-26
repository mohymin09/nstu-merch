import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET() {
  const users = db.getUsers();
  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  try {
    const { id, is_active } = await req.json();
    const user = db.getUsers().find((u) => u.id === id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    user.is_active = is_active;
    db.logAudit("USER_STATUS_CHANGE", "user", id, "Admin", `Changed user ${user.email} active state to ${is_active}`);
    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
  }
}
