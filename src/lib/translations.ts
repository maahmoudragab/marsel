import type { Product } from "@/lib/product";

export type SupportedLanguage = "en" | "ar";

export interface TranslatedProduct extends Product {
  originalTitle: string;
}

// Full curated Arabic translations for MARSEL core catalogue
export const PRODUCT_TRANSLATIONS_AR: Record<
  string,
  Partial<Omit<Product, "id" | "index" | "price" | "compare_at_price" | "image" | "images" | "sizes">>
> = {
  // 1. EAGLE HEAVYWEIGHT HOODIE
  "eagle-heavyweight-00001": {
    title: "هودي النسر الثقيل",
    description: "هودي ثقيل الوزن بقصة واسعة ومريحة، أكتاف منسدلة، وتطريز نسر فاخر متقن على الصدر.",
    story: "صُنع ليكون طبقتك الأساسية في ليالي القاهرة الباردة.",
    details: [
      "ميلتون قطني فائق النعومة ٤٦٠ جم",
      "أكتاف منسدلة دروب شولدر",
      "تطريز نسر فاخر على الصدر",
      "غطاء رأس مبطن بطبقتين",
    ],
    color_name: "أسود مغسول",
    composition: "١٠٠٪ قطن مصري فاخر",
    structure: "ميلتون مبطن ناعم ٤٦٠ جم",
    fit: "أوفر سايز (قصة واسعة)",
    fit_notes: "اختر مقاسك المعتاد للحصول على القصة الواسعة المطلوبة.",
    care: "يُغسل بالمقلوب عند درجة حرارة ٣٠ مئوية. تجنب استخدام المبيضات. يُجفف تعليقاً.",
    collection: "الإصدار الأول",
    provenance: "صُنع في مصر",
    house_label: "مارسيل",
    category: "hoodie",
  },
  "eagle-heavyweight-hoodie-00001": {
    title: "هودي النسر الثقيل",
    description: "هودي ثقيل الوزن بقصة واسعة ومريحة، أكتاف منسدلة، وتطريز نسر فاخر متقن على الصدر.",
    story: "صُنع ليكون طبقتك الأساسية في ليالي القاهرة الباردة.",
    details: [
      "ميلتون قطني فائق النعومة ٤٦٠ جم",
      "أكتاف منسدلة دروب شولدر",
      "تطريز نسر فاخر على الصدر",
      "غطاء رأس مبطن بطبقتين",
    ],
    color_name: "أسود مغسول",
    composition: "١٠٠٪ قطن مصري فاخر",
    structure: "ميلتون مبطن ناعم ٤٦٠ جم",
    fit: "أوفر سايز (قصة واسعة)",
    fit_notes: "اختر مقاسك المعتاد للحصول على القصة الواسعة المطلوبة.",
    care: "يُغسل بالمقلوب عند درجة حرارة ٣٠ مئوية. تجنب استخدام المبيضات. يُجفف تعليقاً.",
    collection: "الإصدار الأول",
    provenance: "صُنع في مصر",
    house_label: "مارسيل",
    category: "hoodie",
  },

  // 2. ARCHIVE ZIP HOODIE
  "archive-zip-hoodie-00002": {
    title: "هودي أرشيف بسحاب",
    description: "هودي بسحاب مصمم بقوام متماسك، خامات وسحابات معدنية متينة، ومساحة مريحة للارتداء بطبقات متعددة.",
    story: "قطعة يومية عملية مستوحاة من تفاصيل الأرشيف الكلاسيكية.",
    details: [
      "ميلتون قطني ممشط ٣٨٠ جم",
      "سحاب معدني قوي وعملي",
      "جيوب كانغرو مقسمة",
      "أساور مطاطية معززة",
    ],
    color_name: "رمادي خرساني",
    composition: "١٠٠٪ قطن مصري ممشط فاخر",
    structure: "ميلتون ناعم ٣٨٠ جم",
    fit: "ريلاكسد (مريح)",
    fit_notes: "اختر مقاسك المعتاد للحصول على مظهر مريح وأنيق.",
    care: "يُغلق السحاب قبل الغسيل. يُغسل عند درجة حرارة ٣٠ مئوية. يُجفف تعليقاً.",
    collection: "الإصدار الأول",
    provenance: "صُنع في مصر",
    house_label: "مارسيل",
    category: "hoodie",
  },

  // 3. NILE BLUE BOX CREWNECK
  "nile-blue-box-00003": {
    title: "سويت شيرت أزرق نيلي بوكسي",
    description: "سويت شيرت بقصة بوكسي مربعة مع بطانة داخلية فائقة النعومة ولون أزرق نيلي هادئ وفاخر.",
    story: "لون هادئ وفاخر، قصة مربعة مفيدة، ووزن نسيج مثالي لكل يوم.",
    details: [
      "ميلتون فاخر ٣٦٠ جم",
      "بطانة داخلية ناعمة جداً",
      "ياقة مضلعة محكمة",
      "أساور معززة",
    ],
    color_name: "أزرق نيلي",
    composition: "١٠٠٪ قطن مصري فاخر",
    structure: "ميلتون مبطن ٣٦٠ جم",
    fit: "بوكسي (قصة مربعة)",
    fit_notes: "القصة عريضة ومربعة عمداً، التزم بمقاسك المعتاد.",
    care: "يُغسل بالمقلوب عند ٣٠ مئوية. تجنب التجفيف الآلي.",
    collection: "الإصدار الأول",
    provenance: "صُنع في مصر",
    house_label: "مارسيل",
    category: "sweatshirt",
  },

  // 4. DAILY WEIGHT TEE
  "daily-weight-tee-00004": {
    title: "تيشيرت يومي ثقيل",
    description: "تيشيرت يومي عالي الكثافة بأكتاف مريحة منسدلة ومعالجة مقاومة للانكماش لتحمل الارتداء اليومي.",
    story: "مُصمم لأيام الصيف والاستخدام المتكرر والارتداء السهل تحت القطع الأخرى.",
    details: [
      "قطن سنغل جيرسيه متماسك ٢٤٠ جم",
      "معالج ضد الانكماش مسبقاً",
      "ياقة معززة متينة",
      "أكتاف منسدلة مريحة",
    ],
    color_name: "رملي صحراوي",
    composition: "١٠٠٪ قطن مصري فاخر",
    structure: "قطن سنغل جيرسيه متماسك ٢٤٠ جم",
    fit: "ريجلر (عادي)",
    fit_notes: "اختر مقاسك المعتاد، أو اختر مقاساً أكبر لمظهر أكثر وسعاً.",
    care: "يُغسل بماء بارد مع ألوان مماثلة. لا تستخدم المبيضات.",
    collection: "الإصدار الأول",
    provenance: "صُنع في مصر",
    house_label: "مارسيل",
    category: "t-shirt",
  },

  // 5. RAW EDGE FOREST HOODIE
  "raw-edge-forest-00005": {
    title: "هودي أخضر غابي حواف خام",
    description: "هودي مغسول بتقنية خاصة وتفاصيل خياطة خام متميزة بلون أخضر غابي عميق وفريد.",
    story: "تقنية الغسيل تمنح كل خياطة طابعاً وبصمة فريدة خاصة بها.",
    details: [
      "ميلتون فاخر ٤٥٠ جم",
      "تفاصيل خياطة خام استثنائية",
      "معالج بالغسيل المسبق",
      "حاشية سفلية مضلعة ثقيلة",
    ],
    color_name: "أخضر غابي",
    composition: "١٠٠٪ قطن مصري فاخر",
    structure: "ميلتون مغسول ٤٥٠ جم",
    fit: "أوفر سايز (واسع)",
    fit_notes: "التزم بمقاسك المعتاد لتحصل على قصة الأكتاف المنسدلة المطلوبة.",
    care: "يُغسل بالمقلوب عند ٣٠ مئوية. يُجفف تعليقاً. يزداد اللون نعومة مع الوقت.",
    collection: "الإصدار الأول",
    provenance: "صُنع في مصر",
    house_label: "مارسيل",
    category: "hoodie",
  },

  // 6. STREET CUT CARGO
  "street-cut-cargo-00006": {
    title: "بنطلون كارجو ستريت كت",
    description: "بنطلون كارجو بقصة واسعة ومريحة مزود بجيوب عملية وأشرطة تعديل وانسيابية متقنة.",
    story: "مُصمم للحركة الحرة في شوارع المدينة دون أن يفقد قوام نسيجه المتماسك.",
    details: [
      "تويل قطني متين",
      "أشرطة خصر قابلة للتعديل",
      "جيوب كارجو معززة",
      "إكسسوارات معدنية متينة",
    ],
    color_name: "حجري",
    composition: "١٠٠٪ تويل قطني متين",
    structure: "تويل يوتيليتي مغسول متوسط الوزن",
    fit: "ريلاكسد (مريح)",
    fit_notes: "اختر مقاس خصرك المعتاد، أو اختر مقاساً أكبر لقصة أوسع متجمعة عند الحذاء.",
    care: "يُغسل بماء بارد. تُغلق الجيوب قبل الغسيل. يُجفف تعليقاً.",
    collection: "الإصدار الأول",
    provenance: "صُنع في مصر",
    house_label: "مارسيل",
    category: "jeans",
  },

  // 7. MONO LOGO TEE
  "mono-logo-tee-00007": {
    title: "تيشيرت مونو لوجو",
    description: "تيشيرت بشعار مونوكروم بطباعة حريرية وياقة محكمة الملمس، ناعم وفاخر للإطلالات اليومية.",
    story: "الطبقة الأساسية التي يُعتمد عليها في كل أطقم التشكيلة.",
    details: [
      "قطن سنغل جيرسيه ٢٤٠ جم",
      "طباعة شعار سكرين برنت متينة",
      "شريط تدعيم للياقة",
      "قطن معالج ضد الانكماش مسبقاً",
    ],
    color_name: "أوف وايت",
    composition: "١٠٠٪ قطن مصري فاخر",
    structure: "قطن سنغل جيرسيه متماسك ٢٤٠ جم",
    fit: "ريجلر (عادي)",
    fit_notes: "اختر مقاسك المعتاد، أو مقاساً أكبر لقصة واسعة مريحة.",
    care: "يُغسل بالمقلوب عند ٣٠ مئوية. لا تستخدم المبيضات. يُجفف تعليقاً.",
    collection: "الإصدار الأول",
    provenance: "صُنع في مصر",
    house_label: "مارسيل",
    category: "t-shirt",
  },

  // 8. COLD FRONT PUFFER VEST
  "cold-front-puffer-00008": {
    title: "فيست بافر كولد فرونت",
    description: "فيست بافر مبطن خفيف الوزن مع طبقة خارجية عازلة مقاومة للماء وسحاب ثنائي الاتجاه.",
    story: "طبقة خارجية دافئة تمنح جسمك حرية تامة في الحركة.",
    details: [
      "طبقة خارجية مقاومة للماء والرياح",
      "عزل حراري صناعي دافئ",
      "سحاب ثنائي الاتجاه معدني",
      "جيب داخلي آمن",
    ],
    color_name: "جرافيت",
    composition: "نايلون مُعاد تدويره مقاوم للعوامل الجوية",
    structure: "حشوة مبطنة خفيفة ودافئة",
    fit: "ريجلر (عادي)",
    fit_notes: "اختر مقاساً أكبر إذا كنت سترتديه فوق هودي ثقيل.",
    care: "يُنظف موضعياً عند الإمكان. يُغسل بماء بارد في دورة غسيل خفيفة.",
    collection: "الإصدار الأول",
    provenance: "صُنع في مصر",
    house_label: "مارسيل",
    category: "jacket",
  },

  // 9. SIGNATURE TRACK JACKET
  "signature-track-00009": {
    title: "جاكيت تراك سيجنتشر",
    description: "جاكيت تراك بقصة مريحة مع خطوط تباين أنيقة، ياقة مرتفعة، وأساور مرنة مريحة.",
    story: "لمسات رياضية كلاسيكية مُعاد صياغتها لتلائم موضة الشارع العصرية.",
    details: [
      "مزيج قطن ونايلون فاخر",
      "خطوط تباين دقيقة ومتناسقة",
      "ياقة مرتفعة كلاسيكية",
      "أساور مطاطية مرنة",
    ],
    color_name: "أسود / كريمي",
    composition: "مزيج قطن ونايلون فاخر",
    structure: "نسيج تراك منظم ومريح",
    fit: "ريلاكسد (مريح)",
    fit_notes: "يمنح مساحة مريحة حول الجسم لارتداء طبقات تحته.",
    care: "يُغسل بماء بارد في دورة خفيفة. تجنب كي أشرطة التباين مباشرة.",
    collection: "الإصدار الأول",
    provenance: "صُنع في مصر",
    house_label: "مارسيل",
    category: "jacket",
  },

  // 10. CORE FRENCH TERRY SWEATPANT
  "core-french-terry-00010": {
    title: "سويت بانتس فرنش تيري أساسي",
    description: "سويت بانتس بقصة مستقيمة ومريحة مع أرجل منسدلة، رباط خصر بأطراف معدنية، وجيوب عميقة.",
    story: "البنطلون اليومي المتناسق بسلاسة مع أي قطعة علوية من مارسيل.",
    details: [
      "فرنش تيري فاخر ٣٣٠ جم",
      "خصر مطاطي مريح برباط",
      "أطراف أربطة معدنية متينة",
      "جيوب جانبية عميقة",
    ],
    color_name: "أسود ليلي",
    composition: "١٠٠٪ قطن مصري ممشط فاخر",
    structure: "فرنش تيري فاخر ٣٣٠ جم",
    fit: "ريلاكسد (مريح)",
    fit_notes: "اختر مقاس خصرك المعتاد للحصول على مظهر مستقيم ومريح.",
    care: "يُغسل بالمقلوب عند ٣٠ مئوية. يُجفف تعليقاً. تجنب المبيضات.",
    collection: "الإصدار الأول",
    provenance: "صُنع في مصر",
    house_label: "مارسيل",
    category: "other",
  },
};

// Title match lookup (case-insensitive)
const TITLE_LOOKUP_AR: Record<string, string> = {
  "EAGLE HEAVYWEIGHT HOODIE": "eagle-heavyweight-00001",
  "ARCHIVE ZIP HOODIE": "archive-zip-hoodie-00002",
  "NILE BLUE BOX CREWNECK": "nile-blue-box-00003",
  "DAILY WEIGHT TEE": "daily-weight-tee-00004",
  "RAW EDGE FOREST HOODIE": "raw-edge-forest-00005",
  "STREET CUT CARGO": "street-cut-cargo-00006",
  "MONO LOGO TEE": "mono-logo-tee-00007",
  "COLD FRONT PUFFER VEST": "cold-front-puffer-00008",
  "SIGNATURE TRACK JACKET": "signature-track-00009",
  "CORE FRENCH TERRY SWEATPANT": "core-french-terry-00010",
};

// Dictionary for standard attributes
export const CATEGORY_TRANSLATIONS: Record<string, { en: string; ar: string }> = {
  hoodie: { en: "Hoodie", ar: "هودي" },
  crewneck: { en: "Crewneck", ar: "كروينك" },
  hoodies: { en: "Hoodies", ar: "هوديز" },
  sweatshirt: { en: "Sweatshirt", ar: "سويت شيرت" },
  "t-shirt": { en: "T-Shirt", ar: "تيشيرت" },
  jeans: { en: "Jeans / Cargo", ar: "كارجو / بنطلون" },
  jacket: { en: "Jacket", ar: "جاكيت" },
  coat: { en: "Coat", ar: "بالطو" },
  other: { en: "Other", ar: "أخرى" },
};

export const COLOR_TRANSLATIONS: Record<string, string> = {
  black: "أسود",
  "off white": "أوف وايت",
  white: "أبيض",
  grey: "رمادي",
  gray: "رمادي",
  "lead grey": "رصاصي",
  beige: "بيج",
  navy: "كحلي",
  olive: "زيتي",
  burgundy: "بورجوندي",
  pink: "بينك",
  "baby blue": "بيبي بلو",
  yellow: "أصفر",
  // 10 Additional Essential Colors
  brown: "بني",
  "chocolate brown": "بني شوكولاتة",
  camel: "جملي",
  charcoal: "فحمي",
  "forest green": "أخضر غابي",
  "sage green": "أخضر سيج",
  "royal blue": "أزرق ملكي",
  red: "أحمر",
  orange: "برتقالي",
  "lilac / lavender": "لافندر / ليلكي",
  // Friendly matching
  "washed black": "أسود مغسول",
  "midnight black": "أسود ليلي",
  "pure white": "أبيض ناصع",
  "concrete grey": "رمادي",
  "vintage olive": "زيتي",
  "nile blue": "بيبي بلو",
};

export const FIT_TRANSLATIONS: Record<string, string> = {
  oversized: "أوفر سايز (واسع)",
  "oversized boxy": "أوفر سايز بوكسي",
  boxy: "بوكسي (قصة مربعة)",
  relaxed: "ريلاكسد (مريح)",
  regular: "ريجلر (عادي)",
  tailored: "مفصل (محدد)",
};

export interface ProductArabicTranslation {
  title?: string;
  description?: string;
  story?: string;
  details?: string[];
  tags?: string[];
  color_name?: string;
  composition?: string;
  structure?: string;
  fit?: string;
  fit_notes?: string;
  care?: string;
  collection?: string;
  provenance?: string;
  category?: string;
}

const STYLING_NOTES_PARSE_CACHE = new Map<string, ProductArabicTranslation | null>();
const PRODUCT_TRANSLATION_CACHE = new Map<string, TranslatedProduct>();

export function parseArabicFromStylingNotes(styling_notes?: string | null): ProductArabicTranslation | null {
  if (!styling_notes) return null;
  const cached = STYLING_NOTES_PARSE_CACHE.get(styling_notes);
  if (cached !== undefined) return cached;

  const trimmed = styling_notes.trim();
  if (!trimmed.startsWith("{")) {
    STYLING_NOTES_PARSE_CACHE.set(styling_notes, null);
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && parsed.ar) {
      const res = parsed.ar as ProductArabicTranslation;
      STYLING_NOTES_PARSE_CACHE.set(styling_notes, res);
      return res;
    }
  } catch {
    // Ignore invalid JSON
  }
  STYLING_NOTES_PARSE_CACHE.set(styling_notes, null);
  return null;
}

export function encodeArabicToStylingNotes(
  existingNotes: string | null | undefined,
  arabicData: ProductArabicTranslation
): string {
  let baseObj: Record<string, unknown> = {};
  if (existingNotes && existingNotes.trim().startsWith("{")) {
    try {
      baseObj = JSON.parse(existingNotes.trim());
    } catch {
      baseObj = {};
    }
  }
  baseObj.ar = arabicData;
  return JSON.stringify(baseObj);
}

export function smartArabicTitle(title: string): string {
  if (!title) return "";
  let ar = title;
  ar = ar.replace(/\bHEAVYWEIGHT\b/gi, "ثقيل الوزن");
  ar = ar.replace(/\bHOODIE\b/gi, "هودي");
  ar = ar.replace(/\bCREWNECK\b/gi, "كروينك");
  ar = ar.replace(/\bSWEATSHIRT\b/gi, "سويت شيرت");
  ar = ar.replace(/\bZIP\b/gi, "بسحاب");
  ar = ar.replace(/\bOVERSIZED\b/gi, "أوفر سايز");
  ar = ar.replace(/\bBOX\b/gi, "بوكسي");
  ar = ar.replace(/\bBOXY\b/gi, "بوكسي");
  ar = ar.replace(/\bARCHIVE\b/gi, "أرشيف");
  ar = ar.replace(/\bEAGLE\b/gi, "النسر");
  ar = ar.replace(/\bCORE\b/gi, "الأساسي");
  ar = ar.replace(/\bDROP 0?1\b/gi, "الإصدار الأول");
  return ar;
}

/**
 * Translates a title and slug to the target language.
 */
export function translateTitle(
  title: string,
  slug?: string,
  lang: SupportedLanguage = "en",
  styling_notes?: string | null
): string {
  if (lang === "en") return title;
  const customAr = parseArabicFromStylingNotes(styling_notes);
  if (customAr?.title?.trim()) return customAr.title.trim();
  const slugKey = slug?.toLowerCase().trim();
  const titleKey = title?.trim().toUpperCase();
  const matched =
    (slugKey && PRODUCT_TRANSLATIONS_AR[slugKey]?.title) ||
    (titleKey && TITLE_LOOKUP_AR[titleKey] && PRODUCT_TRANSLATIONS_AR[TITLE_LOOKUP_AR[titleKey]]?.title);
  return matched || smartArabicTitle(title) || title;
}

/**
 * Translates a color name.
 */
export function translateColor(color?: string | null, lang: SupportedLanguage = "en"): string {
  if (!color) return "";
  if (lang === "en") return color;
  const lower = color.toLowerCase().trim();
  return COLOR_TRANSLATIONS[lower] || color;
}

/**
 * Translates a Product into the target language.
 * When lang === 'en', returns the product as-is with originalTitle.
 * When lang === 'ar', returns the translated fields from curated dictionary or smart fallback.
 */
export function translateProduct(product: Product, lang: SupportedLanguage = "en"): TranslatedProduct {
  const cacheKey = `${product.id || product.slug || product.title}_${lang}_${product.styling_notes || ""}`;
  const cached = PRODUCT_TRANSLATION_CACHE.get(cacheKey);
  if (cached) return cached;

  if (lang === "en") {
    const resEn: TranslatedProduct = {
      ...product,
      originalTitle: product.title,
    };
    PRODUCT_TRANSLATION_CACHE.set(cacheKey, resEn);
    return resEn;
  }

  // 1. Check if the product has custom Arabic translations embedded from the Admin Dashboard
  const customAr = parseArabicFromStylingNotes(product.styling_notes);

  // Color translation
  const colorLower = (product.color_name || "").toLowerCase().trim();
  const translatedColor = customAr?.color_name || COLOR_TRANSLATIONS[colorLower] || product.color_name;

  // Fit translation
  const fitLower = (product.fit || "").toLowerCase().trim();
  const translatedFit = customAr?.fit || FIT_TRANSLATIONS[fitLower] || product.fit;

  // Category translation
  const catLower = (product.category || "").toLowerCase().trim();
  const translatedCategory = customAr?.category || CATEGORY_TRANSLATIONS[catLower]?.ar || product.category;

  // 2. Check by slug or title or id in static curated dictionary
  const slugKey = product.slug?.toLowerCase().trim();
  const titleKey = product.title?.trim().toUpperCase();
  const matchedSlug =
    (slugKey && PRODUCT_TRANSLATIONS_AR[slugKey] ? slugKey : null) ||
    (titleKey && TITLE_LOOKUP_AR[titleKey] ? TITLE_LOOKUP_AR[titleKey] : null);

  const translation = matchedSlug ? PRODUCT_TRANSLATIONS_AR[matchedSlug] : undefined;

  let result: TranslatedProduct;

  if (customAr) {
    result = {
      ...product,
      originalTitle: product.title,
      title: customAr.title || translation?.title || product.title,
      description: customAr.description || translation?.description || product.description,
      story: customAr.story || translation?.story || product.story,
      details:
        customAr.details && customAr.details.length > 0
          ? customAr.details
          : (translation?.details && translation.details.length > 0 ? translation.details : product.details),
      tags:
        customAr.tags && customAr.tags.length > 0
          ? customAr.tags
          : product.tags,
      color_name: customAr.color_name || translation?.color_name || translatedColor,
      composition: customAr.composition || translation?.composition || product.composition,
      structure: customAr.structure || translation?.structure || product.structure,
      fit: customAr.fit || translation?.fit || translatedFit,
      fit_notes: customAr.fit_notes || translation?.fit_notes || product.fit_notes,
      care: customAr.care?.trim() || translation?.care || UI_TRANSLATIONS.ar.washingDefault,
      collection: customAr.collection || "الإصدار الأول",
      provenance: customAr.provenance || "صُنع في مصر",
      house_label: "مارسيل",
      category: translatedCategory,
    };
  } else if (translation) {
    result = {
      ...product,
      originalTitle: product.title,
      title: translation.title || product.title,
      description: translation.description || product.description,
      story: translation.story || product.story,
      details: translation.details && translation.details.length > 0 ? translation.details : product.details,
      color_name: translation.color_name || translatedColor,
      composition: translation.composition || product.composition,
      structure: translation.structure || product.structure,
      fit: translation.fit || translatedFit,
      fit_notes: translation.fit_notes || product.fit_notes,
      care: translation.care || UI_TRANSLATIONS.ar.washingDefault,
      collection: translation.collection || "الإصدار الأول",
      provenance: translation.provenance || "صُنع في مصر",
      house_label: translation.house_label || "مارسيل",
      category: translation.category || translatedCategory,
    };
  } else {
    // Fallback translation for dynamically added products
    result = {
      ...product,
      originalTitle: product.title,
      title: smartArabicTitle(product.title),
      color_name: translatedColor,
      fit: translatedFit,
      category: translatedCategory,
      composition:
        product.composition?.replace(/100%\s*Egyptian\s*Cotton/gi, "١٠٠٪ قطن مصري فاخر") || product.composition,
      structure:
        product.structure
          ?.replace(/GSM/gi, "جم")
          ?.replace(/heavyweight/gi, "ثقيل الوزن")
          ?.replace(/French Terry/gi, "ميلتون فرنسي") || product.structure,
      care: UI_TRANSLATIONS.ar.washingDefault,
      provenance: product.provenance === "EGYPT" ? "صُنع في مصر" : product.provenance,
      collection: product.collection === "DROP 01" ? "الإصدار الأول" : product.collection,
    };
  }

  PRODUCT_TRANSLATION_CACHE.set(cacheKey, result);
  return result;
}

// UI Dictionary for storefront components
export const UI_TRANSLATIONS = {
  en: {
    // Header
    bag: "Bag",
    langSwitcherLabel: "Switch language to Arabic",
    brandTagline: "Made to Be Different",
    
    // Product Detail
    sizeGuideButton: "Size Guide ↓",
    sizeLabel: "Size:",
    addToBag: "Add to Bag",
    addedViewBag: "Added · View in Bag →",
    egpCurrency: "EGP",
    
    // Accordions
    detailsComposition: "Details & Composition",
    sizeMeasurements: "Size & Measurements",
    careShipping: "Care & Shipping",
    recommendedDrops: "Recommended Drops",
    atelierLabel: "MARSEL ATELIER",
    
    // Sizing Table & Technical Graphic
    fitRecommendationSentence: "Take your regular size for the intended oversized fit.",
    thSize: "Size",
    thChest: "Chest (A)",
    thLength: "Length (B)",
    thShoulder: "Shoulder (C)",
    thSleeve: "Sleeve (D)",
    measurementKey: "Technical Measurement Key",
    chestDesc: "Pit to pit (flat)",
    lengthDesc: "Collar to hem",
    shoulderDesc: "Seam to seam",
    sleeveDesc: "Drop shoulder to cuff",
    
    // Specs
    fabricLabel: "Fabric",
    structureLabel: "Structure",
    weightLabel: "Weight",
    originLabel: "Origin",
    colorLabel: "Color",
    categoryLabel: "Category",
    fitLabel: "Fit",
    compositionLabel: "Composition",
    
    // Care & Shipping
    washingLabel: "Washing & Maintenance:",
    washingDefault: "Machine wash cold at 30°C inside out. Do not bleach. Hang dry in shade. Warm iron on reverse side. Do not dry clean.",
    deliveryLabel: "Delivery & Returns:",
    deliveryDefault: "Express shipping across Egypt within 2–4 business days. On-delivery inspection available with the courier. Items in original condition can be returned or exchanged within 14 days.",
    
    // Bag Drawer
    shoppingBag: "Shopping Bag",
    bagEmpty: "Your bag is empty",
    bagEmptySub: "Discover our latest drop and pieces.",
    exploreCollection: "Explore Collection",
    subtotal: "Subtotal",
    checkoutButton: "Checkout",
    bagCashNotice: "Cash on delivery across all Egypt governorates",
    remove: "Remove",
    
    // Footer
    about: "ABOUT",
    faq: "FAQ",
    trackOrder: "TRACK ORDER",
    returnsExchanges: "RETURNS & EXCHANGES",
    terms: "TERMS",
    privacy: "PRIVACY",
    allRightsReserved: "ALL RIGHTS RESERVED",
    cairoEgypt: "CAIRO, EGYPT",
    
    // Empty state
    dropComingSoon: "Drop coming soon. Follow our updates.",
  },
  ar: {
    // Header
    bag: "السلة",
    langSwitcherLabel: "تغيير اللغة إلى الإنجليزية",
    brandTagline: "صُنع ليكون مختلفاً",
    
    // Product Detail
    sizeGuideButton: "دليل المقاسات ↓",
    sizeLabel: "المقاس:",
    addToBag: "أضف إلى السلة",
    addedViewBag: "تمت الإضافة · عرض السلة ←",
    egpCurrency: "ج.م",
    
    // Accordions
    detailsComposition: "التفاصيل والخامات",
    sizeMeasurements: "المقاسات والقياسات",
    careShipping: "العناية والشحن",
    recommendedDrops: "قطع مقترحة لك",
    atelierLabel: "مارسيل أتيلييه",
    
    // Sizing Table & Technical Graphic
    fitRecommendationSentence: "اختر مقاسك المعتاد للحصول على القصة الواسعة المقصودة.",
    thSize: "المقاس",
    thChest: "الصدر (A)",
    thLength: "الطول (B)",
    thShoulder: "الكتف (C)",
    thSleeve: "الكم (D)",
    measurementKey: "دليل القياسات الفني",
    chestDesc: "من الإبط للإبط (مفرود)",
    lengthDesc: "من الياقة إلى الحاشية",
    shoulderDesc: "من الخياطة إلى الخياطة",
    sleeveDesc: "من الكتف المنسدل إلى المعصم",
    
    // Specs
    fabricLabel: "الخامة",
    structureLabel: "النسيج",
    weightLabel: "الوزن",
    originLabel: "بلد المنشأ",
    colorLabel: "اللون",
    categoryLabel: "الفئة",
    fitLabel: "القصة",
    compositionLabel: "الخامة",
    
    // Care & Shipping
    washingLabel: "تعليمات الغسيل والعناية:",
    washingDefault: "يُغسل في الغسالة بماء بارد عند ٣٠ درجة مئوية بالمقلوب. لا تستخدم المبيضات. يُجفف تعليقاً في الظل. كَيّ خفيف على الوجه الداخلي. تجنب التنظيف الجاف.",
    deliveryLabel: "الشحن والاسترجاع:",
    deliveryDefault: "شحن سريع لكافة محافظات مصر خلال ٢ إلى ٤ أيام عمل. معاينة المنتج متاحة مع مندوب التوصيل قبل الاستلام. إمكانية الاستبدال والاسترجاع خلال ١٤ يوماً للمنتجات بحالتها الأصلية.",
    
    // Bag Drawer
    shoppingBag: "حقيبة التسوق",
    bagEmpty: "حقيبتك فارغة",
    bagEmptySub: "اكتشف أحدث إصداراتنا وقطعنا المميزة.",
    exploreCollection: "تصفح التشكيلة",
    subtotal: "المجموع الفرعي",
    checkoutButton: "إتمام الطلب",
    bagCashNotice: "الدفع عند الاستلام متاح لجميع محافظات مصر",
    remove: "حذف",
    
    // Footer
    about: "من نحن",
    faq: "الأسئلة الشائعة",
    trackOrder: "تتبع طلبك",
    returnsExchanges: "الاسترجاع والاستبدال",
    terms: "الشروط والأحكام",
    privacy: "الخصوصية",
    allRightsReserved: "جميع الحقوق محفوظة",
    cairoEgypt: "القاهرة، مصر",
    
    // Empty state
    dropComingSoon: "الإصدار قريباً. تابع تحديثاتنا.",
  },
} as const;

export type TranslationKey = keyof typeof UI_TRANSLATIONS.en;
