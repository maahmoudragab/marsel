"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { getGalleryImages, type Product } from "@/lib/product";
import { Check } from "lucide-react";

function AccordionSection({
  id,
  title,
  isOpen,
  onToggle,
  children,
}: {
  id?: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="border-b border-black/20 scroll-mt-20">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between py-5 text-left rtl:text-right cursor-pointer transition-colors hover:opacity-75"
      >
        <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-black">
          {title}
        </span>
        <span className="text-base font-light font-mono text-black">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className="pb-8 pt-1 text-xs text-black/80 leading-relaxed space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between border-b border-black/10 py-2.5 text-xs">
      <span className="text-black/50 uppercase tracking-wider text-[11px]">{label}</span>
      <span className="uppercase font-semibold text-black tracking-wide text-right rtl:text-left">{value}</span>
    </div>
  );
}

interface SizingRow {
  size: string;
  chest: string;
  length: string;
  shoulder: string;
  sleeve: string;
}

const DEFAULT_SIZING_MAP: Record<string, Omit<SizingRow, "size">> = {
  S: { chest: "60", length: "68", shoulder: "58", sleeve: "57" },
  M: { chest: "63", length: "70", shoulder: "60", sleeve: "58" },
  L: { chest: "66", length: "72", shoulder: "62", sleeve: "59" },
  XL: { chest: "69", length: "74", shoulder: "64", sleeve: "60" },
  XXL: { chest: "72", length: "76", shoulder: "66", sleeve: "61" },
  "2XL": { chest: "72", length: "76", shoulder: "66", sleeve: "61" },
  "3XL": { chest: "75", length: "78", shoulder: "68", sleeve: "62" },
  XXXL: { chest: "75", length: "78", shoulder: "68", sleeve: "62" },
  OVERSIZED: { chest: "66", length: "72", shoulder: "62", sleeve: "59" },
  OS: { chest: "66", length: "72", shoulder: "62", sleeve: "59" },
  "ONE SIZE": { chest: "66", length: "72", shoulder: "62", sleeve: "59" },
};

function parseSizingGuide(text?: string): SizingRow[] {
  if (!text) return [];
  try {
    const trimmed = text.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }

  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const rows: SizingRow[] = [];
  for (const line of lines) {
    const match = line.match(
      /^([A-Z0-9\s-]+):\s*Chest\s*([0-9.]+)[^,]*,\s*Length\s*([0-9.]+)[^,]*,\s*Shoulder\s*([0-9.]+)[^,]*,\s*Sleeve\s*([0-9.]+)/i
    );
    if (match) {
      rows.push({
        size: match[1].trim(),
        chest: match[2].trim(),
        length: match[3].trim(),
        shoulder: match[4].trim(),
        sleeve: match[5].trim(),
      });
    }
  }
  return rows;
}

export default function ProductDetailClient({
  product,
  recommendations,
}: {
  product: Product;
  recommendations: Product[];
}) {
  const { addToCart, openDrawer } = useCart();
  const { dir, isArabic, t, translateProduct, formatPrice } = useLanguage();
  const localized = translateProduct(product);

  useEffect(() => {
    const brand = isArabic ? "مارسيل" : "MARSEL";
    const title = localized.title || product.title;
    document.title = `${brand} | ${title.toUpperCase()}`;
  }, [isArabic, localized.title, product.title]);

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  // Default open section is "details"
  const [openSection, setOpenSection] = useState<string>("details");

  const gallery = getGalleryImages(product);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Duplicate slides if exactly 2 images so Embla has sufficient buffer to loop infinitely without jitter
  const slides = useMemo(() => {
    if (gallery.length === 2) return [...gallery, ...gallery];
    return gallery;
  }, [gallery]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: gallery.length > 1,
    duration: 25,
    skipSnaps: false,
    dragFree: false,
    direction: dir,
  });

  useEffect(() => {
    setSelectedSize(product.sizes[0] ?? "L");
    setQuantity(1);
    setActiveImage(0);
    setIsAdded(false);
  }, [product]);

  useEffect(() => {
    if (!emblaApi) return;
    const syncActiveImage = () => {
      const snap = emblaApi.selectedScrollSnap();
      setActiveImage(snap % gallery.length);
    };
    syncActiveImage();
    emblaApi.on("select", syncActiveImage);
    emblaApi.on("reInit", syncActiveImage);
    return () => {
      emblaApi.off("select", syncActiveImage);
      emblaApi.off("reInit", syncActiveImage);
    };
  }, [emblaApi, gallery.length]);

  const handleThumbnailClick = (index: number) => {
    if (!emblaApi) return;
    const currentSnap = emblaApi.selectedScrollSnap();
    const currentActive = currentSnap % gallery.length;
    if (currentActive === index) return;

    if (gallery.length === 2) {
      if (index === 1 && currentActive === 0) {
        emblaApi.scrollNext();
      } else if (index === 0 && currentActive === 1) {
        emblaApi.scrollPrev();
      } else {
        emblaApi.scrollTo(index);
      }
    } else {
      emblaApi.scrollTo(index);
    }
  };

  useEffect(() => {
    if (thumbnailRefs.current[activeImage]) {
      thumbnailRefs.current[activeImage]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeImage]);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    for (let i = 0; i < quantity; i += 1) {
      addToCart(product, selectedSize);
    }
    setIsAdded(true);
  };

  const toggleSection = (key: string) =>
    setOpenSection((curr) => (curr === key ? "" : key));

  const handleScrollToSize = () => {
    setOpenSection("size");
    setTimeout(() => {
      const el = document.getElementById("size-measurements-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // Dynamic Sizing Grid based on actual available product sizes & measurements
  const sizingData: SizingRow[] = useMemo(() => {
    const parsedGuideRows = parseSizingGuide(product.size_guide);
    const guideMap = new Map<string, SizingRow>();
    parsedGuideRows.forEach((r) => {
      if (r && r.size) {
        guideMap.set(r.size.trim().toUpperCase(), r);
      }
    });

    const availableSizes = (product.sizes || []).map((s) => s.trim()).filter(Boolean);

    if (availableSizes.length > 0) {
      return availableSizes.map((size) => {
        const upper = size.toUpperCase();
        const custom = guideMap.get(upper);
        if (custom) {
          return {
            size,
            chest: custom.chest || "-",
            length: custom.length || "-",
            shoulder: custom.shoulder || "-",
            sleeve: custom.sleeve || "-",
          };
        }
        const def = DEFAULT_SIZING_MAP[upper];
        if (def) {
          return {
            size,
            ...def,
          };
        }
        return {
          size,
          chest: "-",
          length: "-",
          shoulder: "-",
          sleeve: "-",
        };
      });
    }

    if (parsedGuideRows.length > 0) {
      return parsedGuideRows;
    }

    return [
      { size: "S", chest: "60", length: "68", shoulder: "58", sleeve: "57" },
      { size: "M", chest: "63", length: "70", shoulder: "60", sleeve: "58" },
      { size: "L", chest: "66", length: "72", shoulder: "62", sleeve: "59" },
      { size: "XL", chest: "69", length: "74", shoulder: "64", sleeve: "60" },
      { size: "XXL", chest: "72", length: "76", shoulder: "66", sleeve: "61" },
    ];
  }, [product.sizes, product.size_guide]);

  return (
    <>
      {/* Localized Breadcrumb navigation */}
      <div className="relative z-10 py-1 sm:py-1">
        <nav className="text-[11px] font-mono uppercase tracking-wider text-black/50 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-black transition-colors font-mono">
            {isArabic ? "مارسيل" : "marsel"}
          </Link>
          <span>/</span>
          <span className="text-black font-semibold truncate max-w-[240px] sm:max-w-md">
            {localized.title}
          </span>
        </nav>
      </div>

      {/* 1. TOP HERO SECTION */}
      <section className="pt-0.5 pb-2 lg:pb-3 w-full h-auto lg:h-[calc(100dvh-7.5rem)] lg:max-h-[calc(100dvh-7.5rem)] min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-stretch">
        {/* Gallery */}
        <div className="flex flex-col sm:flex-row gap-3 min-w-0 min-h-0 w-full h-full items-start lg:items-stretch">
          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="order-2 sm:order-1 flex sm:flex-col gap-2 shrink-0 overflow-x-auto sm:overflow-y-auto py-1 sm:py-0 max-w-full sm:max-h-full">
              {gallery.map((src, index) => {
                const isActive = activeImage === index;
                return (
                  <button
                    key={`${src}-${index}`}
                    ref={(el) => {
                      thumbnailRefs.current[index] = el;
                    }}
                    type="button"
                    onClick={() => handleThumbnailClick(index)}
                    aria-label={`View image ${index + 1}`}
                    className={`relative w-12 h-12 sm:w-16 sm:h-16 aspect-square border p-0 flex items-center justify-center cursor-pointer transition-colors shrink-0 bg-white overflow-hidden ${
                      isActive
                        ? "border-black"
                        : "border-black/20 hover:border-black/50"
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="128px"
                      quality={85}
                      className="object-contain pointer-events-none p-0.5"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Visual Display */}
          <div className="order-1 sm:order-2 relative flex-1 min-w-0 min-h-0 w-full h-full max-h-full aspect-square border border-black/15 bg-white overflow-hidden select-none">
            <div
              ref={emblaRef}
              className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
            >
              <div
                className="flex h-full"
                style={{ touchAction: "pan-y pinch-zoom" }}
              >
                {slides.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="relative min-w-0 flex-[0_0_100%] h-full flex items-center justify-center p-0 select-none overflow-hidden"
                  >
                    <Image
                      src={src}
                      alt={`${localized.title} — MARSEL (مارسيل) View ${index + 1}`}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                      quality={95}
                      draggable={false}
                      className="object-contain pointer-events-none select-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Studio Details & Actions */}
        <div className="flex flex-col justify-between w-full h-auto lg:h-full min-h-0 p-0 gap-4 lg:gap-0 text-left rtl:text-right">
          {/* Top of Right Column */}
          <div>
            <span className="text-[10px] uppercase tracking-widest text-black/50 font-semibold block">
              {localized.collection || "DROP 01"} — {localized.provenance || "EGYPT"}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight mt-1.5 text-black">
              {localized.title}
            </h1>
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-xl sm:text-2xl font-bold font-mono text-black">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-sm text-black/40 line-through font-mono">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>
          </div>

          {/* Middle: Quick Specification Rows */}
          <div className="space-y-0 border-t border-black/10 my-auto py-2">
            <SpecRow label={t("fitLabel")} value={localized.fit || "Oversized Boxy"} />
            <SpecRow label={t("compositionLabel")} value={localized.composition || "100% Egyptian Cotton"} />
            <SpecRow label={t("structureLabel")} value={localized.structure} />
            <SpecRow label={t("colorLabel")} value={localized.color_name} />
            <SpecRow label={t("categoryLabel")} value={localized.category} />
          </div>

          {/* Bottom of Right Column: Size Selector & Add to Bag */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-black/50 font-mono">
                {t("sizeLabel")} <span className="font-bold text-black">{selectedSize}</span>
              </span>
              <button
                type="button"
                onClick={handleScrollToSize}
                className="text-[10px] uppercase tracking-widest text-black/70 hover:text-black underline underline-offset-4 cursor-pointer transition-colors font-semibold"
              >
                {t("sizeGuideButton")}
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setSelectedSize(size);
                    setIsAdded(false);
                  }}
                  className={`min-w-12 h-10 px-3 text-xs font-mono font-bold border transition-colors cursor-pointer ${
                    selectedSize === size
                      ? "bg-black text-[#f6f5f2] border-black"
                      : "border-black/25 text-black/70 hover:border-black hover:text-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {isAdded ? (
              <button
                type="button"
                onClick={openDrawer}
                className="flex items-center justify-center gap-2 w-full h-12 mt-5 bg-black text-[#f6f5f2] text-xs font-bold uppercase tracking-widest hover:bg-black/85 cursor-pointer shadow-sm animate-fade-in"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{t("addedViewBag")}</span>
              </button>
            ) : (
              <div className="flex gap-2 mt-5 h-12">
                <div className="flex items-center border border-black/25 shrink-0 bg-white/40">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                    className="w-10 h-full cursor-pointer text-base hover:bg-black/5 flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-9 text-center text-xs font-mono font-bold">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((v) => v + 1)}
                    className="w-10 h-full cursor-pointer text-base hover:bg-black/5 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-black text-[#f6f5f2] text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-black/85 transition-colors shadow-sm"
                >
                  {t("addToBag")}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. REFINED COLLAPSIBLES */}
      <section className="border-t border-black/25 mt-4">
        {/* 1. DETAILS & COMPOSITION (TOP & DEFAULT OPEN) */}
        <AccordionSection
          title={t("detailsComposition")}
          isOpen={openSection === "details"}
          onToggle={() => toggleSection("details")}
        >
          <div className="max-w-2xl space-y-3 pt-1 text-left rtl:text-right">
            <p className="text-black/80">{localized.description}</p>
            {localized.story && <p className="text-black/60 italic">{localized.story}</p>}

            {localized.details && localized.details.length > 0 && (
              <ul className="list-disc list-inside space-y-1 pt-2 text-black/80">
                {localized.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pt-2 border-t border-black/10">
              <SpecRow label={t("fabricLabel")} value={localized.composition} />
              <SpecRow label={t("structureLabel")} value={localized.structure} />
              <SpecRow
                label={t("weightLabel")}
                value={
                  product.weight_grams
                    ? `${product.weight_grams} ${isArabic ? "جم" : "g"}`
                    : null
                }
              />
              <SpecRow label={t("originLabel")} value={localized.provenance || (isArabic ? "مصر" : "EGYPT")} />
            </div>

            {((localized.tags && localized.tags.length > 0) || (product.tags && product.tags.length > 0)) && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {(localized.tags && localized.tags.length > 0 ? localized.tags : product.tags || []).map((tag) => (
                  <span key={tag} className="border border-black/20 px-2 py-0.5 text-[10px] font-mono uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </AccordionSection>

        {/* 2. SIZE & MEASUREMENTS */}
        <AccordionSection
          id="size-measurements-section"
          title={t("sizeMeasurements")}
          isOpen={openSection === "size"}
          onToggle={() => toggleSection("size")}
        >
          <div className="space-y-4 pt-1 text-left rtl:text-right">
            <p className="text-black/80 text-xs sm:text-[13px] font-medium leading-relaxed">
              {localized.fit_notes || t("fitRecommendationSentence")}
            </p>

            {/* Side-by-Side: Equal Height Table & Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch pt-1">
              {/* Left: Sizing Table */}
              <div className="md:col-span-7 h-full flex flex-col justify-between">
                <div className="border border-black/20 overflow-hidden h-full flex flex-col justify-between">
                  <table className="w-full text-left rtl:text-right text-xs font-mono h-full">
                    <thead className="bg-black/5 border-b border-black/20 text-black font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">{t("thSize")}</th>
                        <th className="p-3">{t("thChest")}</th>
                        <th className="p-3">{t("thLength")}</th>
                        <th className="p-3">{t("thShoulder")}</th>
                        <th className="p-3">{t("thSleeve")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {sizingData.map((row) => (
                        <tr
                          key={row.size}
                          className="odd:bg-black/[0.04] even:bg-transparent"
                        >
                          <td className="p-3 font-bold">{row.size}</td>
                          <td className="p-3">{row.chest === "-" ? "-" : `${row.chest} ${isArabic ? "سم" : "cm"}`}</td>
                          <td className="p-3">{row.length === "-" ? "-" : `${row.length} ${isArabic ? "سم" : "cm"}`}</td>
                          <td className="p-3">{row.shoulder === "-" ? "-" : `${row.shoulder} ${isArabic ? "سم" : "cm"}`}</td>
                          <td className="p-3">{row.sleeve === "-" ? "-" : `${row.sleeve} ${isArabic ? "سم" : "cm"}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Technical Measurement Graphic */}
              <div className="md:col-span-5 border border-black/15 p-4 bg-white/40 flex flex-col items-center justify-between h-full space-y-3">
                <span className="text-[9px] font-bold uppercase tracking-widest text-black/40">
                  {t("measurementKey")}
                </span>

                <svg
                  viewBox="0 0 280 230"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full max-w-[230px] h-auto text-black"
                >
                  {/* Collar */}
                  <path
                    d="M105 45 C120 56 160 56 175 45"
                    stroke="#000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M110 43 C120 36 160 36 170 43"
                    stroke="#000"
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                  />

                  {/* Silhouette */}
                  <path
                    d="M105 45 L52 70 L34 122 L68 132 L82 92 L82 195 L198 195 L198 92 L212 132 L246 122 L228 70 L175 45"
                    stroke="#000"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    fill="#000000"
                    fillOpacity="0.02"
                  />

                  {/* Rib Details */}
                  <line x1="82" y1="190" x2="198" y2="190" stroke="#000" strokeWidth="0.8" strokeDasharray="2 2" />
                  <line x1="34" y1="118" x2="68" y2="128" stroke="#000" strokeWidth="0.8" strokeDasharray="2 2" />
                  <line x1="212" y1="128" x2="246" y2="118" stroke="#000" strokeWidth="0.8" strokeDasharray="2 2" />

                  {/* Dimension A: Chest */}
                  <line x1="82" y1="105" x2="198" y2="105" stroke="#000" strokeWidth="1.2" />
                  <circle cx="82" cy="105" r="2" fill="#000" />
                  <circle cx="198" cy="105" r="2" fill="#000" />
                  <circle cx="140" cy="105" r="7.5" fill="#f6f5f2" stroke="#000" strokeWidth="1" />
                  <text x="140" y="108.5" textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="monospace" fill="#000">A</text>

                  {/* Dimension B: Length */}
                  <line x1="165" y1="46" x2="165" y2="195" stroke="#000" strokeWidth="1.2" strokeDasharray="3 2" />
                  <circle cx="165" cy="46" r="2" fill="#000" />
                  <circle cx="165" cy="195" r="2" fill="#000" />
                  <circle cx="165" cy="150" r="7.5" fill="#f6f5f2" stroke="#000" strokeWidth="1" />
                  <text x="165" y="153.5" textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="monospace" fill="#000">B</text>

                  {/* Dimension C: Shoulder */}
                  <line x1="52" y1="62" x2="228" y2="62" stroke="#000" strokeWidth="1" />
                  <circle cx="52" cy="62" r="2" fill="#000" />
                  <circle cx="228" cy="62" r="2" fill="#000" />
                  <circle cx="140" cy="62" r="7.5" fill="#f6f5f2" stroke="#000" strokeWidth="1" />
                  <text x="140" y="65.5" textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="monospace" fill="#000">C</text>

                  {/* Dimension D: Sleeve */}
                  <line x1="52" y1="70" x2="38" y2="120" stroke="#000" strokeWidth="1" strokeDasharray="3 2" />
                  <circle cx="38" cy="120" r="2" fill="#000" />
                  <circle cx="32" cy="88" r="7.5" fill="#f6f5f2" stroke="#000" strokeWidth="1" />
                  <text x="32" y="91.5" textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="monospace" fill="#000">D</text>
                </svg>

                {/* Legend */}
                <div className="w-full text-[10px] text-black/60 font-mono space-y-1 border-t border-black/10 pt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-black">{t("thChest")}:</span>
                    <span>{t("chestDesc")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-black">{t("thLength")}:</span>
                    <span>{t("lengthDesc")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-black">{t("thShoulder")}:</span>
                    <span>{t("shoulderDesc")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-black">{t("thSleeve")}:</span>
                    <span>{t("sleeveDesc")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* 3. CARE & SHIPPING */}
        <AccordionSection
          title={t("careShipping")}
          isOpen={openSection === "care"}
          onToggle={() => toggleSection("care")}
        >
          <div className="max-w-2xl space-y-4 pt-1 text-left rtl:text-right">
            <div>
              <span className="font-bold uppercase tracking-wider text-[11px] block mb-1">
                {t("washingLabel")}
              </span>
              <p className="text-black/70">
                {localized.care || t("washingDefault")}
              </p>
            </div>

            <div className="border-t border-black/10 pt-3">
              <span className="font-bold uppercase tracking-wider text-[11px] block mb-1">
                {t("deliveryLabel")}
              </span>
              <p className="text-black/70">
                {t("deliveryDefault")}
              </p>
            </div>
          </div>
        </AccordionSection>
      </section>

      {/* 3. RECOMMENDATIONS SECTION */}
      {recommendations.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="flex items-baseline justify-between border-b border-black/20 pb-3 mb-8">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-black">
              {t("recommendedDrops")}
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-black/50 font-mono">
              {t("atelierLabel")}
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-10 gap-y-10">
            {recommendations.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
