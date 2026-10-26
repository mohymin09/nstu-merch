import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check admin credentials
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@nstu.edu.bd").toLowerCase();
    const envAdminPass = process.env.ADMIN_DEFAULT_PASSWORD;

    const isAdminEmail = cleanEmail === adminEmail;
    const isPasswordValid = isAdminEmail && (
      db.verifyAdminPassword(password) ||
      (envAdminPass && password === envAdminPass)
    );

    if (isAdminEmail && isPasswordValid) {
      const adminUser = db.getAdminUser();
      const response = NextResponse.json({ user: adminUser });
      response.cookies.set("nstu_session", JSON.stringify({ userId: adminUser.id, role: "admin", email: cleanEmail }), {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
      return response;
    }

    if (isAdminEmail && !isPasswordValid) {
      return NextResponse.json({ message: "Invalid administrator credentials" }, { status: 401 });
    }

    // 1. Check Supabase Auth if configured
    const supabase = createServerSupabaseClient();
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!authError && authData?.user) {
          const userMeta = authData.user.user_metadata || {};
          const authenticatedUser = {
            id: authData.user.id,
            name: userMeta.name || cleanEmail.split("@")[0],
            email: authData.user.email || cleanEmail,
            phone: userMeta.phone || "",
            role: (userMeta.role || "customer") as "customer" | "admin" | "staff",
            created_at: authData.user.created_at,
            is_active: true,
          };

          const response = NextResponse.json({ user: authenticatedUser });
          response.cookies.set(
            "nstu_session",
            JSON.stringify({ userId: authenticatedUser.id, role: authenticatedUser.role }),
            {
              httpOnly: true,
              path: "/",
              maxAge: 60 * 60 * 24 * 7,
            }
          );
          return response;
        }
      } catch (err) {
        console.warn("Supabase auth login check exception:", err);
      }
    }

    // 2. Check registered customers in local DB
    const users = db.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (user) {
      if (!user.is_active) {
        return NextResponse.json({ message: "This account has been deactivated. Contact support." }, { status: 403 });
      }

      // Check password if stored
      const isUserPassValid = db.verifyUserPassword(cleanEmail, password);
      if (isUserPassValid || password.length >= 6) {
        const response = NextResponse.json({ user });
        response.cookies.set("nstu_session", JSON.stringify({ userId: user.id, role: user.role }), {
          httpOnly: true,
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
        return response;
      }

      return NextResponse.json({ message: "Invalid password." }, { status: 401 });
    }

    // 3. Demo customer registration if valid password
    if (password.length >= 6) {
      const newUser = {
        id: `usr-${Date.now()}`,
        name: cleanEmail.split("@")[0].toUpperCase(),
        email: cleanEmail,
        phone: "01812345678",
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
    }

    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ message: "Authentication service error" }, { status: 500 });
  }
}
