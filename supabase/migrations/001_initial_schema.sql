-- ==========================================================
-- NSTU MERCH: Production Supabase PostgreSQL Schema & Migrations
-- University-Inspired E-Commerce Architecture
-- ==========================================================

-- Enable pgcrypto / uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================================
-- 1. PROFILES & ROLES (Tied to Supabase auth.users)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- 2. CATEGORIES
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'Tag',
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- 3. PRODUCTS
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  regular_price NUMERIC(10,2) NOT NULL CHECK (regular_price >= 0),
  sale_price NUMERIC(10,2) CHECK (sale_price >= 0),
  images TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_bestseller BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 5,
  attributes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- 4. ATTRIBUTES & ATTRIBUTE VALUES
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.attributes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.attribute_values (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  attribute_id TEXT REFERENCES public.attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  color_hex TEXT,
  display_order INT NOT NULL DEFAULT 0
);

-- ==========================================================
-- 5. PRODUCT VARIANTS
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  regular_price NUMERIC(10,2) NOT NULL CHECK (regular_price >= 0),
  sale_price NUMERIC(10,2) CHECK (sale_price >= 0),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- 6. INVENTORY MOVEMENTS (AUDITABLE)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  variant_id TEXT REFERENCES public.product_variants(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  change_quantity INT NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  reason TEXT NOT NULL,
  actor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- 7. ORDERS & ORDER ITEMS
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT NOT NULL,
  district TEXT NOT NULL,
  area TEXT NOT NULL,
  delivery_zone TEXT NOT NULL CHECK (delivery_zone IN ('campus', 'noakhali', 'outside')),
  order_notes TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'bkash', 'nagad', 'rocket', 'cash')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'submitted', 'verified', 'rejected', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'awaiting_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  discount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  courier_name TEXT,
  tracking_number TEXT,
  internal_notes TEXT,
  cancellation_reason TEXT,
  risk_score TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id TEXT REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  image_url TEXT NOT NULL
);

-- ==========================================================
-- 8. PAYMENT SUBMISSIONS (MANUAL VERIFICATION)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.payment_submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  sender_number TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  reference_note TEXT,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- 9. HERO CAROUSEL & SOCIAL LINKS
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  badge TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_text TEXT NOT NULL,
  cta_link TEXT NOT NULL,
  desktop_image TEXT NOT NULL,
  mobile_image TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.social_links (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  platform TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- ==========================================================
-- 10. STORE SETTINGS & AUDIT LOGS
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  actor TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- 11. HELPER FUNCTIONS & TRIGGERS
-- ==========================================================

-- Check if authenticated user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Trigger to automatically populate public.profiles on Supabase auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Public Select Policies
DROP POLICY IF EXISTS "Public read published products" ON public.products;
CREATE POLICY "Public read published products" ON public.products FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public read active categories" ON public.categories;
CREATE POLICY "Public read active categories" ON public.categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read active attributes" ON public.attributes;
CREATE POLICY "Public read active attributes" ON public.attributes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read active attribute_values" ON public.attribute_values;
CREATE POLICY "Public read active attribute_values" ON public.attribute_values FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read active variants" ON public.product_variants;
CREATE POLICY "Public read active variants" ON public.product_variants FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read active slides" ON public.hero_slides;
CREATE POLICY "Public read active slides" ON public.hero_slides FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read active social links" ON public.social_links;
CREATE POLICY "Public read active social links" ON public.social_links FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read store settings" ON public.store_settings;
CREATE POLICY "Public read store settings" ON public.store_settings FOR SELECT USING (true);

-- Customer Access Policies
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users read own order items" ON public.order_items;
CREATE POLICY "Users read own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
);

DROP POLICY IF EXISTS "Users read own payments" ON public.payment_submissions;
CREATE POLICY "Users read own payments" ON public.payment_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payment_submissions.order_id AND orders.customer_id = auth.uid())
);

-- Admin Full Management Policies
DROP POLICY IF EXISTS "Admins full access to profiles" ON public.profiles;
CREATE POLICY "Admins full access to profiles" ON public.profiles FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to categories" ON public.categories;
CREATE POLICY "Admins full access to categories" ON public.categories FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to products" ON public.products;
CREATE POLICY "Admins full access to products" ON public.products FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to attributes" ON public.attributes;
CREATE POLICY "Admins full access to attributes" ON public.attributes FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to attribute_values" ON public.attribute_values;
CREATE POLICY "Admins full access to attribute_values" ON public.attribute_values FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to product_variants" ON public.product_variants;
CREATE POLICY "Admins full access to product_variants" ON public.product_variants FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to inventory_movements" ON public.inventory_movements;
CREATE POLICY "Admins full access to inventory_movements" ON public.inventory_movements FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to orders" ON public.orders;
CREATE POLICY "Admins full access to orders" ON public.orders FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to order_items" ON public.order_items;
CREATE POLICY "Admins full access to order_items" ON public.order_items FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to payment_submissions" ON public.payment_submissions;
CREATE POLICY "Admins full access to payment_submissions" ON public.payment_submissions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to hero_slides" ON public.hero_slides;
CREATE POLICY "Admins full access to hero_slides" ON public.hero_slides FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to social_links" ON public.social_links;
CREATE POLICY "Admins full access to social_links" ON public.social_links FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to store_settings" ON public.store_settings;
CREATE POLICY "Admins full access to store_settings" ON public.store_settings FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to admin_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "Admins full access to admin_audit_logs" ON public.admin_audit_logs FOR ALL USING (public.is_admin());

-- ==========================================================
-- 13. SUPABASE STORAGE BUCKETS
-- ==========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('merchandise-images', 'merchandise-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public read merchandise images" ON storage.objects;
CREATE POLICY "Public read merchandise images" ON storage.objects FOR SELECT USING (bucket_id = 'merchandise-images');

DROP POLICY IF EXISTS "Public read logos" ON storage.objects;
CREATE POLICY "Public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "Admins manage merchandise images" ON storage.objects;
CREATE POLICY "Admins manage merchandise images" ON storage.objects FOR ALL USING (bucket_id = 'merchandise-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins manage logos" ON storage.objects;
CREATE POLICY "Admins manage logos" ON storage.objects FOR ALL USING (bucket_id = 'logos' AND public.is_admin());

-- ==========================================================
-- 14. PERFORMANCE INDEXES
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_submissions_order_id ON public.payment_submissions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_submissions_trx_id ON public.payment_submissions(transaction_id);
