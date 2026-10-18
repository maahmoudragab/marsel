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
      <div className="w-full min-h-[220px] sm:min-h-[290px] flex items-center justify-center p-2">
        <img
          src={getCoverImage(product)}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="max-h-[220px] sm:max-h-[280px] w-auto max-w-full object-contain transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:opacity-85"
        />
      </div>

      {/* Product Info: Title & Price ONLY */}
      <div className="mt-3 text-left">
        <h3 className="text-[14px] sm:text-[15px] tracking-wider text-black font-medium uppercase group-hover:opacity-70 transition-opacity line-clamp-1">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-[14px] sm:text-[15px] text-black font-semibold">
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
