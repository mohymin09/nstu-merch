"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  Download,
  Printer,
  Edit2,
  CheckCircle,
  Truck,
  X,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Order, OrderStatus, PaymentStatus } from "@/lib/db/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Selected Order for Details & Update Modal
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>("pending");
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>("unpaid");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    let url = `/api/admin/orders?status=${statusFilter}&payment_status=${paymentFilter}`;
    if (search.trim()) url += `&q=${encodeURIComponent(search.trim())}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const openOrderModal = (o: Order) => {
    setActiveOrder(o);
    setNewOrderStatus(o.order_status);
    setNewPaymentStatus(o.payment_status);
    setCourierName(o.courier_name || "");
    setTrackingNumber(o.tracking_number || "");
    setInternalNotes(o.internal_notes || "");
    setCancelReason(o.cancellation_reason || "");
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    setUpdating(true);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: activeOrder.id,
          order_status: newOrderStatus,
          payment_status: newPaymentStatus,
          courier_name: courierName,
          tracking_number: trackingNumber,
          internal_notes: internalNotes,
          cancellation_reason: cancelReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActiveOrder(null);
        loadOrders();
      } else {
        alert("Failed to update order");
      }
    } catch {
      alert("Error updating order");
    } finally {
      setUpdating(false);
    }
  };

  // CSV Export
  const exportToCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Phone",
      "District",
      "Zone",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Subtotal",
      "Delivery Fee",
      "Total",
    ];

    const rows = orders.map((o) => [
      o.order_number,
      new Date(o.created_at).toISOString(),
      `"${o.customer_name}"`,
      `"${o.customer_phone}"`,
      `"${o.district}"`,
      o.delivery_zone,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.subtotal,
      o.delivery_fee,
      o.total,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nstu_orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy">Order Management</h1>
          <p className="text-xs text-brandText-secondary mt-0.5">
            Process student deliveries, manage fulfillment transitions, and verify orders
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="px-4 py-2.5 rounded-xl border border-surface-border bg-white text-navy font-bold text-xs hover:bg-surface-soft flex items-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4 text-primary" /> Export Orders to CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by order number (e.g. NSTU-2026-1001), name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-deep transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft text-navy font-bold focus:outline-none"
          >
            <option value="all">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft text-navy font-bold focus:outline-none"
          >
            <option value="all">All Payment Statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-brandText-muted">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-brandText-muted">
            No orders match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft border-b border-surface-border text-brandText-secondary uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-soft/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-navy">{o.order_number}</td>
                    <td className="py-3 px-4 text-brandText-muted">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-navy block">{o.customer_name}</span>
                      <span className="text-[10px] text-brandText-muted">{o.customer_phone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-brandText-primary block">
                        {o.district} ({o.delivery_zone})
                      </span>
                      <span className="text-[10px] text-brandText-muted truncate max-w-[120px] block">
                        {o.delivery_address}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase font-bold text-brandText-secondary">
                      {o.payment_method}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          o.payment_status === "verified"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.payment_status === "submitted"
                            ? "bg-blue-100 text-blue-800"
                            : o.payment_status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          o.order_status === "delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.order_status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : o.order_status === "confirmed"
                            ? "bg-primary text-white"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.order_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-navy">৳ {o.total}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openOrderModal(o)}
                        className="px-3 py-1.5 rounded-lg bg-navy hover:bg-navy-deep text-white font-bold text-xs transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details & Workflow Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm" onClick={() => setActiveOrder(null)} />

          <div className="relative bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl z-10 max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start border-b border-surface-border pb-4">
              <div>
                <span className="text-xs font-bold text-primary uppercase">Order Inspection</span>
                <h2 className="text-xl font-black text-navy">{activeOrder.order_number}</h2>
                <p className="text-[11px] text-brandText-muted">
                  Placed on {new Date(activeOrder.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 rounded-lg border border-surface-border hover:bg-surface-soft text-navy"
                  title="Print Packing Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveOrder(null)}>
                  <X className="w-5 h-5 text-brandText-secondary hover:text-navy" />
                </button>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-surface-soft p-4 rounded-2xl border border-surface-border">
              <div>
                <span className="font-bold uppercase text-brandText-secondary block mb-1">
                  Recipient Information
                </span>
                <p className="font-extrabold text-navy text-sm">{activeOrder.customer_name}</p>
                <p className="text-brandText-primary font-mono mt-0.5">{activeOrder.customer_phone}</p>
                {activeOrder.customer_email && (
                  <p className="text-brandText-muted">{activeOrder.customer_email}</p>
                )}
              </div>

              <div>
                <span className="font-bold uppercase text-brandText-secondary block mb-1">
                  Delivery Destination
                </span>
                <p className="text-brandText-primary">{activeOrder.delivery_address}</p>
                <p className="text-brandText-secondary">
                  {activeOrder.area}, {activeOrder.district} (Zone: {activeOrder.delivery_zone})
                </p>
                {activeOrder.order_notes && (
                  <p className="text-amber-800 font-semibold mt-1">Note: {activeOrder.order_notes}</p>
                )}
              </div>
            </div>

            {/* Items Snapshots */}
            <div>
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider mb-2">
                Order Items Snapshot
              </h3>
              <div className="divide-y divide-surface-border border border-surface-border rounded-xl overflow-hidden">
                {activeOrder.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg bg-surface-alt border border-surface-border overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image_url || "/assets/nstu-logo.png"}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-navy">{item.product_name}</p>
                        <p className="text-[11px] text-brandText-secondary">{item.variant_label}</p>
                        <p className="text-[10px] text-brandText-muted font-mono">SKU: {item.sku}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-navy">৳ {item.total_price}</p>
                      <p className="text-[10px] text-brandText-muted">
                        {item.quantity} × ৳{item.unit_price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status Update Form */}
            <form onSubmit={handleUpdateOrder} className="border-t border-surface-border pt-4 space-y-4">
              <h3 className="text-xs font-black text-navy uppercase tracking-wider">
                Fulfillment &amp; Status Controls
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Order Status *
                  </label>
                  <select
                    value={newOrderStatus}
                    onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft font-bold text-navy focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="awaiting_payment">Awaiting Payment</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled (Restores Stock)</option>
                    <option value="returned">Returned (Restores Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Payment Status *
                  </label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft font-bold text-navy focus:outline-none"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="submitted">Submitted (TrxID Received)</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Courier Name / Campus Runner
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Steadfast / NSTU Campus Runner"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Tracking Number / Consignment ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. STDF-849202"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft font-mono focus:outline-none"
                  />
                </div>

                {newOrderStatus === "cancelled" && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-red-700 block mb-1">
                      Cancellation Reason *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Customer requested cancellation / unverified COD"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-red-300 bg-red-50 text-red-900 focus:outline-none"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Internal Admin Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Internal reference notes for administrative staff"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setActiveOrder(null)}
                  className="px-4 py-2 rounded-xl border border-surface-border text-xs font-bold text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-deep text-white text-xs font-bold transition shadow"
                >
                  {updating ? "Saving Changes..." : "Save Status & Shipping"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
