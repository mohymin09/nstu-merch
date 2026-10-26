"use client";

import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-surface-soft min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-navy mt-1">Contact NSTU Merch</h1>
          <p className="text-xs text-brandText-secondary mt-1">
            Questions about your order, sizing, or campus pickup? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Info Card (5 cols) */}
          <div className="md:col-span-5 bg-navy text-white p-8 rounded-3xl shadow-card space-y-6">
            <h3 className="text-lg font-bold">Contact Information</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Reach out to our campus representative or drop a message through the form.
            </p>

            <div className="space-y-4 text-xs text-slate-200">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>NSTU Student Center &amp; Central Cafeteria, Noakhali 3814</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>+880 1812 345678</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>nstu.merch@gmail.com</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Campus Booth Hours: 9:00 AM – 6:00 PM (Sat – Thu)</span>
              </div>
            </div>
          </div>

          {/* Form Card (7 cols) */}
          <div className="md:col-span-7 bg-white p-8 rounded-3xl border border-surface-border shadow-card">
            {submitted ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-lg font-bold text-navy">Message Received!</h3>
                <p className="text-xs text-brandText-secondary max-w-sm mx-auto">
                  Thank you for contacting NSTU Merch. A representative will respond via email or phone shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-brandText-primary block mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Sabbir Ahmed"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brandText-primary block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01812345678"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sabbir@student.nstu.edu.bd"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Message / Inquiry *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we assist you with university merchandise?"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-deep text-white text-xs font-bold transition flex items-center gap-2 shadow"
                >
                  <Send className="w-3.5 h-3.5" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
