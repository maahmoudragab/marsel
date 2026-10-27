"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Palette, Layers, Compass } from "lucide-react";
import { getWhatsAppUrl } from "@/config/brand";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutClient() {
  const { isArabic } = useLanguage();

  const whatsappConciergeUrl = getWhatsAppUrl(
    isArabic
      ? "مرحباً مارسيل! أود معرفة المزيد عن أحدث التشكيلات وتفاصيل التصاميم."
      : "Hello MARSEL! I'd love to know more about your latest drop."
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
            {isArabic ? "عن مارسيل" : "about"}
          </span>
        </nav>
      </div>

      {/* HERO SECTION: Editorial Manifesto */}
      <section className="pt-6 pb-12 border-b border-black/20 space-y-6 text-left rtl:text-right">
        <div className="flex items-center justify-between border-y border-black/15 py-2.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-black/60">
          <span>{isArabic ? "براند ملابس ستريت وير مستقل" : "INDEPENDENT CLOTHING LABEL"}</span>
          <span className="font-semibold text-black">{isArabic ? "القاهرة · مصر" : "CAIRO · WORLDWIDE"}</span>
          <span>{isArabic ? "صُنع ليكون مختلفاً" : "MADE TO BE DIFFERENT"}</span>
        </div>

        <div className="pt-4 space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-black/50 block font-semibold">
            {isArabic ? "قصة مارسيل" : "ABOUT MARSEL"}
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-black leading-[0.95]">
            {isArabic ? (
              <>
                صُنع ليكون <br className="hidden sm:block" />
                مختلفاً.
              </>
            ) : (
              <>
                Made to Be <br className="hidden sm:block" />
                Different.
              </>
            )}
          </h1>
          <p className="text-base sm:text-xl font-bold uppercase tracking-wide text-black pt-2">
            {isArabic ? (
              <>
                مارسيل هو براند ملابس ستريت وير مصري مستقل تأسس حول فكرة جوهرية:{" "}
                <span className="underline decoration-black decoration-2 underline-offset-4">
                  الملابس يجب أن تعكس شخصيتك الفردية.
                </span>
              </>
            ) : (
              <>
                MARSEL is an independent clothing brand built around one simple idea:{" "}
                <span className="underline decoration-black decoration-2 underline-offset-4">
                  clothing should feel personal.
                </span>
              </>
            )}
          </p>
          <p className="text-xs sm:text-sm font-medium text-black/75 leading-relaxed max-w-2xl pt-1">
            {isArabic
              ? "نبتكر قطعاً عصرية مصممة لارتداء يومي فائق الراحة، تجمع بين الخامات المصرية الفاخرة، والقصات المدروسة، والرسومات المستقلة، لنقدم أسلوباً مميزاً دون تكلف."
              : "We create modern pieces designed for everyday wear, combining comfort, quality, and distinctive graphics to create a style that feels different without trying too hard."}
          </p>
        </div>
      </section>

      {/* THREE CORE PILLARS GRID */}
      <section className="py-12 space-y-8 border-b border-black/20 text-left rtl:text-right">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-mono uppercase tracking-widest text-black/50 font-semibold">
            {isArabic ? "٠١ // الركائز الأساسية" : "01 // THE PILLARS"}
          </span>
          <span className="text-xs font-mono text-black font-bold uppercase tracking-widest">
            {isArabic ? "التصميم · الخامات · الرؤية" : "DESIGN · PIECES · APPROACH"}
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
                  01 / {isArabic ? "التصميم" : "DESIGN"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                {isArabic ? "تصاميمنا" : "Our Design"}
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-black/80 font-medium leading-relaxed">
                <p className="font-bold text-black uppercase tracking-wider text-xs">
                  {isArabic ? "في مارسيل، التصميم يأتي أولاً دائماً." : "At MARSEL, design comes first."}
                </p>
                <p>
                  {isArabic
                    ? "قطعنا مستوحاة من الفن والسريالية والخيال والواقع الحضري المحيط بنا."
                    : "Our pieces are inspired by fantasy, art, surrealism, and the world around us."}
                </p>
                <p>
                  {isArabic
                    ? "نحوّل هذه الأفكار إلى جرافيك متميز وقصات لافتة تجعلك تبرز بتفرد وتمنحك راحة تامة في نفس الوقت."
                    : "We take these ideas and turn them into graphics and silhouettes made to stand out while still feeling easy to wear."}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-black/10 text-[10px] font-mono uppercase tracking-widest text-black/50">
              {isArabic ? "سريالية · فن · إلهام" : "SURREALISM · ART · FANTASY"}
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
                  02 / {isArabic ? "القطع" : "PIECES"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                {isArabic ? "قطعنا" : "Our Pieces"}
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-black/80 font-medium leading-relaxed">
                <p className="font-bold text-black uppercase tracking-wider text-xs">
                  {isArabic ? "الملابس الحقيقية تبدأ من جودة الأساسيات." : "Good clothing starts with the basics."}
                </p>
                <p>
                  {isArabic
                    ? "هذا يعني انتقاء أفضل خامات القطن المصري عالي الكثافة، والتركيز على الراحة والمتانة وأدق تفاصيل الخياطة."
                    : "That means choosing quality materials, focusing on comfort, and paying attention to the details that make a piece feel right."}
                </p>
                <p>
                  {isArabic
                    ? "تشكيلاتنا تركز حالياً على الهوديز والسويت شيرت والبنطلونات الثقيلة، مع إصدارات جديدة ومستمرة."
                    : "Our collections currently focus on hoodies and sweatshirts, with more pieces to come as MARSEL grows."}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-black/10 text-[10px] font-mono uppercase tracking-widest text-black/50">
              {isArabic ? "هوديز · سويت شيرت · أساسيات فاخرة" : "HOODIES · SWEATSHIRTS · ESSENTIALS"}
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
                  03 / {isArabic ? "الرؤية" : "APPROACH"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                {isArabic ? "رؤيتنا" : "Our Approach"}
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-black/80 font-medium leading-relaxed">
                <p className="font-bold text-black uppercase tracking-wider text-xs">
                  {isArabic ? "لسنا هنا لاتباع الصيحات السريعة المستهلكة." : "We are not here to follow every trend."}
                </p>
                <p>
                  {isArabic
                    ? "هدفنا هو ابتكار قطع تحمل طابعاً مستقلاً وروحاً خاصة لمن يرى في ملابسه وسيلة حقيقية للتعبير عن ذاته."
                    : "We want to create pieces with their own character, made for people who see clothing as part of how they express themselves."}
                </p>
                <p>
                  {isArabic
                    ? "قطع مميزة تشعر معها بالأصالة والانتماء لأسلوبك الخاص."
                    : "Individual pieces that feel natural and authentic to who you are."}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-black/10 text-[10px] font-mono uppercase tracking-widest text-black/50">
              {isArabic ? "تعبير شخصي · أصالة" : "SELF-EXPRESSION · ORIGINALITY"}
            </div>
          </div>
        </div>
      </section>

      {/* ANTHEM FINALE */}
      <section className="py-14 sm:py-16 text-left rtl:text-right">
        <div className="border-2 border-black bg-black text-[#f6f5f2] p-8 sm:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#f6f5f2]/50 block">
              {isArabic ? "شعار مارسيل" : "THE MARSEL ANTHEM"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight leading-snug">
              {isArabic ? (
                <>
                  بسيط حين يتطلب الأمر. <br />
                  وجريء حين يكون للأمر معنى.
                </>
              ) : (
                <>
                  Simple when it needs to be. <br />
                  Bold when it matters.
                </>
              )}
            </h2>
            <p className="text-xs sm:text-sm font-light text-[#f6f5f2]/75 pt-1 uppercase tracking-widest">
              {isArabic ? "هذا هو مارسيل. صُنع ليكون مختلفاً." : "This is MARSEL. Made to Be Different."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
            <Link
              href="/"
              className="h-12 px-8 bg-[#f6f5f2] text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center shadow-sm"
            >
              <span>{isArabic ? "تصفح التشكيلة" : "Explore Drops"}</span>
            </Link>
            <a
              href={whatsappConciergeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 px-6 border border-[#f6f5f2]/40 text-[#f6f5f2] text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <span>{isArabic ? "تواصل عبر واتساب" : "WhatsApp Concierge"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
