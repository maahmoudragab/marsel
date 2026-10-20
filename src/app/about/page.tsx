import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowUpRight, Palette, Layers, Compass, Sparkles } from "lucide-react";
import { getWhatsAppUrl } from "@/config/brand";

export const metadata: Metadata = {
  title: "About MARSEL (عن مارسيل) | Founded by Mahmoud Ragab in Cairo",
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
  const whatsappConciergeUrl = getWhatsAppUrl("Hello MARSEL! I'd love to know more about your latest drop.");

  return (
    <div className="min-h-screen bg-[#f6f5f2] text-black flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8">
        {/* Breadcrumb */}
        <div className="pt-2 pb-2">
          <nav className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-black/55 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-black transition-colors font-mono">
              marsel
            </Link>
            <span>/</span>
            <span className="text-black font-semibold">about</span>
          </nav>
        </div>

        {/* HERO SECTION: Editorial Manifesto */}
        <section className="pt-6 pb-12 border-b border-black/20 space-y-6">
          <div className="flex items-center justify-between border-y border-black/15 py-2.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-black/60">
            <span>INDEPENDENT CLOTHING LABEL</span>
            <span className="font-semibold text-black">CAIRO · WORLDWIDE</span>
            <span>MADE TO BE DIFFERENT</span>
          </div>

          <div className="pt-4 space-y-4 max-w-4xl">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-black/50 block font-semibold">
              ABOUT MARSEL
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-black leading-[0.95]">
              Made to Be <br className="hidden sm:block" />
              Different.
            </h1>
            <p className="text-base sm:text-xl font-bold uppercase tracking-wide text-black pt-2">
              MARSEL is an independent clothing brand built around one simple idea:{" "}
              <span className="underline decoration-black decoration-2 underline-offset-4">
                clothing should feel personal.
              </span>
            </p>
            <p className="text-xs sm:text-sm font-medium text-black/75 leading-relaxed max-w-2xl text-justify pt-1">
              We create modern pieces designed for everyday wear, combining comfort, quality, and distinctive graphics to create a style that feels different without trying too hard.
            </p>
          </div>
        </section>

        {/* THREE CORE PILLARS GRID */}
        <section className="py-12 space-y-8 border-b border-black/20">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-black/50 font-semibold">
              01 // THE PILLARS
            </span>
            <span className="text-xs font-mono text-black font-bold uppercase tracking-widest">
              DESIGN · PIECES · APPROACH
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Box 1: Our Design */}
            <div className="border border-black/20 bg-black/[0.015] p-7 sm:p-9 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div className="w-9 h-9 border border-black bg-black text-[#f6f5f2] flex items-center justify-center">
                    <Palette className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 font-bold">
                    01 / DESIGN
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  Our Design
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-black/80 font-medium leading-relaxed text-justify">
                  <p className="font-bold text-black uppercase tracking-wider text-xs">
                    At MARSEL, design comes first.
                  </p>
                  <p>
                    Our pieces are inspired by fantasy, art, surrealism, and the world around us.
                  </p>
                  <p>
                    We take these ideas and turn them into graphics and silhouettes made to stand out while still feeling easy to wear.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-black/10 text-[10px] font-mono uppercase tracking-widest text-black/50">
                SURREALISM · ART · FANTASY
              </div>
            </div>

            {/* Box 2: Our Pieces */}
            <div className="border border-black/20 bg-black/[0.015] p-7 sm:p-9 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div className="w-9 h-9 border border-black bg-black text-[#f6f5f2] flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 font-bold">
                    02 / PIECES
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  Our Pieces
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-black/80 font-medium leading-relaxed text-justify">
                  <p className="font-bold text-black uppercase tracking-wider text-xs">
                    Good clothing starts with the basics.
                  </p>
                  <p>
                    That means choosing quality materials, focusing on comfort, and paying attention to the details that make a piece feel right.
                  </p>
                  <p>
                    Our collections currently focus on hoodies and sweatshirts, with more pieces to come as MARSEL grows.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-black/10 text-[10px] font-mono uppercase tracking-widest text-black/50">
                HOODIES · SWEATSHIRTS · ESSENTIALS
              </div>
            </div>

            {/* Box 3: Our Approach */}
            <div className="border border-black/20 bg-black/[0.015] p-7 sm:p-9 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div className="w-9 h-9 border border-black bg-black text-[#f6f5f2] flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 font-bold">
                    03 / APPROACH
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  Our Approach
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-black/80 font-medium leading-relaxed text-justify">
                  <p className="font-bold text-black uppercase tracking-wider text-xs">
                    We are not here to follow every trend.
                  </p>
                  <p>
                    We want to create pieces with their own character, made for people who see clothing as part of how they express themselves.
                  </p>
                  <p>
                    Individual pieces that feel natural and authentic to who you are.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-black/10 text-[10px] font-mono uppercase tracking-widest text-black/50">
                SELF-EXPRESSION · ORIGINALITY
              </div>
            </div>
          </div>
        </section>

        {/* ANTHEM FINALE: Simple When It Needs to Be, Bold When It Matters */}
        <section className="py-14 sm:py-16">
          <div className="border-2 border-black bg-black text-[#f6f5f2] p-8 sm:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#f6f5f2]/50 block">
                THE MARSEL ANTHEM
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight leading-snug">
                Simple when it needs to be. <br />
                Bold when it matters.
              </h2>
              <p className="text-xs sm:text-sm font-light text-[#f6f5f2]/75 pt-1 uppercase tracking-widest">
                This is MARSEL. Made to Be Different.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
              <Link
                href="/"
                className="h-12 px-8 bg-[#f6f5f2] text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center shadow-sm"
              >
                <span>Explore Drops</span>
              </Link>
              <a
                href={whatsappConciergeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 px-6 border border-[#f6f5f2]/40 text-[#f6f5f2] text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <span>WhatsApp Concierge</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
