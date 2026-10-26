import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function GET() {
  const metrics = await repository.getDashboardMetrics();
  const allOrders = await repository.getOrders();
  const allProducts = await repository.getProducts(true);
  const recentOrders = allOrders.slice(0, 5);
  const lowStockVariants: any[] = [];

  for (const p of allProducts) {
    for (const v of p.variants) {
      if (v.stock_quantity <= p.low_stock_threshold) {
        lowStockVariants.push({
          product_name: p.name,
          sku: v.sku,
          variant_id: v.id,
          stock: v.stock_quantity,
          threshold: p.low_stock_threshold,
        });
      }
    }
  }

  return NextResponse.json({
    metrics,
    recentOrders,
    lowStockVariants: lowStockVariants.slice(0, 6),
  });
}
