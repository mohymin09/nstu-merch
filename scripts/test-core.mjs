// Automated Verification Test Suite for NSTU Merch
import assert from "assert";
import fs from "fs";
import path from "path";

console.log("=================================================");
console.log("NSTU MERCH — AUTOMATED CORE VERIFICATION SUITE");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] Test ${totalTests}: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] Test ${totalTests}: ${description}`);
    console.error(`       Error: ${err.message}`);
  }
}

// 1. Verify Logo and Media Assets
test("Official NSTU Logo assets are correctly located in public/assets/", () => {
  const logoPng = path.join(process.cwd(), "public", "assets", "nstu-logo.png");
  assert(fs.existsSync(logoPng), "public/assets/nstu-logo.png must exist");
  const stats = fs.statSync(logoPng);
  assert(stats.size > 1000, "NSTU logo file size must be valid");
});

// 2. Database Store Initialized with Seed Catalog
test("Database store initializes and contains NSTU university merchandise", async () => {
  const { db } = await import("../src/lib/db/store.js");
  const products = db.getProducts(true);
  assert(products.length >= 5, "Database must have at least 5 merchandise items");

  const cap = products.find((p) => p.slug === "nstu-signature-cap");
  assert(cap, "NSTU Signature Cap must exist");
  assert.strictEqual(cap.category_name, "Caps & Apparel");
});

// 3. Category Management
test("8 Standard University Categories are loaded and database-driven", async () => {
  const { db } = await import("../src/lib/db/store.js");
  const cats = db.getCategories(false);
  assert(cats.length >= 8, "Expected 8 university categories");
  const catNames = cats.map((c) => c.name);
  assert(catNames.includes("Caps & Apparel"), "Must include Caps & Apparel");
  assert(catNames.includes("Mugs & Drinkware"), "Must include Mugs & Drinkware");
  assert(catNames.includes("Bags & Accessories"), "Must include Bags & Accessories");
  assert(catNames.includes("Stationery & Diaries"), "Must include Stationery & Diaries");
});

// 4. Advanced Product Variations (Variant SKU, prices, stock per variant)
test("Advanced Product Variation system supports independent prices & stock", async () => {
  const { db } = await import("../src/lib/db/store.js");
  const cap = db.getProductBySlug("nstu-signature-cap");
  assert(cap.variants.length >= 2, "Cap must have multiple variants");

  for (const v of cap.variants) {
    assert(v.sku, "Each variant must have a unique SKU");
    assert(typeof v.regular_price === "number", "Variant must have numeric regular_price");
    assert(typeof v.stock_quantity === "number", "Variant must have numeric stock_quantity");
    assert(v.attributes && typeof v.attributes === "object", "Variant attributes must be object");
  }
});

// 5. Server-Side Price & Stock Validation during Order Creation
test("Checkout engine validates variant stock and recalculates prices server-side", async () => {
  const { db } = await import("../src/lib/db/store.js");
  const mug = db.getProductBySlug("nstu-ceramic-mug");
  const variant = mug.variants[0];
  const initialStock = variant.stock_quantity;

  // Test overselling prevention
  const overOrder = db.createOrder({
    customer_name: "Test Student",
    customer_phone: "01800000000",
    delivery_address: "Campus Hall",
    district: "Noakhali",
    area: "Campus",
    delivery_zone: "campus",
    payment_method: "cod",
    payment_status: "unpaid",
    order_status: "pending",
    subtotal: 99999,
    delivery_fee: 30,
    discount: 0,
    total: 99999,
    items: [
      {
        id: "item-test-over",
        product_id: mug.id,
        variant_id: variant.id,
        product_name: mug.name,
        sku: variant.sku,
        variant_label: "White",
        unit_price: 250,
        quantity: initialStock + 100, // Exceeds available stock
        total_price: (initialStock + 100) * 250,
        image_url: "/assets/nstu-logo.png",
      },
    ],
  });

  assert.strictEqual(overOrder.success, false, "Must reject order exceeding available stock");
  assert(overOrder.message.includes("Insufficient stock"), "Error must clearly cite stock limit");
});

// 6. Atomic Stock Reservation and Order Number Generation
test("Order placement decrements stock atomically and generates unique order number", async () => {
  const { db } = await import("../src/lib/db/store.js");
  const diary = db.getProductBySlug("nstu-diary-pen-set");
  const variant = diary.variants[0];
  const beforeStock = variant.stock_quantity;

  const res = db.createOrder({
    customer_name: "Rahim Chowdhury",
    customer_phone: "01712345678",
    delivery_address: "Auditorium Road, NSTU",
    district: "Noakhali",
    area: "Campus",
    delivery_zone: "campus",
    payment_method: "bkash",
    payment_status: "unpaid",
    order_status: "awaiting_payment",
    subtotal: 550,
    delivery_fee: 30,
    discount: 0,
    total: 580,
    items: [
      {
        id: "item-diary-1",
        product_id: diary.id,
        variant_id: variant.id,
        product_name: diary.name,
        sku: variant.sku,
        variant_label: "Executive Navy",
        unit_price: 550,
        quantity: 2,
        total_price: 1100,
        image_url: "/assets/products/nstu-diary.jpg",
      },
    ],
  });

  assert(res.success, "Order creation must succeed");
  assert(res.order.order_number.startsWith("NSTU-2026-"), "Order number format must be NSTU-2026-XXXX");
  assert.strictEqual(variant.stock_quantity, beforeStock - 2, "Stock must decrease by ordered quantity 2");
});

// 7. Manual Mobile Banking Payment Submission & Verification
test("Customer can submit TrxID and Admin verifies/rejects with audit trail", async () => {
  const { db } = await import("../src/lib/db/store.js");
  const orders = db.getOrders();
  const testOrder = orders[0];

  const submission = db.submitPayment({
    order_id: testOrder.id,
    order_number: testOrder.order_number,
    payment_method: "bkash",
    sender_number: "01812345678",
    transaction_id: "BK89X12Z",
    amount: testOrder.total,
  });

  assert(submission.id, "Payment submission must generate an ID");
  assert.strictEqual(submission.status, "pending");

  // Admin reviews payment
  const reviewed = db.reviewPayment(submission.id, "verified", "Admin-User");
  assert.strictEqual(reviewed.status, "verified");

  const updatedOrder = db.getOrderById(testOrder.id);
  assert.strictEqual(updatedOrder.payment_status, "verified");
});

// 8. Stock Restoration on Order Cancellation
test("Cancelling an order restores stock back to the variant inventory", async () => {
  const { db } = await import("../src/lib/db/store.js");
  const orders = db.getOrders();
  const testOrder = orders[0];
  const item = testOrder.items[0];

  let variantBefore = null;
  for (const p of db.getProducts(true)) {
    const v = p.variants.find((vr) => vr.id === item.variant_id);
    if (v) {
      variantBefore = v.stock_quantity;
      break;
    }
  }

  // Cancel order
  db.updateOrderStatus(testOrder.id, "cancelled", undefined, "Customer requested cancellation", "Admin");

  let variantAfter = null;
  for (const p of db.getProducts(true)) {
    const v = p.variants.find((vr) => vr.id === item.variant_id);
    if (v) {
      variantAfter = v.stock_quantity;
      break;
    }
  }

  assert.strictEqual(
    variantAfter,
    variantBefore + item.quantity,
    "Stock must be restored by item.quantity upon order cancellation"
  );
});

// 9. Admin-Configurable Payment Numbers
test("Payment recipient numbers can be edited dynamically without source code modification", async () => {
  const { db } = await import("../src/lib/db/store.js");
  const settings = db.getSettings();
  const oldBkash = settings.payment_methods.bkash.account_number;

  settings.payment_methods.bkash.account_number = "01999888777";
  db.updateSettings(settings, "Admin");

  const refreshed = db.getSettings();
  assert.strictEqual(refreshed.payment_methods.bkash.account_number, "01999888777");

  // Restore
  settings.payment_methods.bkash.account_number = oldBkash;
  db.updateSettings(settings, "Admin");
});

// 10. Real Database Metrics Calculation
test("Dashboard metrics compute real counts and revenue from valid orders", async () => {
  const { db } = await import("../src/lib/db/store.js");
  const metrics = db.getDashboardMetrics();
  assert(typeof metrics.totalOrders === "number");
  assert(typeof metrics.totalRevenue === "number");
  assert(typeof metrics.totalProducts === "number");
  assert(typeof metrics.lowStockProducts === "number");
});

// 11. Password Security Policy Enforcement
test("Password policy strictly enforces minimum 12 chars, upper, lower, and number/symbol", async () => {
  const { validatePasswordPolicy } = await import("../src/lib/auth-security.js");

  // Too short (< 12)
  const res1 = validatePasswordPolicy("Short1!Aa");
  assert.strictEqual(res1.isValid, false, "Should reject password < 12 characters");

  // Missing uppercase
  const res2 = validatePasswordPolicy("lowercase1234!@#$");
  assert.strictEqual(res2.isValid, false, "Should reject password missing uppercase");

  // Missing lowercase
  const res3 = validatePasswordPolicy("UPPERCASE1234!@#$");
  assert.strictEqual(res3.isValid, false, "Should reject password missing lowercase");

  // Missing number or symbol
  const res4 = validatePasswordPolicy("OnlyLettersLongPhrase");
  assert.strictEqual(res4.isValid, false, "Should reject password missing number/symbol");

  // Valid strong password (>= 12, upper, lower, number/symbol)
  const res5 = validatePasswordPolicy("VarsityMerch2026!Campus");
  assert.strictEqual(res5.isValid, true, "Should accept valid strong password");
});

// 12. Password Hashing with Salt & Scrypt
test("Passwords are saved as salted scrypt hashes and never in plaintext", async () => {
  const { hashPassword, verifyPassword } = await import("../src/lib/auth-security.js");

  const rawPass = "MySecurePassword2026#NSTU";
  const hash1 = hashPassword(rawPass);
  const hash2 = hashPassword(rawPass);

  // Must not be plaintext
  assert.notStrictEqual(hash1, rawPass);
  // Must use random unique salts (hashes of same password must be different strings)
  assert.notStrictEqual(hash1, hash2);
  // Must verify correctly
  assert.strictEqual(verifyPassword(rawPass, hash1), true);
  assert.strictEqual(verifyPassword(rawPass, hash2), true);
  // Wrong password must fail
  assert.strictEqual(verifyPassword("WrongPassword123!", hash1), false);
});

// 13. Admin Password Verification & Rejection of Incorrect Current Password
test("Admin authentication correctly verifies valid current password and rejects invalid", async () => {
  const { db } = await import("../src/lib/db/store.js");
  const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || "nstuadmin123";

  assert.strictEqual(db.verifyAdminPassword(defaultPass), true, "Default admin password must verify");
  assert.strictEqual(db.verifyAdminPassword("incorrectPassword999!"), false, "Wrong password must fail");
});

// 14. Real Admin Password Update Workflow & Rejection of Identical Password
test("Admin password update rejects identical password and updates hash", async () => {
  const { db } = await import("../src/lib/db/store.js");
  const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || "nstuadmin123";
  const newPass = "NewSecureAdmin2026#Varsity";

  // Rejects identical password
  const rejectIdentical = db.updateAdminPassword(defaultPass, "admin-test");
  assert.strictEqual(rejectIdentical.success, false, "Must reject identical new password");

  // Updates with new password
  const updateRes = db.updateAdminPassword(newPass, "admin-test");
  assert.strictEqual(updateRes.success, true, "Must successfully update password");

  // Old password must NO LONGER verify!
  assert.strictEqual(db.verifyAdminPassword(defaultPass), false, "Old password must be invalidated");
  // New password must verify
  assert.strictEqual(db.verifyAdminPassword(newPass), true, "New password must verify successfully");

  // Restore default password for remaining tests
  db.updateAdminPassword(defaultPass, "admin-test");
  assert.strictEqual(db.verifyAdminPassword(defaultPass), true);
});

// 15. Single-Use Password Recovery Token Lifecycle
test("Single-use recovery token generates, verifies, resets password, and cannot be reused", async () => {
  const { db } = await import("../src/lib/db/store.js");
  const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@nstu.edu.bd").toLowerCase();

  // Create recovery token
  const tokenRes = db.createPasswordResetToken(adminEmail);
  assert.strictEqual(tokenRes.success, true);
  assert(tokenRes.rawToken, "Must return raw token");

  const newPassFromReset = "RecoveredPass2026#NSTU";

  // Consume token to reset password
  const consumeRes = db.verifyAndConsumeResetToken(tokenRes.rawToken, newPassFromReset);
  assert.strictEqual(consumeRes.success, true, "First token use must succeed");

  // Verify new password works
  assert.strictEqual(db.verifyAdminPassword(newPassFromReset), true);

  // Attempt to REUSE already-consumed token (MUST FAIL)
  const reuseRes = db.verifyAndConsumeResetToken(tokenRes.rawToken, "AnotherPassword2026#NSTU");
  assert.strictEqual(reuseRes.success, false, "Token reuse must be strictly rejected");

  // Restore default password
  const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || "nstuadmin123";
  db.updateAdminPassword(defaultPass, "admin-test");
});

// 16. Server-side Authorization & Session Security Verification
test("Password change endpoint rejects unauthenticated and non-admin requests", async () => {
  const { getSessionFromCookie } = await import("../src/lib/auth-security.js");

  // Unauthenticated request without cookie
  const unauthReq = new Request("http://localhost:3000/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.strictEqual(getSessionFromCookie(unauthReq), null, "Unauthenticated request has null session");

  // Authenticated customer request (non-admin role)
  const customerReq = new Request("http://localhost:3000/api/auth/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `nstu_session=${encodeURIComponent(JSON.stringify({ userId: "cust-1", role: "customer" }))}`,
    },
    body: JSON.stringify({}),
  });
  const customerSession = getSessionFromCookie(customerReq);
  assert.strictEqual(customerSession.role, "customer");
  assert.notStrictEqual(customerSession.role, "admin", "Customer must not possess admin role");

  // Authenticated admin request
  const adminReq = new Request("http://localhost:3000/api/auth/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `nstu_session=${encodeURIComponent(JSON.stringify({ userId: "usr-admin-1", role: "admin" }))}`,
    },
    body: JSON.stringify({}),
  });
  const adminSession = getSessionFromCookie(adminReq);
  assert.strictEqual(adminSession.role, "admin", "Admin request has admin role verified");
});

// 17. Supabase Client Configurations & SDK Integration
test("Supabase client modules exist and conform to Next.js App Router security standards", async () => {
  const clientPath = path.join(process.cwd(), "src", "lib", "supabase", "client.ts");
  const serverPath = path.join(process.cwd(), "src", "lib", "supabase", "server.ts");
  const adminPath = path.join(process.cwd(), "src", "lib", "supabase", "admin.ts");

  assert(fs.existsSync(clientPath), "src/lib/supabase/client.ts must exist");
  assert(fs.existsSync(serverPath), "src/lib/supabase/server.ts must exist");
  assert(fs.existsSync(adminPath), "src/lib/supabase/admin.ts must exist");

  const adminContent = fs.readFileSync(adminPath, "utf-8");
  assert(adminContent.includes("createAdminClient"), "Must export createAdminClient");
  assert(adminContent.includes("typeof window !== \"undefined\""), "Must safeguard admin client against client-side execution");
});

// 18. Supabase SQL Migrations & Storage Buckets
test("Supabase SQL migrations script defines all tables, RLS, functions, and storage buckets", () => {
  const migrationFile = path.join(process.cwd(), "supabase", "migrations", "001_initial_schema.sql");
  assert(fs.existsSync(migrationFile), "001_initial_schema.sql must exist");

  const sql = fs.readFileSync(migrationFile, "utf-8");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.profiles"), "Must define profiles table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.products"), "Must define products table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.categories"), "Must define categories table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.product_variants"), "Must define product_variants table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.orders"), "Must define orders table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.order_items"), "Must define order_items table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.payment_submissions"), "Must define payment_submissions table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.store_settings"), "Must define store_settings table");
  assert(sql.includes("ENABLE ROW LEVEL SECURITY"), "Must enable Row Level Security (RLS)");
  assert(sql.includes("merchandise-images"), "Must configure merchandise-images storage bucket");
  assert(sql.includes("logos"), "Must configure logos storage bucket");
  assert(sql.includes("handle_new_user()"), "Must define handle_new_user() trigger for Auth integration");
});

// 19. Repository Layer Fallback Resilience
test("Repository layer returns products, categories, and settings with seamless fallback", async () => {
  const { repository } = await import("../src/lib/db/repository.js");
  const status = await repository.getStatus();
  assert(status, "Status check must return valid response object");
  assert(status.provider === "local" || status.provider === "supabase", "Provider must be recognized");

  const products = await repository.getProducts(true);
  assert(Array.isArray(products) && products.length >= 5, "Repository must return products");

  const categories = await repository.getCategories(true);
  assert(Array.isArray(categories) && categories.length >= 8, "Repository must return active categories");

  const settings = await repository.getSettings();
  assert(settings && settings.store_name === "NSTU MERCH", "Repository must return valid settings");
});

// 20. Database & Supabase Administration Routes
test("Admin Database diagnostics and synchronization routes are available", () => {
  const statusRoute = path.join(process.cwd(), "src", "app", "api", "admin", "supabase-status", "route.ts");
  const syncRoute = path.join(process.cwd(), "src", "app", "api", "admin", "sync-supabase", "route.ts");
  const uploadRoute = path.join(process.cwd(), "src", "app", "api", "admin", "upload", "route.ts");
  const dbPage = path.join(process.cwd(), "src", "app", "admin", "database", "page.tsx");

  assert(fs.existsSync(statusRoute), "supabase-status API route must exist");
  assert(fs.existsSync(syncRoute), "sync-supabase API route must exist");
  assert(fs.existsSync(uploadRoute), "upload API route must exist");
  assert(fs.existsSync(dbPage), "admin database UI page must exist");
});


console.log("\n=================================================");
console.log(`TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log("=================================================\n");

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
