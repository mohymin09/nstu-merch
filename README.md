# NSTU MERCH — Official University Merchandise Store

**Wear Your Pride.** Authentic, university-inspired merchandise platform designed for the students, alumni, faculty, and well-wishers of **Noakhali Science and Technology University (NSTU)**.

---

## 1. Visual Design & Brand Identity
- **University Reference**: [nstu.edu.bd](https://nstu.edu.bd/)
- **Official Emblem**: Original NSTU crest preserved at [`public/assets/nstu-logo.png`](file:///c:/Users/UESR/Documents/nstu%20project/public/assets/nstu-logo.png)
- **Palette**:
  - Primary Green: `#087443`
  - Deep Green: `#075B38`
  - Navy Blue: `#103B70`
  - Deep Navy: `#08284F`
  - Surface Background: `#F5F9F8`
  - Accent Soft Blue: `#EAF3FB`
  - Border: `#DCE7E8`

---

## 2. Technology Stack & Architecture
- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS with custom editorial university theme
- **Icons**: Lucide React
- **Data Layer**:
  - **Zero-Config Persistent Engine**: Standalone file database (`.data/db.json`) enabling immediate full-featured local execution, cart persistence, inventory adjustments, and order workflows.
  - **Production Supabase PostgreSQL**: Fully compatible client layer (`src/lib/supabase.ts`) and complete SQL migration (`supabase/migrations/001_initial_schema.sql`) with Row-Level Security (RLS) policies, indexes, and constraints.
- **Timezone & Currency**: `Asia/Dhaka` | Bangladeshi Taka (`BDT` / `৳`)

---

## 3. Core Storefront Features
1. **Two-Row Responsive Header**:
   - Official emblem, search bar with dynamic query filtering.
   - Configurable social links (Facebook, Instagram, YouTube, TikTok).
   - Wishlist badge and real-time live cart drawer trigger.
2. **Hero Carousel**:
   - Matches reference mockup with *"Carry Your Campus. Keep Your Memories."*
   - Database-driven slide management, autoplay, pause controls, and CTA links.
3. **8 University Categories**:
   - *Caps & Apparel, Mugs & Drinkware, Bags & Accessories, Stationery & Diaries, Files & Folders, Keychains, Gift Sets, New Arrivals*.
4. **Product Variation System**:
   - Independent variant SKUs, attribute combinations (Color, Size, Material), specific regular/sale prices, independent stock quantities, and variant photography.
5. **Real-Time Cart Drawer**:
   - Slide-in drawer with live subtotal calculation, quantity adjustments, and direct checkout navigation.
6. **Robust Checkout & Abuse Prevention**:
   - Server-side price recalculation (client prices are never trusted).
   - Bangladeshi 11-digit mobile number normalization.
   - Duplicate order prevention guards.
   - 3 Delivery zones: Campus (৳30), Inside Noakhali (৳60), All Bangladesh (৳120).
7. **Configurable Payment Methods**:
   - Cash on Delivery (COD)
   - Manual bKash Send Money
   - Manual Nagad Send Money
   - Manual Rocket Send Money
   - Cash Payment at Campus Booth
   - *Admin can change bKash/Nagad/Rocket recipient numbers dynamically through the Admin Panel without code changes.*
8. **Customer Order Tracking**:
   - Dedicated `/track-order` page by Order Number + Phone number.
   - Printable invoices and packing slips.

---

## 4. Secure Admin Dashboard (`/admin`)
- **Dashboard Overview**: Real-time revenue from verified/delivered orders, order counts, product counts, inventory threshold alerts.
- **Product Catalog CRUD**: Matrix generator for multi-variant products, pricing, stock levels, and badges.
- **Category Management**: Slugs, display ordering, and deletion safeguards preventing orphaned products.
- **Stock & Inventory**: Real-time stock movement audit logs, threshold alerts, and manual correction recording.
- **Order Management**: Order state machine (`Pending` &rarr; `Confirmed` &rarr; `Processing` &rarr; `Shipped` &rarr; `Delivered`), stock restoration on cancellation, courier details, and CSV export.
- **Payment Verification**: Review and verify manual bKash/Nagad/Rocket transaction IDs against bank statements with audit trail.
- **Security & Password Management** (`/admin/security`): Administrator profile overview, change password with current password verification, 12+ character complexity enforcement, salted scrypt hash storage, and session rotation.
- **Password Recovery** (`/forgot-password` & `/reset-password`): Token-based single-use password recovery flow with timing-safe checks.
- **Store Settings**: Real-time configuration of payment recipient numbers, delivery charges, brand identity, and policies.
- **Audit Logs**: Immutable log of administrative actions.

---

## 5. Getting Started Locally

### Prerequisites
- Node.js (v18.17+ or v20+ recommended)
- npm

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npm test

# 3. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Initial Administrator Credentials
To log in as the default administrator:
- **Login URL**: `/login` or directly visit `/admin`
- **Email**: `admin@nstu.edu.bd`
- **Password**: `nstuadmin123`

*(Can be configured via `.env.local` using `ADMIN_DEFAULT_EMAIL` and `ADMIN_DEFAULT_PASSWORD`)*

---

## 7. Supabase Database Deployment (Optional)
To link a hosted Supabase PostgreSQL project:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor in Supabase and paste the contents of:
   `supabase/migrations/001_initial_schema.sql`
3. Add the project credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
