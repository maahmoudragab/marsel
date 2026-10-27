"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, getCoverImage } from "@/lib/product";
import { useLanguage } from "@/context/LanguageContext";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

function ProductCard({ product, priority = false }: ProductCardProps) {
  const { translateProduct, formatPrice } = useLanguage();
  const localized = translateProduct(product);

  const coverImage = getCoverImage(product);
  const secondImage =
    product.images && product.images.length > 1 ? product.images[1] : null;

  const [isCoverLoaded, setIsCoverLoaded] = useState(false);
  const [shouldLoadSecond, setShouldLoadSecond] = useState(false);

  // Quietly defer the back/hover image until idle time so 100% bandwidth goes to primary images first
  useEffect(() => {
    if (!secondImage || shouldLoadSecond) return;
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() =>
          setShouldLoadSecond(true)
        );
      } else {
        setShouldLoadSecond(true);
      }
    }, priority ? 1200 : 3000);

    return () => clearTimeout(timer);
  }, [secondImage, shouldLoadSecond, priority]);

  return (
    <Link
      href={`/products/${product.slug || product.id}`}
      className="product-card-container relative group flex flex-col select-none cursor-pointer block"
      onPointerEnter={() => {
        if (secondImage && !shouldLoadSecond) setShouldLoadSecond(true);
      }}
    >
      {/* Floating Hoodie Container with Smooth Crossfade Hover Flip - Strict 1:1 Square & Transparent Background */}
      <div className="relative w-full aspect-square flex items-center justify-center p-0 overflow-hidden bg-transparent border-0">
        {/* Subtle Minimalist Skeleton Shimmer (Zero Layout Shift) */}
        <div
          className={`absolute inset-0 bg-black/[0.025] rounded-xs transition-opacity duration-500 pointer-events-none ${
            isCoverLoaded ? "opacity-0" : "opacity-100 animate-pulse"
          }`}
        />

        {/* Primary Cover Image with Next.js Optimization */}
        <Image
          src={coverImage}
          alt={`${localized.title} — MARSEL (مارسيل) Streetwear`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          quality={90}
          onLoad={() => setIsCoverLoaded(true)}
          className={`object-contain transform-gpu transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.2,1,0.3,1)] ${
            isCoverLoaded ? "opacity-100" : "opacity-0"
          } ${
            secondImage
              ? "group-hover:opacity-0 group-hover:scale-[0.97]"
              : "group-hover:scale-[1.03] group-hover:-translate-y-1 group-hover:opacity-90"
          }`}
        />

        {/* Secondary Back/Alternate Image (Deferred for lightning-fast initial load & Smooth Crossfade on Hover) */}
        {secondImage && shouldLoadSecond && (
          <Image
            src={secondImage}
            alt={`${localized.title} Back View — MARSEL`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={90}
            className="absolute inset-0 object-contain transform-gpu opacity-0 scale-[1.03] transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.2,1,0.3,1)] group-hover:opacity-100 group-hover:scale-100 pointer-events-none"
          />
        )}
      </div>

      {/* Product Info: Localized Title & Price */}
      <div className="mt-3.5 text-left rtl:text-right">
        <h3 className="text-[14px] sm:text-[15.5px] tracking-wider text-black font-medium uppercase group-hover:opacity-60 transition-opacity duration-500 ease-out line-clamp-1">
          {localized.title}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-[14px] sm:text-[15.5px] text-black font-semibold font-mono">
            {formatPrice(product.price)}
          </p>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <p className="text-[12px] sm:text-[13px] text-black/40 line-through font-mono">
              {formatPrice(product.compare_at_price)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default React.memo(ProductCard);
