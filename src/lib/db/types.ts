export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface Attribute {
  id: string;
  name: string; // e.g. "Size", "Colour", "Material"
  slug: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  attributes: Record<string, string>; // e.g. { "Colour": "Navy", "Size": "Medium" }
  regular_price: number;
  sale_price?: number;
  stock_quantity: number;
  image_url?: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  category_id: string;
  category_name?: string;
  regular_price: number;
  sale_price?: number;
  images: string[];
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  is_published: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  attributes: { name: string; values: string[] }[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  product_slug: string;
  sku: string;
  variant_label: string; // e.g. "Navy / Medium"
  unit_price: number;
  regular_price: number;
  quantity: number;
  image_url: string;
  max_stock: number;
}

export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus =
  | "unpaid"
  | "submitted"
  | "verified"
  | "rejected"
  | "refunded";

export type PaymentMethodType =
  | "cod"
  | "bkash"
  | "nagad"
  | "rocket"
  | "cash";

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  sku: string;
  variant_label: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  district: string;
  area: string;
  delivery_zone: "campus" | "noakhali" | "outside";
  order_notes?: string;
  payment_method: PaymentMethodType;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  items: OrderItem[];
  courier_name?: string;
  tracking_number?: string;
  internal_notes?: string;
  cancellation_reason?: string;
  risk_score?: "low" | "medium" | "high";
  risk_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentSubmission {
  id: string;
  order_id: string;
  order_number: string;
  payment_method: PaymentMethodType;
  sender_number: string;
  transaction_id: string;
  reference_note?: string;
  amount: number;
  status: "pending" | "verified" | "rejected";
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  variant_id: string;
  product_name: string;
  sku: string;
  change_quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  actor: string;
  created_at: string;
}

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
  cta_link: string;
  desktop_image: string;
  mobile_image?: string;
  display_order: number;
  is_active: boolean;
}

export interface SocialLink {
  id: string;
  platform: "facebook" | "instagram" | "youtube" | "tiktok" | "whatsapp" | "twitter";
  label: string;
  url: string;
  display_order: number;
  is_active: boolean;
}

export interface PaymentMethodConfig {
  id: PaymentMethodType;
  name: string;
  is_enabled: boolean;
  account_number: string;
  account_type: "Personal" | "Agent" | "Merchant";
  instructions: string;
  requires_trx_id: boolean;
  display_order: number;
}

export interface StoreSettings {
  store_name: string;
  tagline: string;
  logo_url: string;
  phone: string;
  email: string;
  address: string;
  business_hours: string;
  currency_code: string;
  currency_symbol: string;
  delivery_fees: {
    campus: number;
    noakhali: number;
    outside: number;
  };
  payment_methods: Record<PaymentMethodType, PaymentMethodConfig>;
  policies: {
    privacy_policy: string;
    terms_conditions: string;
    return_refund: string;
    shipping_policy: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  created_at: string;
  is_active: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entity_id: string;
  actor: string;
  details: string;
  created_at: string;
}

export interface AuthCredential {
  user_id: string;
  email: string;
  password_hash: string;
  updated_at: string;
}

export interface PasswordResetToken {
  id: string;
  user_id: string;
  email: string;
  token_hash: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

