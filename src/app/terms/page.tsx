import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TermsClient from "./TermsClient";

export const metadata: Metadata = {
  title: "TERMS",
  description: "Simple terms of service for shopping, courier delivery, and customer care at MARSEL.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f6f5f2] text-black flex flex-col">
      <Header />
      <TermsClient />
      <Footer />
    </div>
  );
}
