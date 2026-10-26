-- ==========================================================
-- NSTU MERCH SEED SCRIPT FOR SUPABASE
-- ==========================================================

-- 1. CATEGORIES
INSERT INTO public.categories (id, name, slug, description, icon, image_url, display_order, is_active)
VALUES ('cat-1', 'Caps & Apparel', 'caps-apparel', '', 'GraduationCap', '', 1, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.categories (id, name, slug, description, icon, image_url, display_order, is_active)
VALUES ('cat-2', 'Mugs & Drinkware', 'mugs-drinkware', '', 'Coffee', '', 2, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.categories (id, name, slug, description, icon, image_url, display_order, is_active)
VALUES ('cat-3', 'Bags & Accessories', 'bags-accessories', '', 'ShoppingBag', '', 3, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.categories (id, name, slug, description, icon, image_url, display_order, is_active)
VALUES ('cat-4', 'Stationery & Diaries', 'stationery-diaries', '', 'PenTool', '', 4, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.categories (id, name, slug, description, icon, image_url, display_order, is_active)
VALUES ('cat-5', 'Files & Folders', 'files-folders', '', 'Folder', '', 5, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.categories (id, name, slug, description, icon, image_url, display_order, is_active)
VALUES ('cat-6', 'Keychains', 'keychains', '', 'Key', '', 6, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.categories (id, name, slug, description, icon, image_url, display_order, is_active)
VALUES ('cat-7', 'Gift Sets', 'gift-sets', '', 'Gift', '', 7, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.categories (id, name, slug, description, icon, image_url, display_order, is_active)
VALUES ('cat-8', 'New Arrivals', 'new-arrivals', '', 'Star', '', 8, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. PRODUCTS
INSERT INTO public.products (id, category_id, category_name, name, slug, sku, description, regular_price, sale_price, images, is_featured, is_bestseller, is_new, is_published, stock_quantity, low_stock_threshold, attributes)
VALUES ('prod-cap', 'cat-1', 'Caps & Apparel', 'NSTU Signature Cap', 'nstu-signature-cap', 'NSTU-CAP-01', 'Premium university-inspired baseball cap featuring high-density 3D embroidered official NSTU emblem. Crafted from 100% breathable cotton twill with an adjustable strap for comfortable all-day wear.', 600, 450, ARRAY['/assets/products/nstu-cap.jpg'], true, false, true, true, 45, 5, '[{"name":"Colour","values":["Navy Blue","Beige","Black"]},{"name":"Size","values":["Adjustable"]}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.products (id, category_id, category_name, name, slug, sku, description, regular_price, sale_price, images, is_featured, is_bestseller, is_new, is_published, stock_quantity, low_stock_threshold, attributes)
VALUES ('prod-mug', 'cat-2', 'Mugs & Drinkware', 'NSTU Ceramic Mug', 'nstu-ceramic-mug', 'NSTU-MUG-01', 'High-grade 11oz glossy white ceramic coffee mug with durable, scratch-resistant official NSTU emblem print. Microwave and dishwasher safe, perfect for study sessions and campus mornings.', 350, 250, ARRAY['/assets/products/nstu-mug.jpg'], true, true, false, true, 60, 10, '[{"name":"Design","values":["Classic White","Navy Accent"]},{"name":"Size","values":["325ml / 11oz"]}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.products (id, category_id, category_name, name, slug, sku, description, regular_price, sale_price, images, is_featured, is_bestseller, is_new, is_published, stock_quantity, low_stock_threshold, attributes)
VALUES ('prod-tote', 'cat-3', 'Bags & Accessories', 'NSTU Canvas Tote Bag', 'nstu-canvas-tote-bag', 'NSTU-TOTE-01', 'Heavyweight 12oz natural cotton canvas tote bag. Features reinforced shoulder straps and high-resolution screen-printed NSTU emblem. Roomy enough for laptops, books, and campus essentials.', 500, 350, ARRAY['/assets/products/nstu-tote.jpg'], true, false, true, true, 35, 5, '[{"name":"Colour","values":["Natural Beige","Navy Blue","Deep Black"]}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.products (id, category_id, category_name, name, slug, sku, description, regular_price, sale_price, images, is_featured, is_bestseller, is_new, is_published, stock_quantity, low_stock_threshold, attributes)
VALUES ('prod-diary', 'cat-4', 'Stationery & Diaries', 'NSTU Diary & Pen Set', 'nstu-diary-pen-set', 'NSTU-DRY-01', 'Executive PU leather-bound NSTU hardcover notebook with gold embossed logo, 192 acid-free ruled pages, ribbon bookmark, inner pocket, and a matching metallic twist-action ballpoint pen.', 750, 550, ARRAY['/assets/products/nstu-diary.jpg'], true, false, false, true, 50, 8, '[{"name":"Colour","values":["Executive Navy","Midnight Black"]}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.products (id, category_id, category_name, name, slug, sku, description, regular_price, sale_price, images, is_featured, is_bestseller, is_new, is_published, stock_quantity, low_stock_threshold, attributes)
VALUES ('prod-keychain', 'cat-6', 'Keychains', 'NSTU Metal Keychain', 'nstu-metal-keychain', 'NSTU-KEY-01', 'Durable zinc alloy circular keychain with full-color hard enamel NSTU crest insert and clear protective dome. Built to keep your keys safe and celebrate your university journey.', 200, 150, ARRAY['/assets/products/nstu-keychain.jpg'], true, false, false, true, 100, 15, '[{"name":"Finish","values":["Silver Plated","Gold Plated"]}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.products (id, category_id, category_name, name, slug, sku, description, regular_price, sale_price, images, is_featured, is_bestseller, is_new, is_published, stock_quantity, low_stock_threshold, attributes)
VALUES ('prod-backpack', 'cat-3', 'Bags & Accessories', 'NSTU Campus Laptop Backpack', 'nstu-campus-laptop-backpack', 'NSTU-BPK-01', 'Heavy-duty waterproof oxford fabric backpack with padded 15.6 inch laptop sleeve, ergonomic shoulder straps, water bottle side pockets, and prominent embroidered NSTU emblem.', 1800, 1450, ARRAY['/assets/banners/banner-bags.jpg'], true, true, true, true, 25, 5, '[{"name":"Colour","values":["Navy Blue","Deep Black"]}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.products (id, category_id, category_name, name, slug, sku, description, regular_price, sale_price, images, is_featured, is_bestseller, is_new, is_published, stock_quantity, low_stock_threshold, attributes)
VALUES ('prod-gift-set', 'cat-7', 'Gift Sets', 'NSTU Premium Welcome Gift Box', 'nstu-premium-welcome-gift-box', 'NSTU-GFT-01', 'Exclusive university gift set containing an NSTU Signature Cap, Ceramic Mug, Executive Diary, Metal Keychain, and Pen enclosed in a luxury foil-stamped presentation box.', 1950, 1490, ARRAY['/assets/hero/hero-slide-1.jpg'], true, true, false, true, 15, 3, '[{"name":"Box Edition","values":["Varsity Blue Deluxe"]}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.products (id, category_id, category_name, name, slug, sku, description, regular_price, sale_price, images, is_featured, is_bestseller, is_new, is_published, stock_quantity, low_stock_threshold, attributes)
VALUES ('prod-folder', 'cat-5', 'Files & Folders', 'NSTU Document File & Folder', 'nstu-document-file-folder', 'NSTU-FLD-01', 'Durable water-resistant polypropylene document folder with snap-button closure. Designed for university certificates, assignments, and campus documents.', 150, 100, ARRAY['/assets/products/nstu-diary.jpg'], false, false, false, true, 80, 10, '[{"name":"Colour","values":["Frosted Blue","Clear White"]}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. PRODUCT VARIANTS
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-cap-navy', 'prod-cap', 'NSTU-CAP-NAVY', '{"Colour":"Navy Blue","Size":"Adjustable"}'::jsonb, 600, 450, 25, '/assets/products/nstu-cap.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-cap-beige', 'prod-cap', 'NSTU-CAP-BEIGE', '{"Colour":"Beige","Size":"Adjustable"}'::jsonb, 600, 450, 12, '/assets/products/nstu-cap.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-cap-black', 'prod-cap', 'NSTU-CAP-BLACK', '{"Colour":"Black","Size":"Adjustable"}'::jsonb, 600, 450, 8, '/assets/products/nstu-cap.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-mug-white', 'prod-mug', 'NSTU-MUG-WHT', '{"Design":"Classic White","Size":"325ml / 11oz"}'::jsonb, 350, 250, 40, '/assets/products/nstu-mug.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-mug-navy', 'prod-mug', 'NSTU-MUG-NVY', '{"Design":"Navy Accent","Size":"325ml / 11oz"}'::jsonb, 380, 270, 20, '/assets/products/nstu-mug.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-tote-beige', 'prod-tote', 'NSTU-TOTE-BEIGE', '{"Colour":"Natural Beige"}'::jsonb, 500, 350, 20, '/assets/products/nstu-tote.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-tote-navy', 'prod-tote', 'NSTU-TOTE-NAVY', '{"Colour":"Navy Blue"}'::jsonb, 500, 350, 10, '/assets/products/nstu-tote.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-tote-black', 'prod-tote', 'NSTU-TOTE-BLK', '{"Colour":"Deep Black"}'::jsonb, 500, 350, 5, '/assets/products/nstu-tote.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-diary-navy', 'prod-diary', 'NSTU-DRY-NVY', '{"Colour":"Executive Navy"}'::jsonb, 750, 550, 32, '/assets/products/nstu-diary.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-diary-black', 'prod-diary', 'NSTU-DRY-BLK', '{"Colour":"Midnight Black"}'::jsonb, 750, 550, 18, '/assets/products/nstu-diary.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-key-silver', 'prod-keychain', 'NSTU-KEY-SLV', '{"Finish":"Silver Plated"}'::jsonb, 200, 150, 65, '/assets/products/nstu-keychain.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-key-gold', 'prod-keychain', 'NSTU-KEY-GLD', '{"Finish":"Gold Plated"}'::jsonb, 220, 160, 35, '/assets/products/nstu-keychain.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-bpk-navy', 'prod-backpack', 'NSTU-BPK-NVY', '{"Colour":"Navy Blue"}'::jsonb, 1800, 1450, 15, '/assets/banners/banner-bags.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-bpk-blk', 'prod-backpack', 'NSTU-BPK-BLK', '{"Colour":"Deep Black"}'::jsonb, 1800, 1450, 10, '/assets/banners/banner-bags.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-gft-blue', 'prod-gift-set', 'NSTU-GFT-DLX', '{"Box Edition":"Varsity Blue Deluxe"}'::jsonb, 1950, 1490, 15, '/assets/hero/hero-slide-1.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-fld-blue', 'prod-folder', 'NSTU-FLD-BLU', '{"Colour":"Frosted Blue"}'::jsonb, 150, 100, 50, '/assets/products/nstu-diary.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('var-fld-clr', 'prod-folder', 'NSTU-FLD-CLR', '{"Colour":"Clear White"}'::jsonb, 150, 100, 30, '/assets/products/nstu-diary.jpg', true)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

-- 4. HERO CAROUSEL SLIDES
INSERT INTO public.hero_slides (id, badge, title, subtitle, description, cta_text, cta_link, desktop_image, display_order, is_active)
VALUES ('slide-1', 'OFFICIAL NSTU MERCHANDISE', 'Carry Your Campus.', 'Keep Your Memories.', 'Premium university-inspired products for every NSTU student.', 'Shop Now', '/shop', '/assets/hero/hero-slide-1.jpg', 1, true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
INSERT INTO public.hero_slides (id, badge, title, subtitle, description, cta_text, cta_link, desktop_image, display_order, is_active)
VALUES ('slide-2', 'NEW ARRIVALS 2026', 'Wear Your Pride.', 'Every Single Day.', 'From cozy signature caps to sturdy campus backpacks and executive sets.', 'Explore Collection', '/category/caps-apparel', '/assets/hero/hero-slide-1.jpg', 2, true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- 5. SOCIAL LINKS
INSERT INTO public.social_links (id, platform, label, url, display_order, is_active)
VALUES ('soc-1', 'facebook', 'Facebook', 'https://facebook.com/nstu.official', 1, true)
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url;
INSERT INTO public.social_links (id, platform, label, url, display_order, is_active)
VALUES ('soc-2', 'instagram', 'Instagram', 'https://instagram.com/nstu.merch', 2, true)
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url;
INSERT INTO public.social_links (id, platform, label, url, display_order, is_active)
VALUES ('soc-3', 'youtube', 'YouTube', 'https://youtube.com/@nstu', 3, true)
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url;
INSERT INTO public.social_links (id, platform, label, url, display_order, is_active)
VALUES ('soc-4', 'tiktok', 'TikTok', 'https://tiktok.com/@nstumerch', 4, true)
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url;

-- 6. STORE SETTINGS
INSERT INTO public.store_settings (id, data)
VALUES ('current', '{"store_name":"NSTU MERCH","tagline":"Wear Your Pride.","logo_url":"/assets/nstu-logo.png","phone":"01869500080","email":"nstu.merch@gmail.com","address":"NSTU, Noakhali Bangladesh","business_hours":"9:00 AM – 6:00 PM (Sat – Thu)","currency_code":"BDT","currency_symbol":"৳","delivery_fees":{"campus":30,"noakhali":60,"outside":120},"payment_methods":{"cod":{"id":"cod","name":"Cash on Delivery","is_enabled":false,"account_number":"01711 223344","account_type":"Personal","instructions":"Pay with cash directly to the delivery person upon receiving your parcel. Please keep the exact amount ready.","requires_trx_id":false,"display_order":1},"bkash":{"id":"bkash","name":"bKash","is_enabled":true,"account_number":"01869500080","account_type":"Personal","instructions":"Go to your bKash app or dial *247#. Select ''Send Money'' to 01812 345678. Enter your order amount. Use your phone number or Order Number as reference. After sending, enter your Transaction ID (TrxID) and sender number below.","requires_trx_id":true,"display_order":2},"nagad":{"id":"nagad","name":"Nagad","is_enabled":true,"account_number":"01869500080","account_type":"Personal","instructions":"Open your Nagad app or dial *167#. Select ''Send Money'' to 01812 345679. Enter the total order amount. Enter reference. After sending, submit your Nagad Transaction ID and sender number.","requires_trx_id":true,"display_order":3},"rocket":{"id":"rocket","name":"Rocket","is_enabled":true,"account_number":"01869500080","account_type":"Personal","instructions":"Open your Rocket app or dial *322#. Select ''Send Money'' to 01812 345680. Enter the order amount. Enter transaction reference. Submit your 10-digit transaction ID and sender number.","requires_trx_id":true,"display_order":4},"cash":{"id":"cash","name":"Cash Payment","is_enabled":true,"account_number":"01869500080","account_type":"Personal","instructions":"Visit our campus pickup booth (NSTU Student Center, 1st floor) during business hours (9:00 AM - 6:00 PM) to pay cash and collect your items.","requires_trx_id":false,"display_order":5}},"policies":{"privacy_policy":"At NSTU Merch, we respect your privacy and protect all customer personal data including phone numbers and delivery addresses. We never share customer data with unauthorized third parties.","terms_conditions":"All merchandise designs are university-inspired. Orders are processed subject to stock availability and payment verification for manual mobile banking.","return_refund":"Items can be exchanged or returned within 7 days of delivery if defective, damaged, or incorrectly sized with tags intact.","shipping_policy":"Campus deliveries are delivered within 24 hours. Noakhali district deliveries take 1-2 business days. Nationwide deliveries take 2-4 business days."}}'::jsonb)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;
