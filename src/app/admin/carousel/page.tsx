"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, ArrowRight } from "lucide-react";
import { HeroSlide } from "@/lib/db/types";

export default function AdminCarouselPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSlides = () => {
    setLoading(true);
    fetch("/api/admin/carousel")
      .then((res) => res.json())
      .then((data) => {
        if (data.slides) setSlides(data.slides);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const openCreateModal = () => {
    setEditingSlide({
      badge: "OFFICIAL NSTU MERCHANDISE",
      title: "Carry Your Campus.",
      subtitle: "Keep Your Memories.",
      description: "Premium university-inspired products for every NSTU student.",
      cta_text: "Shop Now",
      cta_link: "/shop",
      desktop_image: "/assets/hero/hero-slide-1.jpg",
      display_order: slides.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (slide: HeroSlide) => {
    setEditingSlide({ ...slide });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSlide),
      });
      if (res.ok) {
        setIsModalOpen(false);
        loadSlides();
      }
    } catch {
      alert("Failed to save slide");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    try {
      await fetch(`/api/admin/carousel?id=${id}`, { method: "DELETE" });
      loadSlides();
    } catch {
      alert("Error deleting slide");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy">Hero Carousel Slides</h1>
          <p className="text-xs text-brandText-secondary mt-0.5">
            Configure homepage hero headlines, photography, call-to-actions, and ordering
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-primary hover:bg-primary-deep text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="bg-white rounded-3xl border border-surface-border p-6 shadow-card space-y-4"
          >
            <div className="relative aspect-[16/7] w-full rounded-2xl bg-surface-alt border border-surface-border overflow-hidden">
              <Image
                src={slide.desktop_image || "/assets/hero/hero-slide-1.jpg"}
                alt={slide.title}
                fill
                className="object-cover"
              />
              <span className="absolute top-3 left-3 bg-navy-deep/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                Order #{slide.display_order}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-primary uppercase">{slide.badge}</span>
              <h3 className="text-lg font-black text-navy">{slide.title}</h3>
              <p className="text-sm font-serif italic text-primary-deep font-bold">
                {slide.subtitle}
              </p>
              <p className="text-xs text-brandText-secondary mt-1">{slide.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-surface-border text-xs">
              <span
                className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                  slide.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                }`}
              >
                {slide.is_active ? "Active" : "Hidden"}
              </span>

              <div className="space-x-2">
                <button
                  onClick={() => openEditModal(slide)}
                  className="px-3 py-1 bg-navy text-white rounded-lg font-bold hover:bg-navy-deep transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 space-y-4">
            <h2 className="text-base font-black text-navy border-b border-surface-border pb-3">
              {editingSlide.id ? "Edit Hero Slide" : "Create Hero Slide"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-brandText-primary block mb-1">
                  Top Badge Text
                </label>
                <input
                  type="text"
                  value={editingSlide.badge || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-brandText-primary block mb-1">
                  Main Headline *
                </label>
                <input
                  type="text"
                  required
                  value={editingSlide.title || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-brandText-primary block mb-1">
                  Secondary Subtitle (Italic Green)
                </label>
                <input
                  type="text"
                  value={editingSlide.subtitle || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-brandText-primary block mb-1">
                  Description Text
                </label>
                <textarea
                  rows={2}
                  value={editingSlide.description || ""}
                  onChange={(e) =>
                    setEditingSlide({ ...editingSlide, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={editingSlide.cta_text || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, cta_text: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    CTA Link URL
                  </label>
                  <input
                    type="text"
                    value={editingSlide.cta_link || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, cta_link: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-brandText-primary block mb-1">
                  Desktop Image URL
                </label>
                <input
                  type="text"
                  value={editingSlide.desktop_image || ""}
                  onChange={(e) =>
                    setEditingSlide({ ...editingSlide, desktop_image: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs">
                <input
                  type="checkbox"
                  checked={editingSlide.is_active ?? true}
                  onChange={(e) =>
                    setEditingSlide({ ...editingSlide, is_active: e.target.checked })
                  }
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="font-bold text-navy">Slide Active</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-surface-border text-xs font-bold text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-deep text-white text-xs font-bold transition shadow"
                >
                  {saving ? "Saving..." : "Save Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
