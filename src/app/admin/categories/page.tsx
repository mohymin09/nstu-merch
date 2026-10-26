"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Layers, AlertCircle, Check } from "lucide-react";
import { Category } from "@/lib/db/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCategories = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory({
      name: "",
      slug: "",
      icon: "Tag",
      display_order: categories.length + 1,
      is_active: true,
    });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory({ ...c });
    setError("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to save category");
        setSaving(false);
        return;
      }

      setIsModalOpen(false);
      loadCategories();
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Cannot delete category with associated products.");
        return;
      }

      loadCategories();
    } catch {
      alert("Failed to delete category.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy">Category Management</h1>
          <p className="text-xs text-brandText-secondary mt-0.5">
            Organize merchandise into university collections and storefront navigation
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-primary hover:bg-primary-deep text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-brandText-muted">Loading categories...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft border-b border-surface-border text-brandText-secondary uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Icon Identifier</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-soft/60 transition">
                    <td className="py-3.5 px-4 font-bold text-navy">{c.display_order}</td>
                    <td className="py-3.5 px-4 font-bold text-navy">{c.name}</td>
                    <td className="py-3.5 px-4 font-mono text-brandText-secondary">
                      /category/{c.slug}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-primary">{c.icon}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {c.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg bg-surface-soft hover:bg-navy hover:text-white text-navy transition"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 rounded-lg bg-surface-soft hover:bg-red-600 hover:text-white text-red-600 transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
            <h2 className="text-base font-black text-navy border-b border-surface-border pb-3">
              {editingCategory.id ? "Edit Category" : "Add New Category"}
            </h2>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-brandText-primary block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Caps & Apparel"
                  value={editingCategory.name || ""}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-brandText-primary block mb-1">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  placeholder="caps-apparel"
                  value={editingCategory.slug || ""}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft font-mono focus:outline-none focus:border-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingCategory.display_order || 1}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        display_order: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Icon Name
                  </label>
                  <select
                    value={editingCategory.icon || "Tag"}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, icon: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
                  >
                    <option value="GraduationCap">GraduationCap (Apparel)</option>
                    <option value="Coffee">Coffee (Mugs)</option>
                    <option value="ShoppingBag">ShoppingBag (Bags)</option>
                    <option value="PenTool">PenTool (Stationery)</option>
                    <option value="Folder">Folder (Files)</option>
                    <option value="Key">Key (Keychains)</option>
                    <option value="Gift">Gift (Gift Sets)</option>
                    <option value="Star">Star (New Arrivals)</option>
                    <option value="Tag">Tag (General)</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs">
                <input
                  type="checkbox"
                  checked={editingCategory.is_active ?? true}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, is_active: e.target.checked })
                  }
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="font-bold text-navy">Category Active on Storefront</span>
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
                  {saving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
