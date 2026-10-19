import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { getProductsServer } from "@/lib/serverProducts";

export const revalidate = 60; // SSR / ISR: revalidate every 60s for lightning speed and fresh inventory

export const metadata: Metadata = {
  title: "MARSEL (مارسيل) | Independent Streetwear Brand Cairo",
  description:
    "MARSEL (مارسيل) is an independent streetwear clothing label founded by Mahmoud Ragab in Cairo, Egypt. Heavyweight oversized hoodies, crewnecks, and boxy fit tees with nationwide cash on delivery.",
  keywords: [
    "MARSEL",
    "مارسيل",
    "مارسل",
    "MARSEL store",
    "MARSEL brand",
    "MARSEL Egypt",
    "MARSEL Mahmoud Ragab",
    "محمود رجب مارسيل",
    "براند مارسيل",
    "ملابس مارسيل",
    "oversized hoodie egypt",
    "heavyweight hoodie cairo",
    "egyptian streetwear",
    "local clothing brands egypt",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MARSEL (مارسيل) | Independent Streetwear Brand Cairo",
    description:
      "Independent streetwear brand in Cairo by Mahmoud Ragab. Discover premium heavyweight hoodies, oversized crewnecks, and distinctive graphic apparel.",
    siteName: "MARSEL",
    url: "/",
    locale: "en_US",
    alternateLocale: ["ar_EG"],
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 2048,
        height: 2048,
        alt: "MARSEL (مارسيل) — Made to Be Different",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MARSEL (مارسيل) | Independent Streetwear Brand Cairo",
    description:
      "Independent streetwear brand in Cairo by Mahmoud Ragab. Premium heavyweight hoodies, oversized apparel, and graphic drops.",
    images: ["/opengraph-image.png"],
    creator: "@marsel.studio",
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
        {/* Semantic H1 for Google Search Indexing & Screen Readers */}
        <h1 className="sr-only">
          MARSEL (مارسيل) — Independent Egyptian Streetwear Brand founded by Mahmoud Ragab in Cairo
        </h1>

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