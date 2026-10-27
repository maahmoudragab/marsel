"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Trash2,
  ImagePlus,
  Check,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Plus,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { useProducts } from "@/context/ProductContext";
import {
  ALL_SIZES,
  MAX_PRODUCT_IMAGES,
  MAX_DESIGN_IMAGES,
  emptyProductInput,
  getCoverImage,
  parseTags,
  parseDesignImages,
  encodeDesignImages,
  type Product,
  type ProductInput,
} from "@/lib/product";
import { uploadProductImageFile } from "@/lib/productImages";
import {
  parseArabicFromStylingNotes,
  encodeArabicToStylingNotes,
  PRODUCT_TRANSLATIONS_AR,
  CATEGORY_TRANSLATIONS,
  COLOR_TRANSLATIONS,
} from "@/lib/translations";

const fieldClass =
  "w-full text-xs border border-black/25 bg-white p-2.5 focus:outline-none focus:border-black transition-colors font-supreme";
const labelClass = "block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-black/80";

const PRESET_COLORS: [string, string][] = [
  // Core Essentials
  ["Black", "#0A0A0A"],
  ["Off White", "#F4F3EE"],
  ["White", "#FFFFFF"],
  ["Grey", "#8E8E93"],
  ["Lead Grey", "#4A4D52"],
  ["Beige", "#D7C4B7"],
  ["Navy", "#1B2A4A"],
  ["Olive", "#4E5743"],
  ["Burgundy", "#581825"],
  ["Pink", "#E8A598"],
  ["Baby Blue", "#9EC5DB"],
  ["Yellow", "#F2C94C"],

  // 10 Additional Essential Streetwear & Daily Colors
  ["Brown", "#4A3525"],
  ["Chocolate Brown", "#3B2219"],
  ["Camel", "#C19A6B"],
  ["Charcoal", "#262626"],
  ["Forest Green", "#2D4C3A"],
  ["Sage Green", "#8A9A86"],
  ["Royal Blue", "#1E3F66"],
  ["Red", "#B22222"],
  ["Orange", "#E65100"],
  ["Lilac / Lavender", "#BDB2CF"],
];

interface SizingRow {
  size: string;
  chest: string;
  length: string;
  shoulder: string;
  sleeve: string;
}

const DEFAULT_HOODIE_SIZING: SizingRow[] = [
  { size: "S", chest: "60", length: "68", shoulder: "58", sleeve: "57" },
  { size: "M", chest: "63", length: "70", shoulder: "60", sleeve: "58" },
  { size: "L", chest: "66", length: "72", shoulder: "62", sleeve: "59" },
  { size: "XL", chest: "69", length: "74", shoulder: "64", sleeve: "60" },
  { size: "XXL", chest: "72", length: "76", shoulder: "66", sleeve: "61" },
];

function ComboboxInput({
  label,
  value,
  options,
  onChange,
  placeholder,
  required,
  allowCustomColorHex,
  selectedColorHex,
  onColorHexChange,
  storageKey,
}: {
  label: string;
  value?: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  allowCustomColorHex?: boolean;
  selectedColorHex?: string;
  onColorHexChange?: (hex: string) => void;
  storageKey?: string;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load custom saved options from localStorage
  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(`marsel_custom_${storageKey}`);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) setCustomOptions(arr);
      }
    } catch {}
  }, [storageKey]);

  // Save new custom value to localStorage if not in list
  const saveCustomOption = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed || !storageKey || typeof window === "undefined") return;
    try {
      const allExist = [...options, ...customOptions].some(
        (o) => o.toLowerCase() === trimmed.toLowerCase()
      );
      if (!allExist) {
        const next = [trimmed, ...customOptions].slice(0, 30);
        setCustomOptions(next);
        localStorage.setItem(`marsel_custom_${storageKey}`, JSON.stringify(next));
      }
    } catch {}
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const combinedOptions = useMemo(() => {
    const set = new Set([...customOptions, ...options]);
    return Array.from(set);
  }, [options, customOptions]);

  const filtered = useMemo(() => {
    if (!filter) return combinedOptions;
    return combinedOptions.filter((opt) => opt.toLowerCase().includes(filter.toLowerCase()));
  }, [combinedOptions, filter]);

  // Map known color names to Hex code for swatch preview
  const getColorHex = (name: string): string | null => {
    const found = PRESET_COLORS.find(([cName]) => cName.toLowerCase() === name.toLowerCase());
    return found ? found[1] : null;
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-black/80 flex items-center gap-1.5">
          {allowCustomColorHex && selectedColorHex && (
            <span
              className="inline-block w-3.5 h-3.5 rounded-full border border-black/30 shadow-xs shrink-0"
              style={{ backgroundColor: selectedColorHex }}
              title={selectedColorHex}
            />
          )}
          <span>
            {label} {required && <span className="text-red-700">*</span>}
          </span>
        </label>
        {storageKey && customOptions.length > 0 && (
          <span className="text-[9px] text-emerald-700 font-mono font-medium">
            ✓ {customOptions.length} Custom Saved
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        {/* If this is color input, show active swatch inside input */}
        {allowCustomColorHex && (
          <div className="absolute left-2.5 flex items-center gap-1.5 z-10">
            <input
              type="color"
              value={selectedColorHex || "#171717"}
              onChange={(e) => {
                if (onColorHexChange) onColorHexChange(e.target.value);
              }}
              title="Click to pick custom hex color"
              className="w-5 h-5 rounded-full border border-black/30 p-0 cursor-pointer overflow-hidden bg-transparent"
            />
          </div>
        )}

        <input
          type="text"
          value={value || ""}
          required={required}
          onChange={(e) => {
            onChange(e.target.value);
            setFilter(e.target.value);
            setOpen(true);
          }}
          onBlur={(e) => {
            if (e.target.value.trim()) {
              saveCustomOption(e.target.value.trim());
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`${fieldClass} ${allowCustomColorHex ? "pl-9" : ""}`}
        />

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black cursor-pointer p-0.5"
          tabIndex={-1}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-black shadow-xl text-xs divide-y divide-black/5">
          {filtered.length > 0 ? (
            filtered.map((opt) => {
              const hex = getColorHex(opt);
              const isSelected = value?.toLowerCase() === opt.toLowerCase();
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    if (hex && onColorHexChange) {
                      onColorHexChange(hex);
                    }
                    saveCustomOption(opt);
                    setOpen(false);
                    setFilter("");
                  }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-black hover:text-white transition-colors cursor-pointer flex items-center justify-between group ${
                    isSelected ? "bg-black/5 font-bold" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {hex && (
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/25 shrink-0 shadow-2xs group-hover:border-white"
                        style={{ backgroundColor: hex }}
                      />
                    )}
                    <span className="truncate">{opt}</span>
                    {customOptions.includes(opt) && (
                      <span className="text-[9px] px-1 py-0.2 bg-black/10 group-hover:bg-white/20 rounded text-black/70 group-hover:text-white font-mono">
                        Saved
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 group-hover:text-emerald-400" />}
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center text-black/60">
              <p className="text-[11px] mb-1.5">No matching preset.</p>
              <button
                type="button"
                onClick={() => {
                  if (filter.trim()) {
                    onChange(filter.trim());
                    saveCustomOption(filter.trim());
                    setOpen(false);
                    setFilter("");
                  }
                }}
                className="px-2.5 py-1 bg-black text-white text-[10px] uppercase font-bold tracking-wider hover:bg-black/80"
              >
                + Use & Save &ldquo;{filter.trim()}&rdquo;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductEditor({
  mode,
  productId,
}: {
  mode: "create" | "edit";
  productId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateFromId = searchParams.get("duplicateFrom");

  const { products, loading: productsLoading, addProduct, updateProduct } = useProducts();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingPrint, setUploadingPrint] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const printFileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [form, setForm] = useState<ProductInput>(emptyProductInput());
  const [detailsText, setDetailsText] = useState("");
  const [arabicForm, setArabicForm] = useState({
    title: "",
    category: "",
    color_name: "",
    composition: "",
    structure: "",
    fit_notes: "",
    care: "",
    details: "",
    tags: "",
    description: "",
    story: "",
  });
  const [tagsText, setTagsText] = useState("");

  // Category state (Defaulting to Hoodie & Crewneck with custom button)
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // Factory print artwork (Max 2 design assets)
  const [designImages, setDesignImages] = useState<string[]>([]);
  const [designUploadSlot, setDesignUploadSlot] = useState<number | null>(null);

  // Auto-translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateNotice, setTranslateNotice] = useState("");

  // Discount options
  const [discountType, setDiscountType] = useState<"none" | "percent" | "fixed">("none");
  const [discountInput, setDiscountInput] = useState<string>("");

  // Sizing Table State
  const [sizingRows, setSizingRows] = useState<SizingRow[]>(DEFAULT_HOODIE_SIZING);
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [newCustomSizeInput, setNewCustomSizeInput] = useState("");

  // Collapsible for advanced Arabic localization
  const [isArabicSectionOpen, setIsArabicSectionOpen] = useState(false);

  // Helper to parse size guide table from string
  const parseSizingGuide = (text?: string): SizingRow[] => {
    if (!text) return DEFAULT_HOODIE_SIZING;
    try {
      if (text.trim().startsWith("[") && text.trim().endsWith("]")) {
        return JSON.parse(text);
      }
    } catch {}

    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const rows: SizingRow[] = [];
    for (const line of lines) {
      const match = line.match(
        /^([A-Z0-9]+):\s*Chest\s*([0-9.]+)[^,]*,\s*Length\s*([0-9.]+)[^,]*,\s*Shoulder\s*([0-9.]+)[^,]*,\s*Sleeve\s*([0-9.]+)/i
      );
      if (match) {
        rows.push({
          size: match[1],
          chest: match[2],
          length: match[3],
          shoulder: match[4],
          sleeve: match[5],
        });
      }
    }
    return rows.length > 0 ? rows : DEFAULT_HOODIE_SIZING;
  };

  const serializeSizingGuide = (rows: SizingRow[]): string => {
    return rows
      .map(
        (r) =>
          `${r.size}: Chest ${r.chest}cm, Length ${r.length}cm, Shoulder ${r.shoulder}cm, Sleeve ${r.sleeve}cm`
      )
      .join("\n");
  };

  // Populate data when editing or duplicating
  useEffect(() => {
    const targetId = mode === "edit" ? productId : duplicateFromId;
    if (!targetId || productsLoading) return;

    const p = products.find((item) => item.id === targetId);
    if (!p) return;

    const existingAr = parseArabicFromStylingNotes(p.styling_notes);
    const slugKey = p.slug?.toLowerCase().trim();
    const staticAr = slugKey ? PRODUCT_TRANSLATIONS_AR[slugKey] : undefined;

    const initialAr = {
      title: existingAr?.title || staticAr?.title || "",
      category:
        existingAr?.category ||
        (staticAr?.category
          ? CATEGORY_TRANSLATIONS[staticAr.category]?.ar || staticAr.category
          : CATEGORY_TRANSLATIONS[p.category?.toLowerCase() || ""]?.ar || ""),
      color_name:
        existingAr?.color_name ||
        staticAr?.color_name ||
        (COLOR_TRANSLATIONS[p.color_name?.toLowerCase() || ""] || ""),
      composition: existingAr?.composition || staticAr?.composition || "",
      structure: existingAr?.structure || staticAr?.structure || "",
      fit_notes: existingAr?.fit_notes || staticAr?.fit_notes || "",
      care: existingAr?.care || staticAr?.care || "",
      details: (existingAr?.details || staticAr?.details || []).join("\n"),
      tags: (existingAr?.tags || []).join("، "),
      description: existingAr?.description || staticAr?.description || "",
      story: existingAr?.story || staticAr?.story || "",
    };

    setArabicForm(initialAr);
    setDetailsText((p.details || staticAr?.details || []).join("\n"));
    if (initialAr.title || initialAr.description || initialAr.story) {
      setIsArabicSectionOpen(true);
    }

    const parsedDesigns = parseDesignImages(p.print_file_url);
    setDesignImages(parsedDesigns);

    const isStdCategory =
      p.category === "hoodie" || p.category === "crewneck" || p.category === "sweatshirt";
    setIsCustomCategory(!isStdCategory && Boolean(p.category));
    setCustomCategoryInput(!isStdCategory ? p.category || "" : "");

    const titleValue = mode === "create" && duplicateFromId ? `${p.title} (COPY)` : p.title;

    setForm({
      title: titleValue,
      price: p.price,
      compare_at_price: p.compare_at_price,
      discount_label: p.discount_label || "",
      image: getCoverImage(p),
      images: p.images?.length ? p.images : p.image ? [p.image] : [],
      sizes: p.sizes?.length ? p.sizes : [],
      description: p.description || "",
      story: p.story || "",
      details: p.details || [],
      color_name: p.color_name || "",
      color_hex: p.color_hex || "#111111",
      composition: p.composition || "",
      structure: p.structure || "",
      fit: p.fit || "",
      fit_notes: p.fit_notes || "",
      gender: p.gender || "unisex",
      weight_grams: p.weight_grams,
      size_guide: p.size_guide || "",
      styling_notes: p.styling_notes || "",
      season: p.season || "All Season",
      category: p.category || "hoodie",
      care: p.care || "",
      collection: p.collection || "DROP 01",
      provenance: p.provenance || "EGYPT",
      house_label: p.house_label || "MARSEL",
      tags: p.tags || [],
      print_file_url: p.print_file_url || "",
      is_active: p.is_active !== false,
    });

    setTagsText((p.tags || []).join(", "));
    setSizingRows(parseSizingGuide(p.size_guide));

    const extraSizes = (p.sizes || []).filter(
      (s) => !ALL_SIZES.includes(s as (typeof ALL_SIZES)[number])
    );
    setCustomSizes(extraSizes);

    if (p.compare_at_price && p.compare_at_price > p.price) {
      setDiscountType("fixed");
      setDiscountInput(String(p.compare_at_price - p.price));
    } else {
      setDiscountType("none");
      setDiscountInput("");
    }
  }, [mode, productId, duplicateFromId, products, productsLoading]);

  // Dynamic suggestions for autocomplete
  const dynamicOptions = useMemo(() => {
    const categories = Array.from(
      new Set(["hoodie", "crewneck", ...products.map((p) => p.category?.toLowerCase()).filter(Boolean)])
    );

    const collections = Array.from(
      new Set([
        "DROP 01",
        "DROP 02",
        "CORE ATELIER",
        "ARCHIVE",
        "LIMITED EDITION",
        ...products.map((p) => p.collection).filter(Boolean),
      ])
    );

    const colors = Array.from(
      new Set([
        ...PRESET_COLORS.map(([name]) => name),
        ...products.map((p) => p.color_name).filter(Boolean),
      ])
    );

    const compositions = Array.from(
      new Set([
        "100% Egyptian Cotton",
        "100% Combed Egyptian Cotton",
        "Heavyweight French Terry Cotton",
        "Cotton Heavyweight Fleece",
        "100% Heavyweight Brushed Cotton",
        "Egyptian Giza Cotton (Extra-Long Staple)",
        "Organic Cotton Fleece",
        "Cotton-Polyester Vintage Blend",
        ...products.map((p) => p.composition).filter(Boolean),
      ])
    );

    const structures = Array.from(
      new Set([
        "460 GSM heavyweight French Terry",
        "500 GSM custom milled heavy fleece",
        "380 GSM combed fleece",
        "360 GSM boxy fleece",
        "420 GSM diagonal loopback terry",
        "320 GSM light summer terry",
        "280 GSM single jersey cotton",
        "Double-knitted interlock cotton",
        ...products.map((p) => p.structure).filter(Boolean),
      ])
    );

    const fits = Array.from(
      new Set([
        "Oversized",
        "Oversized Boxy",
        "Relaxed",
        "Regular",
        "Boxy",
        "Drop Shoulder Relaxed",
        "Cropped Boxy",
        "Tailored Slim",
        ...products.map((p) => p.fit).filter(Boolean),
      ])
    );

    const cares = Array.from(
      new Set([
        "Wash cold inside out at 30C. Hang dry.",
        "Machine wash 30C delicate. Do not tumble dry.",
        "Gentle cold wash. Iron on reverse side.",
        "Hand wash cold. Flat dry in shade.",
        "Dry clean only.",
        ...products.map((p) => p.care).filter(Boolean),
      ])
    );

    return { categories, collections, colors, compositions, structures, fits, cares };
  }, [products]);

  const setField = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSize = (size: string) => {
    const selected = form.sizes.includes(size)
      ? form.sizes.filter((s) => s !== size)
      : [...form.sizes, size];
    setField("sizes", selected);
  };

  const handleAddCustomSize = () => {
    const val = newCustomSizeInput.trim().toUpperCase();
    if (!val) return;

    if (!customSizes.includes(val) && !ALL_SIZES.includes(val as (typeof ALL_SIZES)[number])) {
      setCustomSizes((prev) => [...prev, val]);
    }
    if (!form.sizes.includes(val)) {
      setField("sizes", [...form.sizes, val]);
    }
    if (!sizingRows.some((r) => r.size.toUpperCase() === val)) {
      setSizingRows((prev) => [
        ...prev,
        { size: val, chest: "60", length: "70", shoulder: "60", sleeve: "58" },
      ]);
    }
    setNewCustomSizeInput("");
  };

  const handleRemoveCustomSize = (sizeToRemove: string) => {
    setCustomSizes((prev) => prev.filter((s) => s !== sizeToRemove));
    setField(
      "sizes",
      form.sizes.filter((s) => s !== sizeToRemove)
    );
  };

  // Drag and drop images
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= form.images.length) return;
    const images = [...form.images];
    const [item] = images.splice(from, 1);
    images.splice(to, 0, item);
    setForm((prev) => ({ ...prev, images, image: images[0] || "" }));
  };

  const removeImage = (index: number) => {
    const next = form.images.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, images: next, image: next[0] || "" }));
  };

  const handleImagesSelected = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = MAX_PRODUCT_IMAGES - form.images.length;
    if (remaining <= 0) {
      setSubmitError(`Maximum ${MAX_PRODUCT_IMAGES} product photos allowed. First image is the cover.`);
      return;
    }
    setUploading(true);
    setSubmitError("");
    try {
      const next: string[] = [...form.images];
      for (const file of Array.from(files).slice(0, remaining)) {
        if (!file.type.startsWith("image/")) continue;
        next.push(await uploadProductImageFile(file));
      }
      setForm((prev) => ({
        ...prev,
        images: next,
        image: next[0] || prev.image,
      }));
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to upload image. Please verify file format and size.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDesignFileSelected = async (fileList: FileList | null) => {
    if (!fileList || !fileList.length || designUploadSlot === null) return;
    const file = fileList[0];
    if (!file.type.startsWith("image/")) {
      setSubmitError("Design artwork file must be an image (PNG recommended).");
      return;
    }
    setUploadingPrint(true);
    setSubmitError("");
    try {
      const uploadedUrl = await uploadProductImageFile(file);
      setDesignImages((prev) => {
        const next = [...prev];
        next[designUploadSlot] = uploadedUrl;
        return next;
      });
      setSuccessToast(`Artwork design #${designUploadSlot + 1} uploaded successfully`);
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to upload design artwork file. Please try again.");
    } finally {
      setUploadingPrint(false);
      setDesignUploadSlot(null);
      if (printFileInputRef.current) printFileInputRef.current.value = "";
    }
  };

  const handleRemoveDesignImage = (index: number) => {
    setDesignImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Pricing calculations
  const priceMath = useMemo(() => {
    const originalPrice = Number(form.price) || 0;
    const inputVal = parseFloat(discountInput) || 0;

    if (discountType === "none" || inputVal <= 0 || originalPrice <= 0) {
      return {
        hasDiscount: false,
        originalPrice: originalPrice,
        finalPrice: originalPrice,
        comparePrice: null,
        discountAmount: 0,
        discountPercent: 0,
      };
    }

    if (discountType === "percent") {
      const percent = Math.min(99, Math.max(1, inputVal));
      const discountAmount = Math.round((originalPrice * percent) / 100);
      const finalPrice = Math.max(0, originalPrice - discountAmount);
      return {
        hasDiscount: true,
        originalPrice: originalPrice,
        finalPrice: finalPrice,
        comparePrice: originalPrice,
        discountAmount: discountAmount,
        discountPercent: Math.round(percent),
      };
    }

    const discountAmount = Math.min(originalPrice - 1, inputVal);
    const finalPrice = Math.max(0, originalPrice - discountAmount);
    const percent = Math.round((discountAmount / originalPrice) * 100);
    return {
      hasDiscount: true,
      originalPrice: originalPrice,
      finalPrice: finalPrice,
      comparePrice: originalPrice,
      discountAmount: discountAmount,
      discountPercent: percent,
    };
  }, [form.price, discountType, discountInput]);

  const handleAutoTranslate = async () => {
    if (!form.title.trim()) {
      setTranslateNotice("Please enter at least a Product Title in English first.");
      return;
    }

    setIsTranslating(true);
    setTranslateNotice("");
    try {
      const fieldsToTranslate = {
        title: form.title,
        category: form.category,
        color_name: form.color_name,
        composition: form.composition,
        structure: form.structure,
        fit_notes: form.fit_notes || form.fit,
        care: form.care,
        details: detailsText,
        tags: tagsText,
        description: form.description,
        story: form.story,
      };

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: fieldsToTranslate, targetLang: "ar" }),
      });
      const data = await res.json();
      if (data.fields) {
        setArabicForm({
          title: data.fields.title || form.title,
          category:
            data.fields.category ||
            CATEGORY_TRANSLATIONS[form.category?.toLowerCase() || ""]?.ar ||
            form.category,
          color_name:
            data.fields.color_name ||
            COLOR_TRANSLATIONS[form.color_name?.toLowerCase() || ""] ||
            form.color_name,
          composition: data.fields.composition || form.composition,
          structure: data.fields.structure || form.structure,
          fit_notes: data.fields.fit_notes || form.fit_notes,
          care: data.fields.care || form.care,
          details: data.fields.details || detailsText,
          tags: data.fields.tags || tagsText,
          description: data.fields.description || form.description,
          story: data.fields.story || form.story,
        });
        setIsArabicSectionOpen(true);
        setTranslateNotice("Piece translated to Arabic! You can review and tweak any field below.");
      }
    } catch (err) {
      console.error("Auto translate error:", err);
      setTranslateNotice("Auto-translation service is temporarily unavailable. You can enter or edit manually.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!form.title.trim()) {
      setSubmitError("Product title is required.");
      return;
    }
    if (!form.price || form.price <= 0) {
      setSubmitError("A valid price in EGP is required.");
      return;
    }
    if (!form.category.trim()) {
      setSubmitError("Please select or specify a product category (e.g. Hoodie, Crewneck).");
      return;
    }
    if (!form.color_name.trim()) {
      setSubmitError("Please specify a color name.");
      return;
    }
    if (form.images.length === 0) {
      setSubmitError("Please upload at least 1 image for the product.");
      return;
    }
    if (form.sizes.length === 0) {
      setSubmitError("Please select at least 1 available size.");
      return;
    }

    setIsSubmitting(true);
    try {
      const serializedGuide = serializeSizingGuide(sizingRows);

      const parsedDetails = detailsText
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean);
      const parsedTags = parseTags(tagsText);

      const parsedArabicDetails = arabicForm.details
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean);
      const parsedArabicTags = arabicForm.tags
        .split(/[,،]/)
        .map((t) => t.trim())
        .filter(Boolean);

      const encodedStylingNotes = encodeArabicToStylingNotes(form.styling_notes, {
        title: arabicForm.title.trim() || undefined,
        category: arabicForm.category.trim() || undefined,
        color_name: arabicForm.color_name.trim() || undefined,
        composition: arabicForm.composition.trim() || undefined,
        structure: arabicForm.structure.trim() || undefined,
        fit_notes: arabicForm.fit_notes.trim() || undefined,
        care: arabicForm.care.trim() || undefined,
        details: parsedArabicDetails.length > 0 ? parsedArabicDetails : undefined,
        tags: parsedArabicTags.length > 0 ? parsedArabicTags : undefined,
        description: arabicForm.description.trim() || undefined,
        story: arabicForm.story.trim() || undefined,
      });

      const payload: ProductInput = {
        ...form,
        title: form.title.trim().toUpperCase(),
        details: parsedDetails,
        tags: parsedTags,
        styling_notes: encodedStylingNotes,
        price: priceMath.finalPrice,
        compare_at_price: priceMath.comparePrice,
        discount_label: priceMath.hasDiscount ? `${priceMath.discountPercent}% OFF` : "",
        size_guide: serializedGuide,
        image: form.images[0] || form.image || "/hoodie-cropped.png",
        print_file_url: encodeDesignImages(designImages),
      };

      if (mode === "edit" && productId) {
        await updateProduct(productId, payload);
      } else {
        await addProduct(payload);
      }

      router.push("/admin/products");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error saving product";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/15">
        <div>
          <nav className="text-[11px] font-mono uppercase tracking-widest text-black/50 flex items-center gap-2 mb-1">
            <Link href="/admin/products" className="hover:text-black transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Catalog</span>
            </Link>
            <span>/</span>
            <span className="text-black font-semibold">
              {mode === "edit" ? "Edit Product" : "New Piece"}
            </span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-black">
            {mode === "edit" ? `Edit: ${form.title || "Product"}` : "Create New Studio Piece"}
          </h1>
          <p className="text-xs text-black/60 uppercase tracking-widest mt-0.5">
            MARSEL ATELIER PRODUCT STUDIO — FULL-SPACE EDITOR
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-black/30 bg-white hover:bg-black/5 text-xs font-bold uppercase tracking-wider text-black transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="product-editor-form"
            disabled={isSubmitting}
            className="px-6 py-2 bg-black text-[#e7ecea] hover:bg-black/85 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isSubmitting ? "Saving Piece..." : mode === "edit" ? "Save Changes" : "Publish Piece"}</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {submitError && (
        <div className="p-3.5 border border-red-400 bg-red-50 text-xs text-red-800 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-700" />
          <span>{submitError}</span>
        </div>
      )}

      {successToast && (
        <div className="p-3 border border-emerald-300 bg-emerald-50 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Spacious Studio Layout (8 cols left / 4 cols right) */}
      <form id="product-editor-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Primary Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Piece Identity & Description */}
          <div className="border border-black/20 bg-white p-6 space-y-5 shadow-xs">
            <div className="border-b border-black/10 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black">
                1. Piece Identity & Description
              </h2>
              <p className="text-[11px] text-black/50">
                Primary piece name, customer-facing description, and editorial story
              </p>
            </div>

            {/* Piece Title */}
            <div>
              <span className="block text-[10px] font-mono text-black/60 uppercase tracking-widest mb-1.5 font-semibold">
                Piece Title <span className="text-red-700">*</span>
              </span>
              <input
                type="text"
                required
                placeholder="e.g. EAGLE HEAVYWEIGHT HOODIE"
                value={form.title}
                onChange={(e) => setField("title", e.target.value.toUpperCase())}
                className={fieldClass + " font-bold text-sm tracking-wide"}
              />
            </div>

            {/* Short Description */}
            <div>
              <label className={labelClass}>Short Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="A brief overview of the piece, silhouette, drape, and feel..."
                className={fieldClass}
              />
            </div>

            {/* Editorial Story */}
            <div>
              <label className={labelClass}>Editorial Story & Design Inspiration</label>
              <textarea
                rows={2}
                value={form.story}
                onChange={(e) => setField("story", e.target.value)}
                placeholder="Built as an essential streetwear layer for cooler Cairo evenings with a structured, relaxed drape..."
                className={fieldClass}
              />
            </div>
          </div>

          {/* Card 2: Product Imagery & Design Artwork (6 Photos + 2 Design Assets) */}
          <div className="border border-black/20 bg-white p-6 space-y-6 shadow-xs">
            <div className="border-b border-black/10 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-black">
                  2. Product Photos & Factory Artwork
                </h2>
                <p className="text-[11px] text-black/50">
                  Up to 6 product photos for the storefront + 2 high-res print files for manufacturing
                </p>
              </div>

              {form.images.length < MAX_PRODUCT_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3.5 py-1.5 border border-black bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer"
                >
                  {uploading ? "Uploading..." : "+ Add Photo"}
                </button>
              )}
            </div>

            {/* Product Photos Grid (Max 6 Photos) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-black/60 font-mono">
                <span>STOREFRONT GALLERY ({form.images.length}/{MAX_PRODUCT_IMAGES})</span>
                <span className="text-[10px] uppercase">First photo is cover • Drag to reorder</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {form.images.map((imgUrl, idx) => (
                  <div
                    key={imgUrl + idx}
                    draggable
                    onDragStart={() => setDraggedIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedIndex === null || draggedIndex === idx) return;
                      moveImage(draggedIndex, idx);
                      setDraggedIndex(null);
                    }}
                    className={`relative aspect-square border-2 bg-black/5 overflow-hidden group cursor-move select-none ${
                      idx === 0 ? "border-black shadow-md ring-1 ring-black" : "border-black/30"
                    }`}
                  >
                    <img src={imgUrl} alt={`Piece ${idx + 1}`} className="w-full h-full object-contain bg-white" />

                    {idx === 0 && (
                      <div className="absolute top-1.5 left-1.5 bg-black text-[#e7ecea] text-[8px] font-bold px-1.5 py-0.5 tracking-wider uppercase">
                        COVER
                      </div>
                    )}

                    {/* Action buttons overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="bg-red-700 text-white p-1 hover:bg-red-800 transition-colors cursor-pointer"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center bg-black/80 p-1 text-white text-[10px]">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, idx - 1)}
                          className="disabled:opacity-20 hover:text-white/80 cursor-pointer"
                          title="Move left"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        {idx !== 0 ? (
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 0)}
                            className="text-[9px] font-bold uppercase hover:underline cursor-pointer"
                          >
                            Set Cover
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold uppercase text-white/70">Cover</span>
                        )}
                        <button
                          type="button"
                          disabled={idx === form.images.length - 1}
                          onClick={() => moveImage(idx, idx + 1)}
                          className="disabled:opacity-20 hover:text-white/80 cursor-pointer"
                          title="Move right"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {form.images.length < MAX_PRODUCT_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-square border-2 border-dashed border-black/30 hover:border-black flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-white/40 group"
                  >
                    <ImagePlus className="w-7 h-7 text-black/40 group-hover:text-black mb-1.5 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black">
                      {uploading ? "Uploading..." : "+ Add Photo"}
                    </span>
                    <span className="text-[9px] text-black/40 mt-0.5">PNG, JPG, WEBP</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={(e) => handleImagesSelected(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Factory Artwork & Print Graphics (Max 2 Assets) */}
            <div className="border-t border-black/10 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-black">
                      Factory Artwork & Print Graphics ({designImages.length}/{MAX_DESIGN_IMAGES})
                    </span>
                    <span className="text-[10px] bg-black text-[#e7ecea] px-1.5 py-0.5 font-bold uppercase">
                      Factory Production
                    </span>
                  </div>
                  <p className="text-[11px] text-black/60 mt-0.5">
                    High-resolution transparent PNG graphics downloaded by the factory for screen-printing & embroidery
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1].map((slotIdx) => {
                  const fileUrl = designImages[slotIdx];
                  const slotLabel = slotIdx === 0 ? "Design 1 (Primary / Front)" : "Design 2 (Secondary / Back)";
                  return (
                    <div key={slotIdx} className="border border-black/15 bg-black/[0.01] p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black/70">
                        <span>{slotLabel}</span>
                        {fileUrl && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDesignImage(slotIdx)}
                            className="text-red-700 hover:underline text-[11px] cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {fileUrl ? (
                        <div className="flex items-center gap-3 bg-white p-2.5 border border-black/15">
                          <div className="w-16 h-16 border border-black/20 bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:8px_8px] flex items-center justify-center overflow-hidden shrink-0">
                            <img src={fileUrl} alt={`Artwork ${slotIdx + 1}`} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0 text-xs">
                            <span className="font-bold text-black uppercase block truncate">Artwork Uploaded</span>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-blue-700 underline truncate block mt-0.5"
                            >
                              View Original PNG ↗
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setDesignUploadSlot(slotIdx);
                                printFileInputRef.current?.click();
                              }}
                              disabled={uploadingPrint}
                              className="mt-1 text-[10px] font-bold uppercase underline cursor-pointer hover:text-black/70"
                            >
                              {uploadingPrint && designUploadSlot === slotIdx ? "Uploading..." : "Replace File"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-5 border border-dashed border-black/25 text-center space-y-2 bg-white">
                          <span className="text-[11px] text-black/50">No artwork uploaded for this slot</span>
                          <button
                            type="button"
                            onClick={() => {
                              setDesignUploadSlot(slotIdx);
                              printFileInputRef.current?.click();
                            }}
                            disabled={uploadingPrint}
                            className="px-3 py-1.5 bg-black text-[#e7ecea] hover:bg-black/85 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            {uploadingPrint && designUploadSlot === slotIdx ? "Uploading..." : `+ Upload ${slotLabel}`}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <input
                ref={printFileInputRef}
                type="file"
                accept="image/*"
                disabled={uploadingPrint}
                onChange={(e) => handleDesignFileSelected(e.target.files)}
                className="hidden"
              />
            </div>
          </div>

          {/* Card 3: Sizes & Measurements Guide */}
          <div className="border border-black/20 bg-white p-6 space-y-5 shadow-xs">
            <div className="border-b border-black/10 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-black">
                  3. Available Sizes & Measurement Guide
                </h2>
                <p className="text-[11px] text-black/50">
                  Select available sizes and provide garment measurements table in centimeters
                </p>
              </div>

              <div className="flex gap-2 text-[10px] font-bold uppercase">
                <button
                  type="button"
                  onClick={() => {
                    const combined = Array.from(new Set([...ALL_SIZES, ...customSizes]));
                    setField("sizes", combined);
                  }}
                  className="hover:underline text-black/70 cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setField("sizes", [])}
                  className="hover:underline text-red-700 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Sizes Pills Selector */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {ALL_SIZES.map((size) => {
                  const isSelected = form.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-black text-[#e7ecea] border-black shadow-xs"
                          : "bg-white text-black/50 border-black/20 hover:border-black hover:text-black"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}

                {customSizes.map((size) => {
                  const isSelected = form.sizes.includes(size);
                  return (
                    <div
                      key={size}
                      className={`inline-flex items-center border font-mono text-xs transition-colors ${
                        isSelected
                          ? "bg-black text-[#e7ecea] border-black shadow-xs"
                          : "bg-white text-black/60 border-black/25 hover:border-black hover:text-black"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSize(size)}
                        className="px-3 py-2 font-bold cursor-pointer uppercase"
                      >
                        {size}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCustomSize(size);
                        }}
                        className={`pr-2.5 pl-0.5 py-2 cursor-pointer transition-opacity ${
                          isSelected ? "text-white/60 hover:text-red-300" : "text-black/40 hover:text-red-600"
                        }`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Size Inline */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Custom size (e.g. 3XL, 32, Oversized)..."
                  value={newCustomSizeInput}
                  onChange={(e) => setNewCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSize();
                    }
                  }}
                  className="w-56 text-xs border border-black/20 bg-white px-2.5 py-1.5 focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-3 py-1.5 bg-black text-[#e7ecea] hover:bg-black/85 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  + Add Size
                </button>
              </div>
            </div>

            {/* Sizing Table */}
            <div className="space-y-3 pt-2">
              <label className={labelClass}>Garment Sizing Specs (CM)</label>
              <div className="overflow-x-auto border border-black/15">
                <table className="w-full text-xs text-left">
                  <thead className="bg-black/[0.04] border-b border-black/15 text-[10px] font-bold uppercase tracking-wider text-black/70">
                    <tr>
                      <th className="p-2.5">Size</th>
                      <th className="p-2.5 text-center">Chest (cm)</th>
                      <th className="p-2.5 text-center">Length (cm)</th>
                      <th className="p-2.5 text-center">Shoulder (cm)</th>
                      <th className="p-2.5 text-center">Sleeve (cm)</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {sizingRows.map((row, index) => (
                      <tr key={index} className="hover:bg-black/[0.01]">
                        <td className="p-2 font-mono font-bold">
                          <input
                            type="text"
                            value={row.size}
                            onChange={(e) => {
                              const updated = [...sizingRows];
                              updated[index].size = e.target.value.toUpperCase();
                              setSizingRows(updated);
                            }}
                            className="w-16 p-1 border border-black/20 bg-white font-mono uppercase"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.chest}
                            onChange={(e) => {
                              const updated = [...sizingRows];
                              updated[index].chest = e.target.value;
                              setSizingRows(updated);
                            }}
                            className="w-20 p-1 border border-black/20 bg-white text-center mx-auto block"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.length}
                            onChange={(e) => {
                              const updated = [...sizingRows];
                              updated[index].length = e.target.value;
                              setSizingRows(updated);
                            }}
                            className="w-20 p-1 border border-black/20 bg-white text-center mx-auto block"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.shoulder}
                            onChange={(e) => {
                              const updated = [...sizingRows];
                              updated[index].shoulder = e.target.value;
                              setSizingRows(updated);
                            }}
                            className="w-20 p-1 border border-black/20 bg-white text-center mx-auto block"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.sleeve}
                            onChange={(e) => {
                              const updated = [...sizingRows];
                              updated[index].sleeve = e.target.value;
                              setSizingRows(updated);
                            }}
                            className="w-20 p-1 border border-black/20 bg-white text-center mx-auto block"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (sizingRows.length <= 1) return;
                              setSizingRows(sizingRows.filter((_, i) => i !== index));
                            }}
                            className="text-black/40 hover:text-red-700 p-1 cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSizingRows([
                    ...sizingRows,
                    { size: "3XL", chest: "75", length: "78", shoulder: "68", sleeve: "62" },
                  ])
                }
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-black/70 hover:text-black cursor-pointer underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Measurement Row</span>
              </button>
            </div>
          </div>

          {/* Card 4: Fabric Specs, Silhouette & Care */}
          <div className="border border-black/20 bg-white p-6 space-y-4 shadow-xs">
            <div className="border-b border-black/10 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black">
                4. Fabric, Fit & Editorial Specs
              </h2>
              <p className="text-[11px] text-black/50">
                Garment composition, milling weight, silhouette fit, and washing care
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ComboboxInput
                label="Fabric Composition"
                value={form.composition}
                options={dynamicOptions.compositions}
                onChange={(val) => setField("composition", val)}
                placeholder="e.g. 100% Egyptian Cotton"
                storageKey="composition"
              />

              <ComboboxInput
                label="Fabric Structure & GSM"
                value={form.structure}
                options={dynamicOptions.structures}
                onChange={(val) => setField("structure", val)}
                placeholder="e.g. 460 GSM heavyweight French Terry"
                storageKey="structure"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ComboboxInput
                label="Fit Silhouette"
                value={form.fit}
                options={dynamicOptions.fits}
                onChange={(val) => setField("fit", val)}
                placeholder="e.g. Oversized Boxy"
                storageKey="fit"
              />

              <div>
                <ComboboxInput
                  label="Washing & Care Instructions"
                  value={form.care}
                  options={dynamicOptions.cares}
                  onChange={(val) => setField("care", val)}
                  placeholder="e.g. Wash cold at 30C inside out. Hang dry."
                  storageKey="care"
                />
                <p className="text-[10px] text-black/50 mt-1">
                  Static specification: Standard professional Arabic care text is automatically displayed to storefront customers.
                </p>
              </div>
            </div>

            {/* Key Piece Details / Bullet Points */}
            <div className="pt-2 border-t border-black/10">
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass}>Key Piece Details (One per line)</label>
                <span className="text-[10px] text-black/50">Displayed as bullet points on product page</span>
              </div>
              <textarea
                rows={3}
                value={detailsText}
                onChange={(e) => setDetailsText(e.target.value)}
                placeholder={"Heavyweight 460 GSM brushed fleece\nDropped shoulders with relaxed boxy silhouette\nSignature high-density chest embroidery\nDouble-layered hood with reinforced seams"}
                className={fieldClass + " leading-relaxed font-mono text-[11px]"}
              />
            </div>
          </div>

          {/* Card 5: Storefront Arabic Translation (At bottom of form) */}
          <div className="border-2 border-black bg-white shadow-xs">
            {!isArabicSectionOpen ? (
              /* State A: Ready to translate trigger banner */
              <div className="p-6 space-y-4 bg-black/[0.02]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-black">
                        Storefront Arabic Translation (الترجمة العربية للمتجر)
                      </h2>
                    </div>
                    <p className="text-[11px] text-black/60 mt-1 max-w-xl leading-relaxed">
                      Finished entering piece information in English? Click below to auto-translate all product attributes
                      (Title, Category, Color, Fabric, Structure, Details, Tags, and Description) into Arabic with 1 click.
                    </p>
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-black/20 bg-white text-black/60 self-start shrink-0">
                    Optional / 1-Click
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleAutoTranslate}
                    disabled={isTranslating || !form.title.trim()}
                    className="px-5 py-2.5 bg-black text-[#e7ecea] hover:bg-black/85 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-40"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isTranslating ? "animate-spin text-amber-400" : "text-amber-400"}`} />
                    <span>{isTranslating ? "Translating Piece..." : "✨ Translate Product to Arabic (ترجمة المنتج للعربية)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsArabicSectionOpen(true)}
                    className="px-3.5 py-2.5 border border-black/25 bg-white hover:bg-black/5 text-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Manual Arabic Entry
                  </button>
                </div>
              </div>
            ) : (
              /* State B: Full Editable Arabic Translation Section */
              <div className="p-6 space-y-5">
                {/* Header & Controls */}
                <div className="border-b border-black/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-black">
                        الترجمة العربية للمنتج (Storefront Arabic Translation)
                      </h2>
                    </div>
                    <p className="text-[11px] text-black/60 mt-0.5">
                      تمت الترجمة بنجاح — يمكنك مراجعة وتعديل أي حقل من الحقول أدناه مباشرة قبل الحفظ
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={handleAutoTranslate}
                      disabled={isTranslating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border border-black/30 bg-white hover:bg-black hover:text-white transition-all cursor-pointer disabled:opacity-40 shadow-xs"
                      title="Re-run translation from current English inputs"
                    >
                      <RotateCcw className={`w-3 h-3 ${isTranslating ? "animate-spin text-amber-500" : ""}`} />
                      <span>{isTranslating ? "Updating..." : "🔄 Re-Translate"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setArabicForm({
                          title: "",
                          category: "",
                          color_name: "",
                          composition: "",
                          structure: "",
                          fit_notes: "",
                          care: "",
                          details: "",
                          tags: "",
                          description: "",
                          story: "",
                        });
                        setIsArabicSectionOpen(false);
                      }}
                      className="text-[10px] uppercase font-bold text-black/50 hover:text-red-700 px-2.5 py-1.5 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {translateNotice && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{translateNotice}</span>
                  </div>
                )}

                {/* Editable Arabic Translation Fields */}
                <div className="space-y-4" dir="rtl">
                  {/* Row 1: Title & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-black/85 mb-1.5 font-sans text-right">
                        اسم القطعة بالعربية (Piece Title)
                      </label>
                      <input
                        type="text"
                        value={arabicForm.title}
                        onChange={(e) => setArabicForm((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="مثال: هودي النسر ثقيل الوزن"
                        className={fieldClass + " font-bold text-sm text-right font-sans"}
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-black/85 mb-1.5 font-sans text-right">
                        نوع القطعة / التصنيف (Category)
                      </label>
                      <input
                        type="text"
                        value={arabicForm.category}
                        onChange={(e) => setArabicForm((prev) => ({ ...prev, category: e.target.value }))}
                        placeholder="مثال: هودي / كروينك"
                        className={fieldClass + " font-semibold text-xs text-right font-sans"}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Row 2: Color & Fabric Composition */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-black/85 mb-1.5 font-sans text-right">
                        اللون بالعربية (Color Name)
                      </label>
                      <input
                        type="text"
                        value={arabicForm.color_name}
                        onChange={(e) => setArabicForm((prev) => ({ ...prev, color_name: e.target.value }))}
                        placeholder="مثال: أسود مغسول / رمادي خرساني"
                        className={fieldClass + " text-xs text-right font-sans"}
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-black/85 mb-1.5 font-sans text-right">
                        الخامة (Fabric / Composition)
                      </label>
                      <input
                        type="text"
                        value={arabicForm.composition}
                        onChange={(e) => setArabicForm((prev) => ({ ...prev, composition: e.target.value }))}
                        placeholder="مثال: ١٠٠٪ قطن مصري فاخر"
                        className={fieldClass + " text-xs text-right font-sans"}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Row 3: Fabric Structure & Fit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-black/85 mb-1.5 font-sans text-right">
                        النسيج والوزن (Fabric Structure & GSM)
                      </label>
                      <input
                        type="text"
                        value={arabicForm.structure}
                        onChange={(e) => setArabicForm((prev) => ({ ...prev, structure: e.target.value }))}
                        placeholder="مثال: ميلتون فرنسي ثقيل ٤٦٠ جم"
                        className={fieldClass + " text-xs text-right font-sans"}
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-black/85 mb-1.5 font-sans text-right">
                        القصة وتفاصيل القياس (Fit & Silhouette)
                      </label>
                      <input
                        type="text"
                        value={arabicForm.fit_notes}
                        onChange={(e) => setArabicForm((prev) => ({ ...prev, fit_notes: e.target.value }))}
                        placeholder="مثال: قصة واسعة مريحة بأكتاف منسدلة، التزم بمقاسك المعتاد."
                        className={fieldClass + " text-xs text-right font-sans"}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Row: Washing & Care Instructions in Arabic */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-black/85 font-sans text-right">
                        تعليمات الغسيل والعناية بالعربية (Washing & Care Instructions)
                      </label>
                      <span className="text-[10px] text-black/50 font-sans">تظهر للعميل في تفاصيل العناية بالقطعة</span>
                    </div>
                    <input
                      type="text"
                      value={arabicForm.care}
                      onChange={(e) => setArabicForm((prev) => ({ ...prev, care: e.target.value }))}
                      placeholder="مثال: يُغسل بماء بارد عند ٣٠ مئوية بالمقلوب. يُجفف تعليقاً في الظل. تجنب المبيضات."
                      className={fieldClass + " text-xs text-right font-sans"}
                      dir="rtl"
                    />
                  </div>

                  {/* Row 4: Details Bullet Points */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-black/85 font-sans text-right">
                        تفاصيل ومواصفات القطعة (Key Details - سطر لكل ميزة)
                      </label>
                      <span className="text-[10px] text-black/50 font-sans">تظهر كنقاط مرتبة في صفحة المنتج</span>
                    </div>
                    <textarea
                      rows={3}
                      value={arabicForm.details}
                      onChange={(e) => setArabicForm((prev) => ({ ...prev, details: e.target.value }))}
                      placeholder={"ميلتون قطني فائق النعومة ٤٦٠ جم\nأكتاف منسدلة دروب شولدر\nتطريز نسر فاخر على الصدر\nغطاء رأس مبطن بطبقتين"}
                      className={fieldClass + " text-xs text-right font-sans leading-relaxed"}
                      dir="rtl"
                    />
                  </div>

                  {/* Row 5: Tags */}
                  <div>
                    <label className="block text-[11px] font-bold text-black/85 mb-1.5 font-sans text-right">
                      التاجات بالعربية (Tags - مفصولة بفواصل)
                    </label>
                    <input
                      type="text"
                      value={arabicForm.tags}
                      onChange={(e) => setArabicForm((prev) => ({ ...prev, tags: e.target.value }))}
                      placeholder="أوفر سايز، ثقيل الوزن، كوري، الإصدار الأول"
                      className={fieldClass + " text-xs text-right font-sans"}
                      dir="rtl"
                    />
                  </div>

                  {/* Row 6: Description */}
                  <div>
                    <label className="block text-[11px] font-bold text-black/85 mb-1.5 font-sans text-right">
                      الوصف الكامل بالعربية (Description)
                    </label>
                    <textarea
                      rows={3}
                      value={arabicForm.description}
                      onChange={(e) => setArabicForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="وصف القطعة الذي يظهر للعملاء عند تصفح المتجر باللغة العربية..."
                      className={fieldClass + " text-xs text-right font-sans leading-relaxed"}
                      dir="rtl"
                    />
                  </div>

                  {/* Row 7: Editorial Story & Inspiration */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-black/85 font-sans text-right">
                        قصة القطعة وإلهام التصميم (Story & Inspiration)
                      </label>
                      <span className="text-[10px] text-black/50 font-sans">تظهر كقصة القطعة في صفحة المنتج</span>
                    </div>
                    <textarea
                      rows={2}
                      value={arabicForm.story}
                      onChange={(e) => setArabicForm((prev) => ({ ...prev, story: e.target.value }))}
                      placeholder="صُممت لتكون قطعتك الأساسية في ليالي وسهرات القاهرة الباردة بقصة واسعة ومظهر متماسك فاخر..."
                      className={fieldClass + " text-xs text-right font-sans leading-relaxed"}
                      dir="rtl"
                    />
                  </div>

                  {/* Static notice */}
                  <div className="p-3 bg-black/[0.03] border border-black/15 text-[11px] text-black/75 flex items-center gap-2">
                    <span className="font-bold shrink-0">ℹ️ تعليمات الغسيل والعناية (Care):</span>
                    <span>إذا تركت خانة الغسيل بالعربية فارغة، سيتم تطبيق الصيغة القياسية المعتمدة لهوديز وكروينك مارسيل تلقائياً.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Controls & Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Card: Publishing Status */}
          <div className="border border-black/20 bg-white p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                Publication Status
              </span>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${
                  form.is_active !== false
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-black/5 text-black/50 border-black/20"
                }`}
              >
                {form.is_active !== false ? "Live on Storefront" : "Hidden / Draft"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-black block">Publish to Storefront</span>
                <span className="text-[11px] text-black/50">Show item to visitors and accept orders</span>
              </div>
              <button
                type="button"
                onClick={() => setField("is_active", form.is_active === false ? true : false)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  form.is_active !== false ? "bg-black justify-end" : "bg-black/20 justify-start"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          </div>

          {/* Card: Category, Color & Collection */}
          <div className="border border-black/20 bg-white p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black/10 pb-2">
              Classification
            </h3>

            {/* Category: Hoodie & Crewneck + Custom */}
            <div>
              <label className={labelClass}>
                Category <span className="text-red-700">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setField("category", "hoodie");
                    setIsCustomCategory(false);
                  }}
                  className={`flex-1 py-2 px-2 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer text-center ${
                    form.category === "hoodie" && !isCustomCategory
                      ? "bg-black text-[#e7ecea] border-black shadow-xs"
                      : "bg-white text-black/60 border-black/25 hover:border-black hover:text-black"
                  }`}
                >
                  Hoodie
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setField("category", "crewneck");
                    setIsCustomCategory(false);
                  }}
                  className={`flex-1 py-2 px-2 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer text-center ${
                    (form.category === "crewneck" || form.category === "sweatshirt") && !isCustomCategory
                      ? "bg-black text-[#e7ecea] border-black shadow-xs"
                      : "bg-white text-black/60 border-black/25 hover:border-black hover:text-black"
                  }`}
                >
                  Crewneck
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCategory(true);
                    if (customCategoryInput) {
                      setField("category", customCategoryInput.toLowerCase().trim());
                    }
                  }}
                  className={`py-2 px-2.5 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer text-center ${
                    isCustomCategory
                      ? "bg-black text-[#e7ecea] border-black shadow-xs"
                      : "bg-white text-black/60 border-black/25 hover:border-black hover:text-black"
                  }`}
                  title="Enter custom category"
                >
                  + Custom
                </button>
              </div>

              {isCustomCategory && (
                <input
                  type="text"
                  value={customCategoryInput}
                  onChange={(e) => {
                    setCustomCategoryInput(e.target.value);
                    setField("category", e.target.value.toLowerCase().trim());
                  }}
                  placeholder="e.g. zip-hoodie, bomber, shorts..."
                  className={fieldClass + " text-xs mt-2"}
                  autoFocus
                />
              )}
            </div>

            {/* Product Color: ONE SINGLE INPUT / SELECT BOX WITH SWATCH PREVIEW */}
            <ComboboxInput
              label="Product Color"
              required
              value={form.color_name}
              options={dynamicOptions.colors}
              onChange={(val) => {
                setField("color_name", val);
                const matched = PRESET_COLORS.find(
                  ([name]) => name.toLowerCase() === val.toLowerCase()
                );
                if (matched) {
                  setField("color_hex", matched[1]);
                }
              }}
              placeholder="e.g. Washed Black, Concrete Grey..."
              allowCustomColorHex
              selectedColorHex={form.color_hex}
              onColorHexChange={(hex) => setField("color_hex", hex)}
              storageKey="color_name"
            />

            {/* Quick Color Presets Carousel */}
            <div>
              <span className="block text-[10px] uppercase font-bold text-black/60 mb-1.5">
                Quick Swatches ({PRESET_COLORS.length} Colors)
              </span>
              <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto p-1.5 border border-black/15 bg-black/[0.02]">
                {PRESET_COLORS.map(([cName, cHex]) => {
                  const isSelected = form.color_name.toLowerCase() === cName.toLowerCase();
                  return (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => {
                        setField("color_name", cName);
                        setField("color_hex", cHex);
                      }}
                      title={`${cName} (${cHex})`}
                      className={`relative w-6 h-6 rounded-full border transition-transform cursor-pointer shrink-0 ${
                        isSelected
                          ? "ring-2 ring-black scale-115 border-white shadow-sm z-10"
                          : "border-black/30 hover:scale-110"
                      }`}
                      style={{ backgroundColor: cHex }}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3 h-3 absolute inset-0 m-auto ${
                            ["#ffffff", "#f4f3ee", "#e3dac9"].includes(cHex.toLowerCase())
                              ? "text-black"
                              : "text-white"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Collection / Drop */}
            <ComboboxInput
              label="Collection / Drop"
              value={form.collection}
              options={dynamicOptions.collections}
              onChange={(val) => setField("collection", val)}
              placeholder="e.g. DROP 01, CORE ATELIER"
              storageKey="collection"
            />
          </div>

          {/* Card: Pricing & Discounts */}
          <div className="border border-black/20 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-black/10 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                Pricing & Discounts
              </span>
              <span className="text-[10px] font-mono text-black/50">EGP</span>
            </div>

            <div>
              <label className={labelClass}>
                Base Price (EGP) <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 1200"
                value={form.price || ""}
                onChange={(e) => setField("price", Number(e.target.value))}
                className={fieldClass + " font-mono font-bold text-sm"}
              />
            </div>

            <div>
              <label className={labelClass}>Discount Option</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "none" | "percent" | "fixed")}
                className={fieldClass}
              >
                <option value="none">No Discount</option>
                <option value="percent">Percentage Off (% OFF)</option>
                <option value="fixed">Fixed Amount Off (EGP OFF)</option>
              </select>
            </div>

            {discountType !== "none" && (
              <div>
                <label className={labelClass}>
                  {discountType === "percent" ? "Discount Rate (%):" : "Discount Amount (EGP):"}
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder={discountType === "percent" ? "e.g. 20" : "e.g. 200"}
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  className={fieldClass + " font-mono"}
                />
              </div>
            )}

            {/* Calculated Breakdown Card */}
            {priceMath.hasDiscount && (
              <div className="border border-black/15 bg-black/[0.03] p-3 text-xs space-y-1.5">
                <div className="flex justify-between items-center text-black/60">
                  <span className="text-[10px] uppercase font-bold">Original:</span>
                  <span className="font-mono line-through">{priceMath.originalPrice?.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between items-center text-red-700">
                  <span className="text-[10px] uppercase font-bold">Discount:</span>
                  <span className="font-mono font-bold">-{priceMath.discountPercent}%</span>
                </div>
                <div className="flex justify-between items-center text-black">
                  <span className="text-[10px] uppercase font-bold">Customer Saves:</span>
                  <span className="font-mono font-bold">{priceMath.discountAmount.toLocaleString()} EGP</span>
                </div>
                <div className="border-t border-black/15 pt-1.5 flex justify-between items-baseline text-emerald-800">
                  <span className="text-xs uppercase font-bold">Final Price:</span>
                  <span className="font-mono text-base font-bold">{priceMath.finalPrice.toLocaleString()} EGP</span>
                </div>
              </div>
            )}
          </div>

          {/* Card: Catalog Tags */}
          <div className="border border-black/20 bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Catalog Tags (Filter & Search)</label>
              <span className="text-[10px] text-black/50">Max 8 tags</span>
            </div>

            {/* Clickable Quick Tags Pills */}
            <div className="space-y-1.5">
              <span className="block text-[10px] uppercase font-bold text-black/60">
                Quick Preset Tags (Click to toggle)
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  "OVERSIZED",
                  "HEAVYWEIGHT",
                  "460 GSM",
                  "380 GSM",
                  "CORE",
                  "DROP 01",
                  "DROP 02",
                  "FLEECE",
                  "FRENCH TERRY",
                  "BOXY",
                  "RELAXED",
                  "LIMITED",
                  "NEW ARRIVAL",
                  "BESTSELLER",
                ].map((tag) => {
                  const currentTags = parseTags(tagsText);
                  const isSelected = currentTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        let next: string[];
                        if (isSelected) {
                          next = currentTags.filter((t) => t !== tag);
                        } else {
                          next = [...currentTags, tag];
                        }
                        setTagsText(next.join(", "));
                      }}
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-black text-white border-black"
                          : "bg-black/[0.03] text-black/70 border-black/15 hover:border-black hover:text-black"
                      }`}
                    >
                      {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Selected Tags Display */}
            {parseTags(tagsText).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {parseTags(tagsText).map((tag, idx) => (
                  <span
                    key={tag + idx}
                    className="inline-flex items-center gap-1 bg-black text-[#e7ecea] px-2 py-0.5 text-[10px] font-mono font-bold"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = parseTags(tagsText).filter((_, i) => i !== idx);
                        setTagsText(updated.join(", "));
                      }}
                      className="text-white/60 hover:text-red-300 ml-1 text-xs leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="e.g. OVERSIZED, HEAVYWEIGHT, CORE, DROP 01"
              className={fieldClass + " uppercase font-mono text-[11px]"}
            />
            <p className="text-[10px] text-black/50">
              Type custom tags separated by commas or click any preset above.
            </p>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-2 space-y-2">
            {arabicForm.title.trim() ? (
              <div className="text-[10px] text-emerald-800 font-bold flex items-center justify-center gap-1.5 py-1 bg-emerald-50 border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Arabic translation included</span>
              </div>
            ) : (
              <div className="text-[10px] text-black/50 text-center">
                Tip: Translate to Arabic before saving for bilingual visitors
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-black text-[#e7ecea] hover:bg-black/85 text-xs font-bold uppercase tracking-widest shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{isSubmitting ? "Saving Piece..." : mode === "edit" ? "Save Changes" : "Publish Piece"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
