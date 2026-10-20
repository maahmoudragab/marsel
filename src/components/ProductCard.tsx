import React from "react";
import Link from "next/link";
import { Product, getCoverImage } from "@/lib/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug || product.id}`}
      className="product-card-container relative group flex flex-col select-none cursor-pointer block"
    >
      {/* Floating Hoodie Container with Smooth 120fps GPU Hover Lift */}
      <div className="w-full min-h-[250px] sm:min-h-[340px] md:min-h-[380px] flex items-center justify-center p-2 sm:p-3">
        <img
          src={getCoverImage(product)}
          alt={`${product.title} — MARSEL (مارسيل) Streetwear`}
          loading="lazy"
          decoding="async"
          className="max-h-[250px] sm:max-h-[330px] md:max-h-[370px] w-auto max-w-full object-contain transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:opacity-85"
        />
      </div>

      {/* Product Info: Title & Price ONLY */}
      <div className="mt-3.5 text-left">
        <h3 className="text-[14px] sm:text-[15.5px] tracking-wider text-black font-medium uppercase group-hover:opacity-70 transition-opacity line-clamp-1">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-[14px] sm:text-[15.5px] text-black font-semibold">
            {product.price} EGP
          </p>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <p className="text-[12px] sm:text-[13px] text-black/40 line-through">
              {product.compare_at_price} EGP
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
