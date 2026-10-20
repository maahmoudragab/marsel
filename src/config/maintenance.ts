/**
 * 🔒 MARSEL STORE — Maintenance & Collection Drop Control
 * =========================================================
 * يتم التحكم في القفل والفتح من خلال متغير البيئة في ملف .env.local
 *
 * 🔴 لقفل الموقع:
 *    MAINTENANCE_MODE=true
 *
 * 🟢 لفتح الموقع وإلغاء القفل:
 *    MAINTENANCE_MODE=false
 */

export const MAINTENANCE_MODE =
  process.env.MAINTENANCE_MODE === "false" ||
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "false"
    ? false
    : true;

/**
 * بيانات ونصوص شاشة التجهيز
 */
export const MAINTENANCE_CONFIG = {
  badgeAr: "قيد التجهيز • إطلاق قريب جداً",
  badgeEn: "DROP IN PROGRESS",
  titleAr: "الكوليكشن الجديد قيد التجهيز",
  titleEn: "NEW COLLECTION DROPPING SOON",
  subtitleAr:
    "شغالين بكل حب ومهتمين بأصغر وأدق التفاصيل عشان نقدملكم قطع وتشكيلة مختلفة تليق بيكم. الموقع هيفتح قريب جداً مع نزول الكوليكشن الجديد.",
  subtitleEn:
    "We are currently curating and finishing the new collection pieces. The store is temporarily closed and will reopen very soon for the drop.",
  ctaWhatsAppText: "بلّغني أول ما الكوليكشن ينزل",
  ctaWhatsAppMessage: "مرحباً مارسيل، حابب اكون أول واحد يعرف أول ما الكوليكشن الجديد ينزل!",
};
