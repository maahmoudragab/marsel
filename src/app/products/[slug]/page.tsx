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
    title: product.title.toUpperCase(),
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
  const { getProductSchema, getBreadcrumbSchema } = await import("@/lib/seo");
  const productSchema = getProductSchema(product);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home (الرئيسية)", url: "/" },
    { name: product.category ? `${product.category.toUpperCase()} (ملابس)` : "Clothing", url: "/" },
    { name: product.title, url: `/products/${product.slug || product.id}` },
  ]);

  return (
    <div className="min-h-screen bg-[#f6f5f2] text-black">
      {/* Google Product Structured Data (Rich Snippets, In-Stock, Pricing, Reviews) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {/* Google Breadcrumb Hierarchy Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Header />

      <main className="max-w-[1700px] mx-auto px-4 sm:px-8">
        <ProductDetailClient product={product} recommendations={recommendations} />
      </main>

      <Footer />
    </div>
  );
}