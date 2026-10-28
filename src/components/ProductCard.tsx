"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, getCoverImage } from "@/lib/product";
import { useLanguage } from "@/context/LanguageContext";
import { useViewMode } from "@/context/ViewModeContext";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

function ProductCard({ product, priority = false }: ProductCardProps) {
  const { isArabic, translateProduct, formatPrice } = useLanguage();
  const { viewMode } = useViewMode();
  const localized = translateProduct(product);

  const coverImage = getCoverImage(product);
  const secondImage =
    product.images && product.images.length > 1 ? product.images[1] : null;

  const isBackActive = viewMode === "back" && Boolean(secondImage);

  const [shouldLoadSecond, setShouldLoadSecond] = useState(false);

  // Eagerly enable back image when back view is active
  useEffect(() => {
    if (isBackActive && !shouldLoadSecond) {
      setShouldLoadSecond(true);
    }
  }, [isBackActive, shouldLoadSecond]);

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
      <div className="relative w-full aspect-square flex items-center justify-center p-0 overflow-hidden bg-black/[0.015] rounded-xs border-0">
        {/* Primary Cover Image with Next.js Optimization */}
        <Image
          src={coverImage}
          alt={`${product.title} — MARSEL`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          quality={90}
          className={`object-contain transform-gpu transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.2,1,0.3,1)] ${
            secondImage
              ? isBackActive
                ? "opacity-0 scale-[0.97]"
                : "group-hover:opacity-0 group-hover:scale-[0.97]"
              : "group-hover:scale-[1.03] group-hover:-translate-y-1 group-hover:opacity-90"
          }`}
        />

        {/* Secondary Back/Alternate Image (Deferred for lightning-fast initial load & Smooth Crossfade on Hover or ViewMode) */}
        {secondImage && (shouldLoadSecond || isBackActive) && (
          <Image
            src={secondImage}
            alt={`${product.title} Back View — MARSEL`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={90}
            className={`absolute inset-0 object-contain transform-gpu transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.2,1,0.3,1)] pointer-events-none ${
              isBackActive
                ? "opacity-100 scale-100"
                : "opacity-0 scale-[1.03] group-hover:opacity-100 group-hover:scale-100"
            }`}
          />
        )}
      </div>

      {/* Product Info: Localized Title & Price - tight spacing to image with original clear font size */}
      <div
        className={`mt-1.5 sm:mt-2 ${isArabic ? "text-right" : "text-left"}`}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <h3 className="text-[14px] sm:text-[15.5px] tracking-wider text-black font-medium uppercase group-hover:opacity-60 transition-opacity duration-500 ease-out line-clamp-1">
          {localized.title}
        </h3>
        <div className="flex items-baseline gap-2 mt-0.5">
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
