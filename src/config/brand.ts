/**
 * MARSEL STORE — Centralized Brand & Social Media Configuration
 * 
 * All external links, social platforms, phone numbers, WhatsApp, and emails
 * are configured here. Update this file to change them store-wide.
 */

export const BRAND_CONFIG = {
  name: "MARSEL",
  legalName: "MARSEL",
  tagline: "Made to Be Different — Independent Clothing Brand",
  origin: "Cairo, Egypt",
  currency: "EGP",

  contact: {
    // Primary customer service phone
    phone: "01095420463",
    // International WhatsApp number (country code + number, digits only)
    whatsappNumber: "01095420463",
    // Formatted display phone
    displayPhone: "01095420463",
    // Concierge & support email
    email: "concierge@marsel.studio",
  },

  social: {
    whatsapp: {
      number: "01095420463",
      username: "marselrg",
      url: "https://wa.me/201095420463",
    },
    instagram: {
      handle: "marsel.eg",
      url: "https://instagram.com/marsel.eg",
    },
    tiktok: {
      handle: "@marsel.eg",
      url: "https://tiktok.com/@marsel.eg",
    },
    facebook: {
      handle: "marsel.studio",
      url: "https://facebook.com/marsel.studio",
    },
  },
};

/**
 * Generate a direct WhatsApp chat URL with an optional pre-filled message
 * @param message Optional text message to prefill in WhatsApp chat
 * @param customNumber Optional specific recipient phone (defaults to brand WhatsApp)
 */
export function getWhatsAppUrl(message?: string, customNumber?: string): string {
  const rawNum = customNumber || BRAND_CONFIG.contact.whatsappNumber;
  const cleanNum = rawNum.replace(/[^0-9]/g, "");
  // Ensure Egyptian numbers start with country code 2
  const formattedNum = cleanNum.startsWith("0")
    ? `2${cleanNum}`
    : cleanNum.startsWith("20")
    ? cleanNum
    : cleanNum;

  if (!message || !message.trim()) {
    return `https://wa.me/${formattedNum}`;
  }

  return `https://wa.me/${formattedNum}?text=${encodeURIComponent(message.trim())}`;
}
