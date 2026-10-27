"use client";

import React from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import BagDrawer from "@/components/BagDrawer";
import DynamicTabTitle from "@/components/DynamicTabTitle";

interface ProvidersProps {
  children: React.ReactNode;
  initialLanguage?: "en" | "ar";
}

export default function Providers({ children, initialLanguage = "en" }: ProvidersProps) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <CartProvider>
        <DynamicTabTitle />
        {children}
        <BagDrawer />
      </CartProvider>
    </LanguageProvider>
  );
}
