import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase();
  const categorySlug = searchParams.get("category");
  const sort = searchParams.get("sort") || "featured";
  const limit = searchParams.get("limit");

  let products = await repository.getProducts(false);

  if (categorySlug) {
    const category = await repository.getCategoryBySlug(categorySlug);
    if (category) {
      products = products.filter((p) => p.category_id === category.id);
    }
  }

  if (q) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category_name?.toLowerCase().includes(q)
    );
  }

  if (sort === "price-low") {
    products.sort((a, b) => (a.sale_price ?? a.regular_price) - (b.sale_price ?? b.regular_price));
  } else if (sort === "price-high") {
    products.sort((a, b) => (b.sale_price ?? b.regular_price) - (a.sale_price ?? a.regular_price));
  } else if (sort === "newest") {
    products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sort === "bestseller") {
    products.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
  }

  if (limit) {
    products = products.slice(0, Number(limit));
  }

  return NextResponse.json({ products });
}
