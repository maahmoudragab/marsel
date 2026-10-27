import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReturnsClient from "./ReturnsClient";

export const metadata: Metadata = {
  title: "RETURNS",
  description: "Official returns and exchange terms for MARSEL — Independent clothing label. Made to Be Different.",
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[#f6f5f2] text-black flex flex-col">
      <Header />
      <ReturnsClient />
      <Footer />
    </div>
  );
}
