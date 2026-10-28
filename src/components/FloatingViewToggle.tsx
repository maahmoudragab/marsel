"use client";

import React from "react";
import { useViewMode } from "@/context/ViewModeContext";
import { useLanguage } from "@/context/LanguageContext";

export default function FloatingViewToggle() {
  const { viewMode, setViewMode, isTouchDevice } = useViewMode();
  const { isArabic } = useLanguage();

  // Render on touch devices or mobile screen widths
  if (!isTouchDevice) {
    return null;
  }

  return (
    <div
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-30 select-none md:hidden pointer-events-auto"
      role="region"
      aria-label={isArabic ? "تبديل زاوية عرض المنتجات" : "Product view angle switcher"}
    >
      <div
        dir={isArabic ? "rtl" : "ltr"}
        className="w-[210px] h-[34px] bg-white/45 backdrop-blur-2xl border border-white/60 ring-1 ring-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.8)] rounded-full p-[3px] flex items-center justify-between"
      >
        <button
          type="button"
          onClick={() => setViewMode("front")}
          aria-pressed={viewMode === "front"}
          className={`flex-1 h-full rounded-full flex items-center justify-center text-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none active:scale-[0.97] ${
            isArabic
              ? "font-sans text-[11px] font-bold"
              : "font-mono text-[10px] font-bold tracking-[0.2em] uppercase"
          } ${
            viewMode === "front"
              ? "bg-black/95 text-[#f6f5f2] shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
              : "text-black/70 hover:text-black"
          }`}
        >
          {isArabic ? "الأمام" : "FRONT"}
        </button>

        <button
          type="button"
          onClick={() => setViewMode("back")}
          aria-pressed={viewMode === "back"}
          className={`flex-1 h-full rounded-full flex items-center justify-center text-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none active:scale-[0.97] ${
            isArabic
              ? "font-sans text-[11px] font-bold"
              : "font-mono text-[10px] font-bold tracking-[0.2em] uppercase"
          } ${
            viewMode === "back"
              ? "bg-black/95 text-[#f6f5f2] shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
              : "text-black/70 hover:text-black"
          }`}
        >
          {isArabic ? "الخلف" : "BACK"}
        </button>
      </div>
    </div>
  );
}
