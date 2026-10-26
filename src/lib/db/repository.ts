import { db as localDb } from "./store";
import {
  Category,
  Product,
  ProductVariant,
  Order,
  PaymentSubmission,
  HeroSlide,
  SocialLink,
  StoreSettings,
  InventoryMovement,
  AuditLog,
} from "./types";
import { createAdminClient, isSupabaseAdminConfigured } from "../supabase/admin";
import { isSupabaseConfigured } from "../supabase/client";

/**
 * Check if active server Supabase client can be instantiated
 */
function getClient() {
  if (typeof window !== "undefined") {
    return null;
  }
  return createAdminClient();
}

/**
 * Unified Repository Layer for NSTU Merch
 * Connects directly to Supabase when environment credentials are present.
 * Transparently falls back to local database file (.data/db.json) if credentials
 * are missing or database connection fails, ensuring zero crashes.
 */
class Repository {
  /**
   * Diagnostic check for Supabase connection status
   */
  async getStatus(): Promise<{
    configured: boolean;
    connected: boolean;
    provider: "supabase" | "local";
    error?: string;
    stats?: {
      products: number;
      categories: number;
      orders: number;
    };
  }> {
    if (!isSupabaseAdminConfigured && !isSupabaseConfigured) {
      return {
        configured: false,
        connected: false,
        provider: "local",
        stats: {
          products: localDb.getProducts(true).length,
          categories: localDb.getCategories(false).length,
          orders: localDb.getOrders().length,
        },
      };
    }

    try {
      const client = getClient();
      if (!client) {
        return {
          configured: true,
          connected: false,
          provider: "local",
          error: "Client creation returned null (check environment variables).",
        };
      }

      const { data: catRows, error: catError } = await client
        .from("categories")
        .select("id");

      if (catError) {
        return {
          configured: true,
          connected: false,
          provider: "local",
          error: catError.message,
        };
      }

      const { data: prodRows } = await client
        .from("products")
        .select("id");

      const { data: orderRows } = await client
        .from("orders")
        .select("id");

      const catCount = catRows ? catRows.length : 0;
      const prodCount = prodRows ? prodRows.length : 0;
      const orderCount = orderRows ? orderRows.length : 0;

      return {
        configured: true,
        connected: true,
        provider: "supabase",
        stats: {
          products: prodCount,
          categories: catCount,
          orders: orderCount,
        },
      };
    } catch (err: any) {
      return {
        configured: true,
        connected: false,
        provider: "local",
        error: err?.message || String(err),
      };
    }
  }

  // ----------------------------------------------------
  // PRODUCTS & VARIANTS
  // ----------------------------------------------------

  async getProducts(includeDrafts = false): Promise<Product[]> {
    const client = getClient();
    if (client) {
      try {
        let query = client
          .from("products")
          .select("*, variants:product_variants(*)")
          .order("created_at", { ascending: false });

        if (!includeDrafts) {
          query = query.eq("is_published", true);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map((p: any) => ({
            ...p,
            variants: (p.variants || []).filter((v: any) => includeDrafts || v.is_active),
          }));
        }
      } catch {
        // Fall back to local
      }
    }
    return localDb.getProducts(includeDrafts);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const client = getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("products")
          .select("*, variants:product_variants(*)")
          .eq("id", id)
          .single();

        if (!error && data) {
          return {
            ...data,
            variants: data.variants || [],
          };
        }
      } catch {
        // Fall back
      }
    }
    return localDb.getProductById(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const client = getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("products")
          .select("*, variants:product_variants(*)")
          .eq("slug", slug)
          .single();

        if (!error && data) {
          return {
            ...data,
            variants: data.variants || [],
          };
        }
      } catch {
        // Fall back
      }
    }
    return localDb.getProductBySlug(slug);
  }

  async saveProduct(product: Product, actor = "admin"): Promise<Product> {
    // Always mirror in local store for redundancy
    const savedLocal = localDb.saveProduct(product, actor);

    const client = getClient();
    if (client) {
      try {
        const { variants, ...prodData } = product;
        const now = new Date().toISOString();

        const { error: prodError } = await client.from("products").upsert({
          id: prodData.id,
          category_id: prodData.category_id,
          category_name: prodData.category_name,
          name: prodData.name,
          slug: prodData.slug,
          sku: prodData.sku,
          description: prodData.description,
          regular_price: prodData.regular_price,
          sale_price: prodData.sale_price,
          images: prodData.images,
          is_featured: prodData.is_featured,
          is_bestseller: prodData.is_bestseller,
          is_new: prodData.is_new,
          is_published: prodData.is_published,
          stock_quantity: prodData.stock_quantity,
          low_stock_threshold: prodData.low_stock_threshold,
          attributes: prodData.attributes,
          created_at: prodData.created_at || now,
          updated_at: now,
        });

        if (!prodError && variants && variants.length > 0) {
          for (const variant of variants) {
            await client.from("product_variants").upsert({
              id: variant.id,
              product_id: prodData.id,
              sku: variant.sku,
              attributes: variant.attributes,
              regular_price: variant.regular_price,
              sale_price: variant.sale_price,
              stock_quantity: variant.stock_quantity,
              image_url: variant.image_url,
              is_active: variant.is_active,
              created_at: now,
            });
          }
        }
      } catch {
        // Silently preserve local record
      }
    }
    return savedLocal;
  }

  async deleteProduct(id: string, actor = "admin"): Promise<boolean> {
    const client = getClient();
    if (client) {
      try {
        await client.from("products").delete().eq("id", id);
      } catch {
        // ignore
      }
    }
    return localDb.deleteProduct(id, actor);
  }

  // ----------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------

  async getCategories(onlyActive = true): Promise<Category[]> {
    const client = getClient();
    if (client) {
      try {
        let query = client.from("categories").select("*").order("display_order", { ascending: true });
        if (onlyActive) {
          query = query.eq("is_active", true);
        }
        const { data, error } = await query;
        if (!error && data) {
          return data;
        }
      } catch {
        // fallback
      }
    }
    return localDb.getCategories(onlyActive);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const client = getClient();
    if (client) {
      try {
        const { data, error } = await client.from("categories").select("*").eq("slug", slug).single();
        if (!error && data) return data;
      } catch {
        // fallback
      }
    }
    return localDb.getCategoryBySlug(slug);
  }

  async saveCategory(category: Category, actor = "admin"): Promise<Category> {
    const savedLocal = localDb.saveCategory(category, actor);
    const client = getClient();
    if (client) {
      try {
        await client.from("categories").upsert({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          image_url: category.image_url,
          display_order: category.display_order,
          is_active: category.is_active,
          created_at: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
    }
    return savedLocal;
  }

  async deleteCategory(id: string, actor = "admin"): Promise<{ success: boolean; message?: string }> {
    const res = localDb.deleteCategory(id, actor);
    if (res.success) {
      const client = getClient();
      if (client) {
        try {
          await client.from("categories").delete().eq("id", id);
        } catch {
          // ignore
        }
      }
    }
    return res;
  }

  // ----------------------------------------------------
  // ORDERS
  // ----------------------------------------------------

  async getOrders(): Promise<Order[]> {
    const client = getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("orders")
          .select("*, items:order_items(*)")
          .order("created_at", { ascending: false });

        if (!error && data) {
          return data.map((o: any) => ({
            ...o,
            items: o.items || [],
          }));
        }
      } catch {
        // fallback
      }
    }
    return localDb.getOrders();
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const client = getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("orders")
          .select("*, items:order_items(*)")
          .or(`id.eq.${id},order_number.eq.${id}`)
          .single();

        if (!error && data) {
          return {
            ...data,
            items: data.items || [],
          };
        }
      } catch {
        // fallback
      }
    }
    return localDb.getOrderById(id);
  }

  async createOrder(orderData: Omit<Order, "id" | "order_number" | "created_at" | "updated_at">): Promise<{
    success: boolean;
    order?: Order;
    error?: string;
  }> {
    // 1. Process in local store for atomic stock verification and fallback
    const result = localDb.createOrder(orderData);
    if (!result.success || !result.order) {
      return result;
    }

    const createdOrder = result.order;

    // 2. Mirror into Supabase
    const client = getClient();
    if (client) {
      try {
        const { items, ...orderRecord } = createdOrder;
        const { error: orderError } = await client.from("orders").insert(orderRecord);
        if (!orderError && items && items.length > 0) {
          const formattedItems = items.map((item) => ({
            id: item.id,
            order_id: createdOrder.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            sku: item.sku,
            variant_label: item.variant_label,
            unit_price: item.unit_price,
            quantity: item.quantity,
            total_price: item.total_price,
            image_url: item.image_url,
          }));
          await client.from("order_items").insert(formattedItems);
        }
      } catch (supabaseErr) {
        console.warn("Supabase order mirror failed, order saved locally:", supabaseErr);
      }
    }

    return { success: true, order: createdOrder };
  }

  async updateOrderStatus(
    orderId: string,
    orderStatus: Order["order_status"],
    paymentStatus?: Order["payment_status"],
    actor = "admin",
    cancellationReason?: string
  ): Promise<Order | undefined> {
    const updated = localDb.updateOrderStatus(orderId, orderStatus, paymentStatus, actor, cancellationReason);
    const client = getClient();
    if (client) {
      try {
        const updatePayload: Record<string, any> = {
          order_status: orderStatus,
          updated_at: new Date().toISOString(),
        };
        if (paymentStatus) updatePayload.payment_status = paymentStatus;
        if (cancellationReason) updatePayload.cancellation_reason = cancellationReason;

        await client.from("orders").update(updatePayload).eq("id", orderId);
      } catch {
        // ignore
      }
    }
    return updated;
  }

  async updateOrderShipping(
    orderId: string,
    courierName: string,
    trackingNumber: string,
    internalNotes?: string,
    actor = "admin"
  ): Promise<Order | undefined> {
    const updated = localDb.updateOrderShipping(orderId, courierName, trackingNumber, internalNotes, actor);
    const client = getClient();
    if (client) {
      try {
        const updatePayload: Record<string, any> = {
          courier_name: courierName,
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString(),
        };
        if (internalNotes !== undefined) updatePayload.internal_notes = internalNotes;
        await client.from("orders").update(updatePayload).eq("id", orderId);
      } catch {
        // ignore
      }
    }
    return updated;
  }

  // ----------------------------------------------------
  // PAYMENTS
  // ----------------------------------------------------

  async submitPayment(
    submission: Omit<PaymentSubmission, "id" | "created_at" | "status">
  ): Promise<PaymentSubmission> {
    const saved = localDb.submitPayment(submission);
    const client = getClient();
    if (client) {
      try {
        await client.from("payment_submissions").insert({
          id: saved.id,
          order_id: saved.order_id,
          order_number: saved.order_number,
          payment_method: saved.payment_method,
          sender_number: saved.sender_number,
          transaction_id: saved.transaction_id,
          reference_note: saved.reference_note,
          amount: saved.amount,
          status: saved.status,
          created_at: saved.created_at,
        });
      } catch {
        // ignore
      }
    }
    return saved;
  }

  async getPayments(): Promise<PaymentSubmission[]> {
    const client = getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("payment_submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) return data;
      } catch {
        // fallback
      }
    }
    return localDb.getPayments();
  }

  async reviewPayment(
    paymentId: string,
    status: "verified" | "rejected",
    actor = "admin"
  ): Promise<PaymentSubmission | undefined> {
    const reviewed = localDb.reviewPayment(paymentId, status, actor);
    const client = getClient();
    if (client && reviewed) {
      try {
        await client
          .from("payment_submissions")
          .update({
            status,
            reviewed_by: actor,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", paymentId);
      } catch {
        // ignore
      }
    }
    return reviewed;
  }

  // ----------------------------------------------------
  // STORE SETTINGS
  // ----------------------------------------------------

  async getSettings(): Promise<StoreSettings> {
    const client = getClient();
    if (client) {
      try {
        const { data, error } = await client.from("store_settings").select("data").eq("id", "current").single();
        if (!error && data && data.data) {
          return data.data as StoreSettings;
        }
      } catch {
        // fallback
      }
    }
    return localDb.getSettings();
  }

  async updateSettings(settings: StoreSettings, actor = "admin"): Promise<StoreSettings> {
    const updated = localDb.updateSettings(settings, actor);
    const client = getClient();
    if (client) {
      try {
        await client.from("store_settings").upsert({
          id: "current",
          data: updated,
          updated_at: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
    }
    return updated;
  }

  // ----------------------------------------------------
  // HERO SLIDES & SOCIAL
  // ----------------------------------------------------

  async getHeroSlides(onlyActive = true): Promise<HeroSlide[]> {
    const client = getClient();
    if (client) {
      try {
        let query = client.from("hero_slides").select("*").order("display_order", { ascending: true });
        if (onlyActive) {
          query = query.eq("is_active", true);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch {
        // fallback
      }
    }
    return localDb.getHeroSlides(onlyActive);
  }

  async saveHeroSlide(slide: HeroSlide, actor = "admin"): Promise<HeroSlide> {
    const saved = localDb.saveHeroSlide(slide, actor);
    const client = getClient();
    if (client) {
      try {
        await client.from("hero_slides").upsert(slide);
      } catch {
        // ignore
      }
    }
    return saved;
  }

  async deleteHeroSlide(id: string, actor = "admin"): Promise<boolean> {
    const client = getClient();
    if (client) {
      try {
        await client.from("hero_slides").delete().eq("id", id);
      } catch {
        // ignore
      }
    }
    return localDb.deleteHeroSlide(id, actor);
  }

  async getSocialLinks(onlyActive = true): Promise<SocialLink[]> {
    const client = getClient();
    if (client) {
      try {
        let query = client.from("social_links").select("*").order("display_order", { ascending: true });
        if (onlyActive) {
          query = query.eq("is_active", true);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch {
        // fallback
      }
    }
    return localDb.getSocialLinks(onlyActive);
  }

  async saveSocialLinks(links: SocialLink[], actor = "admin"): Promise<SocialLink[]> {
    const saved = localDb.saveSocialLinks(links, actor);
    const client = getClient();
    if (client) {
      try {
        for (const link of links) {
          await client.from("social_links").upsert(link);
        }
      } catch {
        // ignore
      }
    }
    return saved;
  }

  // ----------------------------------------------------
  // INVENTORY & AUDIT LOGS
  // ----------------------------------------------------

  async getInventoryMovements(): Promise<InventoryMovement[]> {
    const client = getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("inventory_movements")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) return data;
      } catch {
        // fallback
      }
    }
    return localDb.getInventoryMovements();
  }

  async adjustStock(
    variantId: string,
    changeQuantity: number,
    reason: string,
    actor = "admin"
  ): Promise<{ success: boolean; newStock?: number; error?: string }> {
    const result = localDb.adjustStock(variantId, changeQuantity, reason, actor);
    if (result.success && result.newStock !== undefined) {
      const client = getClient();
      if (client) {
        try {
          // Also update variant stock in Supabase
          await client
            .from("product_variants")
            .update({ stock_quantity: result.newStock })
            .eq("id", variantId);
        } catch {
          // ignore
        }
      }
      return { success: true, newStock: result.newStock };
    }
    return { success: false, error: result.message };
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    const client = getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("admin_audit_logs")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) return data;
      } catch {
        // fallback
      }
    }
    return localDb.getAuditLogs();
  }

  async logAudit(action: string, entity: string, entity_id: string, actor: string, details: string) {
    localDb.logAudit(action, entity, entity_id, actor, details);
    const client = getClient();
    if (client) {
      try {
        await client.from("admin_audit_logs").insert({
          action,
          entity,
          entity_id,
          actor,
          details,
          created_at: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
    }
  }

  async getDashboardMetrics() {
    return localDb.getDashboardMetrics();
  }

  // ----------------------------------------------------
  // FULL SYNC TOOL: Push Local Data to Supabase
  // ----------------------------------------------------

  async syncLocalToSupabase(): Promise<{
    success: boolean;
    synced: {
      categories: number;
      products: number;
      variants: number;
      heroSlides: number;
      socialLinks: number;
      settings: boolean;
    };
    error?: string;
  }> {
    const client = getClient();
    if (!client) {
      return {
        success: false,
        synced: {
          categories: 0,
          products: 0,
          variants: 0,
          heroSlides: 0,
          socialLinks: 0,
          settings: false,
        },
        error: "Supabase client not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
      };
    }

    try {
      const categories = localDb.getCategories(false);
      const products = localDb.getProducts(true);
      const heroSlides = localDb.getHeroSlides(false);
      const socialLinks = localDb.getSocialLinks(false);
      const settings = localDb.getSettings();

      // 1. Categories
      if (categories.length > 0) {
        const catRows = categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          icon: c.icon,
          image_url: c.image_url,
          display_order: c.display_order,
          is_active: c.is_active,
        }));
        const { error: catErr } = await client.from("categories").upsert(catRows, { onConflict: "id" });
        if (catErr) throw new Error(`Category sync failed: ${catErr.message}`);
      }

      // 2. Products
      let totalVariants = 0;
      if (products.length > 0) {
        const prodRows = products.map((p) => ({
          id: p.id,
          category_id: p.category_id,
          category_name: p.category_name,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          description: p.description,
          regular_price: p.regular_price,
          sale_price: p.sale_price,
          images: p.images,
          is_featured: p.is_featured,
          is_bestseller: p.is_bestseller,
          is_new: p.is_new,
          is_published: p.is_published,
          stock_quantity: p.stock_quantity,
          low_stock_threshold: p.low_stock_threshold,
          attributes: p.attributes,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }));
        const { error: prodErr } = await client.from("products").upsert(prodRows, { onConflict: "id" });
        if (prodErr) throw new Error(`Product sync failed: ${prodErr.message}`);

        // 3. Variants
        const allVariants: any[] = [];
        for (const p of products) {
          if (p.variants && p.variants.length > 0) {
            for (const v of p.variants) {
              allVariants.push({
                id: v.id,
                product_id: p.id,
                sku: v.sku,
                attributes: v.attributes,
                regular_price: v.regular_price,
                sale_price: v.sale_price,
                stock_quantity: v.stock_quantity,
                image_url: v.image_url,
                is_active: v.is_active,
              });
            }
          }
        }
        if (allVariants.length > 0) {
          totalVariants = allVariants.length;
          const { error: varErr } = await client.from("product_variants").upsert(allVariants, { onConflict: "id" });
          if (varErr) throw new Error(`Variant sync failed: ${varErr.message}`);
        }
      }

      // 4. Hero Slides
      if (heroSlides.length > 0) {
        await client.from("hero_slides").upsert(heroSlides, { onConflict: "id" });
      }

      // 5. Social Links
      if (socialLinks.length > 0) {
        await client.from("social_links").upsert(socialLinks, { onConflict: "id" });
      }

      // 6. Settings
      await client.from("store_settings").upsert({
        id: "current",
        data: settings,
        updated_at: new Date().toISOString(),
      });

      return {
        success: true,
        synced: {
          categories: categories.length,
          products: products.length,
          variants: totalVariants,
          heroSlides: heroSlides.length,
          socialLinks: socialLinks.length,
          settings: true,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        synced: {
          categories: 0,
          products: 0,
          variants: 0,
          heroSlides: 0,
          socialLinks: 0,
          settings: false,
        },
        error: err?.message || String(err),
      };
    }
  }
}

export const repository = new Repository();
