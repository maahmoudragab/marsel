import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqAccordion from "./FaqAccordion";
import { getFaqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Everything you need to know about MARSEL: courier inspection before payment, nationwide Egyptian shipping in 2-4 days, 14-day returns, sizing, and founders.",
  keywords: [
    "MARSEL FAQ",
    "اسئلة شائعة مارسيل",
    "شحن وتوصيل مارسيل",
    "معاينة الأوردر قبل الاستلام",
    "سياسة استبدال واسترجاع MARSEL",
  ],
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions (FAQ) | MARSEL (مارسيل)",
    description:
      "Essential information on doorstep parcel inspection, 2-4 days delivery across Egypt, sizing guidelines, and return policies.",
    url: "/faq",
    images: ["/opengraph-image.png"],
  },
};

export default function FaqPage() {
  const faqSchema = getFaqSchema();

  return (
    <div className="min-h-screen bg-[#f6f5f2] text-black flex flex-col">
      {/* Google FAQ Structured Data (Rich Answers in Google Search) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Header />
      <FaqAccordion />
      <Footer />
    </div>
  );
}
