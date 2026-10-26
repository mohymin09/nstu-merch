"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  Heart,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  Facebook,
  Instagram,
  Youtube,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CartDrawer from "./CartDrawer";
import { Category, SocialLink } from "@/lib/db/types";

export default function Header() {
  const router = useRouter();
  const { itemCount, toggleDrawer } = useCart();
  const { user, isAdmin, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.socialLinks) setSocialLinks(data.socialLinks);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook className="w-4 h-4" />;
      case "instagram":
        return <Instagram className="w-4 h-4" />;
      case "youtube":
        return <Youtube className="w-4 h-4" />;
      default:
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.67 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.33V9.05c1.47 1.05 3.28 1.68 5.23 1.68v-3.5a4.8 4.8 0 0 1-1.32-.54z" />
          </svg>
        );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-surface-border shadow-sm">
        {/* Top Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Brand Logo & Tagline */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/assets/nstu-logo.png"
                  alt="NSTU Official Emblem"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-navy leading-none font-sans">
                  NSTU MERCH
                </span>
                <span className="text-xs font-serif italic text-primary-deep tracking-wide mt-0.5">
                  Wear Your Pride.
                </span>
              </div>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-6">
              <div className="relative w-full flex items-center">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-5 pr-12 py-2.5 rounded-full border border-surface-border text-sm text-brandText-primary placeholder-brandText-muted focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition bg-surface-soft"
                />
                <button
                  type="submit"
                  className="absolute right-1 w-9 h-9 rounded-full bg-navy hover:bg-navy-deep text-white flex items-center justify-center transition shadow-sm"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Right Side Icons & Auth */}
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Customer Account */}
              {user ? (
                <div className="hidden lg:flex items-center gap-2 text-sm text-brandText-primary">
                  <div className="w-7 h-7 rounded-full bg-navy-soft text-navy flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-medium text-xs max-w-[100px] truncate">{user.name}</span>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="text-xs bg-navy text-white px-2 py-0.5 rounded font-semibold hover:bg-navy-deep flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="text-xs text-brandText-muted hover:text-red-600 p-1"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-brandText-secondary">
                  <User className="w-4 h-4 text-navy" />
                  <Link href="/login" className="hover:text-navy transition">
                    Login
                  </Link>
                  <span>|</span>
                  <Link href="/register" className="hover:text-navy transition">
                    Register
                  </Link>
                </div>
              )}

              {/* Social Icons */}
              <div className="hidden xl:flex items-center gap-2 text-navy">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-navy-soft flex items-center justify-center hover:bg-navy hover:text-white transition"
                    title={link.label}
                  >
                    {renderSocialIcon(link.platform)}
                  </a>
                ))}
              </div>

              {/* Wishlist */}
              <Link
                href="/shop"
                className="hidden sm:flex relative text-brandText-primary hover:text-navy transition p-1.5"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Shopping Cart Icon with Badge */}
              <button
                onClick={toggleDrawer}
                className="relative text-navy hover:text-navy-deep transition p-1.5"
                aria-label="View shopping cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-navy hover:text-navy-deep"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Navigation Bar */}
        <div className="border-t border-surface-border/60 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-8">
                <Link
                  href="/"
                  className="text-sm font-semibold text-primary border-b-2 border-primary py-3 hover:text-primary-deep transition"
                >
                  Home
                </Link>

                {/* Shop Dropdown */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-1 text-sm font-medium text-brandText-primary group-hover:text-navy py-3 transition"
                    onMouseEnter={() => setShopOpen(true)}
                    onClick={() => setShopOpen(!shopOpen)}
                  >
                    Shop <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute top-full left-0 w-48 bg-white border border-surface-border rounded-lg shadow-lg py-2 hidden group-hover:block z-50">
                    <Link
                      href="/shop"
                      className="block px-4 py-2 text-xs font-medium text-brandText-primary hover:bg-surface-soft hover:text-navy"
                    >
                      All Merchandise
                    </Link>
                    <Link
                      href="/shop?sort=newest"
                      className="block px-4 py-2 text-xs font-medium text-brandText-primary hover:bg-surface-soft hover:text-navy"
                    >
                      New Arrivals
                    </Link>
                    <Link
                      href="/shop?sort=bestseller"
                      className="block px-4 py-2 text-xs font-medium text-brandText-primary hover:bg-surface-soft hover:text-navy"
                    >
                      Best Sellers
                    </Link>
                  </div>
                </div>

                {/* Categories Dropdown */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-1 text-sm font-medium text-brandText-primary group-hover:text-navy py-3 transition"
                    onMouseEnter={() => setCategoriesOpen(true)}
                    onClick={() => setCategoriesOpen(!categoriesOpen)}
                  >
                    Categories <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute top-full left-0 w-56 bg-white border border-surface-border rounded-lg shadow-lg py-2 hidden group-hover:block z-50">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="block px-4 py-2 text-xs font-medium text-brandText-primary hover:bg-surface-soft hover:text-navy"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  href="/about"
                  className="text-sm font-medium text-brandText-primary hover:text-navy py-3 transition"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium text-brandText-primary hover:text-navy py-3 transition"
                >
                  Contact
                </Link>
              </nav>

              {/* Right Side: Prominent Green Cart Button Pill */}
              <div className="hidden md:flex items-center">
                <button
                  onClick={toggleDrawer}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary hover:bg-primary-deep text-white text-sm font-semibold transition shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cart ({itemCount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-border bg-white px-4 pt-3 pb-6 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative w-full flex items-center">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 rounded-full border border-surface-border text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-1 w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <nav className="flex flex-col space-y-2 text-sm font-medium text-brandText-primary">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-primary font-semibold"
              >
                Home
              </Link>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-navy"
              >
                Shop All Products
              </Link>
              <div className="py-1">
                <p className="text-xs uppercase text-brandText-muted font-bold tracking-wider mb-1">
                  Categories
                </p>
                <div className="grid grid-cols-2 gap-1 pl-2">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs py-1 text-brandText-secondary hover:text-navy"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-navy"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-navy"
              >
                Contact
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 text-navy font-bold flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                </Link>
              )}
            </nav>

            <div className="border-t border-surface-border pt-3 flex justify-between items-center">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{user.name}</span>
                  <button onClick={logout} className="text-xs text-red-600 underline">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-xs font-medium">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-navy font-semibold">
                    Login
                  </Link>
                  <span>|</span>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </Link>
                </div>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  toggleDrawer();
                }}
                className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full"
              >
                Cart ({itemCount})
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}
