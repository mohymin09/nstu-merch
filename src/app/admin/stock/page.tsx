"use client";

import React, { useState, useEffect } from "react";
import {
  Archive,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  AlertTriangle,
  History,
  Check,
  X,
} from "lucide-react";
import { InventoryMovement } from "@/lib/db/types";

export default function AdminStockPage() {
  const [variants, setVariants] = useState<any[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  // Adjustment Modal
  const [adjustingVariant, setAdjustingVariant] = useState<any | null>(null);
  const [changeQty, setChangeQty] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadStockData = () => {
    setLoading(true);
    fetch("/api/admin/stock")
      .then((res) => res.json())
      .then((data) => {
        if (data.variants) setVariants(data.variants);
        if (data.movements) setMovements(data.movements);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStockData();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingVariant || changeQty === 0 || !reason.trim()) {
      setError("Please specify a non-zero adjustment quantity and a clear reason.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant_id: adjustingVariant.variant_id,
          change_quantity: changeQty,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to adjust stock.");
        setSubmitting(false);
        return;
      }

      setAdjustingVariant(null);
      setChangeQty(0);
      setReason("");
      loadStockData();
    } catch {
      setError("Network error while adjusting stock.");
    } finally {
      setSubmitting(false);
    }
  };

  const inStockCount = variants.filter((v) => v.status === "In Stock").length;
  const lowStockCount = variants.filter((v) => v.status === "Low Stock").length;
  const outOfStockCount = variants.filter((v) => v.status === "Out of Stock").length;

  const filteredVariants = variants.filter((v) => {
    if (filter === "low") return v.status === "Low Stock";
    if (filter === "out") return v.status === "Out of Stock";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-navy">Stock &amp; Inventory Management</h1>
        <p className="text-xs text-brandText-secondary mt-0.5">
          Atomic inventory movements, threshold alerts, and manual correction history
        </p>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <button
          onClick={() => setFilter("all")}
          className={`p-5 rounded-2xl border text-left transition shadow-card ${
            filter === "all" ? "bg-white border-primary ring-2 ring-primary" : "bg-white border-surface-border"
          }`}
        >
          <span className="text-xs font-bold text-brandText-secondary uppercase">
            Total Sellable Variants
          </span>
          <p className="text-2xl font-black text-navy mt-1">{variants.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {inStockCount} variants in healthy stock
          </span>
        </button>

        <button
          onClick={() => setFilter("low")}
          className={`p-5 rounded-2xl border text-left transition shadow-card ${
            filter === "low" ? "bg-amber-50/50 border-amber-500 ring-2 ring-amber-500" : "bg-white border-surface-border"
          }`}
        >
          <span className="text-xs font-bold text-amber-700 uppercase">
            Low Stock Alerts
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1">{lowStockCount}</p>
          <span className="text-[11px] text-brandText-muted mt-1 block">
            Below configured threshold
          </span>
        </button>

        <button
          onClick={() => setFilter("out")}
          className={`p-5 rounded-2xl border text-left transition shadow-card ${
            filter === "out" ? "bg-red-50/50 border-red-500 ring-2 ring-red-500" : "bg-white border-surface-border"
          }`}
        >
          <span className="text-xs font-bold text-red-700 uppercase">
            Out of Stock
          </span>
          <p className="text-2xl font-black text-red-600 mt-1">{outOfStockCount}</p>
          <span className="text-[11px] text-brandText-muted mt-1 block">
            Purchases temporarily disabled
          </span>
        </button>
      </div>

      {/* Inventory Variants Table */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
        <div className="p-5 border-b border-surface-border flex justify-between items-center">
          <h2 className="text-sm font-extrabold text-navy">
            Product Variants Stock Level ({filteredVariants.length})
          </h2>
          <span className="text-xs text-brandText-muted">Filter: {filter.toUpperCase()}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-brandText-muted">Loading inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft border-b border-surface-border text-brandText-secondary uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item &amp; Attributes</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Alert Threshold</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredVariants.map((v) => (
                  <tr key={v.variant_id} className="hover:bg-surface-soft/60 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-navy">{v.product_name}</p>
                      <p className="text-[11px] text-brandText-muted">
                        {Object.entries(v.attributes)
                          .map(([k, val]) => `${k}: ${val}`)
                          .join(" / ") || "Standard"}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-navy">{v.sku}</td>
                    <td className="py-3 px-4">
                      <span className="font-black text-sm text-navy">{v.stock_quantity}</span>
                    </td>
                    <td className="py-3 px-4 text-brandText-secondary">{v.low_stock_threshold}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          v.status === "Out of Stock"
                            ? "bg-red-100 text-red-700"
                            : v.status === "Low Stock"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setAdjustingVariant(v);
                          setChangeQty(0);
                          setReason("");
                          setError("");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-navy hover:bg-navy-deep text-white font-bold text-xs transition"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inventory Movements Log */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
        <div className="p-5 border-b border-surface-border flex items-center gap-2">
          <History className="w-4 h-4 text-navy" />
          <h2 className="text-sm font-extrabold text-navy">
            Audit Trail: Real-time Stock Movements Log
          </h2>
        </div>

        {movements.length === 0 ? (
          <div className="p-8 text-center text-xs text-brandText-muted">
            No stock movements recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft border-b border-surface-border text-brandText-secondary uppercase font-bold tracking-wider sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Product &amp; SKU</th>
                  <th className="py-2.5 px-4">Quantity Change</th>
                  <th className="py-2.5 px-4">Stock Before &rarr; After</th>
                  <th className="py-2.5 px-4">Reason</th>
                  <th className="py-2.5 px-4">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-soft/60 transition">
                    <td className="py-2 px-4 text-brandText-muted">
                      {new Date(m.created_at).toLocaleDateString()} {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 px-4 font-semibold text-navy">
                      {m.product_name} <span className="text-brandText-muted font-mono font-normal">({m.sku})</span>
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={`font-black ${
                          m.change_quantity > 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {m.change_quantity > 0 ? `+${m.change_quantity}` : m.change_quantity}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-brandText-secondary">
                      {m.previous_stock} &rarr; <strong>{m.new_stock}</strong>
                    </td>
                    <td className="py-2 px-4 text-brandText-primary">{m.reason}</td>
                    <td className="py-2 px-4 font-mono text-[11px] text-brandText-muted">
                      {m.actor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {adjustingVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm" onClick={() => setAdjustingVariant(null)} />

          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
            <div className="flex justify-between items-center border-b border-surface-border pb-3">
              <h3 className="text-base font-black text-navy">Adjust Variant Stock</h3>
              <button onClick={() => setAdjustingVariant(null)}>
                <X className="w-5 h-5 text-brandText-secondary hover:text-navy" />
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-navy">{adjustingVariant.product_name}</p>
              <p className="text-[11px] text-brandText-muted font-mono">
                SKU: {adjustingVariant.sku} | Current Stock: {adjustingVariant.stock_quantity}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-brandText-primary block mb-1">
                  Quantity Change (+ for Restock, - for Damage/Loss) *
                </label>
                <input
                  type="number"
                  required
                  value={changeQty}
                  onChange={(e) => setChangeQty(Number(e.target.value))}
                  placeholder="e.g. +20 or -2"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft font-bold focus:outline-none focus:border-navy"
                />
                <p className="text-[10px] text-brandText-muted mt-1">
                  New stock will become: <strong>{adjustingVariant.stock_quantity + changeQty}</strong>
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-brandText-primary block mb-1">
                  Reason for Adjustment *
                </label>
                <select
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy mb-2"
                >
                  <option value="">Select reason...</option>
                  <option value="New stock arrival / Supplier delivery">New stock arrival / Supplier delivery</option>
                  <option value="Damaged in campus storage">Damaged in campus storage</option>
                  <option value="Physical audit inventory recount">Physical audit inventory recount</option>
                  <option value="Returned item restored to sellable">Returned item restored to sellable</option>
                  <option value="Sample given for display at booth">Sample given for display at booth</option>
                </select>
                <input
                  type="text"
                  placeholder="Or enter custom reason notes..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setAdjustingVariant(null)}
                  className="px-4 py-2 rounded-xl border border-surface-border text-xs font-bold text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-deep text-white text-xs font-bold transition shadow"
                >
                  {submitting ? "Updating..." : "Commit Stock Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
