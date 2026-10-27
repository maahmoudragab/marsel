"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function DynamicTabTitle() {
  const pathname = usePathname();
  const { isArabic } = useLanguage();

  useEffect(() => {
    if (!pathname) return;

    // Skip product detail page because ProductDetailClient manages its own localized title
    if (pathname.startsWith("/products/")) return;

    const brand = isArabic ? "مارسيل" : "MARSEL";
    let section = "";

    if (pathname === "/") {
      section = isArabic ? "المتجر" : "STORE";
    } else if (pathname === "/bag") {
      section = isArabic ? "حقيبة التسوق" : "BAG";
    } else if (pathname === "/checkout") {
      section = isArabic ? "إتمام الطلب" : "CHECKOUT";
    } else if (pathname.startsWith("/checkout/")) {
      const orderNum = pathname.replace("/checkout/", "").replace(/^#+/, "").trim();
      section = isArabic ? `طلب #${orderNum}` : `ORDER #${orderNum}`;
    } else if (pathname.startsWith("/confirm/") || pathname.startsWith("/confirm-order/")) {
      const orderNum = pathname.split("/").pop()?.replace(/^#+/, "").trim() || "";
      section = isArabic ? `تأكيد طلب #${orderNum}` : `CONFIRM #${orderNum}`;
    } else if (pathname === "/track") {
      section = isArabic ? "تتبع الطلب" : "TRACK ORDER";
    } else if (pathname === "/about") {
      section = isArabic ? "عن مارسيل" : "ABOUT";
    } else if (pathname === "/faq") {
      section = isArabic ? "الأسئلة الشائعة" : "FAQ";
    } else if (pathname === "/returns") {
      section = isArabic ? "الاستبدال والاسترجاع" : "RETURNS";
    } else if (pathname === "/terms") {
      section = isArabic ? "الشروط والأحكام" : "TERMS";
    } else if (pathname === "/privacy") {
      section = isArabic ? "الخصوصية" : "PRIVACY";
    } else if (pathname.startsWith("/admin")) {
      section = isArabic ? "لوحة التحكم" : "DASHBOARD";
    } else if (pathname.startsWith("/atelier-hub-9821")) {
      section = isArabic ? "الاستوديو" : "ATELIER";
    } else if (pathname === "/coming-soon") {
      section = isArabic ? "قريباً" : "COMING SOON";
    }

    if (section) {
      document.title = `${brand} | ${section}`;
    }
  }, [pathname, isArabic]);

  return null;
}
