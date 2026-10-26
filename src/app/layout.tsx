import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "NSTU Merch — Wear Your Pride | Official University-Inspired Merchandise",
  description:
    "Carry Your Campus. Keep Your Memories. Authentic Noakhali Science and Technology University merchandise: caps, mugs, backpacks, diaries, keychains, and accessories.",
  icons: {
    icon: "/assets/nstu-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary-deep">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
