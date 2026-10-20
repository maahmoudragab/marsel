import React from "react";
import type { Metadata } from "next";
import { BRAND_CONFIG } from "@/config/brand";

export const metadata: Metadata = {
  title: "MARSEL | Dropping Soon",
  description: "الكوليكشن الجديد قيد التجهيز وقريباً جداً هينزل.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#e7ecea] text-black flex flex-col justify-between selection:bg-black selection:text-[#e7ecea]">
      {/* Top spacer for balanced vertical framing */}
      <div className="h-16 sm:h-20" />

      {/* Main Center Message */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 max-w-2xl mx-auto">
        <div className="space-y-4 sm:space-y-5">
          <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.3em] text-black/50">
            Dropping Soon
          </p>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black leading-snug">
            الكوليكشن الجديد قيد التجهيز
          </h1>

          <p className="text-sm sm:text-base text-black/70 leading-relaxed max-w-md mx-auto font-normal">
            بنجهز قطع وتفاصيل جديدة ومختلفة تماماً.
            <br />
            الموقع مقفول مؤقتاً وقريباً جداً هينزل الكوليكشن.
          </p>
        </div>
      </main>

      {/* Footer: Logo + 3 Social Links only */}
      <footer className="w-full border-t border-black/10 py-10 sm:py-12 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center justify-center gap-6 text-center">
          {/* Brand Logo */}
          <img
            src="/logo/Black-without-bg.png"
            alt={BRAND_CONFIG.name}
            className="h-6 sm:h-7 w-auto object-contain"
          />

          {/* 3 Links: WhatsApp, Instagram, TikTok */}
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
