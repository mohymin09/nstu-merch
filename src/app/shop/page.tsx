import React from "react";
import Link from "next/link";
import { db } from "@/lib/db/store";
import ProductCard from "@/components/ProductCard";

interface ShopPageProps {
  searchParams: {
    category?: string;
    sort?: string;
    q?: string;
  };
}

export const revalidate = 0;

export default function ShopPage({ searchParams }: ShopPageProps) {
  const { category: catSlug, sort, q } = searchParams;

  const allCategories = db.getCategories(true);
  let products = db.getProducts(false);

  // Filter by category
  if (catSlug) {
    const matchedCat = allCategories.find((c) => c.slug === catSlug);
    if (matchedCat) {
      products = products.filter((p) => p.category_id === matchedCat.id);
    }
  }

  // Filter by search query
  if (q) {
    const query = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category_name?.toLowerCase().includes(query)
    );
  }

  // Sorting
  if (sort === "price-low") {
    products.sort((a, b) => (a.sale_price ?? a.regular_price) - (b.sale_price ?? b.regular_price));
  } else if (sort === "price-high") {
    products.sort((a, b) => (b.sale_price ?? b.regular_price) - (a.sale_price ?? a.regular_price));
  } else if (sort === "newest") {
    products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sort === "bestseller") {
    products.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
  }

  const activeCategory = allCategories.find((c) => c.slug === catSlug);

  return (
    <div className="bg-surface-soft min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <div className="text-xs text-brandText-secondary flex items-center gap-2 mb-2">
            <Link href="/" className="hover:text-navy">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-navy">Shop</span>
            {activeCategory && (
              <>
                <span>/</span>
                <span className="text-primary font-bold">{activeCategory.name}</span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-navy">
                {activeCategory ? activeCategory.name : q ? `Search results for "${q}"` : "All Merchandise"}
              </h1>
              <p className="text-sm text-brandText-secondary mt-1">
                Showing {products.length} university-inspired products
              </p>
            </div>

            {/* Sort Dropdown */}
            <form method="GET" className="flex items-center gap-2">
              {catSlug && <input type="hidden" name="category" value={catSlug} />}
              {q && <input type="hidden" name="q" value={q} />}
              <label htmlFor="sort" className="text-xs font-bold text-brandText-secondary">
                Sort By:
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={sort || "featured"}
                className="text-xs font-semibold py-2 px-3 rounded-lg border border-surface-border bg-white text-navy focus:outline-none focus:border-navy"
              >
                <option value="featured">Featured</option>
                <option value="newest">New Arrivals</option>
                <option value="bestseller">Best Sellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <button
                type="submit"
                className="px-3 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-deep transition"
              >
                Apply
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
              <h3 className="text-sm font-extrabold text-navy uppercase tracking-wider mb-4 border-b border-surface-border pb-2">
                Categories
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/shop"
                    className={`block py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                      !catSlug
                        ? "bg-primary text-white"
                        : "text-brandText-primary hover:bg-surface-soft hover:text-navy"
                    }`}
                  >
                    All Products
                  </Link>
                </li>
                {allCategories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/shop?category=${c.slug}`}
                      className={`block py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                        catSlug === c.slug
                          ? "bg-primary text-white"
                          : "text-brandText-primary hover:bg-surface-soft hover:text-navy"
                      }`}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-surface-border p-12 text-center">
                <h3 className="text-lg font-bold text-navy">No products found</h3>
                <p className="text-sm text-brandText-secondary mt-1 max-w-sm mx-auto">
                  We couldn&apos;t find any items matching your criteria. Try browsing another category or resetting filters.
                </p>
                <Link
                  href="/shop"
                  className="mt-5 inline-block px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-deep transition"
                >
                  View All Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
