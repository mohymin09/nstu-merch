"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  CreditCard,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Order } from "@/lib/db/types";

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    metrics: any;
    recentOrders: Order[];
    lowStockVariants: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { metrics, recentOrders, lowStockVariants } = data;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy">Store Dashboard</h1>
          <p className="text-xs text-brandText-secondary mt-1">
            Real-time business performance and operational metrics for NSTU Merch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-primary hover:bg-primary-deep text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-navy hover:bg-navy-deep text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brandText-secondary">
              Total Revenue
            </span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-navy">৳ {metrics.totalRevenue}</span>
          <span className="text-[11px] text-brandText-muted block mt-1">
            From verified &amp; delivered orders
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between text-navy mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brandText-secondary">
              Total Orders
            </span>
            <ShoppingCart className="w-5 h-5 text-navy" />
          </div>
          <span className="text-2xl font-black text-navy">{metrics.totalOrders}</span>
          <div className="flex items-center gap-2 mt-1 text-[11px]">
            <span className="text-amber-600 font-bold">{metrics.pendingOrders} pending</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">{metrics.deliveredOrders} delivered</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between text-primary mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brandText-secondary">
              Active Products
            </span>
            <Package className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-navy">{metrics.totalProducts}</span>
          <span className="text-[11px] text-brandText-muted block mt-1">
            Across 8 university categories
          </span>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brandText-secondary">
              Inventory Alerts
            </span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-amber-600">
            {metrics.lowStockProducts + metrics.outOfStockProducts}
          </span>
          <div className="flex items-center gap-2 mt-1 text-[11px]">
            <span className="text-red-600 font-bold">{metrics.outOfStockProducts} out of stock</span>
            <span>•</span>
            <span className="text-amber-700 font-bold">{metrics.lowStockProducts} low stock</span>
          </div>
        </div>
      </div>

      {/* Action Banners & Verification Badge */}
      {metrics.pendingPayments > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">
                {metrics.pendingPayments} Pending Mobile Payment Verification(s)
              </p>
              <p className="text-xs">
                Customers have submitted bKash/Nagad/Rocket transaction IDs awaiting review.
              </p>
            </div>
          </div>
          <Link
            href="/admin/payments"
            className="px-3.5 py-1.5 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition"
          >
            Review Payments &rarr;
          </Link>
        </div>
      )}

      {/* Recent Orders & Low Stock Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-surface-border shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <h2 className="text-base font-extrabold text-navy">Recent Customer Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-brandText-muted py-6 text-center">No orders recorded yet.</p>
          ) : (
            <div className="divide-y divide-surface-border overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-brandText-muted font-bold uppercase tracking-wider pb-2">
                    <th className="py-2">Order #</th>
                    <th className="py-2">Customer</th>
                    <th className="py-2">Method</th>
                    <th className="py-2">Total</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-surface-soft/60 transition">
                      <td className="py-3 font-mono font-bold text-navy">{o.order_number}</td>
                      <td className="py-3">
                        <span className="font-semibold block text-brandText-primary">
                          {o.customer_name}
                        </span>
                        <span className="text-[10px] text-brandText-muted">
                          {o.customer_phone}
                        </span>
                      </td>
                      <td className="py-3 uppercase font-semibold text-brandText-secondary">
                        {o.payment_method}
                      </td>
                      <td className="py-3 font-bold text-navy">৳ {o.total}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            o.order_status === "delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : o.order_status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {o.order_status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders?q=${o.order_number}`}
                          className="text-xs font-bold text-navy hover:text-primary"
                        >
                          Review &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-surface-border shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <h2 className="text-base font-extrabold text-navy">Stock Thresholds</h2>
            <Link
              href="/admin/stock"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Inventory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {lowStockVariants.length === 0 ? (
            <p className="text-xs text-emerald-700 bg-emerald-50 p-4 rounded-xl text-center">
              All product variants are sufficiently stocked.
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockVariants.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface-soft border border-surface-border flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-navy">{item.product_name}</p>
                    <p className="text-[10px] text-brandText-muted font-mono">{item.sku}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-black ${
                      item.stock <= 0
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
