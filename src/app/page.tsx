import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { getProductsServer } from "@/lib/serverProducts";

export const revalidate = 60; // SSR / ISR: revalidate every 60s for lightning speed and fresh inventory

export const metadata: Metadata = {
  title: "MARSEL | Made to Be Different",
  description:
    "MARSEL is an independent clothing brand. Modern pieces designed for everyday wear, combining comfort, quality, and distinctive graphics.",
  openGraph: {
    title: "MARSEL | Made to Be Different",
    description:
      "MARSEL is an independent clothing brand. Modern pieces designed for everyday wear, combining comfort, quality, and distinctive graphics.",
    siteName: "MARSEL",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MARSEL | Made to Be Different",
    description:
      "MARSEL is an independent clothing brand. Modern pieces designed for everyday wear, combining comfort, quality, and distinctive graphics.",
  },
};

export default async function HomePage() {
  const products = await getProductsServer();

  return (
    <div className="min-h-screen flex flex-col bg-[#e7ecea] text-black">
      {/* Header */}
      <Header />

      {/* Main Content: Products Grid directly rendered on the Server */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-8 pt-3 sm:pt-4 pb-16">
        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-xs uppercase tracking-widest text-black/50">
              Drop coming soon. Follow our updates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[14px] sm:gap-x-[66px] gap-y-[36px] sm:gap-y-[72px] items-start">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}