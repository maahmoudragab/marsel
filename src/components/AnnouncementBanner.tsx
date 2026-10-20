import React from "react";
import type { ParsedOffer } from "@/lib/offers";

interface AnnouncementBannerProps {
  initialOffer: ParsedOffer | null;
}

export default function AnnouncementBanner({ initialOffer }: AnnouncementBannerProps) {
  if (!initialOffer) {
    return null;
  }

  const displayText = initialOffer.bannerText?.trim() || initialOffer.title;
  // Repeat the item enough times so the marquee loop is completely seamless
  const repetitions = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <aside
      aria-label="Store Announcement Ticker"
      className="w-full bg-black text-[#f6f5f2] border-b border-white/10 py-2 sm:py-2.5 relative z-50 select-none overflow-hidden"
    >
      {/* Edge Soft Fades to Black */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      {/* Infinite Scrolling Track */}
      <div className="animate-marquee flex items-center">
        {/* First Half */}
        <div className="flex items-center shrink-0">
          {repetitions.map((i) => (
            <div key={`a-${i}`} className="flex items-center">
              <span className="font-mono tracking-[0.22em] sm:tracking-[0.28em] uppercase text-[10px] sm:text-[11.5px] text-[#f6f5f2] font-medium whitespace-nowrap px-4 sm:px-6">
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
              <span className="font-mono tracking-[0.22em] sm:tracking-[0.28em] uppercase text-[10px] sm:text-[11.5px] text-[#f6f5f2] font-medium whitespace-nowrap px-4 sm:px-6">
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
