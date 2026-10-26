"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCode,
  Copy,
  Check,
  HardDrive,
  Key,
  ShieldCheck,
  Server,
  Layers,
} from "lucide-react";

interface StatusResponse {
  configured: boolean;
  connected: boolean;
  provider: "supabase" | "local";
  error?: string;
  stats?: {
    products: number;
    categories: number;
    orders: number;
  };
  env?: {
    hasUrl: boolean;
    hasAnonKey: boolean;
    hasServiceRoleKey: boolean;
    isConfigured: boolean;
    isAdminConfigured: boolean;
  };
}

export default function AdminDatabasePage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/supabase-status");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Status fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSync = async () => {
    if (!confirm("This will synchronize all local products, categories, hero slides, and settings into your Supabase database. Continue?")) {
      return;
    }

    setSyncing(true);
    setSyncResult(null);

    try {
      const res = await fetch("/api/admin/sync-supabase", {
        method: "POST",
      });
      const data = await res.json();
      setSyncResult(data);
      fetchStatus();
    } catch (err: any) {
      setSyncResult({ success: false, error: err?.message || "Sync failed" });
    } finally {
      setSyncing(false);
    }
  };

  const handleCopyEnvSample = () => {
    const text = `# Supabase Production Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy flex items-center gap-2.5">
            <Database className="w-6 h-6 text-primary" />
            Supabase Backend &amp; Database
          </h1>
          <p className="text-xs text-brandText-secondary mt-0.5">
            Monitor real-time Supabase connection, environment variables, storage buckets, and synchronize local catalog
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white border border-surface-border hover:bg-surface-soft text-navy font-bold text-xs transition shadow-sm flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </button>
      </div>

      {/* 1. Connection Status Banner */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                status?.connected
                  ? "bg-emerald-100 text-emerald-700"
                  : status?.configured
                  ? "bg-amber-100 text-amber-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {status?.connected ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : status?.configured ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <HardDrive className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-navy">
                  Active Provider:{" "}
                  <span className="uppercase text-primary">
                    {status?.connected ? "Supabase PostgreSQL" : "Local Storage (db.json)"}
                  </span>
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    status?.connected
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {status?.connected ? "Live Remote" : "Fallback Active"}
                </span>
              </div>
              <p className="text-xs text-brandText-secondary mt-1">
                {status?.connected
                  ? "Your NSTU Merch application is actively querying and synchronizing with your live Supabase cloud database."
                  : status?.configured
                  ? `Supabase credentials detected, but connection check returned: ${status?.error || "Offline / Schema Pending"}. App is running seamlessly using local fallback.`
                  : "Application is running safely on the resilient local JSON store. Provide credentials in .env.local to link remote Supabase."}
              </p>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing || !status?.configured}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-xs transition shadow flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            <UploadCloud className={`w-4 h-4 ${syncing ? "animate-bounce" : ""}`} />
            {syncing ? "Syncing Catalog..." : "Push Local Catalog to Supabase"}
          </button>
        </div>

        {syncResult && (
          <div
            className={`mt-4 p-4 rounded-2xl text-xs ${
              syncResult.success
                ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                : "bg-rose-50 border border-rose-200 text-rose-900"
            }`}
          >
            <p className="font-bold">
              {syncResult.success ? "Sync Successful!" : "Sync Failed:"}
            </p>
            <p className="mt-1">
              {syncResult.message || syncResult.error}
            </p>
            {syncResult.synced && (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 font-mono text-[11px]">
                <span>Categories: {syncResult.synced.categories}</span>
                <span>Products: {syncResult.synced.products}</span>
                <span>Variants: {syncResult.synced.variants}</span>
                <span>Settings: {syncResult.synced.settings ? "Yes" : "No"}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Environment Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* NEXT_PUBLIC_SUPABASE_URL */}
        <div className="bg-white rounded-3xl border border-surface-border p-5 shadow-card space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-brandText-secondary uppercase">URL Variable</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status?.env?.hasUrl ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
          </div>
          <p className="font-mono text-xs font-bold text-navy truncate">NEXT_PUBLIC_SUPABASE_URL</p>
          <p className="text-[11px] text-brandText-secondary">
            {status?.env?.hasUrl ? "Detected in environment" : "Missing in .env.local"}
          </p>
        </div>

        {/* NEXT_PUBLIC_SUPABASE_ANON_KEY */}
        <div className="bg-white rounded-3xl border border-surface-border p-5 shadow-card space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-brandText-secondary uppercase">Client Anon Key</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status?.env?.hasAnonKey ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
          </div>
          <p className="font-mono text-xs font-bold text-navy truncate">NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
          <p className="text-[11px] text-brandText-secondary">
            {status?.env?.hasAnonKey ? "Detected in environment" : "Missing in .env.local"}
          </p>
        </div>

        {/* SUPABASE_SERVICE_ROLE_KEY */}
        <div className="bg-white rounded-3xl border border-surface-border p-5 shadow-card space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-brandText-secondary uppercase">Server Service Role</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status?.env?.hasServiceRoleKey ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
          </div>
          <p className="font-mono text-xs font-bold text-navy truncate">SUPABASE_SERVICE_ROLE_KEY</p>
          <p className="text-[11px] text-brandText-secondary">
            {status?.env?.hasServiceRoleKey ? "Detected (Server Only)" : "Missing in .env.local"}
          </p>
        </div>
      </div>

      {/* 3. Setup Instructions & Migration Card */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-2.5 border-b border-surface-border pb-4">
          <Server className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-base font-extrabold text-navy">
              Connecting Your Supabase Project (3 Easy Steps)
            </h2>
            <p className="text-xs text-brandText-secondary">
              Follow these steps to initialize your tables, RLS policies, and storage buckets
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-surface-soft border border-surface-border space-y-2">
            <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="font-extrabold text-xs text-navy">Get API Credentials</h3>
            <p className="text-[11px] text-brandText-secondary leading-relaxed">
              Open your Supabase Project &rarr; <strong>Project Settings</strong> &rarr; <strong>API</strong>. Copy your <strong>Project URL</strong>, <strong>anon public key</strong>, and <strong>service_role secret key</strong>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-soft border border-surface-border space-y-2">
            <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="font-extrabold text-xs text-navy">Enter in .env.local</h3>
            <p className="text-[11px] text-brandText-secondary leading-relaxed">
              Open <code className="bg-white px-1 py-0.5 rounded border text-primary">.env.local</code> in the project root and paste your 3 keys. The server will automatically reload them.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-soft border border-surface-border space-y-2">
            <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="font-extrabold text-xs text-navy">Run Initial Migration</h3>
            <p className="text-[11px] text-brandText-secondary leading-relaxed">
              Open <strong>SQL Editor</strong> in Supabase, paste the contents of <code className="bg-white px-1 py-0.5 rounded border text-primary">supabase/migrations/001_initial_schema.sql</code>, and click <strong>Run</strong>.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F2238] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <p className="text-xs font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              Migration Schema File: <span className="font-mono text-emerald-400">supabase/migrations/001_initial_schema.sql</span>
            </p>
            <p className="text-[11px] text-gray-300">
              Includes all tables, Row Level Security (RLS) policies, auth trigger handle_new_user(), and storage buckets.
            </p>
          </div>
          <button
            onClick={handleCopyEnvSample}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/10"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied Sample!" : "Copy .env Sample"}
          </button>
        </div>
      </div>
    </div>
  );
}
