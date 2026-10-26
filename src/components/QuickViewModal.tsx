"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart, Check, ShieldCheck, Truck } from "lucide-react";
import { Product, ProductVariant } from "@/lib/db/types";
import { useCart } from "@/context/CartContext";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  if (!product) return null;

  const defaultVariant = product.variants?.[0] || {
    id: `var-${product.id}`,
    product_id: product.id,
    sku: product.sku,
    attributes: {},
    regular_price: product.regular_price,
    sale_price: product.sale_price,
    stock_quantity: product.stock_quantity,
    image_url: product.images[0],
    is_active: true,
  };

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(defaultVariant);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const displayPrice = selectedVariant.sale_price ?? selectedVariant.regular_price;
  const originalPrice = selectedVariant.regular_price;
  const hasDiscount = selectedVariant.sale_price && selectedVariant.sale_price < selectedVariant.regular_price;
  const currentImage = selectedVariant.image_url || product.images[0] || "/assets/nstu-logo.png";
  const isOutOfStock = selectedVariant.stock_quantity <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const variantLabel = Object.entries(selectedVariant.attributes)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" / ") || "Standard";

    addItem({
      product_id: product.id,
      variant_id: selectedVariant.id,
      product_name: product.name,
      product_slug: product.slug,
      sku: selectedVariant.sku,
      variant_label: variantLabel,
      unit_price: displayPrice,
      regular_price: originalPrice,
      quantity,
      image_url: currentImage,
      max_stock: selectedVariant.stock_quantity,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 overflow-hidden z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-brandText-secondary hover:text-navy hover:bg-surface-soft transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="relative aspect-square rounded-xl bg-surface-alt border border-surface-border overflow-hidden">
            <Image src={currentImage} alt={product.name} fill className="object-contain p-4" />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-primary uppercase">
                {product.category_name}
              </span>
              <h2 className="text-xl font-bold text-navy mt-1">{product.name}</h2>
              <p className="text-xs text-brandText-muted mt-0.5">SKU: {selectedVariant.sku}</p>

              {/* Price */}
              <div className="flex items-center gap-3 mt-3">
                <span className="text-2xl font-extrabold text-navy">৳ {displayPrice}</span>
                {hasDiscount && (
                  <span className="text-sm text-brandText-muted line-through">
                    ৳ {originalPrice}
                  </span>
                )}
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold ${
                    isOutOfStock
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isOutOfStock ? "Out of Stock" : `In Stock (${selectedVariant.stock_quantity})`}
                </span>
              </div>

              <p className="text-xs text-brandText-secondary mt-3 leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Variants */}
              {product.variants && product.variants.length > 1 && (
                <div className="mt-4">
                  <label className="text-xs font-bold text-brandText-primary block mb-1.5">
                    Select Variation:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected = v.id === selectedVariant.id;
                      const label = Object.entries(v.attributes)
                        .map(([k, val]) => `${val}`)
                        .join(" - ") || v.sku;
                      return (
                        <button
                          key={v.id}
                          onClick={() => {
                            setSelectedVariant(v);
                            setQuantity(1);
                          }}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-surface-border text-brandText-primary hover:border-navy"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-4 flex items-center gap-3">
                <label className="text-xs font-bold text-brandText-primary">Quantity:</label>
                <div className="flex items-center border border-surface-border rounded-lg bg-surface-soft">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 py-1 text-sm font-bold text-brandText-secondary hover:text-navy"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold text-navy">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(selectedVariant.stock_quantity, quantity + 1))
                    }
                    className="px-2.5 py-1 text-sm font-bold text-brandText-secondary hover:text-navy"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                  isOutOfStock
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : isAdded
                    ? "bg-primary-deep text-white"
                    : "bg-primary hover:bg-primary-deep text-white shadow"
                }`}
              >
                {isOutOfStock ? (
                  "Out of Stock"
                ) : isAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="block text-center text-xs font-semibold text-navy hover:underline"
              >
                View Full Product Details &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
