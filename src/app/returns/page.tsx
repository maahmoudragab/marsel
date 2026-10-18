import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShieldCheck, AlertTriangle, Truck } from "lucide-react";
import { getWhatsAppUrl } from "@/config/brand";

export const metadata: Metadata = {
  title: "Returns & Exchanges Policy | MARSEL",
  description: "Official returns and exchange terms for MARSEL — Independent clothing label. Made to Be Different.",
};

export default function ReturnsPage() {
  const whatsappReturnUrl = getWhatsAppUrl("Hello MARSEL! I would like to request an exchange or return for my order.");

  return (
    <div className="min-h-screen bg-[#e7ecea] text-black flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8">
        {/* Breadcrumb */}
        <div className="pt-2 pb-2">
          <nav className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-black/55 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-black transition-colors font-mono">
              marsel
            </Link>
            <span>/</span>
            <span className="text-black font-semibold">returns & exchanges</span>
          </nav>
        </div>

        {/* Content Container */}
        <div className="w-full space-y-8 pb-16 pt-2 text-left">
          {/* Page Header */}
          <div className="border-b border-black/20 pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-black/60 font-bold block mb-1">
                MARSEL STUDIO — CLIENT CONCIERGE
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-black">
                Returns & Exchanges
              </h1>
              <p className="w-full lg:max-w-[60%] text-xs sm:text-sm font-medium text-black/60 tracking-wide mt-1.5">
                On-the-spot parcel inspection upon delivery with a flexible 14-day exchange window.
              </p>
            </div>

            <a
              href={whatsappReturnUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors self-start sm:self-auto shrink-0 shadow-sm"
            >
              <span>Request Return via WhatsApp →</span>
            </a>
          </div>

          {/* Section 1: Inspection & 14-Day Window */}
          <div className="w-full border border-black/20 bg-black/[0.02] p-6 sm:p-9 space-y-6">
            <div className="flex items-center gap-3 border-b border-black/10 pb-4">
              <div className="w-8 h-8 border border-black bg-black text-[#e7ecea] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-black">
                How Exchanges & Returns Work
              </h2>
            </div>

            <div className="w-full lg:max-w-[70%]">
              <ul className="space-y-4 text-xs sm:text-sm font-medium text-black/90 leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-black shrink-0 mt-2" />
                  <span>
                    <strong>Inspection with the Courier:</strong> When your delivery arrives, you have the right to open the package and inspect sizing, fabric weight, and craftsmanship before accepting. If you choose not to accept the order on the spot, you can hand it back to the courier and pay delivery fees only.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-black shrink-0 mt-2" />
                  <span>
                    <strong>14-Day Post-Delivery Window:</strong> Even after the courier departs, you have up to <strong className="text-black font-bold">14 days</strong> from delivery date to contact us for an exchange or return.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-black shrink-0 mt-2" />
                  <span>
                    <strong>Hassle-Free Doorstep Pickup:</strong> Simply message our concierge on WhatsApp with your order number and photo of the piece. Our team will schedule a courier pickup straight from your door.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-black shrink-0 mt-2" />
                  <span>
                    <strong>Direct Refund:</strong> Once the returned piece reaches our studio and passes inspection, your refund is transferred promptly via <strong className="text-black font-bold">InstaPay or Mobile Wallets (Vodafone Cash)</strong>.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: Shipping Fees Policy */}
          <div className="w-full border border-black/20 bg-black/[0.02] p-6 sm:p-9 space-y-6">
            <div className="flex items-center gap-3 border-b border-black/10 pb-4">
              <div className="w-8 h-8 border border-black bg-black text-[#e7ecea] flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-black">
                Courier & Shipping Fee Terms
              </h2>
            </div>

            <div className="w-full lg:max-w-[70%]">
              <ul className="space-y-4 text-xs sm:text-sm font-medium text-black/90 leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-black shrink-0 mt-2" />
                  <span>
                    <strong>Standard Exchanges/Returns:</strong> The customer covers the standard round-trip courier shipping fee for the exchange or return pickup.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-black shrink-0 mt-2" />
                  <span>
                    <strong>Defective or Incorrect Item:</strong> If you receive an incorrect size or a piece with a manufacturing flaw, <strong className="text-black font-bold">MARSEL</strong> covers 100% of all delivery and return expenses.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3: Eligibility Conditions */}
          <div className="w-full border border-red-300 bg-red-50/50 p-6 sm:p-9 space-y-6">
            <div className="flex items-center gap-3 border-b border-red-200 pb-4">
              <div className="w-8 h-8 border border-red-700 bg-red-700 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-red-950">
                Item Return Conditions
              </h2>
            </div>

            <div className="w-full lg:max-w-[70%]">
              <ul className="space-y-4 text-xs sm:text-sm font-medium text-red-900 leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-red-800 shrink-0 mt-2" />
                  <span>
                    Requests must be submitted within <strong className="font-bold text-red-950 underline decoration-red-400 underline-offset-4">14 days</strong> of receiving the shipment.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-red-800 shrink-0 mt-2" />
                  <span>
                    Garments must be in pristine original condition: unworn, unwashed, and free of perfumes or signs of wear.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-red-800 shrink-0 mt-2" />
                  <span>
                    Original brand tags and MARSEL protective packaging must remain undamaged and attached.
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
