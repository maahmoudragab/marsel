"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function HomeEmptyState() {
  const { isArabic } = useLanguage();

  return (
    <div className="py-28 text-center space-y-3.5 select-none">
      <div className="inline-block px-3 py-1 bg-black text-[#e7ecea] text-[10px] font-bold uppercase tracking-widest">
        {isArabic ? "الدروب ينطلق قريباً" : "DROP 01 LAUNCHING SOON"}
      </div>
      <p className="text-xs font-sans uppercase tracking-widest text-black/60 font-medium max-w-md mx-auto leading-relaxed">
        {isArabic
          ? "يتم الآن تجهيز القطع الحصرية للإطلاق الرسمي. ترقبوا الافتتاح واستقبال الطلبات."
          : "Atelier pieces are currently being prepped for the official drop. Stay tuned for launch."}
      </p>
    </div>
  );
}
