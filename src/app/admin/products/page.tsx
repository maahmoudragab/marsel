"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  ImagePlus,
  Eye,
  EyeOff,
  Ruler,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Check,
  RotateCcw,
  Copy,
  RotateCw,
  CheckCircle2,
  Package,
  Layers,
  Tag,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { useProducts } from "@/context/ProductContext";
import {
  ALL_SIZES,
  MAX_PRODUCT_IMAGES,
  emptyProductInput,
  getCoverImage,
  parseTags,
  type Product,
  type ProductInput,
} from "@/lib/product";
import { uploadProductImageFile } from "@/lib/productImages";

const fieldClass =
  "w-full text-xs border border-black/25 bg-white/80 p-2.5 focus:outline-none focus:border-black transition-colors font-supreme";
const labelClass = "block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-black/80";

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

const DEFAULT_TSHIRT_SIZING: SizingRow[] = [
  { size: "S", chest: "56", length: "70", shoulder: "54", sleeve: "24" },
  { size: "M", chest: "59", length: "72", shoulder: "56", sleeve: "25" },
  { size: "L", chest: "62", length: "74", shoulder: "58", sleeve: "26" },
  { size: "XL", chest: "65", length: "76", shoulder: "60", sleeve: "27" },
  { size: "XXL", chest: "68", length: "78", shoulder: "62", sleeve: "28" },
];

const DEFAULT_PANTS_SIZING: SizingRow[] = [
  { size: "S", chest: "74", length: "104", shoulder: "32", sleeve: "26" },
  { size: "M", chest: "78", length: "106", shoulder: "33", sleeve: "27" },
  { size: "L", chest: "82", length: "108", shoulder: "34", sleeve: "28" },
  { size: "XL", chest: "86", length: "110", shoulder: "35", sleeve: "29" },
  { size: "XXL", chest: "90", length: "112", shoulder: "36", sleeve: "30" },
];

export const PRESET_COLORS: [string, string][] = [
  ["Washed Black", "#171717"],
  ["Midnight Black", "#0B0D0D"],
  ["Pure White", "#FFFFFF"],
  ["Off White", "#E8E4DA"],
  ["Concrete Grey", "#8B8C87"],
  ["Heather Grey", "#A6A6A6"],
  ["Desert Sand", "#C9B89A"],
  ["Warm Beige", "#D7C4B7"],
  ["Chocolate Brown", "#3E2723"],
  ["Forest Green", "#263A32"],
  ["Vintage Olive", "#3D4434"],
  ["Nile Navy", "#183B56"],
  ["Royal Blue", "#1A237E"],
  ["Burgundy", "#3B1E2B"],
  ["Crimson Red", "#8B0000"],
];

// Helper component: Clean input with dropdown arrow to select existing options or type custom
function ComboboxInput({
  label,
  value,
  options,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="space-y-1 relative">
      <label className={labelClass}>
        {label} {required && <span className="text-red-700">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `Type or select ${label.toLowerCase()}...`}
          className={fieldClass + " pr-9"}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-0 top-0 bottom-0 px-2.5 flex items-center justify-center text-black/40 hover:text-black cursor-pointer transition-colors"
          title="Choose from list"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {isOpen && options.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-black/30 shadow-xl z-40 max-h-48 overflow-y-auto divide-y divide-black/5">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-black/5 cursor-pointer flex items-center justify-between ${
                value === opt ? "bg-black/10 font-bold" : "text-black/80"
              }`}
            >
              <span>{opt}</span>
              {value === opt && <Check className="w-3.5 h-3.5 text-black" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Collapsible Box Wrapper
function CollapsibleSection({
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-black/20 bg-white/40 overflow-hidden transition-all">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-black/[0.02] hover:bg-black/[0.05] border-b border-black/10 cursor-pointer text-left transition-colors"
      >
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
            <span>{title}</span>
          </h3>
          {subtitle && <p className="text-[10px] text-black/50 uppercase tracking-widest mt-0.5">{subtitle}</p>}
        </div>
        <div className="p-1 text-black/60">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && <div className="p-5 space-y-5 animate-in fade-in duration-150">{children}</div>}
    </div>
  );
}

export default function AdminProductsPage() {
  const { products, loading, addProduct, updateProduct, deleteProduct, toggleProductActive, refetch } =
    useProducts();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "hidden">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3200);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      setSuccessToast("Products catalog refreshed");
    } finally {
      setRefreshing(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Accidental exit & delete confirmation state
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Accordion Sections State (All open by default for easy viewing)
  const [openSections, setOpenSections] = useState({
    basic: true,
    media: true,
    sizes: true,
    specs: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [form, setForm] = useState<ProductInput>(emptyProductInput());
  const [tagsText, setTagsText] = useState("");

  // Discount options inside basic pricing box
  const [discountType, setDiscountType] = useState<"none" | "percent" | "fixed">("none");
  const [discountInput, setDiscountInput] = useState<string>("");

  // Sizing Table State
  const [sizingRows, setSizingRows] = useState<SizingRow[]>(DEFAULT_HOODIE_SIZING);
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [newCustomSizeInput, setNewCustomSizeInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const printFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPrint, setUploadingPrint] = useState(false);

  // Extract unique options from DB for autocomplete
  const dynamicOptions = useMemo(() => {
    const categories = Array.from(
      new Set([
        "hoodie",
        "t-shirt",
        "sweatpants",
        "jacket",
        "shorts",
        "cap",
        "accessory",
        ...products.map((p) => p.category?.toLowerCase()).filter(Boolean),
      ])
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
        "Washed Black",
        "Midnight Black",
        "Concrete Grey",
        "Off White",
        "Desert Sand",
        "Forest Green",
        "Nile Blue",
        "Vintage Olive",
        "Burgundy",
        ...products.map((p) => p.color_name).filter(Boolean),
      ])
    );

    const compositions = Array.from(
      new Set([
        "100% Egyptian Cotton",
        "100% Combed Egyptian Cotton",
        "Heavyweight French Terry Cotton",
        "Cotton Heavyweight Fleece",
        "Cotton Nylon Blend",
        "Recycled Technical Nylon",
        ...products.map((p) => p.composition).filter(Boolean),
      ])
    );

    const structures = Array.from(
      new Set([
        "460 GSM heavyweight French Terry",
        "450 GSM garment-washed fleece",
        "380 GSM brushed-back fleece",
        "360 GSM brushed fleece",
        "330 GSM loopback French Terry",
        "280 GSM heavyweight jersey",
        "240 GSM combed jersey",
        ...products.map((p) => p.structure).filter(Boolean),
      ])
    );

    const fits = Array.from(
      new Set([
        "Oversized",
        "Boxy Relaxed",
        "Heavyweight Drop",
        "Regular Fit",
        "Cropped Boxy",
        "Wide-Leg Stacked",
        ...products.map((p) => p.fit).filter(Boolean),
      ])
    );

    const cares = Array.from(
      new Set([
        "Wash cold inside out at 30C. Do not bleach. Hang dry. Iron on reverse.",
        "Wash at 30C with similar colours. Zip before washing. Hang dry.",
        "Hand wash cold or gentle machine cycle. Flat dry. Do not tumble dry.",
        ...products.map((p) => p.care).filter(Boolean),
      ])
    );

    return { categories, collections, colors, compositions, structures, fits, cares };
  }, [products]);

  const setField = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Helper to parse size guide table from string
  const parseSizingGuide = (text?: string): SizingRow[] => {
    if (!text) return DEFAULT_HOODIE_SIZING;
    try {
      if (text.trim().startsWith("[") && text.trim().endsWith("]")) {
        return JSON.parse(text);
      }
    } catch {
      // fallback
    }

    // Try parsing lines like "S: Chest 60cm, Length 68cm..."
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const rows: SizingRow[] = [];
    for (const line of lines) {
      const match = line.match(/^([A-Z0-9]+):\s*Chest\s*([0-9.]+)[^,]*,\s*Length\s*([0-9.]+)[^,]*,\s*Shoulder\s*([0-9.]+)[^,]*,\s*Sleeve\s*([0-9.]+)/i);
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

  // Open Add modal with clean empty fields
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm(emptyProductInput());
    setTagsText("");
    setDiscountType("none");
    setDiscountInput("");
    setSizingRows(DEFAULT_HOODIE_SIZING);
    setCustomSizes([]);
    setNewCustomSizeInput("");
    setSubmitError("");
    setOpenSections({ basic: true, media: true, sizes: true, specs: true });
    setIsModalOpen(true);
  };

  // Open Edit modal populated with existing values
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      title: p.title,
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
      category: p.category || "",
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
    setNewCustomSizeInput("");

    if (p.compare_at_price && p.compare_at_price > p.price) {
      setForm((prev) => ({ ...prev, price: p.compare_at_price || p.price }));
      setDiscountType("fixed");
      setDiscountInput(String(p.compare_at_price - p.price));
    } else {
      setDiscountType("none");
      setDiscountInput("");
    }

    setSubmitError("");
    setOpenSections({ basic: true, media: true, sizes: true, specs: true });
    setIsModalOpen(true);
  };

  const handleDuplicate = (p: Product) => {
    setEditingProduct(null); // Mode: create new product
    setForm({
      title: `${p.title} (COPY)`,
      price: p.price || 0,
      compare_at_price: p.compare_at_price,
      discount_label: p.discount_label || "",
      image: p.image || "/hoodie-cropped.png",
      images: p.images?.length ? [...p.images] : p.image ? [p.image] : [],
      sizes: p.sizes?.length ? [...p.sizes] : [],
      description: p.description || "",
      story: p.story || "",
      details: p.details?.length ? [...p.details] : [],
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
      category: p.category || "",
      care: p.care || "",
      collection: p.collection || "DROP 01",
      provenance: p.provenance || "EGYPT",
      house_label: p.house_label || "MARSEL",
      tags: p.tags?.length ? [...p.tags] : [],
      print_file_url: p.print_file_url || "",
      is_active: true,
    });
    setTagsText((p.tags || []).join(", "));
    setSizingRows(parseSizingGuide(p.size_guide));

    const extraSizes = (p.sizes || []).filter(
      (s) => !ALL_SIZES.includes(s as (typeof ALL_SIZES)[number])
    );
    setCustomSizes(extraSizes);
    setNewCustomSizeInput("");

    if (p.compare_at_price && p.compare_at_price > p.price) {
      setDiscountType("fixed");
      setDiscountInput(String(p.compare_at_price - p.price));
    } else {
      setDiscountType("none");
      setDiscountInput("");
    }

    setSubmitError("");
    setOpenSections({ basic: true, media: true, sizes: true, specs: true });
    setIsModalOpen(true);
  };

  // Handle closing modal with discard confirmation
  const handleRequestClose = () => {
    setIsDiscardConfirmOpen(true);
  };

  const handleConfirmDiscard = () => {
    setIsDiscardConfirmOpen(false);
    setIsModalOpen(false);
  };

  // Size selections
  const toggleSize = (size: string) => {
    const selected = form.sizes.includes(size)
      ? form.sizes.filter((s) => s !== size)
      : [...form.sizes, size];
    setField("sizes", selected);
  };

  // Add custom size (e.g. XS, 3XL, 32, Free Size)
  const handleAddCustomSize = (customName?: string) => {
    const raw = typeof customName === "string" ? customName : newCustomSizeInput;
    const val = raw.trim().toUpperCase();
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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const images = [...form.images];
    const [moved] = images.splice(draggedIndex, 1);
    images.splice(dropIndex, 0, moved);
    setForm((prev) => ({ ...prev, images, image: images[0] || "" }));
    setDraggedIndex(null);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= form.images.length) return;
    const images = [...form.images];
    const [item] = images.splice(from, 1);
    images.splice(to, 0, item);
    setForm((prev) => ({ ...prev, images, image: images[0] || "" }));
  };

  const setCoverImage = (index: number) => {
    if (index === 0) return;
    moveImage(index, 0);
  };

  const removeImage = (index: number) => {
    const next = form.images.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, images: next, image: next[0] || "" }));
  };

  const handleImagesSelected = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = MAX_PRODUCT_IMAGES - form.images.length;
    if (remaining <= 0) {
      setSubmitError("Maximum 5 images allowed. First image is the cover.");
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

  const handlePrintFileSelected = async (fileList: FileList | null) => {
    if (!fileList || !fileList.length) return;
    const file = fileList[0];
    if (!file.type.startsWith("image/")) {
      setSubmitError("Design print file must be an image (PNG recommended).");
      return;
    }
    setUploadingPrint(true);
    setSubmitError("");
    try {
      const uploadedUrl = await uploadProductImageFile(file);
      setField("print_file_url", uploadedUrl);
      setSuccessToast("Print design image uploaded successfully");
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to upload print design file. Please try again.");
    } finally {
      setUploadingPrint(false);
      if (printFileInputRef.current) printFileInputRef.current.value = "";
    }
  };

  const handleRemovePrintFile = () => {
    setField("print_file_url", "");
  };

  // Pricing calculations
  // User enters Original Base Price first, then chooses discount (% or EGP), and final price is deducted.
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

    // fixed amount discount (EGP off)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!form.title.trim()) {
      setSubmitError("Product title is required.");
      setOpenSections((prev) => ({ ...prev, basic: true }));
      return;
    }
    if (!form.price || form.price <= 0) {
      setSubmitError("A valid price in EGP is required.");
      setOpenSections((prev) => ({ ...prev, basic: true }));
      return;
    }
    if (!form.category.trim()) {
      setSubmitError("Please specify a product category (e.g. hoodie, t-shirt).");
      setOpenSections((prev) => ({ ...prev, basic: true }));
      return;
    }
    if (!form.color_name.trim()) {
      setSubmitError("Please specify a color name.");
      setOpenSections((prev) => ({ ...prev, basic: true }));
      return;
    }
    if (form.images.length === 0) {
      setSubmitError("Please upload at least 1 image for the product.");
      setOpenSections((prev) => ({ ...prev, media: true }));
      return;
    }
    if (form.sizes.length === 0) {
      setSubmitError("Please select at least 1 available size.");
      setOpenSections((prev) => ({ ...prev, sizes: true }));
      return;
    }

    setIsSubmitting(true);
    try {
      const serializedGuide = serializeSizingGuide(sizingRows);

      const payload: ProductInput = {
        ...form,
        title: form.title.trim().toUpperCase(),
        price: priceMath.finalPrice,
        compare_at_price: priceMath.comparePrice,
        discount_label: priceMath.hasDiscount ? `${priceMath.discountPercent}% OFF` : "",
        size_guide: serializedGuide,
        tags: parseTags(tagsText),
        image: form.images[0] || form.image || "/hoodie-cropped.png",
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        setSuccessToast(`Updated "${payload.title}" successfully`);
      } else {
        await addProduct(payload);
        setSuccessToast(`Added "${payload.title}" to catalog`);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error saving product";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      setSuccessToast(`Deleted "${productToDelete.title}"`);
      setProductToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error deleting product";
      alert(message);
    }
  };

  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  const stats = useMemo(() => {
    const total = products.length;
    const live = products.filter((p) => p.is_active !== false).length;
    const hidden = total - live;
    const categories = categoriesList.length;
    return { total, live, hidden, categories };
  }, [products, categoriesList]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesSearch =
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q) ||
          (p.color_name && p.color_name.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }
      if (filterStatus === "active") return p.is_active !== false;
      if (filterStatus === "hidden") return p.is_active === false;
      if (selectedCategory !== "all") return p.category?.toLowerCase() === selectedCategory.toLowerCase();
      return true;
    });
  }, [products, search, filterStatus, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-black text-[#e7ecea] text-xs font-semibold shadow-2xl border border-black/30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
          <button
            onClick={() => setSuccessToast(null)}
            className="ml-2 text-white/50 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Products Studio
            </h1>
            <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 bg-black text-[#e7ecea]">
              Catalog
            </span>
          </div>
          <p className="text-xs text-black/60 uppercase tracking-widest mt-1">
            Manage catalog, pricing, drop availability & size guides
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-black/25 bg-white hover:bg-black/5 text-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh catalog"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-[#e7ecea] text-xs font-semibold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Products */}
        <div className="border border-black/20 bg-black/[0.02] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-black/60 flex items-center justify-between">
            <span>Total Catalog</span>
            <Package className="w-3.5 h-3.5 text-black/50" />
          </span>
          <div className="my-2">
            <div className="text-2xl font-black font-mono">{stats.total}</div>
            <span className="text-[10px] font-semibold text-black/60 uppercase">Pieces Created</span>
          </div>
          <span className="text-[10px] text-black/50 uppercase">Across all drops</span>
        </div>

        {/* Live in Store */}
        <div className="border border-emerald-900/30 bg-emerald-500/[0.05] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-950 flex items-center justify-between">
            <span>Live in Store</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          </span>
          <div className="my-2">
            <div className="text-2xl font-black text-emerald-950 font-mono">{stats.live}</div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase">Visible to Customers</span>
          </div>
          <span className="text-[10px] text-emerald-800/80 uppercase">
            {stats.hidden} hidden / draft
          </span>
        </div>

        {/* Hidden Products */}
        <div className="border border-black/20 bg-black/[0.02] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-black/60 flex items-center justify-between">
            <span>Draft & Hidden</span>
            <EyeOff className="w-3.5 h-3.5 text-black/50" />
          </span>
          <div className="my-2">
            <div className="text-2xl font-black font-mono">{stats.hidden}</div>
            <span className="text-[10px] font-semibold text-black/60 uppercase">Unpublished</span>
          </div>
          <span className="text-[10px] text-black/50 uppercase">Hidden from storefront</span>
        </div>

        {/* Categories */}
        <div className="border border-blue-900/20 bg-blue-500/[0.04] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-950 flex items-center justify-between">
            <span>Categories</span>
            <Layers className="w-3.5 h-3.5 text-blue-700" />
          </span>
          <div className="my-2">
            <div className="text-2xl font-black text-blue-950 font-mono">{stats.categories}</div>
            <span className="text-[10px] font-bold text-blue-800 uppercase">Product Lines</span>
          </div>
          <span className="text-[10px] text-blue-800/80 uppercase">
            {categoriesList.slice(0, 3).join(", ") || "None"}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="border border-black/20 bg-white p-3 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by title, category, collection, or color..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-8 py-2 border border-black/20 bg-black/[0.01] focus:outline-none focus:border-black font-sans transition-colors placeholder:text-black/35"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black p-0.5 cursor-pointer text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                filterStatus === "all"
                  ? "bg-black text-[#e7ecea] border-black shadow-xs"
                  : "bg-white border-black/20 text-black/70 hover:border-black hover:text-black"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                filterStatus === "active"
                  ? "bg-black text-[#e7ecea] border-black shadow-xs"
                  : "bg-white border-black/20 text-black/70 hover:border-black hover:text-black"
              }`}
            >
              Live ({stats.live})
            </button>
            <button
              onClick={() => setFilterStatus("hidden")}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                filterStatus === "hidden"
                  ? "bg-black text-[#e7ecea] border-black shadow-xs"
                  : "bg-white border-black/20 text-black/70 hover:border-black hover:text-black"
              }`}
            >
              Hidden ({stats.hidden})
            </button>

            {categoriesList.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs border border-black/25 bg-white px-3 py-1.5 focus:outline-none focus:border-black cursor-pointer font-sans"
              >
                <option value="all">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="border border-black/20 bg-white overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center text-black/50 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin" />
            <span>Loading catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-flex p-3 bg-black/5 text-black/40">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider">No Products Found</p>
            <p className="text-xs text-black/50 max-w-sm mx-auto">
              {search || filterStatus !== "all" || selectedCategory !== "all"
                ? "No products matched your current search and filter criteria."
                : "No products added yet. Click '+ Add New Product' to create one."}
            </p>
            {search || filterStatus !== "all" || selectedCategory !== "all" ? (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterStatus("all");
                  setSelectedCategory("all");
                }}
                className="mt-2 text-xs font-bold uppercase tracking-wider underline cursor-pointer"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={handleOpenAdd}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-black text-[#e7ecea] text-xs font-semibold uppercase tracking-wider hover:bg-black/85 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Product</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/20 bg-black/[0.03] text-[10px] font-bold uppercase tracking-wider text-black/70">
                  <th className="py-3 px-4">Piece</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Category & Drop</th>
                  <th className="py-3 px-4">Sizes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filteredProducts.map((p) => {
                  const isActive = p.is_active !== false;
                  return (
                    <tr key={p.id} className="hover:bg-black/[0.02] transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 bg-black/5 shrink-0 border border-black/20 overflow-hidden relative">
                            <img
                              src={getCoverImage(p)}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-xs uppercase tracking-wider text-black">
                              {p.title}
                            </div>
                            <div className="text-[10px] text-black/50 font-mono mt-0.5">
                              {p.color_name || "Standard color"} • {p.images?.length || 1}{" "}
                              {p.images?.length === 1 ? "photo" : "photos"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-black">{Number(p.price).toLocaleString()} EGP</div>
                        {p.compare_at_price && p.compare_at_price > p.price && (
                          <div className="text-[10px] text-black/40 line-through">
                            {Number(p.compare_at_price).toLocaleString()} EGP
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold uppercase text-[11px] text-black">
                          {p.category || "Uncategorized"}
                        </div>
                        <div className="text-[10px] text-black/50 uppercase">{p.collection || "Drop 01"}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.sizes?.map((s) => (
                            <span
                              key={s}
                              className="text-[9px] border border-black/20 px-1.5 py-0.5 font-mono text-black font-semibold bg-black/[0.02]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 1-Click Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={async () => {
                            await toggleProductActive(p.id, isActive);
                            setSuccessToast(`"${p.title}" is now ${!isActive ? "Live in store" : "Hidden"}`);
                          }}
                          title={isActive ? "Click to hide from store" : "Click to publish live"}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                            isActive
                              ? "bg-emerald-500/15 text-emerald-950 border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-black/10 text-black/50 border-black/15 hover:bg-black/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-600" : "bg-black/40"
                            }`}
                          />
                          <span>{isActive ? "Live" : "Hidden"}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              handleDuplicate(p);
                              setSuccessToast(`Duplicated "${p.title}" as draft`);
                            }}
                            className="p-1.5 text-black/60 hover:text-black hover:bg-black/5 border border-transparent hover:border-black/20 transition-all cursor-pointer"
                            title="Duplicate Product (Clone as New)"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-black/60 hover:text-black hover:bg-black/5 border border-transparent hover:border-black/20 transition-all cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-red-600/70 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info bar */}
        <div className="p-3 bg-black/[0.02] border-t border-black/10 text-[11px] text-black/60 flex items-center justify-between">
          <span>
            Showing <strong className="font-mono text-black">{filteredProducts.length}</strong> of{" "}
            <strong className="font-mono text-black">{products.length}</strong> total products
          </span>
          <span className="text-[10px] uppercase tracking-wider text-black/40">
            Click status button to publish/hide • Use Duplicate to quickly clone pieces
          </span>
        </div>
      </div>

      {/* PRODUCT FORM MODAL WITH 4 CLEAN COLLAPSIBLES */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 md:p-6">
          {/* Backdrop: Protected against accidental exit click */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" />

          <div className="relative w-full max-w-4xl bg-[#e7ecea] border border-black text-black shadow-2xl z-10 flex flex-col max-h-[94vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/20 bg-[#e7ecea] shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-black" />
                <div>
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider">
                    {editingProduct ? `Edit Piece: ${editingProduct.title}` : "New Studio Piece"}
                  </h2>
                  <p className="text-[10px] text-black/50 uppercase tracking-widest mt-0.5">
                    MARSEL ATELIER PRODUCT STUDIO
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRequestClose}
                className="p-1 text-black/60 hover:text-black cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error Notification */}
            {submitError && (
              <div className="mx-6 mt-4 p-3 border border-red-300 bg-red-50 text-xs text-red-800 flex items-center gap-2 shrink-0">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-700" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Form Body with 4 Collapsible Sections and Fixed Footer */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* COLLAPSIBLE 1: BASIC INFORMATION */}
              <CollapsibleSection
                title="1. Basic Information"
                subtitle="Title, description, category, collection, color & pricing"
                isOpen={openSections.basic}
                onToggle={() => toggleSection("basic")}
              >
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className={labelClass}>
                      Product Name <span className="text-red-700">*</span>
                    </label>
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
                      rows={2}
                      value={form.description}
                      onChange={(e) => setField("description", e.target.value)}
                      placeholder="A brief overview of the piece, silhouette, and construction..."
                      className={fieldClass}
                    />
                  </div>

                  {/* Category, Collection, Color in 3-col grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ComboboxInput
                      label="Category / Type"
                      required
                      value={form.category}
                      options={dynamicOptions.categories}
                      onChange={(val) => setField("category", val)}
                      placeholder="e.g. hoodie, t-shirt, pants"
                    />

                    <ComboboxInput
                      label="Collection / Drop"
                      value={form.collection}
                      options={dynamicOptions.collections}
                      onChange={(val) => setField("collection", val)}
                      placeholder="e.g. DROP 01, CORE ATELIER"
                    />

                    <div>
                      <label className={labelClass}>
                        Product Color / اللون <span className="text-red-700">*</span>
                      </label>

                      {/* 15 Ready Fixed Colors Dropdown */}
                      <select
                        value={form.color_name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setField("color_name", val);
                          const matched = PRESET_COLORS.find(([name]) => name === val);
                          if (matched) {
                            setField("color_hex", matched[1]);
                          }
                        }}
                        className={fieldClass + " font-medium"}
                      >
                        <option value="">-- اختر لون القطعة من الـ 15 لون الأساسيين --</option>
                        {PRESET_COLORS.map(([name, hex]) => (
                          <option key={name} value={name}>
                            {name} ({hex})
                          </option>
                        ))}
                      </select>

                      {/* Visual Swatch Indicator & Custom Hex if needed */}
                      <div className="flex items-center justify-between gap-2 mt-2 p-2 bg-black/5 border border-black/10">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-full border border-black/30 shadow-xs shrink-0"
                            style={{ backgroundColor: form.color_hex || "#171717" }}
                          />
                          <span className="text-xs font-bold font-mono uppercase text-black">
                            {form.color_name || "لم يتم اختيار لون"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <span className="text-[10px] text-black/50">HEX:</span>
                          <input
                            type="text"
                            value={form.color_hex || ""}
                            onChange={(e) => setField("color_hex", e.target.value)}
                            placeholder="#171717"
                            className="w-20 text-[11px] font-mono uppercase border border-black/25 bg-white px-1.5 py-0.5 text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Box with Native/Percent Discount Calculator */}
                  <div className="border border-black/20 p-4 bg-white/70 space-y-4 mt-2">
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-black">
                        Pricing & Discount Management
                      </span>
                      <span className="text-[10px] font-mono text-black/50">EGP</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Base Original Price */}
                      <div>
                        <label className={labelClass}>
                          السعر الأساسي / Base Price (EGP) <span className="text-red-700">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="مثلاً: 1200"
                          value={form.price || ""}
                          onChange={(e) => setField("price", Number(e.target.value))}
                          className={fieldClass + " font-mono font-bold text-sm"}
                        />
                      </div>

                      {/* Discount Options Mode */}
                      <div>
                        <label className={labelClass}>نوع الخصم / Discount Type</label>
                        <select
                          value={discountType}
                          onChange={(e) => setDiscountType(e.target.value as "none" | "percent" | "fixed")}
                          className={fieldClass}
                        >
                          <option value="none">بدون خصم (No Discount)</option>
                          <option value="percent">نسبة مئوية من السعر (% OFF)</option>
                          <option value="fixed">مبلغ مالي مخصوم (EGP OFF)</option>
                        </select>
                      </div>

                      {/* Discount Input */}
                      {discountType !== "none" && (
                        <div>
                          <label className={labelClass}>
                            {discountType === "percent" ? "نسبة الخصم (%):" : "قيمة الخصم (EGP):"}
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder={discountType === "percent" ? "مثلاً: 20" : "مثلاً: 200"}
                            value={discountInput}
                            onChange={(e) => setDiscountInput(e.target.value)}
                            className={fieldClass + " font-mono"}
                          />
                        </div>
                      )}
                    </div>

                    {/* Calculated Summary Breakdown Card */}
                    {priceMath.hasDiscount && (
                      <div className="border border-black/15 bg-black/[0.03] p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-black/40 block">السعر الأساسي قبل الخصم</span>
                          <span className="font-mono text-xs line-through text-black/60 font-semibold">
                            {priceMath.originalPrice?.toLocaleString()} EGP
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-black/40 block">نسبة الخصم</span>
                          <span className="font-mono text-xs font-bold text-red-700">
                            -{priceMath.discountPercent}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-black/40 block">قيمة التوفير للعميل</span>
                          <span className="font-mono text-xs font-bold text-black">
                            {priceMath.discountAmount.toLocaleString()} EGP
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-black/40 block">سعر البيع النهائي</span>
                          <span className="font-mono text-sm font-bold text-emerald-800">
                            {priceMath.finalPrice.toLocaleString()} EGP
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleSection>

              {/* COLLAPSIBLE 2: MEDIA & IMAGES */}
              <CollapsibleSection
                title={`2. Product Imagery (${form.images.length}/5)`}
                subtitle="Upload, delete, set cover, and drag & drop to reorder images"
                isOpen={openSections.media}
                onToggle={() => toggleSection("media")}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-black/10 pb-2">
                    <span className="text-[11px] text-black/60">
                      Drag any photo to reorder. The first photo is automatically used as the storefront cover.
                    </span>
                    {form.images.length < MAX_PRODUCT_IMAGES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-3 py-1.5 border border-black bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer"
                      >
                        {uploading ? "Uploading..." : "+ Add Image"}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {form.images.map((imgUrl, idx) => (
                      <div
                        key={imgUrl + idx}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(idx)}
                        className={`relative aspect-3/4 border-2 bg-black/5 overflow-hidden group cursor-move select-none ${
                          idx === 0 ? "border-black shadow-md ring-1 ring-black" : "border-black/30"
                        }`}
                      >
                        <img src={imgUrl} alt={`Piece ${idx + 1}`} className="w-full h-full object-cover" />

                        {idx === 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-black text-[#e7ecea] text-[8px] font-bold px-1.5 py-0.5 tracking-wider uppercase">
                            MAIN COVER
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
                                onClick={() => setCoverImage(idx)}
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
                      <label className="aspect-3/4 border-2 border-dashed border-black/30 hover:border-black flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-white/40 group">
                        <ImagePlus className="w-7 h-7 text-black/40 group-hover:text-black mb-1.5 transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-black">
                          {uploading ? "Uploading..." : "+ Add Image"}
                        </span>
                        <span className="text-[9px] text-black/40 mt-0.5">PNG, JPG, WEBP</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={uploading}
                          onChange={(e) => handleImagesSelected(e.target.files)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* FACTORY PRINT DESIGN FILE (صورة الديزاين للمصنع) */}
                  <div className="border border-black/20 bg-black/[0.02] p-4 mt-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-black">
                            ملف / صورة الديزاين للطباعة (Factory Print Design)
                          </span>
                          <span className="text-[10px] bg-black text-[#e7ecea] px-1.5 py-0.5 font-bold uppercase">
                            خاص بالمصنع
                          </span>
                        </div>
                        <p className="text-[11px] text-black/60 mt-0.5">
                          ارفع صورة الديزاين بجودة أصلية (PNG مفرغ) عشان تظهر للمصنع ويحملها مباشرة للطباعة.
                        </p>
                      </div>

                      {form.print_file_url && (
                        <button
                          type="button"
                          onClick={handleRemovePrintFile}
                          className="text-xs text-red-700 hover:underline font-bold cursor-pointer"
                        >
                          حذف الديزاين
                        </button>
                      )}
                    </div>

                    {form.print_file_url ? (
                      <div className="flex items-center gap-4 p-3 bg-white border border-black/15">
                        <div className="w-16 h-16 border border-black/20 bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:8px_8px] flex items-center justify-center overflow-hidden shrink-0">
                          <img
                            src={form.print_file_url}
                            alt="Design Print PNG"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-bold text-black uppercase truncate">تم رفع صورة الديزاين بنجاح</p>
                          <a
                            href={form.print_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-700 underline truncate block mt-0.5"
                          >
                            معاينة الصورة الأصلية ↗
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => printFileInputRef.current?.click()}
                          disabled={uploadingPrint}
                          className="px-3 py-1.5 border border-black/30 hover:border-black text-xs font-bold uppercase bg-white cursor-pointer"
                        >
                          {uploadingPrint ? "جاري الرفع..." : "تغيير الصورة"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white border border-dashed border-black/30">
                        <div className="text-xs text-black/70">
                          <span className="font-bold block text-black">لم يتم رفع صورة الديزاين بعد</span>
                          <span>الصيغ المدعومة: PNG عالي الجودة بخلفية شفافة</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => printFileInputRef.current?.click()}
                          disabled={uploadingPrint}
                          className="px-4 py-2 bg-black text-[#e7ecea] hover:bg-black/85 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                        >
                          {uploadingPrint ? "جاري الرفع..." : "+ رفع صورة الديزاين (PNG)"}
                        </button>
                      </div>
                    )}

                    <input
                      ref={printFileInputRef}
                      type="file"
                      accept="image/*"
                      disabled={uploadingPrint}
                      onChange={(e) => handlePrintFileSelected(e.target.files)}
                      className="hidden"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* COLLAPSIBLE 3: SIZES & SIZE GUIDE TABLE */}
              <CollapsibleSection
                title={`3. Sizes & Measurements Table (${form.sizes.length} selected)`}
                subtitle="Select available sizes & edit measurements directly in the table"
                isOpen={openSections.sizes}
                onToggle={() => toggleSection("sizes")}
              >
                <div className="space-y-5">
                  {/* Sizes Pills Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>
                        Available Sizes <span className="text-red-700">*</span>
                      </label>
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

                    {/* Standard & Custom Sizes Pills */}
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
                                : "bg-white/60 text-black/50 border-black/20 hover:border-black hover:text-black"
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
                                : "bg-white/60 text-black/60 border-black/25 hover:border-black hover:text-black"
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
                              title={`Remove custom size ${size}`}
                              className={`pr-2.5 pl-0.5 py-2 hover:opacity-100 cursor-pointer transition-opacity ${
                                isSelected
                                  ? "text-white/60 hover:text-red-300"
                                  : "text-black/40 hover:text-red-600"
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Custom Size Inline Bar & Quick Suggestions */}
                    <div className="pt-2 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newCustomSizeInput}
                          onChange={(e) => setNewCustomSizeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomSize();
                            }
                          }}
                          placeholder="Add custom size (e.g. XS, 3XL, 32, Free Size)..."
                          className="w-56 h-8 text-xs border border-black/25 bg-white px-2.5 font-mono uppercase focus:outline-none focus:border-black placeholder:normal-case placeholder:text-black/35"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomSize()}
                          disabled={!newCustomSizeInput.trim()}
                          className="h-8 px-3 bg-black text-[#e7ecea] text-[11px] font-bold uppercase tracking-wider hover:bg-black/85 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          + Add Size
                        </button>
                      </div>

                      {/* Quick Suggestions */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">
                          Quick add:
                        </span>
                        {["XS", "3XL", "4XL", "Free Size"].map((s) => {
                          const alreadyExists =
                            ALL_SIZES.includes(s as (typeof ALL_SIZES)[number]) ||
                            customSizes.includes(s);
                          if (alreadyExists) return null;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleAddCustomSize(s)}
                              className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-black/20 bg-white/70 hover:border-black hover:bg-white text-black/75 cursor-pointer transition-colors"
                            >
                              +{s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Sizing Table Section with Direct In-Table Cell Editing */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-2">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-black/70" />
                        <span className="text-xs font-bold uppercase tracking-wider text-black">
                          Interactive Sizing Table
                        </span>
                      </div>

                      {/* Ready 1-Click Templates */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-black/50">Presets:</span>
                        <button
                          type="button"
                          onClick={() => setSizingRows(DEFAULT_HOODIE_SIZING)}
                          className="px-2.5 py-1 text-[10px] font-bold uppercase border border-black/20 hover:border-black bg-white cursor-pointer transition-colors"
                        >
                          Hoodie
                        </button>
                        <button
                          type="button"
                          onClick={() => setSizingRows(DEFAULT_TSHIRT_SIZING)}
                          className="px-2.5 py-1 text-[10px] font-bold uppercase border border-black/20 hover:border-black bg-white cursor-pointer transition-colors"
                        >
                          T-Shirt
                        </button>
                        <button
                          type="button"
                          onClick={() => setSizingRows(DEFAULT_PANTS_SIZING)}
                          className="px-2.5 py-1 text-[10px] font-bold uppercase border border-black/20 hover:border-black bg-white cursor-pointer transition-colors"
                        >
                          Pants
                        </button>
                      </div>
                    </div>

                    {/* Sizing Table Display */}
                    <div className="border border-black/20 overflow-x-auto bg-white/70">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-black/5 border-b border-black/20 text-black font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-2.5">Size</th>
                            <th className="p-2.5">Chest (A) cm</th>
                            <th className="p-2.5">Length (B) cm</th>
                            <th className="p-2.5">Shoulder (C) cm</th>
                            <th className="p-2.5">Sleeve (D) cm</th>
                            <th className="p-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/10">
                          {sizingRows.map((row, index) => (
                            <tr key={index} className="hover:bg-black/[0.02]">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.size}
                                  onChange={(e) => {
                                    const updated = [...sizingRows];
                                    updated[index].size = e.target.value.toUpperCase();
                                    setSizingRows(updated);
                                  }}
                                  className="w-16 p-1.5 border border-black/20 bg-white font-bold text-center uppercase"
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
                                  className="w-20 p-1.5 border border-black/20 bg-white text-center"
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
                                  className="w-20 p-1.5 border border-black/20 bg-white text-center"
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
                                  className="w-20 p-1.5 border border-black/20 bg-white text-center"
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
                                  className="w-20 p-1.5 border border-black/20 bg-white text-center"
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
                      <span>Add Size Row</span>
                    </button>
                  </div>
                </div>
              </CollapsibleSection>

              {/* COLLAPSIBLE 4: FABRIC, FIT, STORY & TAGS */}
              <CollapsibleSection
                title="4. Fabric, Fit & Editorial Story"
                subtitle="Composition, GSM structure, silhouette, care instructions & story"
                isOpen={openSections.specs}
                onToggle={() => toggleSection("specs")}
              >
                <div className="space-y-4">
                  {/* Fabric Composition & Structure */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ComboboxInput
                      label="Fabric Composition"
                      value={form.composition}
                      options={dynamicOptions.compositions}
                      onChange={(val) => setField("composition", val)}
                      placeholder="e.g. 100% Egyptian Cotton"
                    />

                    <ComboboxInput
                      label="Fabric Structure & GSM"
                      value={form.structure}
                      options={dynamicOptions.structures}
                      onChange={(val) => setField("structure", val)}
                      placeholder="e.g. 460 GSM heavyweight French Terry"
                    />
                  </div>

                  {/* Fit Silhouette & Washing Care */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ComboboxInput
                      label="Fit Silhouette"
                      value={form.fit}
                      options={dynamicOptions.fits}
                      onChange={(val) => setField("fit", val)}
                      placeholder="e.g. Oversized Boxy"
                    />

                    <ComboboxInput
                      label="Washing & Care Instructions"
                      value={form.care}
                      options={dynamicOptions.cares}
                      onChange={(val) => setField("care", val)}
                      placeholder="e.g. Wash cold at 30C inside out. Hang dry."
                    />
                  </div>

                  {/* Editorial Story */}
                  <div>
                    <label className={labelClass}>Story & Inspiration</label>
                    <textarea
                      rows={2}
                      value={form.story}
                      onChange={(e) => setField("story", e.target.value)}
                      placeholder="Built as an essential streetwear layer for cooler Cairo evenings with a structured, relaxed drape..."
                      className={fieldClass}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className={labelClass}>Catalog Tags (Separate with commas)</label>
                    <input
                      type="text"
                      value={tagsText}
                      onChange={(e) => setTagsText(e.target.value)}
                      placeholder="OVERSIZED, HEAVYWEIGHT, CORE, DROP 01"
                      className={fieldClass + " uppercase font-mono"}
                    />
                  </div>
                </div>
              </CollapsibleSection>
              </div>

              {/* Solid Fixed Action Footer with On/Off Storefront Switch */}
              <div className="border-t border-black/20 bg-[#e7ecea] px-6 py-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 z-40">
                {/* On/Off Storefront Switch */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setField("is_active", form.is_active === false)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      form.is_active !== false ? "bg-black" : "bg-black/20"
                    }`}
                    role="switch"
                    aria-checked={form.is_active !== false}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        form.is_active !== false ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <div className="text-left">
                    <span className="text-xs font-bold uppercase tracking-wider block text-black">
                      {form.is_active !== false ? "Live on Storefront" : "Hidden in Catalog"}
                    </span>
                    <span className="text-[10px] text-black/50">
                      {form.is_active !== false ? "Piece is visible to customers" : "Piece is saved as draft"}
                    </span>
                  </div>
                </div>

                {/* Cancel & Submit buttons */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleRequestClose}
                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-black/5 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploading}
                    className="px-8 py-2.5 border border-black bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-wider hover:bg-black/85 disabled:opacity-50 transition-colors cursor-pointer shadow-md"
                  >
                    {isSubmitting
                      ? "Saving Piece..."
                      : editingProduct
                      ? "Save Piece Changes"
                      : "Add Product"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP 1: DISCARD UNSAVED CHANGES */}
      {isDiscardConfirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative bg-[#e7ecea] border-2 border-black p-6 max-w-sm w-full text-black shadow-2xl z-10 space-y-4">
            <div className="flex items-center gap-2 text-black">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Discard Unsaved Changes?</h3>
            </div>
            <p className="text-xs text-black/70 leading-relaxed">
              You have unsaved changes in this form. If you exit now, any entered details will be lost.
            </p>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-black/10">
              <button
                type="button"
                onClick={() => setIsDiscardConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black/5 cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 py-2 border border-red-700 bg-red-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-800 cursor-pointer shadow-sm"
              >
                Discard & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP 2: PERMANENT PRODUCT DELETION */}
      {productToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setProductToDelete(null)}
          />
          <div className="relative bg-[#e7ecea] border-2 border-black p-6 max-w-md w-full text-black shadow-2xl z-10 space-y-4">
            <div className="flex items-center gap-2 text-black">
              <Trash2 className="w-5 h-5 text-red-700 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Delete Product Permanently?</h3>
            </div>
            <div className="text-xs text-black/70 leading-relaxed space-y-2">
              <p>
                Are you sure you want to delete <span className="font-bold text-black">&quot;{productToDelete.title}&quot;</span>?
              </p>
              <p className="text-[11px] text-red-700 font-semibold">
                This action cannot be undone. The piece and its images will be removed from your store catalog.
              </p>
            </div>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-black/10">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 border border-red-700 bg-red-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-800 cursor-pointer shadow-sm"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
