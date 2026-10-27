"use client";

import React from "react";
import type { ParsedOffer } from "@/lib/offers";
import { useLanguage } from "@/context/LanguageContext";

interface AnnouncementBannerProps {
  initialOffer: ParsedOffer | null;
}

export default function AnnouncementBanner({ initialOffer }: AnnouncementBannerProps) {
  const { isArabic } = useLanguage();

  if (!initialOffer) {
    return null;
  }

  const rawText = (initialOffer.bannerText?.trim() || initialOffer.title || "").trim();
  const lower = rawText.toLowerCase();

  let displayText = rawText;
  if (isArabic) {
    if (initialOffer.bannerTextAr && initialOffer.bannerTextAr.trim()) {
      displayText = initialOffer.bannerTextAr.trim();
    } else if (initialOffer.titleAr && initialOffer.titleAr.trim()) {
      displayText = initialOffer.titleAr.trim();
    } else if (lower.includes("free shipping") || lower.includes("free delivery") || initialOffer.offerType === "free_shipping") {
      displayText = "شحن مجاني لكافة محافظات مصر لفترة محدودة · MARSEL";
    } else if (lower.includes("off") || lower.includes("sale") || lower.includes("discount")) {
      displayText = "خصم حصري على التشكيلة لفترة محدودة · MARSEL";
    } else {
      displayText = `${rawText} · شحن سريع ومعاينة قبل الاستلام`;
    }
  }

  // 2 items in each half is plenty to fill 4K screens seamlessly with low CPU footprint
  const repetitions = [0, 1];

  return (
    <aside
      aria-label="Store Announcement Ticker"
      dir="ltr"
      style={{ contentVisibility: "auto" }}
      className="w-full bg-black text-[#f6f5f2] border-b border-white/10 py-2 sm:py-2.5 relative z-50 select-none overflow-hidden"
    >
      {/* Edge Soft Fades to Black */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      {/* Infinite Scrolling Track - forced LTR for smooth zero-jitter conveyor loop */}
      <div className="animate-marquee flex items-center" dir="ltr">
        {/* First Half */}
        <div className="flex items-center shrink-0">
          {repetitions.map((i) => (
            <div key={`a-${i}`} className="flex items-center">
              <span
                className={
                  isArabic
                    ? "font-sans tracking-normal font-medium text-[11px] sm:text-[12px] text-[#f6f5f2] whitespace-nowrap px-4 sm:px-6"
                    : "font-mono tracking-[0.22em] sm:tracking-[0.28em] uppercase text-[10px] sm:text-[11.5px] text-[#f6f5f2] font-medium whitespace-nowrap px-4 sm:px-6"
                }
              >
                {displayText}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0 select-none inline-block mx-1 sm:mx-2" />
            </div>
          ))}
        </div>

        {/* Second Identical Half for 0-gap seamless looping */}
        <div className="flex items-center shrink-0" aria-hidden="true">
          {repetitions.map((i) => (
            <div key={`b-${i}`} className="flex items-center">
              <span
                className={
                  isArabic
                    ? "font-sans tracking-normal font-medium text-[11px] sm:text-[12px] text-[#f6f5f2] whitespace-nowrap px-4 sm:px-6"
                    : "font-mono tracking-[0.22em] sm:tracking-[0.28em] uppercase text-[10px] sm:text-[11.5px] text-[#f6f5f2] font-medium whitespace-nowrap px-4 sm:px-6"
                }
              >
                {displayText}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0 select-none inline-block mx-1 sm:mx-2" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
