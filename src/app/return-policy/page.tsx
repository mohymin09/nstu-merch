import React from "react";
import { db } from "@/lib/db/store";

export const revalidate = 0;

export default function ReturnPolicyPage() {
  const settings = db.getSettings();

  return (
    <div className="bg-surface-soft min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-surface-border p-8 sm:p-10 shadow-card space-y-6">
          <h1 className="text-2xl font-black text-navy border-b border-surface-border pb-4">
            Return &amp; Refund Policy
          </h1>
          <div className="prose text-xs text-brandText-secondary leading-relaxed space-y-4">
            <p>{settings.policies.return_refund}</p>
            <h3 className="text-sm font-bold text-navy">1. Eligibility for Return / Exchange</h3>
            <p>
              Merchandise must be reported within 7 days of delivery. Items must be unwashed, unworn, and with tags and original packaging intact.
            </p>
            <h3 className="text-sm font-bold text-navy">2. Campus Booth Exchange</h3>
            <p>
              Students residing on campus can visit the NSTU Student Center booth during business hours for instant sizing exchanges.
            </p>
            <h3 className="text-sm font-bold text-navy">3. Damaged or Defective Items</h3>
            <p>
              If an item is received with a printing defect or transit damage, we provide a 100% free replacement or full refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
