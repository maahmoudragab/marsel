import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetailClient from "@/components/ProductDetailClient";
import {
  getProductBySlugServer,
  getRecommendationsServer,
} from "@/lib/serverProducts";
import { getCoverImage } from "@/lib/product";

export const revalidate = 60; // SSR with ISR caching for ultra-fast performance

// Dynamic SEO & Social Sharing Metadata (OpenGraph & Twitter Card)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);

  if (!product) {
    return {
      title: "Product Not Found | MARSEL",
      description: "This piece is no longer available.",
    };
  }

  const coverImage = getCoverImage(product);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://themarsel.vercel.app";
  const productUrl = `${siteUrl}/products/${product.slug || product.id}`;
  const fullCoverImageUrl = coverImage.startsWith("http")
    ? coverImage
    : `${siteUrl}${coverImage.startsWith("/") ? "" : "/"}${coverImage}`;

  const description =
    product.description ||
    product.story ||
    `${product.title} by MARSEL (مارسيل) — ${product.fit || "Oversized Boxy Cut"}. Made with ${product.composition || "100% Egyptian Cotton"} in Cairo. Fast delivery & cash on delivery across Egypt.`;

  return {
    title: `${product.title} — ${product.price} EGP | MARSEL`,
    description,
    keywords: [
      product.title,
      `${product.title} MARSEL`,
      `${product.title} مارسيل`,
      "MARSEL",
      "مارسيل",
      "مارسل",
      product.category || "streetwear",
      product.color_name || "apparel",
      "oversized hoodie egypt",
      "heavyweight cotton egypt",
      "egyptian streetwear",
    ].filter(Boolean),
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.title} — ${product.price} EGP | MARSEL`,
      description,
      url: productUrl,
      siteName: "MARSEL",
      type: "website",
      images: [
        {
          url: fullCoverImageUrl,
          width: 1200,
          height: 1200,
          alt: `${product.title} — MARSEL (مارسيل)`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} — ${product.price} EGP | MARSEL`,
      description,
      images: [fullCoverImageUrl],
      creator: "@marsel.studio",
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);

  if (!product) {
    notFound();
  }

  const recommendations = await getRecommendationsServer(product);
  const { getProductSchema } = await import("@/lib/seo");
  const productSchema = getProductSchema(product);

  return (
    <div className="min-h-screen bg-[#e7ecea] text-black">
      {/* Google Product Structured Data (Rich Snippets, In-Stock, Pricing, Reviews) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <Header />

      <main className="max-w-[1700px] mx-auto px-4 sm:px-8">
        <div className="relative z-10 py-2.5 sm:py-2">
          <nav className="text-[11px] font-mono uppercase tracking-wider text-black/50 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-black transition-colors font-mono">marsel</Link>
            <span>/</span>
            <span className="text-black font-semibold truncate max-w-[240px] sm:max-w-md">{product.title}</span>
          </nav>
        </div>

        <ProductDetailClient product={product} recommendations={recommendations} />
      </main>

      <Footer />
    </div>
  );
}