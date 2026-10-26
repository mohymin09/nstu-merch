import React from "react";
import { db } from "@/lib/db/store";

export const revalidate = 0;

export default function PrivacyPolicyPage() {
  const settings = db.getSettings();

  return (
    <div className="bg-surface-soft min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-surface-border p-8 sm:p-10 shadow-card space-y-6">
          <h1 className="text-2xl font-black text-navy border-b border-surface-border pb-4">
            Privacy Policy
          </h1>
          <div className="prose text-xs text-brandText-secondary leading-relaxed space-y-4">
            <p>{settings.policies.privacy_policy}</p>
            <h3 className="text-sm font-bold text-navy">1. Information We Collect</h3>
            <p>
              We collect your full name, contact mobile number, delivery address, and order notes to fulfill and deliver university merchandise accurately.
            </p>
            <h3 className="text-sm font-bold text-navy">2. Payment References</h3>
            <p>
              For manual mobile banking (bKash/Nagad/Rocket), we only record your Transaction ID and sender number to verify transactions against our bank records. We never request your personal PIN or OTP.
            </p>
            <h3 className="text-sm font-bold text-navy">3. Security</h3>
            <p>
              All customer data is stored securely. We do not sell or lease student information to marketing brokers or unrelated third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
