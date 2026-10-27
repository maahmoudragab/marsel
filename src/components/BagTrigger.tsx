"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function BagTrigger() {
  const { totalCount, openDrawer } = useCart();
  const { isArabic } = useLanguage();

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={isArabic ? `حقيبة التسوق (${totalCount})` : `Shopping Bag (${totalCount})`}
      className="relative p-1 text-black hover:opacity-60 transition-opacity duration-150 cursor-pointer flex items-center justify-center"
    >
      {/* Sleek luxury fashion tote silhouette */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[20px] h-[20px]"
      >
        <path d="M6 8h12l1 13H5L6 8z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      <span
        suppressHydrationWarning
        className={`absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-mono font-bold flex items-center justify-center leading-none ${
          totalCount > 0
            ? "bg-black text-[#f6f5f2]"
            : "border border-black/30 text-black/60 bg-[#f6f5f2]"
        }`}
      >
        {totalCount > 99 ? "99+" : totalCount}
      </span>
    </button>
  );
}
