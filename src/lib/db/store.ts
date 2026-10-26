import fs from "fs";
import path from "path";
import {
  Category,
  Product,
  Order,
  PaymentSubmission,
  HeroSlide,
  SocialLink,
  StoreSettings,
  UserProfile,
  InventoryMovement,
  AuditLog,
  CartItem,
  AuthCredential,
  PasswordResetToken,
} from "./types";
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken,
} from "../auth-security";

interface DatabaseSchema {
  categories: Category[];
  products: Product[];
  orders: Order[];
  payments: PaymentSubmission[];
  hero_slides: HeroSlide[];
  social_links: SocialLink[];
  settings: StoreSettings;
  users: UserProfile[];
  inventory_movements: InventoryMovement[];
  audit_logs: AuditLog[];
  carts: Record<string, CartItem[]>; // session/user ID -> items
  auth_credentials: AuthCredential[];
  password_resets: PasswordResetToken[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

const INITIAL_SETTINGS: StoreSettings = {
  store_name: "NSTU MERCH",
  tagline: "Wear Your Pride.",
  logo_url: "/assets/nstu-logo.png",
  phone: "+880 1812 345678",
  email: "nstu.merch@gmail.com",
  address: "NSTU, Noakhali Bangladesh",
  business_hours: "9:00 AM – 6:00 PM (Sat – Thu)",
  currency_code: "BDT",
  currency_symbol: "৳",
  delivery_fees: {
    campus: 30,
    noakhali: 60,
    outside: 120,
  },
  payment_methods: {
    cod: {
      id: "cod",
      name: "Cash on Delivery",
      is_enabled: true,
      account_number: "01711 223344",
      account_type: "Personal",
      instructions: "Pay with cash directly to the delivery person upon receiving your parcel. Please keep the exact amount ready.",
      requires_trx_id: false,
      display_order: 1,
    },
    bkash: {
      id: "bkash",
      name: "bKash",
      is_enabled: true,
      account_number: "01812 345678",
      account_type: "Personal",
      instructions: "Go to your bKash app or dial *247#. Select 'Send Money' to 01812 345678. Enter your order amount. Use your phone number or Order Number as reference. After sending, enter your Transaction ID (TrxID) and sender number below.",
      requires_trx_id: true,
      display_order: 2,
    },
    nagad: {
      id: "nagad",
      name: "Nagad",
      is_enabled: true,
      account_number: "01812 345679",
      account_type: "Personal",
      instructions: "Open your Nagad app or dial *167#. Select 'Send Money' to 01812 345679. Enter the total order amount. Enter reference. After sending, submit your Nagad Transaction ID and sender number.",
      requires_trx_id: true,
      display_order: 3,
    },
    rocket: {
      id: "rocket",
      name: "Rocket",
      is_enabled: true,
      account_number: "01812 345680",
      account_type: "Personal",
      instructions: "Open your Rocket app or dial *322#. Select 'Send Money' to 01812 345680. Enter the order amount. Enter transaction reference. Submit your 10-digit transaction ID and sender number.",
      requires_trx_id: true,
      display_order: 4,
    },
    cash: {
      id: "cash",
      name: "Cash Payment",
      is_enabled: true,
      account_number: "01711 223355",
      account_type: "Personal",
      instructions: "Visit our campus pickup booth (NSTU Student Center, 1st floor) during business hours (9:00 AM - 6:00 PM) to pay cash and collect your items.",
      requires_trx_id: false,
      display_order: 5,
    },
  },
  policies: {
    privacy_policy: "At NSTU Merch, we respect your privacy and protect all customer personal data including phone numbers and delivery addresses. We never share customer data with unauthorized third parties.",
    terms_conditions: "All merchandise designs are university-inspired. Orders are processed subject to stock availability and payment verification for manual mobile banking.",
    return_refund: "Items can be exchanged or returned within 7 days of delivery if defective, damaged, or incorrectly sized with tags intact.",
    shipping_policy: "Campus deliveries are delivered within 24 hours. Noakhali district deliveries take 1-2 business days. Nationwide deliveries take 2-4 business days.",
  },
};

const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Caps & Apparel", slug: "caps-apparel", icon: "GraduationCap", display_order: 1, is_active: true },
  { id: "cat-2", name: "Mugs & Drinkware", slug: "mugs-drinkware", icon: "Coffee", display_order: 2, is_active: true },
  { id: "cat-3", name: "Bags & Accessories", slug: "bags-accessories", icon: "ShoppingBag", display_order: 3, is_active: true },
  { id: "cat-4", name: "Stationery & Diaries", slug: "stationery-diaries", icon: "PenTool", display_order: 4, is_active: true },
  { id: "cat-5", name: "Files & Folders", slug: "files-folders", icon: "Folder", display_order: 5, is_active: true },
  { id: "cat-6", name: "Keychains", slug: "keychains", icon: "Key", display_order: 6, is_active: true },
  { id: "cat-7", name: "Gift Sets", slug: "gift-sets", icon: "Gift", display_order: 7, is_active: true },
  { id: "cat-8", name: "New Arrivals", slug: "new-arrivals", icon: "Star", display_order: 8, is_active: true },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-cap",
    name: "NSTU Signature Cap",
    slug: "nstu-signature-cap",
    sku: "NSTU-CAP-01",
    description: "Premium university-inspired baseball cap featuring high-density 3D embroidered official NSTU emblem. Crafted from 100% breathable cotton twill with an adjustable strap for comfortable all-day wear.",
    category_id: "cat-1",
    category_name: "Caps & Apparel",
    regular_price: 600,
    sale_price: 450,
    images: ["/assets/products/nstu-cap.jpg"],
    is_featured: true,
    is_bestseller: false,
    is_new: true,
    is_published: true,
    stock_quantity: 45,
    low_stock_threshold: 5,
    attributes: [
      { name: "Colour", values: ["Navy Blue", "Beige", "Black"] },
      { name: "Size", values: ["Adjustable"] },
    ],
    variants: [
      {
        id: "var-cap-navy",
        product_id: "prod-cap",
        sku: "NSTU-CAP-NAVY",
        attributes: { Colour: "Navy Blue", Size: "Adjustable" },
        regular_price: 600,
        sale_price: 450,
        stock_quantity: 25,
        image_url: "/assets/products/nstu-cap.jpg",
        is_active: true,
      },
      {
        id: "var-cap-beige",
        product_id: "prod-cap",
        sku: "NSTU-CAP-BEIGE",
        attributes: { Colour: "Beige", Size: "Adjustable" },
        regular_price: 600,
        sale_price: 450,
        stock_quantity: 12,
        image_url: "/assets/products/nstu-cap.jpg",
        is_active: true,
      },
      {
        id: "var-cap-black",
        product_id: "prod-cap",
        sku: "NSTU-CAP-BLACK",
        attributes: { Colour: "Black", Size: "Adjustable" },
        regular_price: 600,
        sale_price: 450,
        stock_quantity: 8,
        image_url: "/assets/products/nstu-cap.jpg",
        is_active: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-mug",
    name: "NSTU Ceramic Mug",
    slug: "nstu-ceramic-mug",
    sku: "NSTU-MUG-01",
    description: "High-grade 11oz glossy white ceramic coffee mug with durable, scratch-resistant official NSTU emblem print. Microwave and dishwasher safe, perfect for study sessions and campus mornings.",
    category_id: "cat-2",
    category_name: "Mugs & Drinkware",
    regular_price: 350,
    sale_price: 250,
    images: ["/assets/products/nstu-mug.jpg"],
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    is_published: true,
    stock_quantity: 60,
    low_stock_threshold: 10,
    attributes: [
      { name: "Design", values: ["Classic White", "Navy Accent"] },
      { name: "Size", values: ["325ml / 11oz"] },
    ],
    variants: [
      {
        id: "var-mug-white",
        product_id: "prod-mug",
        sku: "NSTU-MUG-WHT",
        attributes: { Design: "Classic White", Size: "325ml / 11oz" },
        regular_price: 350,
        sale_price: 250,
        stock_quantity: 40,
        image_url: "/assets/products/nstu-mug.jpg",
        is_active: true,
      },
      {
        id: "var-mug-navy",
        product_id: "prod-mug",
        sku: "NSTU-MUG-NVY",
        attributes: { Design: "Navy Accent", Size: "325ml / 11oz" },
        regular_price: 380,
        sale_price: 270,
        stock_quantity: 20,
        image_url: "/assets/products/nstu-mug.jpg",
        is_active: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-tote",
    name: "NSTU Canvas Tote Bag",
    slug: "nstu-canvas-tote-bag",
    sku: "NSTU-TOTE-01",
    description: "Heavyweight 12oz natural cotton canvas tote bag. Features reinforced shoulder straps and high-resolution screen-printed NSTU emblem. Roomy enough for laptops, books, and campus essentials.",
    category_id: "cat-3",
    category_name: "Bags & Accessories",
    regular_price: 500,
    sale_price: 350,
    images: ["/assets/products/nstu-tote.jpg"],
    is_featured: true,
    is_bestseller: false,
    is_new: true,
    is_published: true,
    stock_quantity: 35,
    low_stock_threshold: 5,
    attributes: [
      { name: "Colour", values: ["Natural Beige", "Navy Blue", "Deep Black"] },
    ],
    variants: [
      {
        id: "var-tote-beige",
        product_id: "prod-tote",
        sku: "NSTU-TOTE-BEIGE",
        attributes: { Colour: "Natural Beige" },
        regular_price: 500,
        sale_price: 350,
        stock_quantity: 20,
        image_url: "/assets/products/nstu-tote.jpg",
        is_active: true,
      },
      {
        id: "var-tote-navy",
        product_id: "prod-tote",
        sku: "NSTU-TOTE-NAVY",
        attributes: { Colour: "Navy Blue" },
        regular_price: 500,
        sale_price: 350,
        stock_quantity: 10,
        image_url: "/assets/products/nstu-tote.jpg",
        is_active: true,
      },
      {
        id: "var-tote-black",
        product_id: "prod-tote",
        sku: "NSTU-TOTE-BLK",
        attributes: { Colour: "Deep Black" },
        regular_price: 500,
        sale_price: 350,
        stock_quantity: 5,
        image_url: "/assets/products/nstu-tote.jpg",
        is_active: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-diary",
    name: "NSTU Diary & Pen Set",
    slug: "nstu-diary-pen-set",
    sku: "NSTU-DRY-01",
    description: "Executive PU leather-bound NSTU hardcover notebook with gold embossed logo, 192 acid-free ruled pages, ribbon bookmark, inner pocket, and a matching metallic twist-action ballpoint pen.",
    category_id: "cat-4",
    category_name: "Stationery & Diaries",
    regular_price: 750,
    sale_price: 550,
    images: ["/assets/products/nstu-diary.jpg"],
    is_featured: true,
    is_bestseller: false,
    is_new: false,
    is_published: true,
    stock_quantity: 50,
    low_stock_threshold: 8,
    attributes: [
      { name: "Colour", values: ["Executive Navy", "Midnight Black"] },
    ],
    variants: [
      {
        id: "var-diary-navy",
        product_id: "prod-diary",
        sku: "NSTU-DRY-NVY",
        attributes: { Colour: "Executive Navy" },
        regular_price: 750,
        sale_price: 550,
        stock_quantity: 32,
        image_url: "/assets/products/nstu-diary.jpg",
        is_active: true,
      },
      {
        id: "var-diary-black",
        product_id: "prod-diary",
        sku: "NSTU-DRY-BLK",
        attributes: { Colour: "Midnight Black" },
        regular_price: 750,
        sale_price: 550,
        stock_quantity: 18,
        image_url: "/assets/products/nstu-diary.jpg",
        is_active: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-keychain",
    name: "NSTU Metal Keychain",
    slug: "nstu-metal-keychain",
    sku: "NSTU-KEY-01",
    description: "Durable zinc alloy circular keychain with full-color hard enamel NSTU crest insert and clear protective dome. Built to keep your keys safe and celebrate your university journey.",
    category_id: "cat-6",
    category_name: "Keychains",
    regular_price: 200,
    sale_price: 150,
    images: ["/assets/products/nstu-keychain.jpg"],
    is_featured: true,
    is_bestseller: false,
    is_new: false,
    is_published: true,
    stock_quantity: 100,
    low_stock_threshold: 15,
    attributes: [
      { name: "Finish", values: ["Silver Plated", "Gold Plated"] },
    ],
    variants: [
      {
        id: "var-key-silver",
        product_id: "prod-keychain",
        sku: "NSTU-KEY-SLV",
        attributes: { Finish: "Silver Plated" },
        regular_price: 200,
        sale_price: 150,
        stock_quantity: 65,
        image_url: "/assets/products/nstu-keychain.jpg",
        is_active: true,
      },
      {
        id: "var-key-gold",
        product_id: "prod-keychain",
        sku: "NSTU-KEY-GLD",
        attributes: { Finish: "Gold Plated" },
        regular_price: 220,
        sale_price: 160,
        stock_quantity: 35,
        image_url: "/assets/products/nstu-keychain.jpg",
        is_active: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-backpack",
    name: "NSTU Campus Laptop Backpack",
    slug: "nstu-campus-laptop-backpack",
    sku: "NSTU-BPK-01",
    description: "Heavy-duty waterproof oxford fabric backpack with padded 15.6 inch laptop sleeve, ergonomic shoulder straps, water bottle side pockets, and prominent embroidered NSTU emblem.",
    category_id: "cat-3",
    category_name: "Bags & Accessories",
    regular_price: 1800,
    sale_price: 1450,
    images: ["/assets/banners/banner-bags.jpg"],
    is_featured: true,
    is_bestseller: true,
    is_new: true,
    is_published: true,
    stock_quantity: 25,
    low_stock_threshold: 5,
    attributes: [
      { name: "Colour", values: ["Navy Blue", "Deep Black"] },
    ],
    variants: [
      {
        id: "var-bpk-navy",
        product_id: "prod-backpack",
        sku: "NSTU-BPK-NVY",
        attributes: { Colour: "Navy Blue" },
        regular_price: 1800,
        sale_price: 1450,
        stock_quantity: 15,
        image_url: "/assets/banners/banner-bags.jpg",
        is_active: true,
      },
      {
        id: "var-bpk-blk",
        product_id: "prod-backpack",
        sku: "NSTU-BPK-BLK",
        attributes: { Colour: "Deep Black" },
        regular_price: 1800,
        sale_price: 1450,
        stock_quantity: 10,
        image_url: "/assets/banners/banner-bags.jpg",
        is_active: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-gift-set",
    name: "NSTU Premium Welcome Gift Box",
    slug: "nstu-premium-welcome-gift-box",
    sku: "NSTU-GFT-01",
    description: "Exclusive university gift set containing an NSTU Signature Cap, Ceramic Mug, Executive Diary, Metal Keychain, and Pen enclosed in a luxury foil-stamped presentation box.",
    category_id: "cat-7",
    category_name: "Gift Sets",
    regular_price: 1950,
    sale_price: 1490,
    images: ["/assets/hero/hero-slide-1.jpg"],
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    is_published: true,
    stock_quantity: 15,
    low_stock_threshold: 3,
    attributes: [
      { name: "Box Edition", values: ["Varsity Blue Deluxe"] },
    ],
    variants: [
      {
        id: "var-gft-blue",
        product_id: "prod-gift-set",
        sku: "NSTU-GFT-DLX",
        attributes: { "Box Edition": "Varsity Blue Deluxe" },
        regular_price: 1950,
        sale_price: 1490,
        stock_quantity: 15,
        image_url: "/assets/hero/hero-slide-1.jpg",
        is_active: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-folder",
    name: "NSTU Document File & Folder",
    slug: "nstu-document-file-folder",
    sku: "NSTU-FLD-01",
    description: "Durable water-resistant polypropylene document folder with snap-button closure. Designed for university certificates, assignments, and campus documents.",
    category_id: "cat-5",
    category_name: "Files & Folders",
    regular_price: 150,
    sale_price: 100,
    images: ["/assets/products/nstu-diary.jpg"],
    is_featured: false,
    is_bestseller: false,
    is_new: false,
    is_published: true,
    stock_quantity: 80,
    low_stock_threshold: 10,
    attributes: [
      { name: "Colour", values: ["Frosted Blue", "Clear White"] },
    ],
    variants: [
      {
        id: "var-fld-blue",
        product_id: "prod-folder",
        sku: "NSTU-FLD-BLU",
        attributes: { Colour: "Frosted Blue" },
        regular_price: 150,
        sale_price: 100,
        stock_quantity: 50,
        image_url: "/assets/products/nstu-diary.jpg",
        is_active: true,
      },
      {
        id: "var-fld-clr",
        product_id: "prod-folder",
        sku: "NSTU-FLD-CLR",
        attributes: { Colour: "Clear White" },
        regular_price: 150,
        sale_price: 100,
        stock_quantity: 30,
        image_url: "/assets/products/nstu-diary.jpg",
        is_active: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    badge: "OFFICIAL NSTU MERCHANDISE",
    title: "Carry Your Campus.",
    subtitle: "Keep Your Memories.",
    description: "Premium university-inspired products for every NSTU student.",
    cta_text: "Shop Now",
    cta_link: "/shop",
    desktop_image: "/assets/hero/hero-slide-1.jpg",
    mobile_image: "/assets/hero/hero-slide-1.jpg",
    display_order: 1,
    is_active: true,
  },
  {
    id: "slide-2",
    badge: "NEW ARRIVALS 2026",
    title: "Wear Your Pride.",
    subtitle: "Every Single Day.",
    description: "From cozy signature caps to sturdy campus backpacks and executive sets.",
    cta_text: "Explore Collection",
    cta_link: "/category/caps-apparel",
    desktop_image: "/assets/hero/hero-slide-1.jpg",
    display_order: 2,
    is_active: true,
  },
];

const INITIAL_SOCIAL_LINKS: SocialLink[] = [
  { id: "soc-1", platform: "facebook", label: "Facebook", url: "https://facebook.com/nstu.official", display_order: 1, is_active: true },
  { id: "soc-2", platform: "instagram", label: "Instagram", url: "https://instagram.com/nstu.merch", display_order: 2, is_active: true },
  { id: "soc-3", platform: "youtube", label: "YouTube", url: "https://youtube.com/@nstu", display_order: 3, is_active: true },
  { id: "soc-4", platform: "tiktok", label: "TikTok", url: "https://tiktok.com/@nstumerch", display_order: 4, is_active: true },
];

const INITIAL_USERS: UserProfile[] = [
  {
    id: "usr-admin-1",
    name: "NSTU Store Administrator",
    email: "admin@nstu.edu.bd",
    phone: "01812345678",
    role: "admin",
    created_at: new Date().toISOString(),
    is_active: true,
  },
  {
    id: "usr-demo-1",
    name: "Sabbir Ahmed",
    email: "sabbir@student.nstu.edu.bd",
    phone: "01712345678",
    role: "customer",
    created_at: new Date().toISOString(),
    is_active: true,
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    ensureDirectoryExistence(DB_FILE);
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@nstu.edu.bd").toLowerCase();
    const adminPass = process.env.ADMIN_DEFAULT_PASSWORD || "nstuadmin123";

    if (!fs.existsSync(DB_FILE)) {
      const initial: DatabaseSchema = {
        categories: INITIAL_CATEGORIES,
        products: INITIAL_PRODUCTS,
        orders: [],
        payments: [],
        hero_slides: INITIAL_HERO_SLIDES,
        social_links: INITIAL_SOCIAL_LINKS,
        settings: INITIAL_SETTINGS,
        users: INITIAL_USERS,
        inventory_movements: [],
        audit_logs: [
          {
            id: "log-init",
            action: "SYSTEM_INITIALIZE",
            entity: "store",
            entity_id: "nstu-merch",
            actor: "system",
            details: "NSTU Merch database seeded with university catalog & settings",
            created_at: new Date().toISOString(),
          },
        ],
        carts: {},
        auth_credentials: [
          {
            user_id: "usr-admin-1",
            email: adminEmail,
            password_hash: hashPassword(adminPass),
            updated_at: new Date().toISOString(),
          },
        ],
        password_resets: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }

    try {
      const raw = fs.readFileSync(DB_FILE, "utf8");
      const parsed: DatabaseSchema = JSON.parse(raw);
      if (!parsed.auth_credentials) {
        parsed.auth_credentials = [];
      }
      if (!parsed.password_resets) {
        parsed.password_resets = [];
      }
      // Ensure initial admin credential exists
      const existingAdminCred = parsed.auth_credentials.find(
        (c) => c.email.toLowerCase() === adminEmail
      );
      if (!existingAdminCred) {
        parsed.auth_credentials.push({
          user_id: "usr-admin-1",
          email: adminEmail,
          password_hash: hashPassword(adminPass),
          updated_at: new Date().toISOString(),
        });
      }
      return parsed;
    } catch {
      return {
        categories: INITIAL_CATEGORIES,
        products: INITIAL_PRODUCTS,
        orders: [],
        payments: [],
        hero_slides: INITIAL_HERO_SLIDES,
        social_links: INITIAL_SOCIAL_LINKS,
        settings: INITIAL_SETTINGS,
        users: INITIAL_USERS,
        inventory_movements: [],
        audit_logs: [],
        carts: {},
        auth_credentials: [
          {
            user_id: "usr-admin-1",
            email: adminEmail,
            password_hash: hashPassword(adminPass),
            updated_at: new Date().toISOString(),
          },
        ],
        password_resets: [],
      };
    }
  }

  private save() {
    ensureDirectoryExistence(DB_FILE);
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), "utf8");
    fs.renameSync(tempFile, DB_FILE);
  }

  // --- Products ---
  getProducts(includeDrafts = false): Product[] {
    if (includeDrafts) return this.data.products;
    return this.data.products.filter((p) => p.is_published);
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.data.products.find((p) => p.slug === slug);
  }

  saveProduct(product: Product, actor = "admin"): Product {
    const index = this.data.products.findIndex((p) => p.id === product.id);
    product.updated_at = new Date().toISOString();

    // Recalculate total product stock
    if (product.variants && product.variants.length > 0) {
      product.stock_quantity = product.variants.reduce(
        (sum, v) => sum + (v.stock_quantity || 0),
        0
      );
    }

    if (index >= 0) {
      this.data.products[index] = product;
      this.logAudit("UPDATE", "product", product.id, actor, `Updated product: ${product.name}`);
    } else {
      product.created_at = new Date().toISOString();
      this.data.products.unshift(product);
      this.logAudit("CREATE", "product", product.id, actor, `Created product: ${product.name}`);
    }
    this.save();
    return product;
  }

  deleteProduct(id: string, actor = "admin"): boolean {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index >= 0) {
      const [removed] = this.data.products.splice(index, 1);
      this.logAudit("DELETE", "product", id, actor, `Deleted product: ${removed.name}`);
      this.save();
      return true;
    }
    return false;
  }

  // --- Categories ---
  getCategories(onlyActive = true): Category[] {
    let cats = this.data.categories;
    if (onlyActive) cats = cats.filter((c) => c.is_active);
    return cats.sort((a, b) => a.display_order - b.display_order);
  }

  getCategoryBySlug(slug: string): Category | undefined {
    return this.data.categories.find((c) => c.slug === slug);
  }

  saveCategory(category: Category, actor = "admin"): Category {
    const index = this.data.categories.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      this.data.categories[index] = category;
      this.logAudit("UPDATE", "category", category.id, actor, `Updated category: ${category.name}`);
    } else {
      this.data.categories.push(category);
      this.logAudit("CREATE", "category", category.id, actor, `Created category: ${category.name}`);
    }
    this.save();
    return category;
  }

  deleteCategory(id: string, actor = "admin"): { success: boolean; message?: string } {
    const inUse = this.data.products.some((p) => p.category_id === id);
    if (inUse) {
      return { success: false, message: "Cannot delete category with associated products." };
    }
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.data.categories.splice(idx, 1);
      this.logAudit("DELETE", "category", id, actor, `Deleted category ${id}`);
      this.save();
      return { success: true };
    }
    return { success: false, message: "Category not found." };
  }

  // --- Stock Management & Inventory Movements ---
  adjustStock(
    variantId: string,
    changeQty: number,
    reason: string,
    actor = "admin"
  ): { success: boolean; newStock?: number; message?: string } {
    let foundProduct: Product | undefined;
    let foundVariant = undefined;

    for (const prod of this.data.products) {
      const v = prod.variants.find((vr) => vr.id === variantId);
      if (v) {
        foundProduct = prod;
        foundVariant = v;
        break;
      }
    }

    if (!foundProduct || !foundVariant) {
      return { success: false, message: "Variant not found" };
    }

    const previousStock = foundVariant.stock_quantity;
    const newStock = previousStock + changeQty;
    if (newStock < 0) {
      return { success: false, message: "Insufficient stock. Cannot reduce below 0." };
    }

    foundVariant.stock_quantity = newStock;
    foundProduct.stock_quantity = foundProduct.variants.reduce(
      (sum, vr) => sum + (vr.stock_quantity || 0),
      0
    );

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      variant_id: variantId,
      product_name: foundProduct.name,
      sku: foundVariant.sku,
      change_quantity: changeQty,
      previous_stock: previousStock,
      new_stock: newStock,
      reason,
      actor,
      created_at: new Date().toISOString(),
    };
    this.data.inventory_movements.unshift(movement);
    this.save();

    return { success: true, newStock };
  }

  getInventoryMovements(): InventoryMovement[] {
    return this.data.inventory_movements;
  }

  // --- Carts ---
  getCart(sessionId: string): CartItem[] {
    return this.data.carts[sessionId] || [];
  }

  saveCart(sessionId: string, items: CartItem[]): CartItem[] {
    this.data.carts[sessionId] = items;
    this.save();
    return items;
  }

  // --- Orders ---
  getOrders(): Order[] {
    return this.data.orders.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id || o.order_number === id);
  }

  createOrder(orderData: Omit<Order, "id" | "order_number" | "created_at" | "updated_at">): {
    success: boolean;
    order?: Order;
    message?: string;
  } {
    // 1. Server-side validation of variants & stock availability
    for (const item of orderData.items) {
      let foundVariant = undefined;
      let foundProduct = undefined;
      for (const prod of this.data.products) {
        const v = prod.variants.find((vr) => vr.id === item.variant_id);
        if (v) {
          foundProduct = prod;
          foundVariant = v;
          break;
        }
      }

      if (!foundVariant || !foundProduct) {
        return { success: false, message: `Product variant ${item.variant_label} not found.` };
      }

      if (foundVariant.stock_quantity < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for ${foundProduct.name} (${item.variant_label}). Available: ${foundVariant.stock_quantity}`,
        };
      }
    }

    // 2. Decrement stock atomically
    for (const item of orderData.items) {
      this.adjustStock(
        item.variant_id,
        -item.quantity,
        `Order placement reserved stock`,
        orderData.customer_name
      );
    }

    // 3. Generate sequential/unique readable order number (e.g. NSTU-2026-1042)
    const nextNum = 1001 + this.data.orders.length;
    const orderNumber = `NSTU-2026-${nextNum}`;

    const order: Order = {
      ...orderData,
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order_number: orderNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.orders.unshift(order);
    this.logAudit("CREATE", "order", order.id, order.customer_name, `Created order ${orderNumber} for ৳${order.total}`);
    this.save();

    return { success: true, order };
  }

  updateOrderStatus(
    orderId: string,
    orderStatus: Order["order_status"],
    paymentStatus?: Order["payment_status"],
    cancellationReason?: string,
    actor = "admin"
  ): Order | undefined {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    const prevOrderStatus = order.order_status;
    order.order_status = orderStatus;
    if (paymentStatus) order.payment_status = paymentStatus;
    if (cancellationReason) order.cancellation_reason = cancellationReason;
    order.updated_at = new Date().toISOString();

    // If order is cancelled or returned, restore stock atomically!
    if (
      (orderStatus === "cancelled" || orderStatus === "returned") &&
      prevOrderStatus !== "cancelled" &&
      prevOrderStatus !== "returned"
    ) {
      for (const item of order.items) {
        this.adjustStock(
          item.variant_id,
          item.quantity,
          `Restored stock due to order ${orderStatus} (${order.order_number})`,
          actor
        );
      }
    }

    this.logAudit(
      "UPDATE_STATUS",
      "order",
      order.id,
      actor,
      `Order ${order.order_number} status changed to ${orderStatus} (Payment: ${order.payment_status})`
    );
    this.save();
    return order;
  }

  updateOrderShipping(
    orderId: string,
    courierName: string,
    trackingNumber: string,
    internalNotes?: string,
    actor = "admin"
  ): Order | undefined {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    order.courier_name = courierName;
    order.tracking_number = trackingNumber;
    if (internalNotes !== undefined) order.internal_notes = internalNotes;
    order.updated_at = new Date().toISOString();

    this.logAudit("UPDATE_SHIPPING", "order", order.id, actor, `Shipping updated for ${order.order_number}`);
    this.save();
    return order;
  }

  // --- Payments & Verification ---
  submitPayment(submission: Omit<PaymentSubmission, "id" | "created_at" | "status">): PaymentSubmission {
    const item: PaymentSubmission = {
      ...submission,
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    this.data.payments.unshift(item);

    // Update order payment status to submitted
    const order = this.data.orders.find((o) => o.id === submission.order_id || o.order_number === submission.order_number);
    if (order) {
      order.payment_status = "submitted";
      order.updated_at = new Date().toISOString();
    }

    this.save();
    return item;
  }

  getPayments(): PaymentSubmission[] {
    return this.data.payments;
  }

  reviewPayment(
    paymentId: string,
    status: "verified" | "rejected",
    actor = "admin"
  ): PaymentSubmission | undefined {
    const payment = this.data.payments.find((p) => p.id === paymentId);
    if (!payment) return undefined;

    payment.status = status;
    payment.reviewed_by = actor;
    payment.reviewed_at = new Date().toISOString();

    const order = this.data.orders.find((o) => o.id === payment.order_id || o.order_number === payment.order_number);
    if (order) {
      order.payment_status = status === "verified" ? "verified" : "rejected";
      if (status === "verified" && order.order_status === "awaiting_payment") {
        order.order_status = "confirmed";
      }
      order.updated_at = new Date().toISOString();
    }

    this.logAudit(
      status === "verified" ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED",
      "payment",
      paymentId,
      actor,
      `Payment for ${payment.order_number} (${payment.payment_method} TrxID: ${payment.transaction_id}) marked as ${status}`
    );
    this.save();
    return payment;
  }

  // --- Settings ---
  getSettings(): StoreSettings {
    return this.data.settings;
  }

  updateSettings(settings: StoreSettings, actor = "admin"): StoreSettings {
    this.data.settings = settings;
    this.logAudit("UPDATE", "settings", "global", actor, "Updated store settings & payment accounts");
    this.save();
    return settings;
  }

  // --- Hero Slides ---
  getHeroSlides(onlyActive = true): HeroSlide[] {
    let slides = this.data.hero_slides;
    if (onlyActive) slides = slides.filter((s) => s.is_active);
    return slides.sort((a, b) => a.display_order - b.display_order);
  }

  saveHeroSlide(slide: HeroSlide, actor = "admin"): HeroSlide {
    const idx = this.data.hero_slides.findIndex((s) => s.id === slide.id);
    if (idx >= 0) {
      this.data.hero_slides[idx] = slide;
    } else {
      this.data.hero_slides.push(slide);
    }
    this.logAudit("SAVE", "hero_slide", slide.id, actor, `Saved slide: ${slide.title}`);
    this.save();
    return slide;
  }

  deleteHeroSlide(id: string, actor = "admin"): boolean {
    const idx = this.data.hero_slides.findIndex((s) => s.id === id);
    if (idx >= 0) {
      this.data.hero_slides.splice(idx, 1);
      this.logAudit("DELETE", "hero_slide", id, actor, `Deleted slide ${id}`);
      this.save();
      return true;
    }
    return false;
  }

  // --- Social Links ---
  getSocialLinks(onlyActive = true): SocialLink[] {
    let links = this.data.social_links;
    if (onlyActive) links = links.filter((l) => l.is_active && l.url && l.url.trim() !== "");
    return links.sort((a, b) => a.display_order - b.display_order);
  }

  saveSocialLinks(links: SocialLink[], actor = "admin"): SocialLink[] {
    this.data.social_links = links;
    this.logAudit("UPDATE", "social_links", "all", actor, "Updated social links");
    this.save();
    return links;
  }

  // --- Users & Audit Logs ---
  getUsers(): UserProfile[] {
    return this.data.users;
  }

  getAdminUser(): UserProfile {
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@nstu.edu.bd").toLowerCase();
    const admin = this.data.users.find(
      (u) => u.role === "admin" || u.email.toLowerCase() === adminEmail
    );
    if (admin) return admin;

    const defaultAdmin: UserProfile = {
      id: "usr-admin-1",
      name: "NSTU Store Administrator",
      email: adminEmail,
      phone: "01812345678",
      role: "admin",
      created_at: new Date().toISOString(),
      is_active: true,
    };
    this.data.users.push(defaultAdmin);
    this.save();
    return defaultAdmin;
  }

  getAdminCredential(): AuthCredential {
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@nstu.edu.bd").toLowerCase();
    const adminPass = process.env.ADMIN_DEFAULT_PASSWORD || "nstuadmin123";

    if (!this.data.auth_credentials) {
      this.data.auth_credentials = [];
    }

    let cred = this.data.auth_credentials.find(
      (c) => c.email.toLowerCase() === adminEmail
    );

    if (!cred) {
      cred = {
        user_id: "usr-admin-1",
        email: adminEmail,
        password_hash: hashPassword(adminPass),
        updated_at: new Date().toISOString(),
      };
      this.data.auth_credentials.push(cred);
      this.save();
    }

    return cred;
  }

  verifyAdminPassword(password: string): boolean {
    const cred = this.getAdminCredential();
    return verifyPassword(password, cred.password_hash);
  }

  updateAdminPassword(
    newPassword: string,
    actor = "admin"
  ): { success: boolean; message?: string } {
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@nstu.edu.bd").toLowerCase();
    const cred = this.getAdminCredential();

    if (verifyPassword(newPassword, cred.password_hash)) {
      return { success: false, message: "New password cannot be identical to current password." };
    }

    cred.password_hash = hashPassword(newPassword);
    cred.updated_at = new Date().toISOString();

    this.logAudit(
      "ADMIN_PASSWORD_CHANGED",
      "admin_auth",
      cred.user_id,
      actor,
      `Administrator password updated securely by ${actor}`
    );
    this.save();
    return { success: true };
  }

  getUserCredential(email: string): AuthCredential | undefined {
    if (!this.data.auth_credentials) return undefined;
    return this.data.auth_credentials.find(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    );
  }

  setUserPassword(userId: string, email: string, password: string) {
    if (!this.data.auth_credentials) {
      this.data.auth_credentials = [];
    }
    const cleanEmail = email.toLowerCase();
    const existing = this.data.auth_credentials.find((c) => c.email.toLowerCase() === cleanEmail);

    if (existing) {
      existing.password_hash = hashPassword(password);
      existing.updated_at = new Date().toISOString();
    } else {
      this.data.auth_credentials.push({
        user_id: userId,
        email: cleanEmail,
        password_hash: hashPassword(password),
        updated_at: new Date().toISOString(),
      });
    }
    this.save();
  }

  verifyUserPassword(email: string, password: string): boolean {
    const cred = this.getUserCredential(email);
    if (!cred) return false;
    return verifyPassword(password, cred.password_hash);
  }

  createPasswordResetToken(email: string): {
    success: boolean;
    rawToken?: string;
    expiresAt?: string;
    message?: string;
  } {
    const cleanEmail = email.toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@nstu.edu.bd").toLowerCase();

    // Check if user exists (admin or regular user)
    const isAdmin = cleanEmail === adminEmail;
    const user = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!isAdmin && !user) {
      return { success: false, message: "User not found" };
    }

    const userId = user ? user.id : "usr-admin-1";
    const { rawToken, tokenHash } = generateSecureToken();

    // 15 minutes TTL
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    if (!this.data.password_resets) {
      this.data.password_resets = [];
    }

    // Invalidate existing unused tokens for this email
    for (const tokenRecord of this.data.password_resets) {
      if (tokenRecord.email.toLowerCase() === cleanEmail) {
        tokenRecord.used = true;
      }
    }

    const resetTokenRecord: PasswordResetToken = {
      id: `rst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      email: cleanEmail,
      token_hash: tokenHash,
      expires_at: expiresAt,
      used: false,
      created_at: new Date().toISOString(),
    };

    this.data.password_resets.push(resetTokenRecord);
    this.logAudit(
      "PASSWORD_RESET_REQUESTED",
      "auth",
      userId,
      cleanEmail,
      `Password reset token requested for ${cleanEmail}`
    );
    this.save();

    return {
      success: true,
      rawToken,
      expiresAt,
    };
  }

  verifyAndConsumeResetToken(
    rawToken: string,
    newPassword: string
  ): { success: boolean; email?: string; message?: string } {
    if (!rawToken || !newPassword) {
      return { success: false, message: "Token and new password are required." };
    }

    const hashedInput = hashToken(rawToken);
    if (!this.data.password_resets) {
      return { success: false, message: "Invalid or expired recovery token." };
    }

    const match = this.data.password_resets.find(
      (r) => r.token_hash === hashedInput && !r.used
    );

    if (!match) {
      return { success: false, message: "Invalid or expired recovery token." };
    }

    if (new Date(match.expires_at).getTime() < Date.now()) {
      match.used = true;
      this.save();
      return { success: false, message: "Recovery token has expired. Please request a new one." };
    }

    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@nstu.edu.bd").toLowerCase();

    // Update password
    if (match.email.toLowerCase() === adminEmail) {
      const updateResult = this.updateAdminPassword(newPassword, `ResetToken:${match.email}`);
      if (!updateResult.success) {
        return updateResult;
      }
    } else {
      this.setUserPassword(match.user_id, match.email, newPassword);
    }

    match.used = true;
    this.logAudit(
      "PASSWORD_RESET_COMPLETED",
      "auth",
      match.user_id,
      match.email,
      `Password successfully reset using recovery token for ${match.email}`
    );
    this.save();

    return { success: true, email: match.email };
  }


  getAuditLogs(): AuditLog[] {
    return this.data.audit_logs;
  }

  logAudit(action: string, entity: string, entity_id: string, actor: string, details: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      entity,
      entity_id,
      actor,
      details,
      created_at: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs.pop();
    }
  }

  // --- Real Dashboard Metrics ---
  getDashboardMetrics() {
    const orders = this.data.orders;
    const products = this.data.products;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.order_status === "pending" || o.order_status === "awaiting_payment").length;
    const confirmedOrders = orders.filter((o) => o.order_status === "confirmed" || o.order_status === "processing").length;
    const deliveredOrders = orders.filter((o) => o.order_status === "delivered").length;
    const cancelledOrders = orders.filter((o) => o.order_status === "cancelled").length;

    // Real revenue calculated strictly from delivered or confirmed orders (not cancelled)
    const qualifyingOrders = orders.filter(
      (o) => o.order_status !== "cancelled" && o.payment_status !== "rejected"
    );
    const totalRevenue = qualifyingOrders.reduce((sum, o) => sum + o.total, 0);

    const totalProducts = products.length;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;

    for (const p of products) {
      if (p.stock_quantity <= 0) {
        outOfStockProducts++;
      } else if (p.stock_quantity <= p.low_stock_threshold) {
        lowStockProducts++;
      }
    }

    const registeredUsers = this.data.users.length;
    const pendingPayments = this.data.payments.filter((p) => p.status === "pending").length;

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      registeredUsers,
      pendingPayments,
    };
  }
}

// Singleton database instance
export const db = new Database();
