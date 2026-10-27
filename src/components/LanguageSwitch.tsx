"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setLanguage(language === "en" ? "ar" : "en")}
      aria-label={language === "en" ? "التبديل إلى العربية" : "Switch to English"}
      title={language === "en" ? "التبديل إلى العربية" : "Switch to English"}
      className="flex items-center gap-1.5 text-black hover:opacity-60 transition-opacity duration-150 cursor-pointer py-1 select-none"
    >
      <Globe className="w-[18px] h-[18px] text-black shrink-0" strokeWidth={1.35} />
      <span className="text-[11px] font-mono tracking-wider font-bold uppercase">
        {language === "en" ? "عربي" : "EN"}
      </span>
    </button>
  );
}
