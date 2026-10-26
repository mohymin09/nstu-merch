import React from "react";

export default function FAQPage() {
  const faqs = [
    {
      q: "How does campus delivery work at NSTU?",
      a: "For all orders inside the NSTU Campus (Halls, Departments, or Campus gates), our student delivery agent will deliver within 24 hours. The delivery fee is just ৳30.",
    },
    {
      q: "What payment methods are supported?",
      a: "We support Cash on Delivery (COD), manual bKash Send Money, Nagad Send Money, Rocket Send Money, and direct Cash Payment at the campus booth.",
    },
    {
      q: "How do I pay using bKash, Nagad, or Rocket?",
      a: "Select your mobile payment option at checkout, send the total order amount to our designated number via Send Money, and enter your Transaction ID (TrxID) and sender number on the confirmation page.",
    },
    {
      q: "Can I exchange an item if the size does not fit?",
      a: "Yes! Sizing exchanges for caps and apparel are available within 7 days of delivery at our student center booth, provided items are unworn with original packaging.",
    },
    {
      q: "Do you ship outside Noakhali to other districts?",
      a: "Yes, we ship all across Bangladesh using Steadfast and RedX couriers. Delivery typically takes 2 to 4 business days.",
    },
  ];

  return (
    <div className="bg-surface-soft min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Help Center
          </span>
          <h1 className="text-3xl font-extrabold text-navy mt-1">Frequently Asked Questions</h1>
          <p className="text-xs text-brandText-secondary mt-1">
            Common questions about orders, payments, and delivery at NSTU
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-surface-border shadow-card">
              <h3 className="text-sm font-bold text-navy">{faq.q}</h3>
              <p className="text-xs text-brandText-secondary mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
