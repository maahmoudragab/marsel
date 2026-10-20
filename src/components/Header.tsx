import React from "react";
import Link from "next/link";
import BagTrigger from "@/components/BagTrigger";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { getActiveBannerServer } from "@/lib/serverOffers";

export default async function Header() {
  const bannerOffer = await getActiveBannerServer();

  return (
    <>
      <AnnouncementBanner initialOffer={bannerOffer} />
      <header className="sticky top-0 z-40 bg-[#f6f5f2]/85 backdrop-blur-xl border-b border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Left balance spacer */}
          <div className="w-16 hidden sm:block" />

          {/* Center Logo - marsel */}
          <div className="flex-1 sm:flex-initial text-left sm:text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center hover:opacity-75 transition-opacity"
            >
              <img
                src="/logo/Black-without-bg.png"
                alt="MARSEL"
                className="h-5 sm:h-7.5 w-auto max-w-[200px] sm:max-w-none object-contain"
              />
            </Link>
          </div>

          {/* Right - Bag Trigger */}
          <div className="w-auto sm:w-16 flex justify-end">
            <BagTrigger />
          </div>
        </div>
      </header>
    </>
  );
}
