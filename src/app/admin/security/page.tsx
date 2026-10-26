"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminSecurityPage() {
  const { user } = useAuth();

  // Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility Toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status State
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Real-time policy checks
  const hasMinLength = newPassword.length >= 12;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(newPassword);
  const isDifferentFromCurrent = newPassword.length > 0 && currentPassword.length > 0 && newPassword !== currentPassword;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleResetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Client-side validation checks
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please complete all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("The new password and confirmation password do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage("The new password cannot be identical to your current password.");
      return;
    }

    if (newPassword.length < 12) {
      setErrorMessage("The new password must be at least 12 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to update administrator password.");
        setSubmitting(false);
        return;
      }

      setSuccessMessage(
        "Administrator password has been successfully updated. Your new credentials are now active."
      );
      // Clear password fields immediately
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setErrorMessage("Network error occurred while updating password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Account Management
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy">
          Admin Profile &amp; Security
        </h1>
        <p className="text-xs sm:text-sm text-brandText-secondary mt-1">
          Manage your administrator access credentials, security policies, and session protection
        </p>
      </div>

      {/* Admin Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-border pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-navy text-white flex items-center justify-center font-black text-xl shadow-sm">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-navy">
                  {user?.name || "NSTU Store Administrator"}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary text-white tracking-wider">
                  Verified Administrator
                </span>
              </div>
              <p className="text-xs text-brandText-secondary mt-0.5 font-mono">
                {user?.email || "admin@nstu.edu.bd"}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-brandText-muted">
            <span className="block font-semibold text-brandText-primary">Session Security</span>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 sm:justify-end mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Encrypted Session
            </span>
          </div>
        </div>

        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-brandText-secondary">
          <div>
            <span className="text-brandText-muted block text-[11px]">Primary Role</span>
            <span className="font-bold text-navy">Super Administrator</span>
          </div>
          <div>
            <span className="text-brandText-muted block text-[11px]">Store Realm</span>
            <span className="font-bold text-navy">NSTU Merch (Storefront &amp; API)</span>
          </div>
          <div>
            <span className="text-brandText-muted block text-[11px]">Authentication Standard</span>
            <span className="font-bold text-navy">Scrypt Salted Hash + HTTP-Only Cookie</span>
          </div>
        </div>
      </div>

      {/* Change Password Form Card */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-3 border-b border-surface-border pb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-navy">Change Login Password</h2>
            <p className="text-xs text-brandText-secondary">
              Update your account password with strict security policy enforcement
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Success</p>
              <p className="mt-0.5 leading-relaxed">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Update Notice</p>
              <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Current Password */}
          <div>
            <label className="text-xs font-bold text-brandText-primary block mb-1.5">
              Current Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brandText-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showCurrent ? "text" : "password"}
                required
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 text-xs rounded-xl border border-surface-border bg-surface-soft text-brandText-primary focus:outline-none focus:border-navy focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brandText-muted hover:text-navy transition"
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-brandText-muted mt-1">
              Used to verify your administrative authority before making changes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 2. New Password */}
            <div>
              <label className="text-xs font-bold text-brandText-primary block mb-1.5">
                New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brandText-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNew ? "text" : "password"}
                  required
                  placeholder="Minimum 12 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 text-xs rounded-xl border border-surface-border bg-surface-soft text-brandText-primary focus:outline-none focus:border-navy focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brandText-muted hover:text-navy transition"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 3. Confirm Password */}
            <div>
              <label className="text-xs font-bold text-brandText-primary block mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brandText-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 text-xs rounded-xl border border-surface-border bg-surface-soft text-brandText-primary focus:outline-none focus:border-navy focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brandText-muted hover:text-navy transition"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Password Policy Checklist */}
          <div className="p-4 rounded-2xl bg-surface-soft border border-surface-border space-y-2.5 text-xs">
            <span className="font-bold text-navy block text-[11px] uppercase tracking-wider">
              Password Requirements
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    hasMinLength ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {hasMinLength ? "✓" : "•"}
                </span>
                <span className={hasMinLength ? "text-emerald-800 font-semibold" : "text-brandText-secondary"}>
                  Minimum 12 characters (passphrases allowed)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    hasUpper && hasLower ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {hasUpper && hasLower ? "✓" : "•"}
                </span>
                <span className={hasUpper && hasLower ? "text-emerald-800 font-semibold" : "text-brandText-secondary"}>
                  Uppercase &amp; lowercase letters
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    hasNumberOrSymbol ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {hasNumberOrSymbol ? "✓" : "•"}
                </span>
                <span className={hasNumberOrSymbol ? "text-emerald-800 font-semibold" : "text-brandText-secondary"}>
                  At least one number or symbol
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    passwordsMatch ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {passwordsMatch ? "✓" : "•"}
                </span>
                <span className={passwordsMatch ? "text-emerald-800 font-semibold" : "text-brandText-secondary"}>
                  New passwords match
                </span>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-3 pt-4 border-t border-surface-border">
            <button
              type="button"
              onClick={handleResetForm}
              disabled={submitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-surface-border bg-white text-navy font-bold text-xs hover:bg-surface-soft transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Form
            </button>

            <button
              type="submit"
              disabled={submitting || !hasMinLength || !passwordsMatch}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-xs transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                "Verifying & Updating..."
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Save New Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
