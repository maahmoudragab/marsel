import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { COLOR_TRANSLATIONS, FIT_TRANSLATIONS, CATEGORY_TRANSLATIONS } from "@/lib/translations";

// High-precision Egyptian fashion & streetwear replacements for Marsel
const FASHION_REPLACEMENTS: [RegExp, string][] = [
  [/\bdouble-layered hood\b/gi, "كابيشو دبل مبطن بطبقتين"],
  [/\bdouble layered hood\b/gi, "كابيشو دبل مبطن بطبقتين"],
  [/\bdropped shoulders?\b/gi, "أكتاف ساقطة دروب شولدر"],
  [/\bbrushed fleece\b/gi, "ميلتون مبطن ناعم"],
  [/\bfrench terry\b/gi, "ميلتون فرنسي فاخر"],
  [/\bheavyweight fleece\b/gi, "ميلتون قطني تقيل فاخر"],
  [/\bheavyweight\b/gi, "ثقيل الوزن"],
  [/\boversized boxy\b/gi, "أوفر سايز بوكسي"],
  [/\boversized\b/gi, "أوفر سايز"],
  [/\bboxy fit\b/gi, "قصة بوكسي مريحة"],
  [/\bboxy\b/gi, "بوكسي"],
  [/\bhoodie\b/gi, "هودي"],
  [/\bcrewneck\b/gi, "كروينك"],
  [/\bsweatshirt\b/gi, "سويت شيرت"],
  [/\bzip hoodie\b/gi, "هودي بسوستة معدنية"],
  [/\bwashed black\b/gi, "أسود مغسول"],
  [/\bconcrete grey\b/gi, "رمادي خرساني"],
  [/\bdesert sand\b/gi, "رملي صحراوي"],
  [/\bnile blue\b/gi, "أزرق نيلي"],
  [/\bvintage olive\b/gi, "زيتي فينتاج"],
  [/\bmidnight black\b/gi, "أسود ليلي"],
  [/\bpure white\b/gi, "أبيض ناصع"],
  [/\boff white\b/gi, "أوف وايت"],
  [/\braw ecru\b/gi, "إيكرو طبيعي"],
  [/\bwashed navy\b/gi, "كحلي مغسول"],
  [/\bdrop 0?1\b/gi, "الدروب الأول (Drop 01)"],
  [/\bdrop 0?2\b/gi, "الدروب الثاني (Drop 02)"],
  [/\begyptian cotton\b/gi, "قطن مصري فاخر"],
  [/\b100% cotton\b/gi, "١٠٠٪ قطن مصري"],
  [/\b100% egyptian cotton\b/gi, "١٠٠٪ قطن مصري فاخر"],
  [/\bribbed cuffs\b/gi, "أساور مضلعة متينة"],
  [/\bhigh-density embroidery\b/gi, "تطريز عالي الكثافة بارز"],
  [/\bkangaroo pocket\b/gi, "جيب كانغرو أمامي"],
  [/\bmetal zipper\b/gi, "سوستة معدنية متينة"],
];

/**
 * Egyptian Streetwear Polish:
 * Cleans machine translation blunders and transforms literal phrasing into authentic,
 * stylish Egyptian streetwear Arabic (Cairo streetwear atelier tone).
 */
function polishEgyptianStreetwear(text: string, fieldName?: string): string {
  if (!text) return "";
  let res = text;

  // Title-specific streetwear polish
  if (fieldName === "title") {
    res = res.replace(/سترة إيجل ثقيلة الوزن/gi, "هودي النسر ثقيل الوزن");
    res = res.replace(/سترة إيجل/gi, "هودي النسر");
    res = res.replace(/سترة النسر/gi, "هودي النسر");
    res = res.replace(/إيجل/gi, "النسر");
    res = res.replace(/سترة هودي/gi, "هودي");
    res = res.replace(/سترة/gi, "هودي");
    res = res.replace(/زُنط/gi, "هودي");
    res = res.replace(/هوديي/gi, "هودي");
    res = res.replace(/كنزة/gi, "كروينك");
    res = res.replace(/ثقيلة الوزن/gi, "ثقيل الوزن");
    res = res.replace(/الرمز البريدي/gi, "سوستة");
  }

  // Editorial Story & Inspiration polish
  if (fieldName === "story" || fieldName === "description") {
    res = res.replace(/بنيت كـ?|تم تصميمه كـ?|تم بناؤه كـ?|صنع كـ?/gi, "صُمم ليكون ");
    res = res.replace(/طبقة أساسية من ملابس الشارع|ملابس الشارع الأساسية/gi, "طبقتك الأساسية في عالم الستريت وير");
    res = res.replace(/ملابس الشارع/gi, "الستريت وير");
    res = res.replace(/أمسيات القاهرة/gi, "ليالي وسهرات القاهرة");
    res = res.replace(/أمسيات/gi, "ليالي");
    res = res.replace(/ستارة مريحة ومنظمة|ستارة منظمة ومريحة|ستارة منظمة|ستارة/gi, "قصة واسعة مريحة ومظهر متماسك فاخر");
    res = res.replace(/ثنية مريحة|ثنية منظمة|ثنية/gi, "قصة مريحة ومظهر متماسك");
    res = res.replace(/صورة ظلية/gi, "قصة ومظهر");
    res = res.replace(/بارد في القاهرة/gi, "الباردة في القاهرة");
  }

  // Offers & Storefront Banner specific polish
  if (fieldName === "bannerText" || fieldName === "title" || fieldName === "notes") {
    res = res.replace(/توصيل مجاني/gi, "شحن مجاني");
    res = res.replace(/الشحن المجاني/gi, "شحن مجاني");
    res = res.replace(/في جميع أنحاء مصر|لكل مصر/gi, "لكافة محافظات مصر");
    res = res.replace(/في القاهرة/gi, "داخل القاهرة");
    res = res.replace(/لجميع الطلبات|لكل الطلبات/gi, "لكافة الطلبات");
    res = res.replace(/لفترة محدودة فقط/gi, "لفترة محدودة");
    res = res.replace(/عرض خاص:|عرض خاص/gi, "عرض حصري");
    res = res.replace(/انفق/gi, "اشتري بقيمة");
    res = res.replace(/عند الخروج|عند الدفع/gi, "عند إتمام الطلب");
  }

  // General Streetwear vocabulary adjustments (Egyptian atelier style)
  res = res.replace(/غطاء محرك السيارة مزدوج الطبقات|غطاء محرك السيارة المزدوج/gi, "كابيشو دبل مبطن بطبقتين");
  res = res.replace(/غطاء محرك السيارة|غطاء محرك/gi, "كابيشو مبطن");
  res = res.replace(/غطاء رأس مزدوج/gi, "كابيشو دبل مبطن");
  res = res.replace(/غطاء رأس/gi, "كابيشو");
  res = res.replace(/الرمز البريدي هوديي/gi, "هودي بسوستة");
  res = res.replace(/الرمز البريدي/gi, "سوستة معدنية");
  res = res.replace(/سحاب معدني/gi, "سوستة معدنية");
  res = res.replace(/سحاب/gi, "سوستة");

  // Colors
  res = res.replace(/مغسول باللون الأسود/gi, "أسود مغسول");
  res = res.replace(/مغسول باللون الكحلي/gi, "كحلي مغسول");
  res = res.replace(/مغسول باللون/gi, "لون مغسول");

  // Fabrics & Weights
  res = res.replace(/تيري فرنسي|تيري الفرنسي|الفرنسي تيري/gi, "ميلتون فرنسي فاخر");
  res = res.replace(/صوف مصقول/gi, "ميلتون مبطن ناعم");
  res = res.replace(/صوف ناعم/gi, "ميلتون ناعم فاخر");
  res = res.replace(/صوف ثقيل الوزن|صوف ثقيل/gi, "ميلتون تقيل فاخر");
  res = res.replace(/صوف/gi, "ميلتون قطني");
  res = res.replace(/جي إس إم/gi, "جم");
  res = res.replace(/جرام في المتر المربع|جرام لكل متر مربع/gi, "جم");

  // Fits & Silhouettes
  res = res.replace(/صندوقي كبير الحجم|كبير الحجم الذي يشبه الصندوق/gi, "أوفر سايز بوكسي");
  res = res.replace(/كبير الحجم/gi, "أوفر سايز");
  res = res.replace(/صندوقي/gi, "بوكسي");
  res = res.replace(/أكتاف منسدلة|أكتاف متدلية/gi, "أكتاف ساقطة دروب شولدر");

  // Drops & Releases
  res = res.replace(/قطرة 0?1/gi, "الدروب الأول (Drop 01)");
  res = res.replace(/قطرة 0?2/gi, "الدروب الثاني (Drop 02)");
  res = res.replace(/قطرة 0?3/gi, "الدروب الثالث (Drop 03)");

  // Sizing recommendations
  res = res.replace(/خذ مقاسك المعتاد للحصول على مظهر كبير الحجم|خذ مقاسك المعتاد/gi, "اختر مقاسك المعتاد للوك أوفر سايز مظبوط ومريح");
  res = res.replace(/التزم بمقاسك المعتاد/gi, "اختر مقاسك المعتاد للوك أوفر سايز مظبوط");

  return res.trim();
}

/**
 * Robust multi-strategy translation function
 */
async function translateText(
  text: string,
  targetLang: "ar" | "en" = "ar",
  sourceLang: "en" | "ar" = "en",
  fieldName?: string
): Promise<{ translated: string; detectedLang: string }> {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    return { translated: "", detectedLang: "auto" };
  }

  const lower = trimmed.toLowerCase();

  // Step 1: Direct Streetwear Dictionary Check for exact matches
  if (targetLang === "ar") {
    if (COLOR_TRANSLATIONS[lower]) {
      return { translated: COLOR_TRANSLATIONS[lower], detectedLang: "en" };
    }
    if (FIT_TRANSLATIONS[lower]) {
      return { translated: FIT_TRANSLATIONS[lower], detectedLang: "en" };
    }
    if (CATEGORY_TRANSLATIONS[lower]?.ar) {
      return { translated: CATEGORY_TRANSLATIONS[lower].ar, detectedLang: "en" };
    }
    for (const [pattern, arTerm] of FASHION_REPLACEMENTS) {
      if (pattern.test(trimmed) && trimmed.replace(pattern, "").trim().length === 0) {
        return { translated: arTerm, detectedLang: "en" };
      }
    }
  }

  // Step 2: Google Dictionary API Endpoint (very fast and reliable)
  try {
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sourceLang}&tl=${targetLang}&q=${encodeURIComponent(
      trimmed
    )}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        const raw = typeof data[0] === "string" ? data[0] : data[0][0] || "";
        if (raw) {
          const finalResult = targetLang === "ar" ? polishEgyptianStreetwear(raw, fieldName) : raw;
          return { translated: finalResult, detectedLang: sourceLang };
        }
      }
    }
  } catch (err) {
    console.warn("Google clients5 translate error:", err);
  }

  // Step 3: MyMemory API Fallback
  try {
    const pair = `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${pair}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data.responseData?.translatedText) {
        const raw = data.responseData.translatedText;
        const finalResult = targetLang === "ar" ? polishEgyptianStreetwear(raw, fieldName) : raw;
        return { translated: finalResult, detectedLang: sourceLang };
      }
    }
  } catch (err) {
    console.warn("MyMemory translate error:", err);
  }

  return { translated: trimmed, detectedLang: sourceLang };
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    const isAuthorized = await verifySessionToken(token);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let { text, fields, targetLang = "ar", sourceLang = "en", fieldName } = body;

    // Strict validation on supported language codes
    if (!["ar", "en"].includes(targetLang)) targetLang = "ar";
    if (!["ar", "en"].includes(sourceLang)) sourceLang = "en";

    // Single text translation
    if (typeof text === "string") {
      const result = await translateText(text, targetLang, sourceLang, fieldName);
      return NextResponse.json({ success: true, ...result });
    }

    // Batch translation of multiple fields (title, category, color_name, composition, structure, fit_notes, details, tags, description, story)
    if (fields && typeof fields === "object") {
      const entries = Object.entries(fields as Record<string, string>);
      const translatedFields: Record<string, string> = {};

      await Promise.all(
        entries.map(async ([key, val]) => {
          if (!val || typeof val !== "string" || !val.trim()) {
            translatedFields[key] = "";
            return;
          }

          // If the field is multi-line (e.g. details bullet points), translate line by line
          if (val.includes("\n")) {
            const lines = val.split("\n").filter((l) => l.trim().length > 0);
            const translatedLines = await Promise.all(
              lines.map(async (line) => {
                const res = await translateText(line, targetLang, sourceLang, key);
                return res.translated;
              })
            );
            translatedFields[key] = translatedLines.join("\n");
            return;
          }

          // If the field is comma-separated tags, translate tag by tag
          if (key === "tags" && val.includes(",")) {
            const tagsList = val.split(",").map((t) => t.trim()).filter(Boolean);
            const translatedTags = await Promise.all(
              tagsList.map(async (t) => {
                const res = await translateText(t, targetLang, sourceLang, key);
                return res.translated;
              })
            );
            translatedFields[key] = translatedTags.join("، ");
            return;
          }

          const res = await translateText(val, targetLang, sourceLang, key);
          translatedFields[key] = res.translated;
        })
      );

      return NextResponse.json({
        success: true,
        fields: translatedFields,
      });
    }

    return NextResponse.json(
      { error: "Please provide either 'text' or 'fields' to translate." },
      { status: 400 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to translate.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
