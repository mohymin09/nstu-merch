import React from "react";
import { db } from "@/lib/db/store";

export const revalidate = 0;

export default function TermsPage() {
  const settings = db.getSettings();

  return (
    <div className="bg-surface-soft min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-surface-border p-8 sm:p-10 shadow-card space-y-6">
          <h1 className="text-2xl font-black text-navy border-b border-surface-border pb-4">
            Terms &amp; Conditions
          </h1>
          <div className="prose text-xs text-brandText-secondary leading-relaxed space-y-4">
            <p>{settings.policies.terms_conditions}</p>
            <h3 className="text-sm font-bold text-navy">1. Brand Identity &amp; Disclaimer</h3>
            <p>
              NSTU Merch is an initiative offering university-inspired merchandise for students and alumni. Official university policies, academic inquiries, and admissions remain governed by Noakhali Science and Technology University (https://nstu.edu.bd/).
            </p>
            <h3 className="text-sm font-bold text-navy">2. Order Acceptance &amp; Verification</h3>
            <p>
              Orders placed with Cash on Delivery or manual mobile banking are subject to verification. Fake submissions, repeated failed deliveries, or fraudulent transaction references may result in account restrictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
