import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Lock, UserCheck, ShieldAlert, MessageCircle } from "lucide-react";
import { BRAND_CONFIG, getWhatsAppUrl } from "@/config/brand";

export const metadata: Metadata = {
  title: "Privacy Policy | MARSEL",
  description: "Simple and transparent privacy policy for customer orders and data protection at MARSEL.",
};

export default function PrivacyPage() {
  const whatsappContactUrl = getWhatsAppUrl("Hello MARSEL! I have an inquiry regarding privacy and my data.");

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
            <span className="text-black font-semibold">privacy policy</span>
          </nav>
        </div>

        {/* Content Container - Full Width Box Layout */}
        <div className="w-full space-y-8 pb-16 pt-2">
          {/* Page Header (Full Width) */}
          <div className="border-b border-black/20 pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-black/60 font-bold block mb-1">
                MARSEL STUDIO — DATA PROTECTION
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-black">
                Privacy Policy
              </h1>
              <p className="w-full lg:max-w-[60%] text-xs sm:text-sm font-semibold text-black/60 tracking-wider mt-1.5 text-justify">
                How we protect your personal information when ordering from MARSEL
              </p>
            </div>

            <a
              href={whatsappContactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors self-start sm:self-auto shrink-0 shadow-sm"
            >
              <span>Concierge Support →</span>
            </a>
          </div>

          {/* Section 1: Information Collected (Full Width Box, 60% Text) */}
          <div className="w-full border border-black/20 bg-black/[0.015] p-6 sm:p-9 space-y-6">
            <div className="flex items-center gap-3 border-b border-black/10 pb-4">
              <div className="w-8 h-8 border border-black bg-black text-[#e7ecea] flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold uppercase text-black tracking-tight">
                01 / Information We Collect
              </h2>
            </div>

            {/* Inner Content Constrained to 60% with text-justify */}
            <div className="w-full lg:max-w-[60%] space-y-4 text-justify">
              <p className="text-sm font-semibold text-black/80">
                When ordering from MARSEL, we collect only the minimal details necessary to dispatch your pieces safely:
              </p>

              <ul className="space-y-4 text-sm font-semibold text-black/90 leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>Customer full name and delivery address details (governorate, area, street).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>Primary mobile phone number and optional WhatsApp contact for courier coordination.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>Order notes or specific handover instructions provided during checkout.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: How We Use Data (Full Width Box, 60% Text) */}
          <div className="w-full border border-black/20 bg-black/[0.015] p-6 sm:p-9 space-y-6">
            <div className="flex items-center gap-3 border-b border-black/10 pb-4">
              <div className="w-8 h-8 border border-black bg-black text-[#e7ecea] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold uppercase text-black tracking-tight">
                02 / How Your Information Is Used
              </h2>
            </div>

            {/* Inner Content Constrained to 60% with text-justify */}
            <div className="w-full lg:max-w-[60%]">
              <ul className="space-y-4 text-sm font-semibold text-black/90 leading-relaxed text-justify">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>Fulfilling and packing your drop pieces from our Cairo studio.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>Providing live order tracking and dispatch confirmation via WhatsApp.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-black shrink-0 mt-2" />
                  <span>Assisting with size exchanges, courier returns, and instant refunds.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3: Zero Data Selling (Full Width Box, 60% Text) */}
          <div className="w-full border border-black/20 bg-black/[0.015] p-6 sm:p-9 space-y-6">
            <div className="flex items-center gap-3 border-b border-black/10 pb-4">
              <div className="w-8 h-8 border border-black bg-black text-[#e7ecea] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold uppercase text-black tracking-tight">
                03 / Strict Zero Data Monetization
              </h2>
            </div>

            {/* Inner Content Constrained to 60% with text-justify */}
            <div className="w-full lg:max-w-[60%]">
              <p className="text-sm font-semibold text-black/85 leading-relaxed text-justify">
                MARSEL does not sell, lease, trade, or distribute your private contact details to third-party advertisers, data brokers, or external marketing networks. Your records remain strictly confidential within our order management database.
              </p>
            </div>
          </div>

          {/* Section 4: Contact & Data Deletion (Full Width Box, 60% Text) */}
          <div className="w-full border border-black/20 bg-black/[0.015] p-6 sm:p-9 space-y-6">
            <div className="flex items-center gap-3 border-b border-black/10 pb-4">
              <div className="w-8 h-8 border border-black bg-black text-[#e7ecea] flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold uppercase text-black tracking-tight">
                04 / Your Rights & Concierge Contact
              </h2>
            </div>

            {/* Inner Content Constrained to 60% with text-justify */}
            <div className="w-full lg:max-w-[60%]">
              <p className="text-sm font-semibold text-black/85 leading-relaxed text-justify">
                You may request an update or deletion of your customer records from our system at any time by messaging our concierge on WhatsApp or emailing <strong>{BRAND_CONFIG.contact.email}</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
