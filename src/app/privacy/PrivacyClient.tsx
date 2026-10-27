"use client";

import React from "react";
import Link from "next/link";
import { Lock, UserCheck, ShieldAlert } from "lucide-react";
import { getWhatsAppUrl } from "@/config/brand";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyClient() {
  const { isArabic } = useLanguage();

  const whatsappContactUrl = getWhatsAppUrl(
    isArabic
      ? "مرحباً مارسيل! لدي استفسار بخصوص سياسة الخصوصية وحماية البيانات."
      : "Hello MARSEL! I have an inquiry regarding privacy and my data."
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
            {isArabic ? "سياسة الخصوصية" : "privacy policy"}
          </span>
        </nav>
      </div>

      {/* Content Container */}
      <div className="w-full space-y-8 pb-16 pt-2 text-left rtl:text-right">
        {/* Page Header */}
        <div className="border-b border-black/20 pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-black/60 font-bold block mb-1">
              {isArabic ? "استوديو مارسيل — حماية وأمان البيانات" : "MARSEL STUDIO — DATA PROTECTION"}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-black">
              {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
            </h1>
            <p className="w-full lg:max-w-[60%] text-xs sm:text-sm font-semibold text-black/60 tracking-wider mt-1.5">
              {isArabic
                ? "كيف نحمي ونحافظ على سرية بياناتك الشخصية عند الشراء والتسوق من مارسيل."
                : "How we protect your personal information when ordering from MARSEL."}
            </p>
          </div>

          <a
            href={whatsappContactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-black text-[#f6f5f2] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors self-start sm:self-auto shrink-0 shadow-sm"
          >
            <span>{isArabic ? "تواصل مع خدمة العملاء ←" : "Concierge Support →"}</span>
          </a>
        </div>

        {/* Section 1: Information Collected */}
        <div className="w-full border border-black/20 bg-black/[0.015] p-6 sm:p-9 space-y-6">
          <div className="flex items-center gap-3 border-b border-black/10 pb-4">
            <div className="w-8 h-8 border border-black bg-black text-[#f6f5f2] flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-black">
              {isArabic ? "البيانات التي نجمعها لتوصيل طلبك" : "Information Collected"}
            </h2>
          </div>

          <div className="w-full lg:max-w-[70%] space-y-3 text-xs sm:text-sm font-medium text-black/90 leading-relaxed">
            <p>
              {isArabic
                ? "نجمع فقط المعلومات الضرورية لمعالجة وشحن وتوصيل طلبك بنجاح، والتي تشمل: الاسم، رقم الهاتف، رقم الواتساب، المحافظة، والمنطقة والعنوان التفصيلي للتوصيل."
                : "We collect only the essential details needed to fulfill, dispatch, and deliver your parcel: customer name, mobile phone number, WhatsApp number, and delivery destination address."}
            </p>
          </div>
        </div>

        {/* Section 2: Data Security */}
        <div className="w-full border border-black/20 bg-black/[0.015] p-6 sm:p-9 space-y-6">
          <div className="flex items-center gap-3 border-b border-black/10 pb-4">
            <div className="w-8 h-8 border border-black bg-black text-[#f6f5f2] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-black">
              {isArabic ? "أمان وسرية البيانات" : "Data Security & Confidentiality"}
            </h2>
          </div>

          <div className="w-full lg:max-w-[70%] space-y-3 text-xs sm:text-sm font-medium text-black/90 leading-relaxed">
            <p>
              {isArabic
                ? "بياناتك الشخصية مشفرة بالكامل ولا نقوم بمشاركتها أو بيعها لأي طرف ثالث لأغراض إعلانية. تُستخدم بياناتك حصرياً لخدمتك وتنسيق التوصيل المباشر مع شركات الشحن المعتمدة."
                : "Your personal data is strictly protected. We never sell or distribute customer information to third-party advertisers. Data is used exclusively for fulfilling orders and communicating shipping updates."}
            </p>
          </div>
        </div>

        {/* Section 3: Your Rights */}
        <div className="w-full border border-black/20 bg-black/[0.015] p-6 sm:p-9 space-y-6">
          <div className="flex items-center gap-3 border-b border-black/10 pb-4">
            <div className="w-8 h-8 border border-black bg-black text-[#f6f5f2] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-black">
              {isArabic ? "حقوقك والتحكم في بياناتك" : "Your Rights & Inquiries"}
            </h2>
          </div>

          <div className="w-full lg:max-w-[70%] space-y-3 text-xs sm:text-sm font-medium text-black/90 leading-relaxed">
            <p>
              {isArabic
                ? "يحق لك في أي وقت مراسلتنا لطلب تعديل أو حذف بيانات الاتصال الخاصة بك من سجلاتنا بمجرد اكتمال تسليم طلبك."
                : "You may request the modification or deletion of your customer contact record from our active databases at any point after order completion by contacting our team."}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
