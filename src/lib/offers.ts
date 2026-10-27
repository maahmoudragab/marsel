export type OfferType =
  | "order_discount"          // e.g. Spend 1000 EGP get 100 EGP off
  | "free_shipping"           // e.g. Free shipping to Cairo or all Egypt
  | "buy_x_get_y"             // e.g. Buy 2 get 1 free
  | "bundle_discount"         // e.g. Buy 2 pieces get 100 EGP off
  | "free_shipping_governorate" // legacy compatibility
  | "free_shipping_quantity";   // legacy compatibility

export interface OfferConfig {
  real_type: OfferType;
  discount_value?: number;
  discount_type?: "fixed" | "percentage";
  minimum_order_amount?: number;
  minimum_quantity?: number;
  free_quantity?: number;
  governorate?: string; // "all" or specific governorate name
  show_banner?: boolean;
  banner_text?: string;
  notes?: string;
  // Arabic Translations
  title_ar?: string;
  banner_text_ar?: string;
  notes_ar?: string;
}

export interface RawOffer {
  id: string;
  title: string;
  description: string;
  offer_type: string;
  governorate?: string | null;
  minimum_quantity?: number | null;
  starts_at: string;
  ends_at: string;
  priority: number;
  is_active: boolean;
  created_at?: string;
  // Optional direct columns if migration applied
  discount_value?: number | null;
  discount_type?: string | null;
  minimum_order_amount?: number | null;
  free_quantity?: number | null;
  show_banner?: boolean | null;
  banner_text?: string | null;
}

export interface ParsedOffer {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  offerType: OfferType;
  discountValue: number;
  discountType: "fixed" | "percentage";
  minimumOrderAmount: number;
  minimumQuantity: number;
  freeQuantity: number;
  governorate: string; // "all" or specific
  showBanner: boolean;
  bannerText: string;
  bannerTextAr?: string;
  startsAt: string;
  endsAt: string;
  priority: number;
  isActive: boolean;
  createdAt?: string;
}

export function parseOffer(row: RawOffer): ParsedOffer {
  let config: OfferConfig | null = null;
  try {
    if (row.description && row.description.trim().startsWith("{")) {
      config = JSON.parse(row.description);
    }
  } catch {
    // Plain description string
  }

  // Determine actual offer type
  let offerType: OfferType = "free_shipping";
  if (config?.real_type) {
    offerType = config.real_type;
  } else if (row.offer_type === "free_shipping_governorate") {
    offerType = "free_shipping";
  } else if (row.offer_type === "free_shipping_quantity") {
    offerType = "free_shipping";
  } else if (row.offer_type as OfferType) {
    offerType = row.offer_type as OfferType;
  }

  const discountValue = Number(
    config?.discount_value ?? row.discount_value ?? (offerType === "free_shipping" ? 0 : 100)
  );
  const discountType = (config?.discount_type ?? row.discount_type ?? "fixed") as "fixed" | "percentage";
  const minimumOrderAmount = Number(config?.minimum_order_amount ?? row.minimum_order_amount ?? 0);
  const minimumQuantity = Number(
    config?.minimum_quantity ?? row.minimum_quantity ?? (offerType === "buy_x_get_y" ? 2 : 1)
  );
  const freeQuantity = Number(config?.free_quantity ?? row.free_quantity ?? 1);
  const governorate = (config?.governorate ?? row.governorate ?? "all") || "all";
  const showBanner = config?.show_banner ?? row.show_banner ?? true;
  const bannerText = config?.banner_text ?? row.banner_text ?? row.title;
  const bannerTextAr = config?.banner_text_ar ?? "";
  const titleAr = config?.title_ar ?? "";
  const descriptionAr = config?.notes_ar ?? "";

  return {
    id: row.id,
    title: row.title,
    titleAr,
    description: config?.notes || (config ? "" : row.description || ""),
    descriptionAr,
    offerType,
    discountValue,
    discountType,
    minimumOrderAmount,
    minimumQuantity,
    freeQuantity,
    governorate,
    showBanner,
    bannerText,
    bannerTextAr,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    priority: row.priority ?? 10,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export function encodeOfferPayload(data: Omit<ParsedOffer, "id" | "createdAt">): Record<string, unknown> {
  const minOrderAmount =
    data.offerType === "order_discount"
      ? Number(data.minimumOrderAmount) || 0
      : data.offerType === "free_shipping"
      ? Number(data.minimumOrderAmount) || 0
      : 0;

  const minQuantity =
    data.offerType === "buy_x_get_y" || data.offerType === "bundle_discount"
      ? Math.max(1, Number(data.minimumQuantity) || 2)
      : data.offerType === "free_shipping"
      ? Math.max(1, Number(data.minimumQuantity) || 1)
      : 1;

  const config: OfferConfig = {
    real_type: data.offerType,
    discount_value: data.offerType === "free_shipping" ? 0 : Number(data.discountValue) || 0,
    discount_type: data.discountType || "fixed",
    minimum_order_amount: minOrderAmount,
    minimum_quantity: minQuantity,
    free_quantity: Number(data.freeQuantity) || 1,
    governorate: data.governorate || "all",
    show_banner: Boolean(data.showBanner),
    banner_text: data.bannerText || data.title,
    notes: data.description || "",
    title_ar: data.titleAr || "",
    banner_text_ar: data.bannerTextAr || "",
    notes_ar: data.descriptionAr || "",
  };

  // Legacy fallback compatibility for database check constraints:
  const legacyOfferType =
    data.governorate && data.governorate !== "all"
      ? "free_shipping_governorate"
      : "free_shipping_quantity";

  const legacyGov =
    data.governorate && ["Cairo", "Giza", "Alexandria"].includes(data.governorate)
      ? data.governorate
      : legacyOfferType === "free_shipping_governorate"
      ? data.governorate || "Cairo"
      : null;

  return {
    title: data.title,
    description: JSON.stringify(config),
    offer_type: legacyOfferType,
    governorate: legacyGov,
    minimum_quantity:
      legacyOfferType === "free_shipping_quantity"
        ? Math.max(2, minQuantity)
        : minQuantity,
    starts_at: new Date(data.startsAt).toISOString(),
    ends_at: new Date(data.endsAt).toISOString(),
    priority: Number(data.priority) || 10,
    is_active: data.isActive,
  };
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  minimum_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  starts_at?: string | null;
  expires_at: string | null;
  created_at?: string;
}

export function isCouponLive(coupon: Coupon): { status: "active" | "scheduled" | "expired" | "limit_reached" | "disabled"; label: string; color: string } {
  if (!coupon.is_active) {
    return { status: "disabled", label: "Disabled", color: "bg-black/10 text-black/60 border-black/20" };
  }
  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { status: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-900 border-blue-300" };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { status: "expired", label: "Expired", color: "bg-red-100 text-red-900 border-red-300" };
  }
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
    return { status: "limit_reached", label: "Limit Reached", color: "bg-amber-100 text-amber-900 border-amber-300" };
  }
  return { status: "active", label: "Active", color: "bg-emerald-100 text-emerald-950 border-emerald-300" };
}

export function isOfferLive(offer: ParsedOffer): { status: "active" | "scheduled" | "expired" | "disabled"; label: string; color: string } {
  if (!offer.isActive) {
    return { status: "disabled", label: "Disabled", color: "bg-black/10 text-black/60 border-black/20" };
  }
  const now = new Date();
  if (offer.startsAt && new Date(offer.startsAt) > now) {
    return { status: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-900 border-blue-300" };
  }
  if (offer.endsAt && new Date(offer.endsAt) < now) {
    return { status: "expired", label: "Expired", color: "bg-red-100 text-red-900 border-red-300" };
  }
  return { status: "active", label: "Active", color: "bg-emerald-100 text-emerald-950 border-emerald-300" };
}

export function toDateTimeLocalString(isoString?: string | null): string {
  if (!isoString) {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function normalizeGov(s?: string | null): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, "");
}

export function isGovernorateMatching(offerGov?: string | null, selectedGov?: string | null): boolean {
  if (!offerGov || offerGov === "all" || offerGov.trim() === "") return true;
  if (!selectedGov || selectedGov.trim() === "") return false;

  const oNorm = normalizeGov(offerGov);
  const sNorm = normalizeGov(selectedGov);

  if (oNorm === sNorm) return true;

  const isCairo = (val: string) => val.includes("cairo") || val.includes("قاهر");
  const isGiza = (val: string) => val.includes("giza") || val.includes("جيز");
  const isAlex = (val: string) => val.includes("alex") || val.includes("اسكندر");

  if (isCairo(oNorm) && isCairo(sNorm)) return true;
  if (isGiza(oNorm) && isGiza(sNorm)) return true;
  if (isAlex(oNorm) && isAlex(sNorm)) return true;

  return oNorm.includes(sNorm) || sNorm.includes(oNorm);
}

// Evaluate eligible offers for a checkout cart
export function evaluateOffers(
  offers: ParsedOffer[],
  cart: {
    items: Array<{ price: number; quantity: number }>;
    totalPrice: number;
    totalCount: number;
    governorate: string;
    baseShippingFee: number;
  }
): {
  appliedOffer: ParsedOffer | null;
  discountAmount: number;
  isFreeShipping: boolean;
  explanation: string;
} {
  const now = new Date();
  // Filter active and within time range, sorted by priority desc
  const liveOffers = offers
    .filter((o) => o.isActive && new Date(o.startsAt) <= now && new Date(o.endsAt) >= now)
    .sort((a, b) => b.priority - a.priority);

  // STRICT SINGLE-OFFER RULE: Only evaluate and apply at most 1 offer
  for (const offer of liveOffers) {
    // 1. Order Value Discount (e.g. Spend 1000 get 100 off)
    if (offer.offerType === "order_discount") {
      if (cart.totalPrice >= offer.minimumOrderAmount) {
        let discount = 0;
        if (offer.discountType === "percentage") {
          discount = Math.round((cart.totalPrice * offer.discountValue) / 100);
        } else {
          discount = Math.min(cart.totalPrice, offer.discountValue);
        }
        return {
          appliedOffer: offer,
          discountAmount: discount,
          isFreeShipping: false,
          explanation: `${offer.title} (-${discount.toLocaleString()} EGP)`,
        };
      }
    }

    // 2. Free Shipping (e.g. Free delivery Cairo or all Egypt)
    if (offer.offerType === "free_shipping") {
      const govMatches = isGovernorateMatching(offer.governorate, cart.governorate);
      const qtyMatches = cart.totalCount >= (offer.minimumQuantity || 1);
      const spendMatches =
        !offer.minimumOrderAmount ||
        offer.minimumOrderAmount <= 0 ||
        cart.totalPrice >= offer.minimumOrderAmount;

      if (govMatches && qtyMatches && spendMatches) {
        return {
          appliedOffer: offer,
          discountAmount: 0,
          isFreeShipping: true,
          explanation: `${offer.title} (Free Delivery)`,
        };
      }
    }

    // 3. Buy X Get Y Free (e.g. Buy 2 get 1 free)
    if (offer.offerType === "buy_x_get_y") {
      const requiredItems = (offer.minimumQuantity || 2) + (offer.freeQuantity || 1);
      if (cart.totalCount >= requiredItems) {
        // Calculate discount as price of cheapest item(s) up to freeQuantity
        const allItemPrices: number[] = [];
        cart.items.forEach((it) => {
          for (let q = 0; q < it.quantity; q++) {
            allItemPrices.push(it.price);
          }
        });
        allItemPrices.sort((a, b) => a - b);
        const freeCount = Math.min(
          offer.freeQuantity || 1,
          Math.floor(cart.totalCount / requiredItems) * (offer.freeQuantity || 1)
        );
        const discount = allItemPrices.slice(0, freeCount).reduce((a, b) => a + b, 0);

        return {
          appliedOffer: offer,
          discountAmount: discount,
          isFreeShipping: false,
          explanation: `${offer.title} (-${discount.toLocaleString()} EGP)`,
        };
      }
    }

    // 4. Bundle / Quantity Discount (e.g. Buy 2 pieces get 100 EGP off)
    if (offer.offerType === "bundle_discount") {
      if (cart.totalCount >= (offer.minimumQuantity || 2)) {
        let discount = 0;
        if (offer.discountType === "percentage") {
          discount = Math.round((cart.totalPrice * offer.discountValue) / 100);
        } else {
          discount = Math.min(cart.totalPrice, offer.discountValue);
        }
        return {
          appliedOffer: offer,
          discountAmount: discount,
          isFreeShipping: false,
          explanation: `${offer.title} (-${discount.toLocaleString()} EGP)`,
        };
      }
    }
  }

  return {
    appliedOffer: null,
    discountAmount: 0,
    isFreeShipping: false,
    explanation: "",
  };
}
