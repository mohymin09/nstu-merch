import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), ".data", "db.json");
const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

let sql = `-- ==========================================================
-- NSTU MERCH SEED SCRIPT FOR SUPABASE
-- ==========================================================

`;

// 1. Categories
sql += `-- 1. CATEGORIES\n`;
for (const c of db.categories) {
  const name = c.name.replace(/'/g, "''");
  const desc = (c.description || "").replace(/'/g, "''");
  const img = c.image_url || "";
  sql += `INSERT INTO public.categories (id, name, slug, description, icon, image_url, display_order, is_active)
VALUES ('${c.id}', '${name}', '${c.slug}', '${desc}', '${c.icon}', '${img}', ${c.display_order}, ${c.is_active})
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;\n`;
}

// 2. Products
sql += `\n-- 2. PRODUCTS\n`;
for (const p of db.products) {
  const imgs = "ARRAY[" + (p.images || []).map((img) => `'${img}'`).join(",") + "]";
  const attrs = JSON.stringify(p.attributes || []).replace(/'/g, "''");
  const desc = (p.description || "").replace(/'/g, "''");
  const name = p.name.replace(/'/g, "''");
  const catId = p.category_id ? `'${p.category_id}'` : "NULL";
  const catName = p.category_name ? `'${p.category_name.replace(/'/g, "''")}'` : "NULL";
  const salePrice = p.sale_price !== undefined ? p.sale_price : "NULL";

  sql += `INSERT INTO public.products (id, category_id, category_name, name, slug, sku, description, regular_price, sale_price, images, is_featured, is_bestseller, is_new, is_published, stock_quantity, low_stock_threshold, attributes)
VALUES ('${p.id}', ${catId}, ${catName}, '${name}', '${p.slug}', '${p.sku}', '${desc}', ${p.regular_price}, ${salePrice}, ${imgs}, ${p.is_featured}, ${p.is_bestseller}, ${p.is_new}, ${p.is_published}, ${p.stock_quantity}, ${p.low_stock_threshold}, '${attrs}'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;\n`;
}

// 3. Variants
sql += `\n-- 3. PRODUCT VARIANTS\n`;
for (const p of db.products) {
  for (const v of p.variants || []) {
    const attrs = JSON.stringify(v.attributes || {}).replace(/'/g, "''");
    const salePrice = v.sale_price !== undefined ? v.sale_price : "NULL";
    const img = v.image_url || "";

    sql += `INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES ('${v.id}', '${p.id}', '${v.sku}', '${attrs}'::jsonb, ${v.regular_price}, ${salePrice}, ${v.stock_quantity}, '${img}', ${v.is_active})
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;\n`;
  }
}

// 4. Hero Slides
sql += `\n-- 4. HERO CAROUSEL SLIDES\n`;
for (const s of db.hero_slides || []) {
  sql += `INSERT INTO public.hero_slides (id, badge, title, subtitle, description, cta_text, cta_link, desktop_image, display_order, is_active)
VALUES ('${s.id}', '${s.badge.replace(/'/g, "''")}', '${s.title.replace(/'/g, "''")}', '${s.subtitle.replace(/'/g, "''")}', '${s.description.replace(/'/g, "''")}', '${s.cta_text.replace(/'/g, "''")}', '${s.cta_link}', '${s.desktop_image}', ${s.display_order}, ${s.is_active})
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;\n`;
}

// 5. Social Links
sql += `\n-- 5. SOCIAL LINKS\n`;
for (const l of db.social_links || []) {
  sql += `INSERT INTO public.social_links (id, platform, label, url, display_order, is_active)
VALUES ('${l.id}', '${l.platform}', '${l.label.replace(/'/g, "''")}', '${l.url}', ${l.display_order}, ${l.is_active})
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url;\n`;
}

// 6. Store Settings
sql += `\n-- 6. STORE SETTINGS\n`;
const settingsJson = JSON.stringify(db.settings).replace(/'/g, "''");
sql += `INSERT INTO public.store_settings (id, data)
VALUES ('current', '${settingsJson}'::jsonb)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;\n`;

fs.writeFileSync(path.join(process.cwd(), "supabase", "seed.sql"), sql);
console.log("Seed script generated successfully at supabase/seed.sql");
