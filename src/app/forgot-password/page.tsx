"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setDevResetUrl(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to process recovery request.");
        setSubmitting(false);
        return;
      }

      setMessage(data.message);
      if (data.developmentResetUrl) {
        setDevResetUrl(data.developmentResetUrl);
      }
    } catch {
      setError("Network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-soft min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl border border-surface-border p-8 sm:p-10 max-w-md w-full shadow-card space-y-6">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-3">
            <Image
              src="/assets/nstu-logo.png"
              alt="NSTU Logo"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-navy">Account Recovery</h1>
          <p className="text-xs text-brandText-secondary mt-1">
            Enter your email address to receive a secure password reset link
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Recovery Request Submitted</p>
                <p className="mt-1 leading-relaxed">{message}</p>
              </div>
            </div>

            {devResetUrl && (
              <div className="p-3.5 rounded-xl bg-surface-soft border border-navy/20 text-xs space-y-2">
                <span className="font-bold text-navy block text-[11px] uppercase">
                  Development Mode Reset Link
                </span>
                <Link
                  href={devResetUrl}
                  className="block text-center py-2 px-3 rounded-lg bg-navy hover:bg-navy-deep text-white font-bold transition shadow-sm"
                >
                  Click Here to Reset Password &rarr;
                </Link>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-brandText-primary block mb-1">
                Registered Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brandText-muted absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@nstu.edu.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-xs transition shadow flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? "Dispatching..." : "Send Reset Instructions"}{" "}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-4 border-t border-surface-border text-center">
              <Link
                href="/login"
                className="text-xs font-bold text-brandText-secondary hover:text-navy inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
