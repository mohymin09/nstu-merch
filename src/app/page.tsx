import { db } from "@/lib/db/store";
import HeroCarousel from "@/components/HeroCarousel";
import CategorySection from "@/components/CategorySection";
import LatestProducts from "@/components/LatestProducts";
import PromoBanners from "@/components/PromoBanners";

export const revalidate = 0; // Dynamic server-rendered

export default function HomePage() {
  const categories = db.getCategories(true);
  const products = db.getProducts(false);
  const slides = db.getHeroSlides(true);

  return (
    <div className="w-full">
      {/* 1. Hero Carousel */}
      <HeroCarousel slides={slides} />

      {/* 2. Shop by Category */}
      <CategorySection categories={categories} />

      {/* 3. Latest Products */}
      <LatestProducts products={products} />

      {/* 4. Promotional Banners */}
      <PromoBanners />
    </div>
  );
}
