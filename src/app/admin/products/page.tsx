"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Check,
  X,
  AlertCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import { Product, Category, ProductVariant } from "@/lib/db/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load products & categories
  const fetchData = () => {
    setLoading(true);
    Promise.all([fetch("/api/admin/products"), fetch("/api/admin/categories")])
      .then(async ([prodRes, catRes]) => {
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        if (prodData.products) setProducts(prodData.products);
        if (catData.categories) setCategories(catData.categories);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct({
      name: "",
      sku: "NSTU-",
      category_id: categories[0]?.id || "",
      regular_price: 500,
      sale_price: 400,
      description: "",
      images: ["/assets/products/nstu-cap.jpg"],
      is_featured: false,
      is_bestseller: false,
      is_new: true,
      is_published: true,
      stock_quantity: 20,
      low_stock_threshold: 5,
      variants: [
        {
          id: `var-${Date.now()}`,
          product_id: "",
          sku: "NSTU-VAR-1",
          attributes: { Edition: "Standard" },
          regular_price: 500,
          sale_price: 400,
          stock_quantity: 20,
          image_url: "/assets/products/nstu-cap.jpg",
          is_active: true,
        },
      ],
    });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(JSON.parse(JSON.stringify(p)));
    setError("");
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setError("");
    setSaving(true);

    try {
      // Find category name
      const cat = categories.find((c) => c.id === editingProduct.category_id);
      const payload = {
        ...editingProduct,
        category_name: cat ? cat.name : "Merchandise",
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to save product");
        setSaving(false);
        return;
      }

      setIsModalOpen(false);
      fetchData();
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert("Failed to delete product.");
    }
  };

  const addVariantRow = () => {
    if (!editingProduct) return;
    const newVar: ProductVariant = {
      id: `var-${Date.now()}`,
      product_id: editingProduct.id || "",
      sku: `${editingProduct.sku || "NSTU"}-V${(editingProduct.variants?.length || 0) + 1}`,
      attributes: { Option: "New Variant" },
      regular_price: Number(editingProduct.regular_price) || 500,
      sale_price: editingProduct.sale_price ? Number(editingProduct.sale_price) : undefined,
      stock_quantity: 10,
      image_url: editingProduct.images?.[0] || "/assets/nstu-logo.png",
      is_active: true,
    };
    setEditingProduct({
      ...editingProduct,
      variants: [...(editingProduct.variants || []), newVar],
    });
  };

  const removeVariantRow = (index: number) => {
    if (!editingProduct || !editingProduct.variants) return;
    const copy = [...editingProduct.variants];
    copy.splice(index, 1);
    setEditingProduct({ ...editingProduct, variants: copy });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy">Product Catalog &amp; Variants</h1>
          <p className="text-xs text-brandText-secondary mt-0.5">
            Manage merchandise items, pricing, multi-attribute variants, and stock
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-primary hover:bg-primary-deep text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-card flex items-center gap-3">
        <Search className="w-4 h-4 text-brandText-muted" />
        <input
          type="text"
          placeholder="Search by product title, SKU, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none text-brandText-primary"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-brandText-muted">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-brandText-muted">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft border-b border-surface-border text-brandText-secondary uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Price (৳)</th>
                  <th className="py-3.5 px-4">Total Stock</th>
                  <th className="py-3.5 px-4">Variants</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-soft/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg bg-surface-alt border border-surface-border overflow-hidden flex-shrink-0">
                          <Image
                            src={p.images[0] || "/assets/nstu-logo.png"}
                            alt={p.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-navy line-clamp-1">{p.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {p.is_new && (
                              <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded">
                                NEW
                              </span>
                            )}
                            {p.is_bestseller && (
                              <span className="text-[9px] bg-navy/10 text-navy font-bold px-1.5 py-0.2 rounded">
                                BEST SELLER
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-brandText-secondary">{p.category_name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-navy">{p.sku}</td>
                    <td className="py-3 px-4">
                      <span className="font-black text-navy">৳ {p.sale_price ?? p.regular_price}</span>
                      {p.sale_price && (
                        <span className="text-[10px] text-brandText-muted line-through block">
                          ৳ {p.regular_price}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-black px-2 py-0.5 rounded text-[11px] ${
                          p.stock_quantity <= 0
                            ? "bg-red-100 text-red-700"
                            : p.stock_quantity <= p.low_stock_threshold
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {p.stock_quantity} in stock
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-navy">
                      {p.variants?.length || 1} variant(s)
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.is_published
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {p.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg bg-surface-soft hover:bg-navy hover:text-white text-navy transition"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1.5 rounded-lg bg-surface-soft hover:bg-red-600 hover:text-white text-red-600 transition"
                        title="Delete Product"
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

      {/* Edit / Create Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl z-10 max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-surface-border pb-4">
              <h2 className="text-lg font-black text-navy">
                {editingProduct.id ? "Edit Product & Variants" : "Add New Merchandise"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-brandText-secondary hover:text-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* General details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Primary SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft font-mono focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.category_id || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category_id: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Regular Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.regular_price || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        regular_price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Sale Price (৳)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.sale_price || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        sale_price: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Product Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editingProduct.description || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs font-bold text-brandText-primary block mb-1">
                    Primary Image URL
                  </label>
                  <input
                    type="text"
                    value={editingProduct.images?.[0] || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        images: [e.target.value],
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-surface-soft focus:outline-none focus:border-navy"
                  />
                </div>
              </div>

              {/* Status toggles */}
              <div className="flex flex-wrap gap-4 pt-2 border-t border-surface-border text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_published ?? true}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_published: e.target.checked })
                    }
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="font-bold text-navy">Published in Store</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_new ?? false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_new: e.target.checked })
                    }
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="font-bold text-navy">Mark as New</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_bestseller ?? false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_bestseller: e.target.checked })
                    }
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="font-bold text-navy">Best Seller Badge</span>
                </label>
              </div>

              {/* Advanced Variants Section */}
              <div className="border-t border-surface-border pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy">
                      Product Variations Matrix (Size / Color / Stock)
                    </h3>
                    <p className="text-[11px] text-brandText-secondary">
                      Each variant has its own unique SKU, stock quantity, and optional sale price
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="px-3 py-1 bg-navy hover:bg-navy-deep text-white text-xs font-bold rounded-lg flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Variation
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {editingProduct.variants?.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="p-3 rounded-xl bg-surface-soft border border-surface-border grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs"
                    >
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-brandText-muted block">
                          Attribute &amp; Value
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Colour: Navy"
                          value={
                            Object.entries(v.attributes || {})
                              .map(([k, val]) => `${k}: ${val}`)
                              .join(", ") || ""
                          }
                          onChange={(e) => {
                            const [k = "Option", val = "Default"] = e.target.value.split(":");
                            const copy = [...(editingProduct.variants || [])];
                            copy[idx].attributes = { [k.trim()]: val.trim() };
                            setEditingProduct({ ...editingProduct, variants: copy });
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-surface-border bg-white"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-brandText-muted block">
                          Variant SKU
                        </label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => {
                            const copy = [...(editingProduct.variants || [])];
                            copy[idx].sku = e.target.value;
                            setEditingProduct({ ...editingProduct, variants: copy });
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-surface-border bg-white font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-brandText-muted block">
                          Regular (৳)
                        </label>
                        <input
                          type="number"
                          value={v.regular_price}
                          onChange={(e) => {
                            const copy = [...(editingProduct.variants || [])];
                            copy[idx].regular_price = Number(e.target.value);
                            setEditingProduct({ ...editingProduct, variants: copy });
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-surface-border bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-brandText-muted block">Stock</label>
                        <input
                          type="number"
                          value={v.stock_quantity}
                          onChange={(e) => {
                            const copy = [...(editingProduct.variants || [])];
                            copy[idx].stock_quantity = Number(e.target.value);
                            setEditingProduct({ ...editingProduct, variants: copy });
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-surface-border bg-white font-bold"
                        />
                      </div>

                      <div className="sm:col-span-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeVariantRow(idx)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Remove variant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save & Cancel */}
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-navy hover:bg-surface-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-deep text-white text-xs font-bold transition shadow disabled:opacity-60"
                >
                  {saving ? "Saving Product..." : "Save Product & Variants"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
