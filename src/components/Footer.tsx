"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BRAND_CONFIG } from "@/config/brand";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t, isArabic } = useLanguage();

  return (
    <footer className="border-t border-black/15 mt-20 py-10 px-4 sm:px-8 bg-[#f6f5f2]">
      <div className="max-w-[1700px] mx-auto flex flex-col items-center justify-center text-center space-y-4 text-black">
        <div className="flex items-center justify-center">
          <Image
            src="/logo/Black-without-bg.png"
            alt={BRAND_CONFIG.name}
            width={120}
            height={32}
            className="h-8 w-auto object-contain"
          />
        </div>

        <p className="text-[11px] font-normal uppercase tracking-wider text-black/70">
          {t("brandTagline")}
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-medium uppercase tracking-wider text-black max-w-xl">
          <Link href="/about" className="hover:underline underline-offset-4">
            {t("about")}
          </Link>
          <span className="text-black/30">•</span>
          <Link href="/faq" className="hover:underline underline-offset-4">
            {t("faq")}
          </Link>
          <span className="text-black/30">•</span>
          <Link href="/track" className="hover:underline underline-offset-4">
            {t("trackOrder")}
          </Link>
          <span className="text-black/30">•</span>
          <Link href="/returns" className="hover:underline underline-offset-4">
            {t("returnsExchanges")}
          </Link>
          <span className="text-black/30">•</span>
          <Link href="/terms" className="hover:underline underline-offset-4">
            {t("terms")}
          </Link>
          <span className="text-black/30">•</span>
          <Link href="/privacy" className="hover:underline underline-offset-4">
            {t("privacy")}
          </Link>
          <span className="text-black/30">•</span>
          <a
            href={BRAND_CONFIG.social.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline underline-offset-4"
          >
            {isArabic ? "واتساب" : "WHATSAPP"}
          </a>
          <span className="text-black/30">•</span>
          <a
            href={BRAND_CONFIG.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline underline-offset-4"
          >
            {isArabic ? "إنستغرام" : "INSTAGRAM"}
          </a>
        </nav>

        {/* Semantic brand descriptor for local SEO + Copyright */}
        <p className="sr-only">
          MARSEL (مارسيل) - Independent Egyptian Streetwear Label founded by Mahmoud Ragab in Cairo
        </p>

        <div className="pt-4 border-t border-black/10 w-full max-w-md text-[10px] text-black/40 font-mono tracking-widest uppercase">
          © {new Date().getFullYear()} {BRAND_CONFIG.legalName} · {t("cairoEgypt")} · {t("allRightsReserved")}
        </div>
      </div>
    </footer>
  );
}
