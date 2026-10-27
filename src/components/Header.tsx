import React from "react";
import Link from "next/link";
import Image from "next/image";
import BagTrigger from "@/components/BagTrigger";
import LanguageSwitch from "@/components/LanguageSwitch";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { getActiveBannerServer } from "@/lib/serverOffers";

export default async function Header() {
  const bannerOffer = await getActiveBannerServer();

  return (
    <>
      <AnnouncementBanner initialOffer={bannerOffer} />
      <header className="sticky top-0 z-40 bg-[#f6f5f2]/95 backdrop-blur-sm border-b border-black/10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]" dir="ltr">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Desktop Left: Spacer to keep logo centered */}
          <div className="w-16 sm:w-44 flex items-center justify-start" />

          {/* Center Logo - MARSEL */}
          <div className="flex-1 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center hover:opacity-75 transition-opacity"
            >
              <Image
                src="/logo/Black-without-bg.png"
                alt="MARSEL"
                width={170}
                height={30}
                priority
                className="h-5 sm:h-7.5 w-auto max-w-[170px] sm:max-w-none object-contain"
              />
            </Link>
          </div>

          {/* Right: Bag Trigger + Language Switcher on its right */}
          <div className="w-auto sm:w-44 flex items-center justify-end gap-3.5 sm:gap-5">
            <BagTrigger />
            <LanguageSwitch />
          </div>
        </div>
      </header>
    </>
  );
}
