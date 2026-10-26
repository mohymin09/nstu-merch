"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Save, Check, ShieldCheck, CreditCard, Phone, Truck, FileText } from "lucide-react";
import { StoreSettings, PaymentMethodType } from "@/lib/db/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      alert("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const updatePaymentMethod = (key: PaymentMethodType, field: string, val: any) => {
    setSettings({
      ...settings,
      payment_methods: {
        ...settings.payment_methods,
        [key]: {
          ...settings.payment_methods[key],
          [field]: val,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy">Store &amp; Payment Settings</h1>
          <p className="text-xs text-brandText-secondary mt-0.5">
            Configure mobile banking numbers, delivery fees, brand identity, and policies
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-xs transition shadow flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? "Saving..." : success ? <><Check className="w-4 h-4" /> Settings Saved!</> : <><Save className="w-4 h-4" /> Save All Settings</>}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Payment Methods & Dynamic Recipient Numbers */}
        <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center gap-2.5 border-b border-surface-border pb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-extrabold text-navy">
                Payment Gateways &amp; Recipient Numbers
              </h2>
              <p className="text-xs text-brandText-secondary">
                Change bKash, Nagad, and Rocket numbers dynamically without code edits or redeployment
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* bKash */}
            <div className="p-5 rounded-2xl bg-pink-50/40 border border-pink-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-pink-700 text-sm">bKash Mobile Banking</span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={settings.payment_methods.bkash.is_enabled}
                    onChange={(e) => updatePaymentMethod("bkash", "is_enabled", e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-600"
                  />
                  <span className="font-bold text-navy">Enabled</span>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold text-brandText-primary block mb-1">
                  Recipient bKash Number (Send Money) *
                </label>
                <input
                  type="text"
                  value={settings.payment_methods.bkash.account_number}
                  onChange={(e) => updatePaymentMethod("bkash", "account_number", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-white font-mono font-bold text-navy"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-brandText-primary block mb-1">
                  Account Type
                </label>
                <select
                  value={settings.payment_methods.bkash.account_type}
                  onChange={(e) => updatePaymentMethod("bkash", "account_type", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-white"
                >
                  <option value="Personal">Personal (Send Money)</option>
                  <option value="Merchant">Merchant (Payment)</option>
                  <option value="Agent">Agent (Cash In)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-brandText-primary block mb-1">
                  Customer Instructions
                </label>
                <textarea
                  rows={2}
                  value={settings.payment_methods.bkash.instructions}
                  onChange={(e) => updatePaymentMethod("bkash", "instructions", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-white text-brandText-secondary"
                />
              </div>
            </div>

            {/* Nagad */}
            <div className="p-5 rounded-2xl bg-orange-50/40 border border-orange-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-orange-700 text-sm">Nagad Mobile Banking</span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={settings.payment_methods.nagad.is_enabled}
                    onChange={(e) => updatePaymentMethod("nagad", "is_enabled", e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-600"
                  />
                  <span className="font-bold text-navy">Enabled</span>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold text-brandText-primary block mb-1">
                  Recipient Nagad Number (Send Money) *
                </label>
                <input
                  type="text"
                  value={settings.payment_methods.nagad.account_number}
                  onChange={(e) => updatePaymentMethod("nagad", "account_number", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-white font-mono font-bold text-navy"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-brandText-primary block mb-1">
                  Account Type
                </label>
                <select
                  value={settings.payment_methods.nagad.account_type}
                  onChange={(e) => updatePaymentMethod("nagad", "account_type", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-white"
                >
                  <option value="Personal">Personal</option>
                  <option value="Merchant">Merchant</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-brandText-primary block mb-1">
                  Customer Instructions
                </label>
                <textarea
                  rows={2}
                  value={settings.payment_methods.nagad.instructions}
                  onChange={(e) => updatePaymentMethod("nagad", "instructions", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-white text-brandText-secondary"
                />
              </div>
            </div>

            {/* Rocket */}
            <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-purple-700 text-sm">Rocket Dutch-Bangla</span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={settings.payment_methods.rocket.is_enabled}
                    onChange={(e) => updatePaymentMethod("rocket", "is_enabled", e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-600"
                  />
                  <span className="font-bold text-navy">Enabled</span>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold text-brandText-primary block mb-1">
                  Recipient Rocket Number *
                </label>
                <input
                  type="text"
                  value={settings.payment_methods.rocket.account_number}
                  onChange={(e) => updatePaymentMethod("rocket", "account_number", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-white font-mono font-bold text-navy"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-brandText-primary block mb-1">
                  Customer Instructions
                </label>
                <textarea
                  rows={2}
                  value={settings.payment_methods.rocket.instructions}
                  onChange={(e) => updatePaymentMethod("rocket", "instructions", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-white text-brandText-secondary"
                />
              </div>
            </div>

            {/* COD & Cash */}
            <div className="p-5 rounded-2xl bg-surface-soft border border-surface-border space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-navy text-sm">Cash on Delivery &amp; Pickup</span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={settings.payment_methods.cod.is_enabled}
                    onChange={(e) => updatePaymentMethod("cod", "is_enabled", e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="font-bold text-navy">COD Enabled</span>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold text-brandText-primary block mb-1">
                  COD Reference / Hotline Number
                </label>
                <input
                  type="text"
                  value={settings.payment_methods.cod.account_number}
                  onChange={(e) => updatePaymentMethod("cod", "account_number", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-brandText-primary block mb-1">
                  Campus Pickup Contact Number
                </label>
                <input
                  type="text"
                  value={settings.payment_methods.cash.account_number}
                  onChange={(e) => updatePaymentMethod("cash", "account_number", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Delivery Rates */}
        <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-surface-border pb-3">
            <Truck className="w-5 h-5 text-primary" />
            <h2 className="text-base font-extrabold text-navy">Delivery Fees Configuration (৳)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-brandText-primary block mb-1">
                Inside NSTU Campus (৳)
              </label>
              <input
                type="number"
                value={settings.delivery_fees.campus}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery_fees: {
                      ...settings.delivery_fees,
                      campus: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brandText-primary block mb-1">
                Inside Noakhali District (৳)
              </label>
              <input
                type="number"
                value={settings.delivery_fees.noakhali}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery_fees: {
                      ...settings.delivery_fees,
                      noakhali: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brandText-primary block mb-1">
                Outside Noakhali / All Bangladesh (৳)
              </label>
              <input
                type="number"
                value={settings.delivery_fees.outside}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery_fees: {
                      ...settings.delivery_fees,
                      outside: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft font-bold"
              />
            </div>
          </div>
        </div>

        {/* 3. General Information & Brand Identity */}
        <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-surface-border pb-3">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-base font-extrabold text-navy">Brand &amp; Contact Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-brandText-primary block mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brandText-primary block mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brandText-primary block mb-1">
                Official Logo Asset Path
              </label>
              <input
                type="text"
                value={settings.logo_url}
                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brandText-primary block mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brandText-primary block mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brandText-primary block mb-1">
                Campus Hours
              </label>
              <input
                type="text"
                value={settings.business_hours}
                onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
