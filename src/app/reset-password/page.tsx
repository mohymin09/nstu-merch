"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Policy checks
  const hasMinLength = newPassword.length >= 12;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  if (!token) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-navy">Invalid or Missing Recovery Link</h2>
        <p className="text-xs text-brandText-secondary max-w-xs mx-auto">
          The password reset token is missing or malformed. Please request a new recovery link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-deep transition"
        >
          Request New Reset Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 12) {
      setError("Password must be at least 12 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to reset password.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-navy">Password Reset Complete!</h2>
        <p className="text-xs text-brandText-secondary max-w-xs mx-auto">
          Your account password has been updated. You can now securely log in with your new credentials.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-deep transition shadow"
        >
          Proceed to Login <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="text-xs font-bold text-brandText-primary block mb-1">
          New Password (min 12 chars) *
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-brandText-muted absolute left-3.5 top-3" />
          <input
            type={showNew ? "text" : "password"}
            required
            placeholder="Minimum 12 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brandText-muted hover:text-navy"
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-brandText-primary block mb-1">
          Confirm New Password *
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-brandText-muted absolute left-3.5 top-3" />
          <input
            type={showConfirm ? "text" : "password"}
            required
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brandText-muted hover:text-navy"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="p-3 bg-surface-soft rounded-xl text-[11px] text-brandText-secondary space-y-1">
        <p className={hasMinLength ? "text-emerald-700 font-bold" : "text-brandText-muted"}>
          {hasMinLength ? "✓" : "•"} At least 12 characters
        </p>
        <p className={passwordsMatch ? "text-emerald-700 font-bold" : "text-brandText-muted"}>
          {passwordsMatch ? "✓" : "•"} Passwords match
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting || !hasMinLength || !passwordsMatch}
        className="w-full py-3 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-xs transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? "Resetting Password..." : "Set New Password"} <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="text-2xl font-black text-navy">Set New Password</h1>
          <p className="text-xs text-brandText-secondary mt-1">
            Choose a strong, secure password for your NSTU Merch account
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-8 text-center text-xs text-brandText-muted">Loading reset form...</div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
