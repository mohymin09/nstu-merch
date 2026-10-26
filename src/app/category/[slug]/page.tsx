import { notFound } from "next/navigation";
import { db } from "@/lib/db/store";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

interface CategoryPageProps {
  params: { slug: string };
}

export const revalidate = 0;

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = db.getCategoryBySlug(params.slug);
  if (!category) {
    notFound();
  }

  const allProducts = db.getProducts(false);
  const products = allProducts.filter((p) => p.category_id === category.id);

  return (
    <div className="bg-surface-soft min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-xs text-brandText-secondary flex items-center gap-2 mb-3">
          <Link href="/" className="hover:text-navy">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-navy">
            Shop
          </Link>
          <span>/</span>
          <span className="font-semibold text-primary">{category.name}</span>
        </div>

        <div className="bg-white rounded-2xl border border-surface-border p-8 mb-8 shadow-card">
          <h1 className="text-3xl font-black text-navy">{category.name}</h1>
          <p className="text-sm text-brandText-secondary mt-1">
            {category.description || `Browse our official university collection of ${category.name.toLowerCase()}.`}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-surface-border p-12 text-center">
            <h3 className="text-base font-bold text-navy">No products in this category yet</h3>
            <p className="text-xs text-brandText-secondary mt-1">
              New merchandise is being prepared for this collection.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-block px-5 py-2 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-deep transition"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
