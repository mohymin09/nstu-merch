"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Package, Clock, CheckCircle2, Truck, AlertCircle } from "lucide-react";
import { Order } from "@/lib/db/types";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);

    if (!orderNumber.trim() || !phone.trim()) {
      setError("Please enter both Order Number and Mobile Number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?q=${encodeURIComponent(orderNumber.trim())}`);
      const data = await res.json();

      if (data.orders && data.orders.length > 0) {
        const cleanPhone = phone.replace(/[^0-9]/g, "");
        const match = data.orders.find(
          (o: Order) =>
            (o.order_number.toLowerCase() === orderNumber.trim().toLowerCase() || o.id === orderNumber.trim()) &&
            o.customer_phone.includes(cleanPhone)
        );

        if (match) {
          setOrder(match);
        } else {
          setError("No matching order found for this Order Number and Mobile Number combination.");
        }
      } else {
        setError("Order number not found.");
      }
    } catch {
      setError("Failed to fetch tracking data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-soft min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Live Status
          </span>
          <h1 className="text-3xl font-extrabold text-navy mt-1">Track Your Order</h1>
          <p className="text-xs text-brandText-secondary mt-1">
            Enter your order reference and phone number to see real-time fulfillment status
          </p>
        </div>

        {/* Tracking Input Card */}
        <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-brandText-primary block mb-1">
                  Order Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NSTU-2026-1001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-brandText-primary block mb-1">
                  Customer Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01812345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-xs transition shadow flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Search className="w-4 h-4" />
              {loading ? "Locating Order..." : "Check Order Status"}
            </button>
          </form>
        </div>

        {/* Order Result Card */}
        {order && (
          <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-surface-border gap-2">
              <div>
                <span className="text-xs font-mono font-bold text-navy text-lg block">
                  {order.order_number}
                </span>
                <span className="text-xs text-brandText-secondary">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-primary text-white">
                  {order.order_status.replace("_", " ")}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-800">
                  {order.payment_status}
                </span>
              </div>
            </div>

            {/* Courier & Tracking */}
            {order.tracking_number && (
              <div className="p-4 rounded-xl bg-surface-alt border border-surface-border flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-navy block">Courier: {order.courier_name || "Steadfast / Campus"}</span>
                  <span className="text-brandText-secondary font-mono">
                    Tracking ID: {order.tracking_number}
                  </span>
                </div>
                <Truck className="w-6 h-6 text-primary" />
              </div>
            )}

            {/* Items summary */}
            <div>
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2">
                Merchandise
              </h4>
              <div className="divide-y divide-surface-border text-xs">
                {order.items.map((i) => (
                  <div key={i.id} className="py-2.5 flex justify-between">
                    <div>
                      <p className="font-semibold text-navy">{i.product_name}</p>
                      <p className="text-[11px] text-brandText-muted">{i.variant_label}</p>
                    </div>
                    <span className="font-bold text-navy">
                      {i.quantity} × ৳{i.unit_price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-surface-border pt-4 flex justify-between text-xs font-bold text-navy">
              <span>Total Payable</span>
              <span className="text-base text-primary">৳ {order.total}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
