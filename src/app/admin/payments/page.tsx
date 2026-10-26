"use client";

import React, { useState, useEffect } from "react";
import { Check, X, ShieldCheck, AlertCircle, Clock, CreditCard } from "lucide-react";
import { PaymentSubmission } from "@/lib/db/types";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const loadPayments = () => {
    setLoading(true);
    fetch("/api/admin/payments")
      .then((res) => res.json())
      .then((data) => {
        if (data.payments) setPayments(data.payments);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleReview = async (paymentId: string, status: "verified" | "rejected") => {
    setReviewingId(paymentId);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: paymentId, status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadPayments();
      } else {
        alert("Failed to review payment.");
      }
    } catch {
      alert("Error processing review.");
    } finally {
      setReviewingId(null);
    }
  };

  const pendingCount = payments.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy">Manual Payment Verification</h1>
          <p className="text-xs text-brandText-secondary mt-0.5">
            Audit and approve manual mobile banking transactions (bKash, Nagad, Rocket)
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-xl border border-surface-border text-xs shadow-sm">
          <span className="font-bold text-amber-700">{pendingCount} Pending Verification(s)</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-brandText-muted">Loading submissions...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-xs text-brandText-muted">
            No payment transaction submissions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft border-b border-surface-border text-brandText-secondary uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Gateway</th>
                  <th className="py-3 px-4">Sender Phone</th>
                  <th className="py-3 px-4">Transaction ID (TrxID)</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-soft/60 transition">
                    <td className="py-3 px-4 text-brandText-muted">
                      {new Date(p.created_at).toLocaleDateString()}{" "}
                      {new Date(p.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-navy">{p.order_number}</td>
                    <td className="py-3 px-4 uppercase font-bold text-brandText-primary">
                      {p.payment_method}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-navy">{p.sender_number}</td>
                    <td className="py-3 px-4 font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded inline-block">
                      {p.transaction_id}
                    </td>
                    <td className="py-3 px-4 font-black text-navy">৳ {p.amount}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          p.status === "verified"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReview(p.id, "verified")}
                            disabled={reviewingId === p.id}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-sm disabled:opacity-50"
                          >
                            Verify &amp; Confirm
                          </button>
                          <button
                            onClick={() => handleReview(p.id, "rejected")}
                            disabled={reviewingId === p.id}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition shadow-sm disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-brandText-muted">
                          Reviewed by {p.reviewed_by || "Admin"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
