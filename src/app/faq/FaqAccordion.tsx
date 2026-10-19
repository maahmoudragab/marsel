"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus, Minus } from "lucide-react";
import { BRAND_CONFIG, getWhatsAppUrl } from "@/config/brand";

interface FaqQuestion {
  id: string;
  number: string;
  question: string;
  answer: React.ReactNode;
}

export default function FaqAccordion() {
  const [openIds, setOpenIds] = useState<string[]>(["faq-01"]);

  const whatsappContactUrl = getWhatsAppUrl("Hello MARSEL! I have a question regarding my order and policies.");

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (openIds.length === FAQS.length) {
      setOpenIds([]);
    } else {
      setOpenIds(FAQS.map((f) => f.id));
    }
  };

  const FAQS: FaqQuestion[] = [
    {
      id: "faq-01",
      number: "01",
      question: "How long does shipping take and how much does it cost?",
      answer: (
        <p>
          Shipments to Cairo and Giza arrive within <strong>2 to 4 business days</strong>. Deliveries to all other Egyptian governorates arrive within <strong>3 to 5 business days</strong>. Exact shipping fees are calculated automatically by governorate and area at checkout before order confirmation.
        </p>
      ),
    },
    {
      id: "faq-02",
      number: "02",
      question: "Do you ship across all Egyptian governorates?",
      answer: (
        <p>
          Yes. MARSEL fulfills and delivers doorstep orders across every governorate throughout Egypt without exception through our dedicated courier networks.
        </p>
      ),
    },
    {
      id: "faq-03",
      number: "03",
      question: "Can I open and inspect the parcel with the courier before paying?",
      answer: (
        <p>
          Absolutely. You are fully entitled to open your parcel and inspect sizing, fabric weight, and craftsmanship while the courier is with you before making payment. If the piece does not meet your expectations, hand it back directly to the courier and <strong>pay only the courier delivery fee</strong>.
        </p>
      ),
    },
    {
      id: "faq-04",
      number: "04",
      question: "What is your 14-day return and exchange policy?",
      answer: (
        <p>
          Even after the courier departs, you have up to <strong>14 days</strong> from the delivery date to contact us for a size exchange or full return. Garments must be in pristine, unworn, and unwashed condition with all original MARSEL tags and packaging intact.
        </p>
      ),
    },
    {
      id: "faq-05",
      number: "05",
      question: "How and when do I receive my refund?",
      answer: (
        <p>
          Simply message our concierge on WhatsApp with your order number. We will schedule a courier pickup straight from your door. Once the piece arrives at our studio and passes inspection, your refund is transferred promptly via <strong>InstaPay or Mobile Wallets (Vodafone Cash)</strong>.
        </p>
      ),
    },
    {
      id: "faq-06",
      number: "06",
      question: "Who covers shipping fees for returns or size exchanges?",
      answer: (
        <p>
          The customer covers the standard round-trip courier shipping fee for personal preference returns or size exchanges. In the rare case of a manufacturing flaw or incorrect item received, <strong>MARSEL covers 100% of all delivery and return expenses</strong>.
        </p>
      ),
    },
    {
      id: "faq-07",
      number: "07",
      question: "What payment methods are accepted?",
      answer: (
        <p>
          We offer <strong>Cash on Delivery (COD)</strong> upon parcel arrival and inspection, as well as electronic payments via <strong>InstaPay</strong> and Egyptian <strong>Mobile Wallets (Vodafone Cash, Orange Cash, Etisalat Cash)</strong> coordinated directly with our concierge.
        </p>
      ),
    },
    {
      id: "faq-08",
      number: "08",
      question: "Are MARSEL pieces true to size or oversized?",
      answer: (
        <p>
          Most MARSEL garments are designed with a contemporary <strong>relaxed / oversized fit</strong>. We recommend taking your usual size for the intended streetwear look, or sizing down one size if you prefer a classic, closer fit. Centimeter measurement charts are provided on each product page.
        </p>
      ),
    },
    {
      id: "faq-09",
      number: "09",
      question: "How do I contact customer support or modify my order?",
      answer: (
        <p>
          Our concierge team is reachable daily via WhatsApp at <strong>{BRAND_CONFIG.contact.displayPhone}</strong> or on Instagram <strong>@{BRAND_CONFIG.social.instagram.handle}</strong>. If you need to edit your shipping address, adjust sizes, or cancel, please contact us immediately before courier dispatch.
        </p>
      ),
    },
  ];

  const allOpen = openIds.length === FAQS.length;

  return (
    <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8">
      {/* Breadcrumb */}
      <div className="pt-2 pb-2">
        <nav className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-black/55 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-black transition-colors font-mono">
            marsel
          </Link>
          <span>/</span>
          <span className="text-black font-semibold">frequently asked questions</span>
        </nav>
      </div>

      {/* Content Container - Full Width Box Layout */}
      <div className="w-full space-y-8 pb-16 pt-2">
        {/* Page Header (Full Width) */}
        <div className="border-b border-black/20 pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-black/60 font-bold block mb-1">
              MARSEL STUDIO — CLIENT CONCIERGE & HELP
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-black">
              Frequently Asked Questions
            </h1>
            <p className="w-full lg:max-w-[60%] text-xs sm:text-sm font-semibold text-black/60 tracking-wider mt-1.5 text-justify">
              9 essential answers regarding courier inspection, nationwide delivery, sizing, and 14-day returns.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={toggleAll}
              className="inline-flex items-center justify-center h-11 px-4 border border-black/30 bg-transparent text-xs font-bold uppercase tracking-wider text-black hover:bg-black/5 transition-colors"
            >
              {allOpen ? "Collapse All" : "Expand All"}
            </button>

            <a
              href={whatsappContactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors shadow-sm"
            >
              <span>Questions? Chat with Us →</span>
            </a>
          </div>
        </div>

        {/* 9 Collapsible Questions */}
        <div className="space-y-4">
          {FAQS.map((faq) => {
            const isOpen = openIds.includes(faq.id);

            return (
              <div
                key={faq.id}
                className="w-full border border-black/20 bg-black/[0.015] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full p-6 sm:p-7 flex items-center justify-between gap-4 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div className="w-8 h-8 border border-black bg-black text-[#e7ecea] flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                      {faq.number}
                    </div>
                    <h2 className="text-base sm:text-lg font-bold uppercase text-black tracking-tight group-hover:opacity-75 transition-opacity">
                      {faq.question}
                    </h2>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-full border border-black/20 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-black text-[#e7ecea] border-black" : "text-black/60 group-hover:border-black/50"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-1 border-t border-black/10">
                    <div className="w-full lg:max-w-[70%] text-sm font-semibold text-black/90 leading-relaxed text-justify">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
