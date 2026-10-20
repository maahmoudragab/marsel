"use client";

import React from "react";
import { useCart } from "@/context/CartContext";

export default function BagTrigger() {
  const { totalCount, openDrawer } = useCart();

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label="Open Shopping Bag"
      className="text-xs sm:text-sm font-medium tracking-wide lowercase text-black hover:opacity-60 transition-opacity flex items-center gap-1 py-1 cursor-pointer bg-transparent border-0"
    >
      <span>bag</span>
      <span className="text-black" suppressHydrationWarning>
        [{totalCount}]
      </span>
    </button>
  );
}
