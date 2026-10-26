"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login(email, password);
    if (res.success) {
      if (email.toLowerCase().includes("admin")) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } else {
      setError(res.message || "Failed to log in.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-soft min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl border border-surface-border p-8 sm:p-10 max-w-md w-full shadow-card">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="relative w-14 h-14 mx-auto mb-3">
            <Image
              src="/assets/nstu-logo.png"
              alt="NSTU Logo"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-navy">Welcome Back</h1>
          <p className="text-xs text-brandText-secondary mt-1">
            Sign in to track orders and manage your merchandise account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-brandText-primary block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brandText-muted absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="sabbir@student.nstu.edu.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-brandText-primary">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-brandText-muted absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-xs transition shadow flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-surface-border text-center text-xs text-brandText-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Register here
          </Link>
        </div>

        {/* Demo Credentials Hint */}
<div className="mt-6 p-3 rounded-xl bg-surface-soft border border-surface-border text-[11px] text-brandText-secondary space-y-1">
  <p className="font-bold text-navy flex items-center gap-1">
    <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Initial Admin Access:
  </p>
  <p>
    Email: <code className="bg-white px-1 py-0.5 rounded border">admin@nstu.edu.bd</code>
  </p>
  <p>
    Password: <code className="bg-white px-1 py-0.5 rounded border">nstuadmin123</code>
  </p>
</div>
      </div>
    </div>
  );
}
