import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PrivacyClient from "./PrivacyClient";

export const metadata: Metadata = {
  title: "PRIVACY",
  description: "Simple and transparent privacy policy for customer orders and data protection at MARSEL.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f6f5f2] text-black flex flex-col">
      <Header />
      <PrivacyClient />
      <Footer />
    </div>
  );
}
