"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Clock,
  Printer,
  ArrowRight,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Info,
} from "lucide-react";
import { Order, StoreSettings } from "@/lib/db/types";

export default function OrderConfirmationPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Manual payment submission state
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [referenceNote, setReferenceNote] = useState("");
  const [isSubmittingTrx, setIsSubmittingTrx] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch order
    fetch(`/api/admin/orders?q=${encodeURIComponent(params.orderNumber)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.orders && data.orders.length > 0) {
          const match = data.orders.find(
            (o: Order) => o.order_number === params.orderNumber || o.id === params.orderNumber
          );
          setOrder(match || data.orders[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, [params.orderNumber]);

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitTrx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSubmitError("");

    if (!senderNumber.trim() || !trxId.trim()) {
      setSubmitError("Please provide both your sender mobile number and the Transaction ID.");
      return;
    }

    setIsSubmittingTrx(true);
    try {
      const res = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          order_number: order.order_number,
          payment_method: order.payment_method,
          sender_number: senderNumber,
          transaction_id: trxId,
          reference_note: referenceNote,
          amount: order.total,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data.message || "Failed to submit transaction ID.");
        setIsSubmittingTrx(false);
        return;
      }

      setSubmitSuccess(true);
      setOrder({ ...order, payment_status: "submitted" });
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmittingTrx(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16">
        <div className="text-center">
          <h2 className="text-xl font-bold text-navy">Order not found</h2>
          <p className="text-xs text-brandText-secondary mt-1">
            Could not locate order #{params.orderNumber}.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block px-5 py-2 rounded-full bg-primary text-white text-xs font-bold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isManualPayment = ["bkash", "nagad", "rocket"].includes(order.payment_method);
  const paymentConfig = settings?.payment_methods?.[order.payment_method];

  return (
    <div className="bg-surface-soft min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Success Banner */}
        <div className="bg-white rounded-3xl border border-surface-border p-8 text-center shadow-card mb-8">
          <div className="w-16 h-16 rounded-full bg-[#EAF5F0] text-primary flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9" />
          </div>

          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Thank you for your order!
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-navy mt-1">
            Order Confirmed: {order.order_number}
          </h1>
          <p className="text-xs text-brandText-secondary mt-2 max-w-md mx-auto">
            A confirmation has been recorded. Please keep your Order Number for reference or tracking.
          </p>

          <div className="mt-6 flex flex-wrap justify-center items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-full border border-surface-border bg-surface-soft hover:bg-surface-alt text-navy text-xs font-bold flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
            <Link
              href="/track-order"
              className="px-4 py-2 rounded-full bg-navy hover:bg-navy-deep text-white text-xs font-bold transition"
            >
              Track Order Status
            </Link>
          </div>
        </div>

        {/* Manual Mobile Payment Submission Box */}
        {isManualPayment && paymentConfig && (
          <div className="bg-white rounded-2xl border-2 border-primary/30 p-6 shadow-card mb-8">
            <div className="flex items-start gap-3 border-b border-surface-border pb-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                ৳
              </div>
              <div>
                <h3 className="text-base font-extrabold text-navy">
                  Complete Your {paymentConfig.name} Payment
                </h3>
                <p className="text-xs text-brandText-secondary">
                  Please send <strong>৳ {order.total}</strong> to complete verification.
                </p>
              </div>
            </div>

            {/* Recipient Account Details */}
            <div className="bg-surface-soft p-4 rounded-xl border border-surface-border mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[11px] font-bold text-brandText-secondary uppercase">
                  {paymentConfig.name} Account ({paymentConfig.account_type})
                </span>
                <p className="text-xl font-black text-navy font-mono tracking-wider mt-0.5">
                  {paymentConfig.account_number}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopyNumber(paymentConfig.account_number)}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-surface-border text-xs font-bold text-navy hover:bg-surface-alt flex items-center gap-1.5 shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Copy Number"}
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="text-xs text-brandText-secondary bg-surface-alt p-3.5 rounded-xl border border-surface-border mb-6 space-y-1">
              <p className="font-bold text-navy">Payment Instructions:</p>
              <p>{paymentConfig.instructions}</p>
            </div>

            {/* Submission Form */}
            {submitSuccess || order.payment_status === "submitted" ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <div>
                  <p className="font-bold text-sm">Transaction ID Submitted!</p>
                  <p className="mt-0.5">
                    Our team will verify your transaction shortly. Your order status will update to &quot;Confirmed&quot;.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitTrx} className="space-y-4">
                <h4 className="text-xs font-bold text-navy uppercase tracking-wider">
                  Submit Payment Verification Details:
                </h4>

                {submitError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-brandText-primary block mb-1">
                      Your Sender Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 018XXXXXXXX"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brandText-primary block mb-1">
                      Transaction ID (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9J4K2L8M"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft font-mono uppercase"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingTrx}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-deep text-white text-xs font-bold transition flex items-center gap-2 shadow disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmittingTrx ? "Submitting..." : "Submit Transaction ID"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Invoice & Order Summary Details */}
        <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-surface-border gap-4">
            <div>
              <span className="text-xs text-brandText-muted uppercase tracking-wider">
                Order Reference
              </span>
              <p className="text-lg font-black text-navy">{order.order_number}</p>
              <p className="text-xs text-brandText-secondary mt-0.5">
                Date: {new Date(order.created_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-brandText-muted uppercase tracking-wider">
                Status
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800">
                  {order.order_status.replace("_", " ")}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-800">
                  Payment: {order.payment_status}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-surface-border text-xs">
            <div>
              <h4 className="font-bold text-navy uppercase tracking-wider mb-2">
                Delivery Details
              </h4>
              <p className="font-bold text-brandText-primary">{order.customer_name}</p>
              <p className="text-brandText-secondary mt-0.5">{order.customer_phone}</p>
              <p className="text-brandText-secondary mt-0.5">{order.delivery_address}</p>
              <p className="text-brandText-secondary mt-0.5">
                {order.area}, {order.district} ({order.delivery_zone} zone)
              </p>
            </div>

            <div>
              <h4 className="font-bold text-navy uppercase tracking-wider mb-2">
                Payment Information
              </h4>
              <p className="font-semibold text-brandText-primary uppercase">
                Method: {order.payment_method}
              </p>
              <p className="text-brandText-secondary mt-0.5">
                Payment Status: <strong className="uppercase">{order.payment_status}</strong>
              </p>
              {order.order_notes && (
                <p className="text-brandText-muted mt-2">Notes: {order.order_notes}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-3">
              Order Items
            </h4>
            <div className="divide-y divide-surface-border">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg bg-surface-alt border border-surface-border overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image_url || "/assets/nstu-logo.png"}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-navy">{item.product_name}</p>
                      <p className="text-brandText-secondary text-[11px]">{item.variant_label}</p>
                      <p className="text-brandText-muted text-[10px]">SKU: {item.sku}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-navy">৳ {item.total_price}</p>
                    <p className="text-[11px] text-brandText-muted">
                      {item.quantity} × ৳{item.unit_price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-surface-border pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-brandText-secondary">
              <span>Subtotal</span>
              <span className="font-bold text-navy">৳ {order.subtotal}</span>
            </div>
            <div className="flex justify-between text-brandText-secondary">
              <span>Delivery Fee ({order.delivery_zone})</span>
              <span className="font-bold text-navy">৳ {order.delivery_fee}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Discount</span>
                <span className="font-bold">- ৳ {order.discount}</span>
              </div>
            )}
            <div className="border-t border-surface-border pt-3 flex justify-between items-baseline text-sm">
              <span className="font-extrabold text-navy">Total Paid / Payable</span>
              <span className="text-xl font-black text-primary">৳ {order.total}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-navy hover:text-primary transition"
          >
            &larr; Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
