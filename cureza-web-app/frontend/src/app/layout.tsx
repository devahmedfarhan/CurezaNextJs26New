import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import FloatingCompareBar from "@/components/FloatingCompareBar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Cureza | Multi-Vendor Wellness Marketplace",
  description: "Authentic Ayurvedic, Herbal, and Wellness products verified by doctors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="light" className={inter.variable}>
      <body
        className={`${outfit.variable} ${inter.variable} antialiased font-sans bg-warm-sand text-charcoal`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <CategoryProvider>
                  <ConditionalNavbar />
                  <main className="min-h-screen">
                    {children}
                  </main>
                  <ConditionalFooter />
                  <FloatingCompareBar />
                </CategoryProvider>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
