"use client";

import React from "react";
import { CartProvider } from "@/context/CartContext";
import BagDrawer from "@/components/BagDrawer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <BagDrawer />
    </CartProvider>
  );
}