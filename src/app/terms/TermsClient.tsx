"use client";

import React from "react";
import Link from "next/link";
import { FileText, Truck, RotateCcw, Sparkles } from "lucide-react";
import { BRAND_CONFIG, getWhatsAppUrl } from "@/config/brand";
import { useLanguage } from "@/context/LanguageContext";

export default function TermsClient() {
  const { isArabic } = useLanguage();

  const whatsappContactUrl = getWhatsAppUrl(
    isArabic
      ? "مرحباً مارسيل! لدي استفسار بخصوص شروط الخدمة والطلبات."
      : "Hello MARSEL! I have a question regarding terms and orders."
  );

  return (
    <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8">
      {/* Breadcrumb */}
      <div className="pt-2 pb-2">
        <nav className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-black/55 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-black transition-colors font-mono">
            marsel
          </Link>
          <span>/</span>
          <span className="text-black font-semibold">
            {isArabic ? "الشروط والأحكام" : "terms of service"}
          </span>
        </nav>
      </div>

      {/* Content Container */}
      <div className="w-full space-y-8 pb-16 pt-2 text-left rtl:text-right">
        {/* Page Header */}
        <div className="border-b border-black/20 pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-black/60 font-bold block mb-1">
              {isArabic ? "استوديو مارسيل — الشروط والعمليات" : "MARSEL STUDIO — LEGAL & OPERATIONS"}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-black">
              {isArabic ? "الشروط والأحكام" : "Terms of Service"}
            </h1>
            <p className="w-full lg:max-w-[60%] text-xs sm:text-sm font-semibold text-black/60 tracking-wider mt-1.5">
              {isArabic
                ? "إرشادات واضحة وبسيطة للتسوق، الشحن السريع، وخدمة العملاء في متجر مارسيل."
                : "Clear, simple guidelines for shopping, courier delivery, and customer care."}
            </p>
          </div>

          <a
            href={whatsappContactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-black text-[#f6f5f2] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors self-start sm:self-auto shrink-0 shadow-sm"
          >
            <span>{isArabic ? "تواصل معنا عبر واتساب ←" : "Questions? Chat with Us →"}</span>
          </a>
        </div>

        {/* Section 1: Orders & Delivery */}
        <div className="w-full border border-black/20 bg-black/[0.015] p-6 sm:p-9 space-y-6">
          <div className="flex items-center gap-3 border-b border-black/10 pb-4">
            <div className="w-8 h-8 border border-black bg-black text-[#f6f5f2] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-black">
              {isArabic ? "الطلبات والتوصيل لجميع المحافظات" : "Orders & Delivery Fulfillment"}
            </h2>
          </div>

          <div className="w-full lg:max-w-[70%]">
            <p className="text-xs sm:text-sm font-medium text-black/90 leading-relaxed mb-4">
              {isArabic
                ? "عند تأكيد طلبك في مارسيل، يتم تجهيزه وشحنه حتى باب منزلك مع شركات شحن متخصصة:"
                : "When you place an order with MARSEL, we fulfill and deliver it directly to your doorstep with trusted couriers:"}
            </p>
            <ul className="space-y-4 text-xs sm:text-sm font-medium text-black/90 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-black shrink-0 mt-2" />
                <span>
                  {isArabic
                    ? "مدة التوصيل: تصل الشحنات داخل القاهرة والجيزة خلال ٢ إلى ٤ أيام عمل، ولكافة المحافظات الأخرى خلال ٣ إلى ٥ أيام عمل."
                    : "Delivery Timeline: Shipments to Cairo and Giza arrive in 2–4 business days; all other Egyptian governorates in 3–5 business days."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-black shrink-0 mt-2" />
                <span>
                  {isArabic
                    ? "المعاينة عند الاستلام: يحق للعميل معاينة الأوردر مع المندوب قبل السداد للتأكد من المقاس والخامة."
                    : "Doorstep Inspection: You may open and inspect your pieces with the courier before completing payment."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-black shrink-0 mt-2" />
                <span>
                  {isArabic
                    ? "الدفع عند الاستلام: السداد متاح نقداً للمندوب أو عبر إنستاباي والمحافظ الإلكترونية."
                    : "Cash on Delivery: Payment is collected upon delivery in cash or via mobile wallets / InstaPay."}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 2: Returns and Exchanges */}
        <div className="w-full border border-black/20 bg-black/[0.015] p-6 sm:p-9 space-y-6">
          <div className="flex items-center gap-3 border-b border-black/10 pb-4">
            <div className="w-8 h-8 border border-black bg-black text-[#f6f5f2] flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-black">
              {isArabic ? "حقوق الاسترجاع والاستبدال (١٤ يوماً)" : "14-Day Exchange & Return Policy"}
            </h2>
          </div>

          <div className="w-full lg:max-w-[70%] space-y-3 text-xs sm:text-sm font-medium text-black/90 leading-relaxed">
            <p>
              {isArabic
                ? "وفقاً لقوانين حماية المستهلك وسياسة مارسيل، يحق لك استبدال أو استرجاع أي قطعة خلال ١٤ يوماً من تاريخ الاستلام بشرط الحفاظ عليها بحالتها الأصلية غير مستعملة وبكافة لوازم التغليف."
                : "In accordance with consumer standards and MARSEL policy, you may exchange or return any unworn piece within 14 days of delivery with original tags intact."}
            </p>
          </div>
        </div>

        {/* Section 3: Intellectual Property */}
        <div className="w-full border border-black/20 bg-black/[0.015] p-6 sm:p-9 space-y-6">
          <div className="flex items-center gap-3 border-b border-black/10 pb-4">
            <div className="w-8 h-8 border border-black bg-black text-[#f6f5f2] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-black">
              {isArabic ? "الملكية الفكرية والعلامة التجارية" : "Intellectual Property"}
            </h2>
          </div>

          <div className="w-full lg:max-w-[70%] space-y-3 text-xs sm:text-sm font-medium text-black/90 leading-relaxed">
            <p>
              {isArabic
                ? "جميع التصاميم والشعارات والرسومات والنصوص والصور المنشورة على هذا الموقع مملوكة حصرياً لعلامة MARSEL ومحمية بموجب حقوق الملكية الفكرية."
                : "All designs, logos, graphics, copy, and visual media on this platform are the exclusive intellectual property of MARSEL and protected by law."}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
