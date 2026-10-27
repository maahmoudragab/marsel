import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "ABOUT",
  description:
    "MARSEL (مارسيل) is an independent streetwear clothing brand founded by Mahmoud Ragab in Cairo, Egypt. Built around the ethos: Made to Be Different. Discover our story and production values.",
  keywords: [
    "About MARSEL",
    "عن براند مارسيل",
    "Mahmoud Ragab MARSEL",
    "محمود رجب مارسيل",
    "مؤسس براند مارسيل",
    "ستريت وير مصري",
    "قصة براند مارسيل",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About MARSEL (عن مارسيل) | Founded by Mahmoud Ragab in Cairo",
    description:
      "Independent streetwear clothing label founded by Mahmoud Ragab in Cairo, Egypt. Dedicated to personal, distinctive garments.",
    url: "/about",
    images: ["/opengraph-image.png"],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f6f5f2] text-black flex flex-col">
      <Header />
      <AboutClient />
      <Footer />
    </div>
  );
}
