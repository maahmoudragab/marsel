import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, Truck, RotateCcw, Sparkles } from "lucide-react";
import { BRAND_CONFIG, getWhatsAppUrl } from "@/config/brand";

export const metadata: Metadata = {
  title: "Terms of Service | MARSEL",
  description: "Simple terms of service for shopping, courier delivery, and customer care at MARSEL.",
};

export default function TermsPage() {
  const whatsappContactUrl = getWhatsAppUrl("Hello MARSEL! I have a question regarding terms and orders.");

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
            <span className="text-black font-semibold">terms of service</span>
          </nav>
        </div>

        {/* Content Container - Full Width Box Layout */}
        <div className="w-full space-y-8 pb-16 pt-2">
          {/* Page Header (Full Width) */}
          <div className="border-b border-black/20 pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-black/60 font-bold block mb-1">
                MARSEL STUDIO — LEGAL & OPERATIONS
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-black">
                Terms of Service
              </h1>
              <p className="w-full lg:max-w-[60%] text-xs sm:text-sm font-semibold text-black/60 tracking-wider mt-1.5 text-justify">
                Clear, simple guidelines for shopping, courier delivery, and customer care
              </p>
            </div>

            <a
              href={whatsappContactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-black text-[#f6f5f2] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors self-start sm:self-auto shrink-0 shadow-sm"
            >
              <span>Questions? Chat with Us →</span>
            </a>
          </div>

          {/* Section 1: Orders & Delivery Fulfillment (Full Width Box, 60% Text) */}
          <div className="w-full border border-black/20 bg-black/[0.015] p-6 sm:p-9 space-y-6">
            <div className="flex items-center gap-3 border-b border-black/10 pb-4">
              <div className="w-8 h-8 border border-black bg-black text-[#f6f5f2] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold uppercase text-black tracking-tight">
                01 / Orders & Delivery Fulfillment
              </h2>
            </div>

            {/* Inner Content Constrained to 60% with text-justify */}
            <div className="w-full lg:max-w-[60%]">
              <ul className="space-y-4 text-sm font-semibold text-black/90 leading-relaxed text-justify">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>
                    <strong>Order Placement & Delivery:</strong> All orders placed on MARSEL are fulfilled and delivered directly to your doorstep across all Egyptian governorates.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>
                    <strong>Order Verification:</strong> Once your order is placed, you will receive an automatic confirmation summary via WhatsApp or online verification to ensure your address and size are correct before dispatch.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: On-Spot Inspection & Delivery (Full Width Box, 60% Text) */}
          <div className="w-full border border-black/20 bg-black/[0.015] p-6 sm:p-9 space-y-6">
            <div className="flex items-center gap-3 border-b border-black/10 pb-4">
              <div className="w-8 h-8 border border-black bg-black text-[#f6f5f2] flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold uppercase text-black tracking-tight">
                02 / Delivery & On-Spot Inspection
              </h2>
            </div>

            {/* Inner Content Constrained to 60% with text-justify */}
            <div className="w-full lg:max-w-[60%]">
              <ul className="space-y-4 text-sm font-semibold text-black/90 leading-relaxed text-justify">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>
                    <strong>Inspect with Courier:</strong> You are fully entitled to open your parcel and inspect the piece while the courier is with you. If the item does not meet your expectations, hand it back directly to the courier and <strong>pay only the shipping fee</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>
                    <strong>Estimated Delivery Times:</strong> Cairo & Giza shipments arrive within <strong>2 to 4 business days</strong>. All other governorates across Egypt arrive within <strong>3 to 5 business days</strong>.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3: 14-Day Returns & Exchanges (Full Width Box, 60% Text) */}
          <div className="w-full border border-black/20 bg-black/[0.015] p-6 sm:p-9 space-y-6">
            <div className="flex items-center gap-3 border-b border-black/10 pb-4">
              <div className="w-8 h-8 border border-black bg-black text-[#f6f5f2] flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold uppercase text-black tracking-tight">
                03 / Returns & Exchanges (14-Day Window)
              </h2>
            </div>

            {/* Inner Content Constrained to 60% with text-justify */}
            <div className="w-full lg:max-w-[60%]">
              <ul className="space-y-4 text-sm font-semibold text-black/90 leading-relaxed text-justify">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>
                    <strong>Up to 14 Days:</strong> Even after the courier leaves, you have up to <strong>14 days</strong> from delivery to request an exchange or return through our WhatsApp concierge.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>
                    <strong>Shipping Responsibility:</strong> Customer covers courier shipping fees for personal returns or size exchanges. In the rare case of a manufacturing defect, MARSEL covers all shipping costs.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>
                    <strong>Instant Refunds:</strong> Payments are refunded immediately via <strong>InstaPay or Mobile Wallets</strong> once the returned item arrives back at our studio in its original condition.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 4: Drops & Intellectual Property (Full Width Box, 60% Text) */}
          <div className="w-full border border-black/20 bg-black/[0.015] p-6 sm:p-9 space-y-6">
            <div className="flex items-center gap-3 border-b border-black/10 pb-4">
              <div className="w-8 h-8 border border-black bg-black text-[#f6f5f2] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold uppercase text-black tracking-tight">
                04 / Original Pieces & Brand Rights
              </h2>
            </div>

            {/* Inner Content Constrained to 60% with text-justify */}
            <div className="w-full lg:max-w-[60%]">
              <ul className="space-y-4 text-sm font-semibold text-black/90 leading-relaxed text-justify">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>
                    All silhouettes, graphics, lookbook imagery, and trademarks published on this site belong exclusively to <strong>{BRAND_CONFIG.legalName}</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>
                    MARSEL operates in limited release drops; items in your cart are not reserved until checkout submission is complete.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
