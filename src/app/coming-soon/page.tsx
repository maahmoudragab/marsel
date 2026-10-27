import React from "react";
import type { Metadata } from "next";
import { BRAND_CONFIG } from "@/config/brand";

export const metadata: Metadata = {
  title: "COMING SOON",
  description: "الكوليكشن الجديد قيد التجهيز.. الموقع هيفتح قريب جداً.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#f6f5f2] text-black flex flex-col justify-between selection:bg-black selection:text-[#f6f5f2]">
      {/* Top Header: Brand Logo */}
      <header className="w-full py-8 sm:py-12 flex items-center justify-center px-6">
        <img
          src="/logo/Black-without-bg.png"
          alt={BRAND_CONFIG.name}
          className="h-6 sm:h-8 w-auto object-contain"
        />
      </header>

      {/* Main Center Message */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 max-w-2xl mx-auto">
        <div className="space-y-4 sm:space-y-6">
          <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.3em] text-black/50">
            Dropping Soon
          </p>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black leading-snug">
            الكوليكشن الجديد قيد التجهيز
          </h1>

          <p className="text-sm sm:text-base text-black/75 leading-relaxed max-w-lg mx-auto font-normal">
            شغالين بكل حب ومهتمين بأصغر وأدق التفاصيل عشان نقدملكم قطع وتشكيلة مختلفة تليق بيكم.
            <br className="hidden sm:inline" />
            {" "}الموقع هيفتح قريب جداً مع نزول الكوليكشن الجديد.
          </p>
        </div>
      </main>

      {/* Footer: 3 Social Links only */}
      <footer className="w-full border-t border-black/10 py-8 sm:py-10 px-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-center text-center">
          <nav className="flex items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium tracking-wider uppercase text-black/80">
            <a
              href={BRAND_CONFIG.social.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black hover:underline underline-offset-4 transition-all"
            >
              WhatsApp
            </a>
            <span className="text-black/25 select-none">•</span>
            <a
              href={BRAND_CONFIG.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black hover:underline underline-offset-4 transition-all"
            >
              Instagram
            </a>
            <span className="text-black/25 select-none">•</span>
            <a
              href={BRAND_CONFIG.social.tiktok.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black hover:underline underline-offset-4 transition-all"
            >
              TikTok
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
