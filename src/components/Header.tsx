"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import AnnouncementBanner from "@/components/AnnouncementBanner";

export default function Header() {
  const { totalCount, openDrawer } = useCart();

  return (
    <>
      <AnnouncementBanner />
      <header className="sticky top-0 z-40 bg-[#e7ecea]/75 backdrop-blur-xl border-b border-black/15 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Left balance spacer */}
          <div className="w-16 hidden sm:block" />

          {/* Center Logo - marsel */}
          <div className="flex-1 sm:flex-initial text-left sm:text-center">
            <Link
              href="/"
              className="text-lg sm:text-xl font-bold tracking-[0.2em] uppercase text-black hover:opacity-70 transition-opacity"
            >
              marsel
            </Link>
          </div>

          {/* Right - Bag Trigger */}
          <div className="w-auto sm:w-16 flex justify-end">
            <button
              type="button"
              onClick={openDrawer}
              aria-label="Open Shopping Bag"
              className="text-xs sm:text-sm font-medium tracking-wide lowercase text-black hover:opacity-60 transition-opacity flex items-center gap-1 py-1 cursor-pointer bg-transparent border-0"
            >
              <span>bag</span>
              <span className="text-black" suppressHydrationWarning>[{totalCount}]</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}