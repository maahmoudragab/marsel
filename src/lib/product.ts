export const ALL_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export const PRODUCT_CATEGORIES = [
  { value: "hoodie", label: "Hoodie" },
  { value: "crewneck", label: "Crewneck" },
] as const;

export const PRODUCT_FITS = [
  "Oversized",
  "Boxy",
  "Relaxed",
  "Regular",
  "Tailored",
] as const;

export const MAX_PRODUCT_IMAGES = 6;
export const MAX_DESIGN_IMAGES = 2;

export interface Product {
  id: string;
  index: number;
  slug: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  discount_label: string;
  image: string;
  images: string[];
  sizes: string[];
  description: string;
  story: string;
  details: string[];
  color_name: string;
  color_hex: string;
  composition: string;
  structure: string;
  fit: string;
  fit_notes: string;
  gender: string;
  weight_grams: number | null;
  size_guide: string;
  styling_notes: string;
  season: string;
  category: string;
  care: string;
  collection: string;
  provenance: string;
  house_label: string;
  tags: string[];
  print_file_url?: string;
  is_active?: boolean;
}

export type ProductInput = Omit<Product, "id" | "index" | "slug"> & { is_active?: boolean };

export function createProductSlug(title: string, id: string): string {
  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";
  return `${cleanTitle}-${id.slice(-5)}`;
}

export function getCoverImage(product: Pick<Product, "image" | "images">): string {
  if (product.images?.length) return product.images[0];
  return product.image || "/hoodie-cropped.png";
}

export function getGalleryImages(product: Pick<Product, "image" | "images">): string[] {
  const gallery = (product.images ?? []).filter(Boolean);
  if (gallery.length) return gallery.slice(0, MAX_PRODUCT_IMAGES);
  return product.image ? [product.image] : ["/hoodie-cropped.png"];
}

export function categoryLabel(value: string): string {
  const matched = PRODUCT_CATEGORIES.find((c) => c.value === value.toLowerCase());
  if (matched) return matched.label;
  if (value.toLowerCase() === "sweatshirt") return "Crewneck";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function parseDesignImages(url?: string | null): string[] {
  if (!url) return [];
  const trimmed = url.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr)) return arr.filter(Boolean).slice(0, MAX_DESIGN_IMAGES);
    } catch {}
  }
  if (trimmed.includes(",")) {
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean).slice(0, MAX_DESIGN_IMAGES);
  }
  return [trimmed];
}

export function encodeDesignImages(urls: string[]): string {
  const filtered = urls.filter(Boolean).slice(0, MAX_DESIGN_IMAGES);
  if (filtered.length === 0) return "";
  if (filtered.length === 1) return filtered[0];
  return JSON.stringify(filtered);
}

export function normalizeProduct(row: Record<string, unknown>): Product {
  const image = typeof row.image === "string" ? row.image : "/hoodie-cropped.png";
  const images = Array.isArray(row.images)
    ? (row.images as string[]).filter(Boolean)
    : [];

  return {
    id: String(row.id ?? ""),
    index: Number(row.index ?? 0),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    price: Number(row.price ?? 0),
    compare_at_price: row.compare_at_price == null ? null : Number(row.compare_at_price),
    discount_label: String(row.discount_label ?? ""),
    image: images[0] || image,
    images: images.length ? images : image ? [image] : [],
    sizes: Array.isArray(row.sizes) ? (row.sizes as string[]) : ["M", "L"],
    description: String(row.description ?? ""),
    story: String(row.story ?? ""),
    details: Array.isArray(row.details) ? (row.details as string[]) : [],
    color_name: String(row.color_name ?? ""),
    color_hex: String(row.color_hex ?? "#111111"),
    composition: String(row.composition ?? ""),
    structure: String(row.structure ?? ""),
    fit: String(row.fit ?? ""),
    fit_notes: String(row.fit_notes ?? ""),
    gender: String(row.gender ?? "unisex"),
    weight_grams: row.weight_grams == null ? null : Number(row.weight_grams),
    size_guide: String(row.size_guide ?? ""),
    styling_notes: String(row.styling_notes ?? ""),
    season: String(row.season ?? ""),
    category: String(row.category ?? "hoodie"),
    care: String(row.care ?? ""),
    collection: String(row.collection ?? "DROP 01"),
    provenance: String(row.provenance ?? "EGYPT"),
    house_label: String(row.house_label ?? "MARSEL"),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    print_file_url: String(row.print_file_url ?? ""),
    is_active: row.is_active !== false,
  };
}

export function emptyProductInput(): ProductInput {
  return {
    title: "",
    price: 0,
    compare_at_price: null,
    discount_label: "",
    image: "",
    images: [],
    sizes: [],
    description: "",
    story: "",
    details: [],
    color_name: "",
    color_hex: "#111111",
    composition: "",
    structure: "",
    fit: "",
    fit_notes: "",
    gender: "unisex",
    weight_grams: null,
    size_guide: "",
    styling_notes: "",
    season: "",
    category: "",
    care: "",
    collection: "",
    provenance: "EGYPT",
    house_label: "MARSEL",
    tags: [],
    print_file_url: "",
    is_active: true,
  };
}

export function parseTags(value: string): string[] {
  return value
    .split(/[,،]/)
    .map((tag) => tag.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 8);
}

export function compressImageFile(file: File, maxEdge = 1400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode image"));
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP with 0.85 quality: preserves transparency (alpha) while reducing size by up to 90%
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to JPEG if browser doesn't support WebP canvas export
              canvas.toBlob(
                (fallback) => {
                  if (!fallback) {
                    reject(new Error("Could not compress image"));
                    return;
                  }
                  resolve(fallback);
                },
                "image/jpeg",
                0.85
              );
              return;
            }
            resolve(blob);
          },
          "image/webp",
          0.85
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not encode image"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

export async function prepareProductImage(
  file: File,
  upload: (blob: Blob, fileName: string) => Promise<string | null>
): Promise<string> {
  const blob = await compressImageFile(file);
  const ext =
    blob.type === "image/webp"
      ? "webp"
      : blob.type === "image/png"
      ? "png"
      : "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const uploaded = await upload(blob, fileName);
  if (uploaded) return uploaded;
  return blobToDataUrl(blob);
}
