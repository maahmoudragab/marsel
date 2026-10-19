import { BRAND_CONFIG } from "@/config/brand";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://themarsel.vercel.app";

/**
 * Enhanced brand & founder keywords covering all bilingual search queries:
 * Latin variants, Arabic transliterations, founder name, intent & category
 */
export const BRAND_KEYWORDS = [
  // Exact brand variations
  "MARSEL",
  "marsel",
  "MARSEL Store",
  "MARSEL Brand",
  "MARSEL Egypt",
  "MARSEL Studio",
  "MARSEL Clothing",
  "MARSEL Fashion",
  "marsel online",
  "marsel shop",
  
  // Founder search
  "MARSEL Mahmoud Ragab",
  "Mahmoud Ragab MARSEL",
  "محمود رجب مارسيل",
  "مارسيل محمود رجب",

  // Arabic brand transliterations
  "مارسيل",
  "مارسل",
  "براند مارسيل",
  "براند مارسل",
  "مارسيل ستور",
  "مارسل ستور",
  "مارسيل مصر",
  "مارسل مصر",
  "ملابس مارسيل",
  "ملابس مارسل",
  "موقع مارسيل",
  "موقع مارسل",

  // Core Category & Intent (Bilingual)
  "Egyptian streetwear brand",
  "Local clothing brand Egypt",
  "Oversized hoodie Egypt",
  "Heavyweight hoodie Cairo",
  "Crewneck sweatshirt Egypt",
  "Boxy fit tee Egypt",
  "High quality streetwear Cairo",
  "براند ملابس مصري",
  "براندات ستريت وير في مصر",
  "هودي اوفر سايز مصر",
  "هودي قطن تقيل",
  "سويت شيرت كرو نيك",
  "تيشرتات بوكسي اوفر سايز",
  "ملابس كاجوال شبابي مصر",
  "شراء هوديز اونلاين مصر دليفري كاش",
  "براندات مصرية محلية",
];

/**
 * 1. Organization Schema (JSON-LD)
 * Includes official logo, founder, social links (Instagram, TikTok, Facebook, WhatsApp),
 * contact point, founding location, and Arabic/English alternate brand names.
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND_CONFIG.name,
    legalName: BRAND_CONFIG.legalName,
    alternateName: [
      "مارسيل",
      "مارسل",
      "MARSEL Brand",
      "MARSEL Store",
      "MARSEL Egypt",
      "MARSEL Studio",
      "MARSEL Clothing",
      "MARSEL Mahmoud Ragab",
      "مارسيل براند",
      "مارسل براند",
    ],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: `${SITE_URL}/logo/Black-without-bg.png`,
      caption: "MARSEL — Made to Be Different",
      width: 2096,
      height: 228,
    },
    image: `${SITE_URL}/opengraph-image.png`,
    description:
      "MARSEL (مارسيل) is an independent Egyptian streetwear brand founded by Mahmoud Ragab in Cairo, Egypt. Specializing in premium heavyweight hoodies, oversized crewnecks, and distinctive graphic apparel. Made to be different.",
    founder: {
      "@type": "Person",
      name: "Mahmoud Ragab",
      alternateName: "محمود رجب",
      jobTitle: "Founder & Creative Director",
    },
    foundingLocation: {
      "@type": "Place",
      name: "Cairo, Egypt",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Cairo",
        addressCountry: "EG",
      },
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cairo",
      addressRegion: "Cairo Governorate",
      addressCountry: "EG",
    },
    telephone: `+20${BRAND_CONFIG.contact.phone.replace(/^0+/, "")}`,
    email: BRAND_CONFIG.contact.email,
    priceRange: "$$",
    currenciesAccepted: "EGP",
    paymentAccepted: "Cash, Cash on Delivery, Credit Card",
    sameAs: [
      BRAND_CONFIG.social.instagram.url,
      BRAND_CONFIG.social.tiktok.url,
      BRAND_CONFIG.social.facebook.url,
      BRAND_CONFIG.social.whatsapp.url,
    ].filter(Boolean),
    areaServed: {
      "@type": "Country",
      name: "Egypt",
    },
  };
}

/**
 * 2. WebSite Schema with Site Search Potential Action
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "MARSEL | Made to Be Different",
    alternateName: ["مارسيل", "مارسل", "MARSEL Store", "MARSEL Brand"],
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    inLanguage: ["en-US", "ar-EG"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products/{search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * 3. Product Schema for Google Rich Snippets & AI Overviews
 */
export function getProductSchema(product: {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  story?: string | null;
  price: number;
  compare_at_price?: number | null;
  image?: string | null;
  gallery_images?: string[] | null;
  category?: string | null;
  color_name?: string | null;
  composition?: string | null;
  fit?: string | null;
  sizes?: string[] | null;
  is_active?: boolean;
}) {
  const productUrl = `${SITE_URL}/products/${product.slug || product.id}`;
  const images = (product.gallery_images && product.gallery_images.length > 0)
    ? product.gallery_images
    : product.image
    ? [product.image]
    : [`${SITE_URL}/opengraph-image.png`];

  const fullImages = images.map((img) =>
    img.startsWith("http") ? img : `${SITE_URL}${img.startsWith("/") ? "" : "/"}${img}`
  );

  const desc =
    product.description ||
    product.story ||
    `${product.title} by MARSEL (مارسيل). ${product.fit || "Oversized boxy cut"}, crafted with ${product.composition || "100% premium Egyptian cotton"} in Cairo. Made to be different.`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}/#product`,
    name: product.title,
    image: fullImages,
    description: desc,
    sku: `MARSEL-${product.id.slice(0, 8).toUpperCase()}`,
    mpn: `MARSEL-${product.slug || product.id}`,
    brand: {
      "@type": "Brand",
      name: BRAND_CONFIG.name,
      alternateName: "مارسيل",
      logo: `${SITE_URL}/logo/Black-without-bg.png`,
    },
    category: product.category || "Apparel & Accessories > Clothing",
    color: product.color_name || undefined,
    material: product.composition || "100% Egyptian Cotton",
    offers: {
      "@type": "Offer",
      "@id": `${productUrl}/#offer`,
      url: productUrl,
      priceCurrency: "EGP",
      price: product.price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.is_active !== false
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: BRAND_CONFIG.name,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "EG",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 70,
          currency: "EGP",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "EG",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 4,
            unitCode: "d",
          },
        },
      },
    },
  };
}

/**
 * 4. FAQ Schema for Rich Snippets on Google Search
 */
export function getFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How long does shipping take and how much does it cost at MARSEL?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Shipments to Cairo and Giza arrive within 2 to 4 business days. Deliveries to all other Egyptian governorates arrive within 3 to 5 business days. Exact shipping fees are calculated by governorate at checkout.",
        },
      },
      {
        "@type": "Question",
        name: "Does MARSEL ship across all Egyptian governorates?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. MARSEL delivers doorstep orders across every governorate throughout Egypt through dedicated courier networks.",
        },
      },
      {
        "@type": "Question",
        name: "Can I open and inspect the parcel with the courier before paying?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, 100%. MARSEL strictly permits on-the-spot parcel inspection before completing cash on delivery payment.",
        },
      },
      {
        "@type": "Question",
        name: "What is MARSEL's return and exchange policy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MARSEL offers a transparent 14-day exchange and return window from the delivery date, provided items are unworn with original tags attached.",
        },
      },
      {
        "@type": "Question",
        name: "Who founded MARSEL (مارسيل)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MARSEL is an independent streetwear clothing brand founded by Mahmoud Ragab in Cairo, Egypt, dedicated to personal, distinctive, high-quality garments.",
        },
      },
    ],
  };
}

/**
 * 5. BreadcrumbList Schema for Google Search URL Hierarchies
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * 6. ItemList Schema for Product Grid Carousel in Google Search
 */
export function getItemListSchema(
  products: { id: string; title: string; slug?: string | null }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "MARSEL Streetwear Collection (كولكشن مارسيل)",
    url: SITE_URL,
    itemListElement: products.map((prod, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/products/${prod.slug || prod.id}`,
      name: prod.title,
    })),
  };
}

