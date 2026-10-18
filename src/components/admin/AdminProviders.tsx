"use client";

import React from "react";
import { ProductProvider } from "@/context/ProductContext";

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return <ProductProvider>{children}</ProductProvider>;
}
