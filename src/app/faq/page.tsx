import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqAccordion from "./FaqAccordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | MARSEL",
  description: "9 essential answers regarding courier inspection, nationwide shipping, sizing, and 14-day returns at MARSEL.",
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#e7ecea] text-black flex flex-col">
      <Header />
      <FaqAccordion />
      <Footer />
    </div>
  );
}
