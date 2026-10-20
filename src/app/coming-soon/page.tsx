import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_CONFIG, getWhatsAppUrl } from "@/config/brand";
import { MAINTENANCE_CONFIG } from "@/config/maintenance";
import { Sparkles, MessageCircle, Clock, Lock, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "الكوليكشن الجديد قيد التجهيز | MARSEL (مارسيل)",
  description:
    "الكوليكشن الجديد من براند مارسيل قيد التجهيز وقريباً جداً هينزل. تابعنا أو تواصل معنا عبر واتساب لمعرفة موعد الإنزال فور توفره.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function ComingSoonPage() {
  const whatsappNotificationUrl = getWhatsAppUrl(
    MAINTENANCE_CONFIG.ctaWhatsAppMessage
  );

  return (
    <div className="min-h-screen bg-[#e7ecea] text-black flex flex-col justify-between selection:bg-black selection:text-[#e7ecea] relative overflow-hidden">
      {/* Background Subtle Ambience / Grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Decorative top accent glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-black/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-[1700px] mx-auto px-4 sm:px-8 py-5 sm:py-6 flex items-center justify-between border-b border-black/10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
          </span>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-black/70">
            {MAINTENANCE_CONFIG.badgeEn}
          </span>
        </div>

        {/* Center Brand Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <img
            src="/logo/Black-without-bg.png"
            alt="MARSEL"
            className="h-5 sm:h-7 w-auto object-contain"
          />
        </div>

        {/* Right status */}
        <div className="text-[10px] sm:text-xs font-mono text-black/60 hidden sm:block">
          CAIRO, EG
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="w-full max-w-2xl mx-auto text-center space-y-8 sm:space-y-10">
          
          {/* Animated Icon / Sign Badge */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black text-[#e7ecea] flex items-center justify-center shadow-[0_12px_36px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:scale-105 border border-black">
                <Clock className="w-9 h-9 sm:w-11 sm:h-11 animate-pulse stroke-[1.6]" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white text-black border border-black flex items-center justify-center shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-black" />
              </div>
            </div>

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 border border-black/15 text-[11px] sm:text-xs font-semibold tracking-wider text-black/85">
              <span>{MAINTENANCE_CONFIG.badgeAr}</span>
            </div>
          </div>

          {/* Heading Section */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-[1.15]">
              {MAINTENANCE_CONFIG.titleAr}
            </h1>
            <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-black/50">
              {MAINTENANCE_CONFIG.titleEn}
            </p>
          </div>

          {/* Descriptive Copy */}
          <div className="max-w-xl mx-auto space-y-3">
            <p className="text-base sm:text-lg leading-relaxed text-black/80 font-medium">
              {MAINTENANCE_CONFIG.subtitleAr}
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-black/50">
              {MAINTENANCE_CONFIG.subtitleEn}
            </p>
          </div>

          {/* Call to Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            {/* Primary WhatsApp Notify Button */}
            <a
              href={whatsappNotificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 h-13 px-6 rounded-xl bg-black text-[#e7ecea] text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-black/85 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{MAINTENANCE_CONFIG.ctaWhatsAppText}</span>
              <ArrowUpRight className="w-4 h-4 opacity-70" />
            </a>

            {/* Instagram Link */}
            <a
              href={BRAND_CONFIG.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-13 px-5 rounded-xl bg-white/70 hover:bg-white text-black border border-black/15 text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>@{BRAND_CONFIG.social.instagram.handle}</span>
            </a>
          </div>

          {/* Additional Social Links */}
          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-black/60 font-mono">
            <a
              href={BRAND_CONFIG.social.tiktok.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors underline-offset-4 hover:underline"
            >
              TikTok: {BRAND_CONFIG.social.tiktok.handle}
            </a>
            <span>•</span>
            <a
              href={whatsappNotificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors underline-offset-4 hover:underline"
            >
              WhatsApp: {BRAND_CONFIG.contact.displayPhone}
            </a>
          </div>

        </div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 w-full max-w-[1700px] mx-auto px-4 sm:px-8 py-5 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-black/50">
        <div>
          © {new Date().getFullYear()} MARSEL STUDIO. ALL RIGHTS RESERVED.
        </div>

        <div className="flex items-center gap-4">
          <span>MADE TO BE DIFFERENT</span>
          <span>•</span>
          {/* Subtle Admin Entrance */}
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-black/40 hover:text-black transition-colors hover:underline"
            title="لوحة تحكم الإدارة"
          >
            <Lock className="w-3 h-3" />
            <span>لوحة التحكم</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
