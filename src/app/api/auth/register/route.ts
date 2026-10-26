import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.getUsers().find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      return NextResponse.json({ message: "An account with this email already exists" }, { status: 400 });
    }

    let supabaseUserId: string | null = null;

    // 1. Try Supabase Auth if configured
    const supabase = createServerSupabaseClient();
    if (supabase) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: name.trim(),
              phone: phone.trim(),
            },
          },
        });

        if (authErr) {
          console.warn("Supabase Auth signUp note:", authErr.message);
        } else if (authData?.user) {
          supabaseUserId = authData.user.id;
        }
      } catch (err) {
        console.warn("Supabase Auth error during register:", err);
      }
    }

    const newUser = {
      id: supabaseUserId || `usr-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      role: "customer" as const,
      created_at: new Date().toISOString(),
      is_active: true,
    };

    db.getUsers().push(newUser);
    db.setUserPassword(newUser.id, cleanEmail, password);

    const response = NextResponse.json({ user: newUser });
    response.cookies.set("nstu_session", JSON.stringify({ userId: newUser.id, role: "customer" }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}
