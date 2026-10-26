"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await register(name, email, phone, password);
    if (res.success) {
      router.push("/");
    } else {
      setError(res.message || "Registration failed.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-soft min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl border border-surface-border p-8 sm:p-10 max-w-md w-full shadow-card">
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
          <h1 className="text-2xl font-black text-navy">Create an Account</h1>
          <p className="text-xs text-brandText-secondary mt-1">
            Join NSTU Merch to track orders and save your delivery details
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
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-brandText-muted absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Sabbir Ahmed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-brandText-primary block mb-1">
              Email Address *
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
            <label className="text-xs font-bold text-brandText-primary block mb-1">
              Mobile Number (11 digits) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-brandText-muted absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                placeholder="01812345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-brandText-primary block mb-1">
              Password (min 6 characters) *
            </label>
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
            {loading ? "Creating Account..." : "Register Account"}{" "}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-surface-border text-center text-xs text-brandText-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
