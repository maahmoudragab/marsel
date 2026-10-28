"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, Tag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { isEgyptianMobile } from "@/lib/validation";
import { parseOffer, evaluateOffers, type RawOffer } from "@/lib/offers";
import { getStandardGovernorateName } from "@/lib/egyptianLocations";
import { useLanguage } from "@/context/LanguageContext";
import {
  CAIRO_GIZA_ZONES,
  findZone,
  getZonesByGovernorate,
  getLocalizedArea,
  type CairoGizaZone,
} from "@/lib/cairoGizaZones";

interface ShippingZone {
  governorate: string;
  area: string;
  shipping_fee: number;
}

type ActiveOffer = RawOffer;

const CHECKOUT_CACHE_KEY = "marsel_checkout_options_v3";
const CHECKOUT_CACHE_TTL = 60 * 1000;

const GOVERNORATE_ALIASES: Record<string, string[]> = {
  Cairo: ["Cairo", "القاهرة"],
  Giza: ["Giza", "الجيزة"],
  Alexandria: ["Alexandria", "الإسكندرية"],
};

const isGovernorateMatch = (val?: string | null, targetGov?: string) => {
  if (!val || !targetGov) return false;
  const aliases = GOVERNORATE_ALIASES[targetGov] || [targetGov];
  if (aliases.some((a) => a.toLowerCase() === val.toLowerCase())) return true;
  return getStandardGovernorateName(val).toLowerCase() === getStandardGovernorateName(targetGov).toLowerCase();
};


export interface CheckoutClientProps {
  initialShippingZones?: ShippingZone[];
  initialOffers?: ActiveOffer[];
}

export default function CheckoutClient({ initialShippingZones = [], initialOffers = [] }: CheckoutClientProps) {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, totalPrice, totalCount, clearCart, hydrated } = useCart();
  const { isArabic, translateTitle, translateColor, formatPrice } = useLanguage();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    whatsapp: "",
    governorate: "Cairo",
    area: "",
    address: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>(initialShippingZones);
  const [offers, setOffers] = useState<ActiveOffer[]>(initialOffers);

  // Coupons state
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    amount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  // Auto-fill state for returning customers
  const [autoFillNotice, setAutoFillNotice] = useState<{ name: string; source: "device" | "phone" } | null>(null);
  const [isLookingUpPhone, setIsLookingUpPhone] = useState(false);

  // Restore saved delivery info from localStorage on mount (for returning customers)
  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem("marsel_customer_info");
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo);
        if (parsed && (parsed.name || parsed.phone)) {
          setFormData((prev) => ({
            ...prev,
            name: parsed.name || prev.name,
            age: parsed.age || prev.age,
            phone: parsed.phone || prev.phone,
            whatsapp: parsed.whatsapp || parsed.phone || prev.whatsapp,
            governorate: (parsed.governorate === "Cairo" || parsed.governorate === "Giza") ? parsed.governorate : "Cairo",
            area: parsed.area || prev.area,
            address: parsed.address || prev.address,
          }));
          if (parsed.name) {
            setAutoFillNotice({ name: parsed.name, source: "device" });
          }
        }
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    // 1. Fetch shipping zones if not preloaded from SSR
    if (!initialShippingZones || initialShippingZones.length === 0) {
      const supabase = createClient();
      supabase
        .from("shipping_zones")
        .select("governorate, area, shipping_fee")
        .eq("is_active", true)
        .order("governorate")
        .order("area")
        .then(({ data }) => {
          if (data) setShippingZones(data as ShippingZone[]);
        });
    }

    // 2. Always fetch latest active offers on client to guarantee 100% real-time accuracy
    const fetchLatestOffers = async () => {
      try {
        const supabase = createClient();
        const now = new Date().toISOString();
        const { data: offerData, error: offerError } = await supabase
          .from("offers")
          .select("*")
          .eq("is_active", true)
          .lte("starts_at", now)
          .gte("ends_at", now)
          .order("priority", { ascending: false });

        if (!offerError && offerData) {
          setOffers(offerData as ActiveOffer[]);
        }
      } catch (err) {
        console.warn("Could not refresh active offers on checkout mount:", err);
      }
    };

    fetchLatestOffers();
  }, [initialShippingZones]);

  const distinctGovernorates = useMemo(() => {
    return ["Cairo", "Giza"];
  }, []);

  const availableZones = useMemo(() => {
    return getZonesByGovernorate(formData.governorate);
  }, [formData.governorate]);

  // Synchronize formData.area when language switches between Arabic and English
  useEffect(() => {
    if (!formData.area) return;
    const matched = findZone(formData.area, formData.governorate);
    if (matched) {
      const targetName = isArabic ? matched.nameAr : matched.nameEn;
      if (targetName !== formData.area) {
        setFormData((prev) => ({ ...prev, area: targetName }));
      }
    }
  }, [isArabic, formData.governorate]);

  // Re-translate active validation errors immediately when language switches
  useEffect(() => {
    if (Object.keys(fieldErrors).length === 0) return;
    setFieldErrors((prev) => {
      const next: Record<string, string> = {};
      if (prev.name) next.name = isArabic ? "يرجى كتابة الاسم بالكامل" : "Please enter your full name";
      if (prev.phone) {
        next.phone = !formData.phone.trim()
          ? (isArabic ? "يرجى كتابة رقم الهاتف المحمول" : "Please enter your phone number")
          : (isArabic ? "رقم الهاتف غير صحيح. يرجى إدخال 11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015" : "Invalid phone. Must be 11 digits starting with 010, 011, 012, or 015");
      }
      if (prev.whatsapp) {
        next.whatsapp = !formData.whatsapp.trim()
          ? (isArabic ? "يرجى كتابة رقم الواتساب" : "Please enter your WhatsApp number")
          : (isArabic ? "رقم الواتساب غير صحيح. يرجى إدخال 11 رقماً مصرياً صحيحاً" : "Invalid WhatsApp number. Must be an 11-digit Egyptian mobile number");
      }
      if (prev.governorate) next.governorate = isArabic ? "يرجى اختيار المحافظة" : "Please select your governorate";
      if (prev.area) next.area = isArabic ? "يرجى اختيار المنطقة أو الحي" : "Please select your area";
      if (prev.address) {
        next.address = !formData.address.trim()
          ? (isArabic ? "يرجى كتابة العنوان بالتفصيل واسم الشارع والعمارة" : "Please enter your full street address")
          : (isArabic ? "العنوان قصير جداً، يرجى إضافة تفاصيل كافية لمندوب التوصيل" : "Address is too short, please provide more details");
      }
      if (prev.age) next.age = isArabic ? "يرجى كتابة عمر صحيح (بين 12 و 99)" : "Please enter a valid age (12 - 99)";
      return next;
    });
  }, [isArabic, formData.phone, formData.whatsapp, formData.address]);

  const selectedZone = useMemo(() => {
    if (!formData.area) return null;
    const matched = findZone(formData.area, formData.governorate);
    if (matched) return matched;
    return shippingZones.find((z) => isGovernorateMatch(z.governorate, formData.governorate) && z.area === formData.area);
  }, [formData.area, formData.governorate, shippingZones]);

  const baseShippingFee = useMemo(() => {
    if (!selectedZone) return 0;
    if ("shippingFee" in selectedZone) return selectedZone.shippingFee;
    return (selectedZone as ShippingZone).shipping_fee ?? 0;
  }, [selectedZone]);

  const parsedOffers = useMemo(() => offers.map((o) => parseOffer(o)), [offers]);

  const evaluatedOffer = useMemo(() => {
    return evaluateOffers(parsedOffers, {
      items: items.map((it) => ({ price: it.price, quantity: it.quantity })),
      totalPrice,
      totalCount,
      governorate: formData.governorate,
      baseShippingFee,
    });
  }, [parsedOffers, items, totalPrice, totalCount, formData.governorate, baseShippingFee]);

  const eligibleOffer = evaluatedOffer.isFreeShipping ? evaluatedOffer.appliedOffer : null;
  const shippingFee = evaluatedOffer.isFreeShipping ? 0 : baseShippingFee;
  const autoOfferDiscount = evaluatedOffer.discountAmount;
  const couponDiscount = appliedCoupon ? appliedCoupon.amount : 0;
  const totalOrderDiscount = autoOfferDiscount + couponDiscount;
  const finalOrderTotal = Math.max(0, totalPrice + shippingFee - couponDiscount - autoOfferDiscount);

  const originalSubtotal = items.reduce(
    (sum, item) =>
      sum +
      (item.compareAtPrice && item.compareAtPrice > item.price
        ? item.compareAtPrice
        : item.price) *
        item.quantity,
    0
  );
  const productSavings = originalSubtotal - totalPrice;
  // Exclude shipping fee from totalSavings and preDiscountTotal so free delivery doesn't inflate crossed-out total or "You saved"
  const totalSavings = productSavings + totalOrderDiscount;
  const preDiscountTotal = originalSubtotal + shippingFee;

  const isFormValid = Boolean(
    formData.name.trim() &&
    formData.phone.trim() &&
    formData.whatsapp.trim() &&
    formData.governorate.trim() &&
    formData.area.trim() &&
    formData.address.trim()
  );

  const lookupCustomerByPhone = async (phoneToLookup: string) => {
    const clean = phoneToLookup.trim();
    if (!isEgyptianMobile(clean)) return;

    try {
      setIsLookingUpPhone(true);
      const res = await fetch(`/api/customers/lookup?phone=${encodeURIComponent(clean)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.found && data.customer) {
        setFormData((prev) => ({
          ...prev,
          name: prev.name.trim() ? prev.name : data.customer.name,
          age: prev.age.trim() ? prev.age : data.customer.age || "",
          whatsapp: prev.whatsapp.trim() ? prev.whatsapp : data.customer.whatsapp || clean,
          governorate: data.customer.governorate || prev.governorate,
          area: data.customer.area || prev.area,
          address: prev.address.trim() ? prev.address : data.customer.address,
        }));
        if (data.customer.name) {
          setAutoFillNotice({ name: data.customer.name, source: "phone" });
        }
        try {
          localStorage.setItem("marsel_customer_info", JSON.stringify(data.customer));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn("Auto-fill phone lookup error:", err);
    } finally {
      setIsLookingUpPhone(false);
    }
  };

  const handleClearAutoFill = () => {
    setFormData({
      name: "",
      age: "",
      phone: "",
      whatsapp: "",
      governorate: "Cairo",
      area: "",
      address: "",
      notes: "",
    });
    setAutoFillNotice(null);
    try {
      localStorage.removeItem("marsel_customer_info");
    } catch {
      // ignore
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "governorate" ? { area: "" } : {}),
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }

    if (name === "governorate" && fieldErrors.area) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.area;
        return copy;
      });
    }

    if (name === "phone") {
      const clean = value.trim();
      if (isEgyptianMobile(clean) && !formData.name.trim()) {
        lookupCustomerByPhone(clean);
      }
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    setCheckingCoupon(true);
    setCouponError("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", cleanCode)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        setCouponError("Invalid or inactive coupon code.");
        return;
      }

      const now = new Date();
      if (data.starts_at && new Date(data.starts_at) > now) {
        setCouponError("This coupon code is not active yet.");
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < now) {
        setCouponError("This coupon code has expired.");
        return;
      }

      if (data.max_uses != null && Number(data.used_count || 0) >= Number(data.max_uses)) {
        setCouponError("This coupon code has reached its maximum usage limit.");
        return;
      }

      if (data.minimum_order_amount && totalPrice < Number(data.minimum_order_amount)) {
        setCouponError(`Minimum order of ${data.minimum_order_amount} EGP required for this code.`);
        return;
      }

      let calculatedDiscount = 0;
      if (data.discount_type === "percentage") {
        calculatedDiscount = Math.round((totalPrice * Number(data.discount_value)) / 100);
      } else {
        calculatedDiscount = Math.min(totalPrice, Number(data.discount_value));
      }

      setAppliedCoupon({
        code: data.code,
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
        amount: calculatedDiscount,
      });
      setCouponCodeInput("");
    } catch {
      setCouponError("Could not verify coupon code.");
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (items.length === 0) {
      setSubmitError(isArabic ? "حقيبة التسوق فارغة." : "Your bag is empty. Please add items before checking out.");
      return;
    }

    const errors: Record<string, string> = {};

    // 1. Full Name
    if (!formData.name.trim()) {
      errors.name = isArabic ? "يرجى كتابة الاسم بالكامل" : "Please enter your full name";
    }

    // 2. Mobile Phone
    if (!formData.phone.trim()) {
      errors.phone = isArabic ? "يرجى كتابة رقم الهاتف المحمول" : "Please enter your phone number";
    } else if (!isEgyptianMobile(formData.phone)) {
      errors.phone = isArabic
        ? "رقم غير صحيح (يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقماً)"
        : "Invalid mobile number (must start with 010, 011, 012, or 015 and be 11 digits)";
    }

    // 3. WhatsApp (Required)
    if (!formData.whatsapp.trim()) {
      errors.whatsapp = isArabic ? "يرجى كتابة رقم الواتساب" : "Please enter your WhatsApp number";
    } else if (!isEgyptianMobile(formData.whatsapp.trim())) {
      errors.whatsapp = isArabic
        ? "رقم واتساب غير صحيح (يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقماً)"
        : "Invalid WhatsApp number (must start with 010, 011, 012, or 015 and be 11 digits)";
    }

    // 4. Area
    if (!formData.area.trim()) {
      errors.area = isArabic ? "يرجى اختيار المنطقة أو الحي" : "Please select your area";
    }

    // 5. Detailed Address
    if (!formData.address.trim()) {
      errors.address = isArabic ? "يرجى كتابة العنوان بالتفصيل واسم الشارع والعمارة" : "Please enter your full street address";
    } else if (formData.address.trim().length < 5) {
      errors.address = isArabic ? "العنوان قصير جداً، يرجى إضافة تفاصيل كافية لمندوب التوصيل" : "Address is too short, please provide more details";
    }

    // 6. Age (optional, but validate if entered)
    if (formData.age.trim()) {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 12 || ageNum > 99) {
        errors.age = isArabic ? "يرجى كتابة عمر صحيح (بين 12 و 99)" : "Please enter a valid age (12 - 99)";
      }
    }

    // If any error exists: highlight inputs in red and scroll smoothly to the first problem
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitError("");

      const fieldOrder = ["name", "age", "phone", "whatsapp", "governorate", "area", "address"];
      const firstErrorKey = fieldOrder.find((k) => errors[k]);
      if (firstErrorKey) {
        const el = document.querySelector(`[name="${firstErrorKey}"]`) as HTMLElement | null;
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => el.focus({ preventScroll: true }), 300);
        }
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setFieldErrors({});

    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          image: item.image,
        })),
        customer: {
          name: formData.name,
          age: formData.age,
          phone: formData.phone.trim(),
          whatsapp: formData.whatsapp.trim(),
          governorate: formData.governorate,
          area: formData.area,
          address: formData.address,
          notes: formData.notes,
        },
        couponCode: appliedCoupon?.code || null,
      };

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Order creation failed");
      }

      const generatedOrderNumber = result.orderNumber;

      // Persist customer delivery info for returning customer convenience
      try {
        localStorage.setItem(
          "marsel_customer_info",
          JSON.stringify({
            name: formData.name.trim(),
            age: formData.age ? formData.age.trim() : "",
            phone: formData.phone.trim(),
            whatsapp: formData.whatsapp.trim(),
            governorate: formData.governorate,
            area: formData.area,
            address: formData.address.trim(),
          })
        );
      } catch {
        // ignore
      }

      clearCart();
      setIsConfirmed(true);
      router.push(`/checkout/${generatedOrderNumber}`);
    } catch (err: unknown) {
      console.error("Order submit error:", err);
      const message = err instanceof Error ? err.message : "Failed to place order.";
      setSubmitError(`Could not place order: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
        {/* URL Breadcrumb */}
        <div className="pt-2 pb-2">
          <nav className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-black/55 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-black transition-colors font-mono">marsel</Link>
            <span>/</span>
            <span className="text-black font-semibold">{isArabic ? "إتمام الطلب" : "checkout"}</span>
          </nav>
        </div>

        {/* Redirection indicator if order was just placed */}
        {isConfirmed ? (
          <div className="py-24 text-center space-y-3 font-mono">
            <span className="text-xs uppercase tracking-widest text-black/60 block animate-pulse">
              {isArabic ? "جاري تحويلك لتفاصيل طلبك..." : "Redirecting to your order..."}
            </span>
          </div>
        ) : !hydrated ? (
          /* Initializing state to prevent flashing "Your bag is empty" */
          <div className="py-24 text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 block">
              {isArabic ? "جاري تجهيز صفحة إتمام الطلب..." : "Loading Checkout..."}
            </span>
          </div>
        ) : items.length === 0 ? (
          /* VIEW 2: EMPTY CART */
          <div className="max-w-md mx-auto text-center py-20 space-y-4">
            <h1 className="text-sm font-bold uppercase tracking-widest text-black/60">
              {isArabic ? "حقيبتك فارغة" : "Your bag is empty"}
            </h1>
            <p className="text-xs text-black/50">
              {isArabic ? "أضف قطعاً من التشكيلة لإتمام الطلب." : "Add pieces from the collection to proceed with checkout."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-12 px-8 bg-black text-[#f6f5f2] text-xs font-bold uppercase tracking-widest hover:bg-black/85 transition-colors shadow-sm mt-2"
            >
              {isArabic ? "تصفح التشكيلة" : "Explore Drops"}
            </Link>
          </div>
        ) : (
          /* VIEW 3: CHECKOUT TWO-COLUMN LAYOUT */
          <div className="text-left rtl:text-right">
            <div className="border-b border-black/20 pb-3 mb-5">
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">
                {isArabic ? "إتمام الطلب" : "Checkout"}
              </h1>
              <p className="text-xs text-black/60 uppercase tracking-widest mt-1">
                {isArabic ? "استوديو مارسيل — أكمل بيانات التوصيل والشحن" : "Independent Clothing Label — Complete Your Order"}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
              {/* Left Column: Customer Form (7 cols) - Box 1: Contact Details & Box 2: Delivery Address */}
              <form id="checkout-form" onSubmit={handleSubmitOrder} noValidate className="lg:col-span-7 space-y-6">
                {submitError && (
                  <div className="border border-red-500/40 bg-red-500/[0.04] p-3 text-xs text-red-600 flex items-center gap-2">
                    <span className="shrink-0 font-bold">⚠️</span>
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Box 1: Contact Details */}
                <div className="border border-black/15 bg-black/[0.02] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-black/10 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                      <span>{isArabic ? "١. بيانات العميل والتواصل" : "1. Contact Details"}</span>
                    </h2>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">
                      {isArabic ? "مطلوب" : "Required"}
                    </span>
                  </div>

                  {autoFillNotice && (
                    <div className="border border-emerald-600/30 bg-emerald-50/50 p-3 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        <span className="text-black/85 text-[11px] truncate">
                          {isArabic ? (
                            <>أهلاً بعودتك يا <strong>{autoFillNotice.name}</strong>! تم ملء بياناتك تلقائياً.</>
                          ) : (
                            <>Welcome back, <strong>{autoFillNotice.name}</strong>! Details auto-filled.</>
                          )}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearAutoFill}
                        className="text-[10px] font-mono uppercase tracking-wider text-black/50 hover:text-black underline cursor-pointer shrink-0 ml-3"
                      >
                        {isArabic ? "مسح البيانات" : "Clear info"}
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60 mb-1.5">
                        {isArabic ? "الاسم بالكامل *" : "Full Name *"}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={isArabic ? "مثال: عمر أحمد" : "e.g. Omar Ahmed"}
                        className={`w-full h-11 text-xs text-black px-3 transition-colors rounded-none placeholder:text-black/35 focus:outline-none ${
                          fieldErrors.name
                            ? "border border-red-500 bg-black/[0.01] focus:border-red-600"
                            : "border border-black/20 bg-black/[0.01] focus:border-black"
                        }`}
                      />
                      {fieldErrors.name && (
                        <p className="text-[10px] text-red-600 mt-1 font-sans">{fieldErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60 mb-1.5">
                        {isArabic ? "العمر (اختياري)" : "Age (Optional)"}
                      </label>
                      <input
                        type="number"
                        name="age"
                        min="12"
                        max="99"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder={isArabic ? "مثال: ٢٢" : "e.g. 21"}
                        className={`w-full h-11 text-xs text-black px-3 transition-colors rounded-none placeholder:text-black/35 focus:outline-none ${
                          fieldErrors.age
                            ? "border border-red-500 bg-black/[0.01] focus:border-red-600"
                            : "border border-black/20 bg-black/[0.01] focus:border-black"
                        }`}
                      />
                      {fieldErrors.age && (
                        <p className="text-[10px] text-red-600 mt-1 font-sans">{fieldErrors.age}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60">
                          {isArabic ? "رقم الهاتف المحمول *" : "Phone Number *"}
                        </label>
                        {isLookingUpPhone && (
                          <span className="text-[10px] font-mono text-black/50 animate-pulse">
                            {isArabic ? "التعرف على الهاتف..." : "Recognizing phone..."}
                          </span>
                        )}
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={() => {
                          if (isEgyptianMobile(formData.phone) && !formData.name.trim()) {
                            lookupCustomerByPhone(formData.phone);
                          }
                        }}
                        placeholder="01XXXXXXXXX"
                        className={`w-full h-11 text-xs text-black px-3 transition-colors rounded-none placeholder:text-black/35 font-mono focus:outline-none ${
                          fieldErrors.phone
                            ? "border border-red-500 bg-black/[0.01] focus:border-red-600"
                            : "border border-black/20 bg-black/[0.01] focus:border-black"
                        }`}
                      />
                      {fieldErrors.phone && (
                        <p className="text-[10px] text-red-600 mt-1 font-sans">{fieldErrors.phone}</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60">
                          {isArabic ? "رقم الواتساب *" : "WhatsApp Number *"}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.phone) {
                              setFormData((prev) => ({ ...prev, whatsapp: prev.phone }));
                              if (fieldErrors.whatsapp) {
                                setFieldErrors((prev) => {
                                  const copy = { ...prev };
                                  delete copy.whatsapp;
                                  return copy;
                                });
                              }
                            }
                          }}
                          disabled={!formData.phone}
                          className={`text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                            formData.phone && formData.whatsapp === formData.phone
                              ? "text-black font-semibold"
                              : "text-black/60 hover:text-black underline underline-offset-2"
                          }`}
                        >
                          {formData.phone && formData.whatsapp === formData.phone
                            ? isArabic ? "✓ نفس رقم الهاتف" : "✓ Same as phone"
                            : isArabic ? "نفس رقم الهاتف" : "Same as phone"}
                        </button>
                      </div>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="01XXXXXXXXX"
                        className={`w-full h-11 text-xs text-black px-3 transition-colors rounded-none placeholder:text-black/35 font-mono focus:outline-none ${
                          fieldErrors.whatsapp
                            ? "border border-red-500 bg-black/[0.01] focus:border-red-600"
                            : "border border-black/20 bg-black/[0.01] focus:border-black"
                        }`}
                      />
                      {fieldErrors.whatsapp && (
                        <p className="text-[10px] text-red-600 mt-1 font-sans">{fieldErrors.whatsapp}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Box 2: Delivery Address */}
                <div className="border border-black/15 bg-black/[0.02] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-black/10 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                      <span>{isArabic ? "٢. عنوان التوصيل" : "2. Delivery Address"}</span>
                    </h2>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">
                      {isArabic ? "مصر" : "Egypt"}
                    </span>
                  </div>

                  {/* Delivery Location Notice (Cairo & Giza Only) */}
                  <div className="p-3 border border-black/15 bg-black/[0.02] flex items-start gap-2.5">
                    <span className="text-sm mt-0.5 select-none shrink-0">📍</span>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[11px] uppercase tracking-wider text-black">
                          {isArabic ? "التوصيل متاح حالياً داخل القاهرة والجيزة فقط" : "Delivery currently available in Cairo & Giza only"}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-black text-[#e7ecea]">
                          {isArabic ? "حصري" : "EXCLUSIVE"}
                        </span>
                      </div>
                      <p className="text-[11px] text-black/65 font-sans leading-relaxed">
                        {isArabic
                          ? "نعتذر لعملائنا الكرام، التوصيل لباقي المحافظات سيتوفر قريباً جداً في التحديث القادم."
                          : "Delivery to remaining governorates across Egypt will be available very soon in our next drop."}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60 mb-1.5">
                        {isArabic ? "المحافظة *" : "Governorate *"}
                      </label>
                      <select
                        name="governorate"
                        value={formData.governorate}
                        onChange={handleInputChange}
                        className={`w-full h-11 text-xs text-black px-3 transition-colors rounded-none cursor-pointer focus:outline-none ${
                          fieldErrors.governorate
                            ? "border border-red-500 bg-black/[0.01] focus:border-red-600"
                            : "border border-black/20 bg-black/[0.01] focus:border-black"
                        }`}
                      >
                        {distinctGovernorates.map((gov) => (
                          <option key={gov} value={gov}>
                            {isArabic ? (gov === "Cairo" ? "القاهرة" : gov === "Giza" ? "الجيزة" : gov) : gov}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.governorate && (
                        <p className="text-[10px] text-red-600 mt-1 font-sans">{fieldErrors.governorate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60 mb-1.5">
                        {isArabic ? "المنطقة / الحي *" : "Area / District *"}
                      </label>
                      <select
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        className={`w-full h-11 text-xs text-black px-3 transition-colors rounded-none cursor-pointer focus:outline-none ${
                          fieldErrors.area
                            ? "border border-red-500 bg-black/[0.01] focus:border-red-600"
                            : "border border-black/20 bg-black/[0.01] focus:border-black"
                        }`}
                      >
                        <option value="">{isArabic ? "اختر منطقتك..." : "Select your area..."}</option>
                        {availableZones.map((zone) => {
                          const val = isArabic ? zone.nameAr : zone.nameEn;
                          return (
                            <option key={zone.id} value={val}>
                              {val}
                            </option>
                          );
                        })}
                      </select>
                      {fieldErrors.area && (
                        <p className="text-[10px] text-red-600 mt-1 font-sans">{fieldErrors.area}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60 mb-1.5">
                      {isArabic ? "العنوان بالتفصيل واسم الشارع والعمارة *" : "Street Address & Building Details *"}
                    </label>
                    <textarea
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder={isArabic ? "اسم الشارع، رقم العمارة، رقم الشقة، علامة مميزة..." : "Street name, Building number, Apartment, Landmark..."}
                      className={`w-full text-xs text-black p-3 transition-colors rounded-none placeholder:text-black/35 resize-none leading-relaxed focus:outline-none ${
                        fieldErrors.address
                          ? "border border-red-500 bg-black/[0.01] focus:border-red-600"
                          : "border border-black/20 bg-black/[0.01] focus:border-black"
                      }`}
                    />
                    {fieldErrors.address && (
                      <p className="text-[10px] text-red-600 mt-1 font-sans">{fieldErrors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60 mb-1.5">
                      {isArabic ? "ملاحظات إضافية للتوصيل (اختياري)" : "Order Notes (Optional)"}
                    </label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder={isArabic ? "تعليمات خاصة للتوصيل، وقت مفضل للاستلام..." : "Special delivery instructions, preferred delivery time..."}
                      className="w-full h-11 text-xs text-black border border-black/20 bg-black/[0.01] px-3 focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-black/35"
                    />
                  </div>
                </div>
              </form>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-5">
                <div className="border border-black/15 bg-black/[0.02] p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-black/10 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      {isArabic ? "ملخص الطلب" : "Order Summary"}
                    </h3>
                    <span className="text-[11px] font-mono text-black/60">
                      {totalCount} {totalCount === 1 ? (isArabic ? "قطعة" : "piece") : (isArabic ? "قطع" : "pieces")}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-black/10 max-h-72 overflow-y-auto pr-1">
                    {items.map((item) => {
                      const itemTitle = translateTitle(item.title, item.slug, item.styling_notes);
                      const itemColor = translateColor(item.color);

                      return (
                        <div key={item.id} className="py-3 flex items-center gap-3">
                          <div className="relative w-12 h-14 shrink-0 border border-black/15 bg-white flex items-center justify-center p-1 overflow-hidden">
                            {item.image ? (
                              <Image src={item.image} alt={itemTitle} fill sizes="120px" quality={85} className="object-contain p-0.5" />
                            ) : null}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold uppercase truncate">{itemTitle}</p>
                            <p className="text-[11px] text-black/60">
                              {isArabic ? "المقاس: " : "Size: "}{item.size} {itemColor && `· ${itemColor}`} · {isArabic ? "الكمية: " : "Qty: "}{item.quantity}
                            </p>
                          </div>
                          <div className="text-right rtl:text-left text-xs font-mono">
                            {item.compareAtPrice && item.compareAtPrice > item.price ? (
                              <div className="flex flex-col items-end rtl:items-start">
                                <span className="text-[10px] text-black/40 line-through">
                                  {formatPrice(item.compareAtPrice * item.quantity)}
                                </span>
                                <span className="font-bold text-black">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold text-black">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Coupon Code Section */}
                  <div className="border-t border-black/10 pt-4 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-black/60 block">
                      {isArabic ? "كود الخصم الترويجي:" : "Promotional Code:"}
                    </span>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between border border-emerald-600 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-800">
                        <div className="flex items-center gap-1.5 font-mono font-bold">
                          <Tag className="w-3.5 h-3.5" />
                          <span>{appliedCoupon.code}</span>
                          <span className="font-normal text-[11px]">
                            ({appliedCoupon.discount_type === "percentage" ? `-${appliedCoupon.discount_value}%` : `-${appliedCoupon.discount_value} ${isArabic ? "ج.م" : "EGP"}`})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-emerald-700 hover:text-black p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value)}
                          placeholder="MARSEL10"
                          className="flex-1 h-11 text-xs text-black border border-black/20 bg-black/[0.01] px-3 focus:outline-none focus:border-black transition-colors uppercase font-mono tracking-wider placeholder:normal-case placeholder:font-sans placeholder:text-black/35 rounded-none"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={checkingCoupon || !couponCodeInput.trim()}
                          className="h-11 px-5 border border-black bg-black text-[#f6f5f2] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer disabled:opacity-40 rounded-none flex items-center justify-center shrink-0"
                        >
                          {checkingCoupon ? "..." : isArabic ? "تطبيق" : "Apply"}
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-[10px] text-red-600">{couponError}</p>
                    )}
                  </div>

                  {/* Payment Notice (COD & Inspection) */}
                  <div className="border border-black/15 bg-black/[0.03] p-4 flex items-start gap-3 text-xs text-black/80">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold uppercase tracking-wide text-xs text-black">
                          {isArabic ? "الدفع عند الاستلام مع المعاينة قبل الاستلام" : "Cash on Delivery with Pre-Inspection"}
                        </p>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-emerald-700 text-white">
                          {isArabic ? "معاينة مجانية" : "INSPECT FIRST"}
                        </span>
                      </div>
                      <p className="text-[11px] text-black/65 leading-relaxed font-sans">
                        {isArabic
                          ? "يحق لك فتح الطرد ومعاينة الخامات والمقاسات بكل طمأنينة مع المندوب قبل دفع أي جنيه. الدفع نقداً أو عبر إنستاباي للمندوب."
                          : "Inspect your items and verify fit/quality with the courier before paying. Cash on delivery or InstaPay supported."}
                      </p>
                    </div>
                  </div>

                  {/* Calculations / Summary */}
                  <div className="border-t border-black/10 pt-4 space-y-2.5 text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="text-black/60 uppercase text-[11px]">{isArabic ? "المجموع الفرعي" : "Subtotal"}</span>
                      <div className="text-right rtl:text-left font-mono">
                        {productSavings > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-black/40 line-through">
                              {formatPrice(originalSubtotal)}
                            </span>
                            <span className="font-semibold text-black">
                              {formatPrice(totalPrice)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-black">{formatPrice(totalPrice)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-black/60 uppercase text-[11px]">{isArabic ? "التوصيل" : "Delivery"}</span>
                      <span className="font-mono">
                        {eligibleOffer ? (
                          <div className="flex items-center gap-1.5 justify-end rtl:justify-start">
                            <span className="text-emerald-700 font-bold uppercase tracking-wider">{isArabic ? "مجاناً" : "FREE"}</span>
                            <span className="text-[10px] text-emerald-800/80 font-sans font-normal">
                              ({isArabic ? (eligibleOffer.titleAr || eligibleOffer.title) : eligibleOffer.title})
                            </span>
                          </div>
                        ) : formData.area ? (
                          formatPrice(shippingFee)
                        ) : (
                          <span className="text-black/40 text-[11px]">{isArabic ? "اختر المنطقة" : "Select area"}</span>
                        )}
                      </span>
                    </div>

                    {productSavings > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span className="uppercase text-[11px]">{isArabic ? "خصم المنتجات" : "Item Discount"}</span>
                        <span className="font-mono">−{formatPrice(productSavings)}</span>
                      </div>
                    )}

                    {autoOfferDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span className="uppercase text-[11px]">
                          {isArabic
                            ? (evaluatedOffer.appliedOffer?.titleAr ? `عرض: ${evaluatedOffer.appliedOffer.titleAr}` : "خصم العرض")
                            : `Offer: ${evaluatedOffer.appliedOffer?.title || "Promotion"}`}
                        </span>
                        <span className="font-mono">−{formatPrice(autoOfferDiscount)}</span>
                      </div>
                    )}

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span className="uppercase text-[11px]">{isArabic ? "خصم الكوبون" : `Coupon (${appliedCoupon?.code})`}</span>
                        <span className="font-mono">−{formatPrice(couponDiscount)}</span>
                      </div>
                    )}

                    <div className="border-t border-black/15 pt-3 flex justify-between items-end">
                      <div>
                        <span className="text-xl font-bold uppercase tracking-wide text-black leading-none block">
                          {isArabic ? "الإجمالي" : "Total"}
                        </span>
                      </div>
                      <div className="text-right rtl:text-left">
                        {totalSavings > 0 && preDiscountTotal > finalOrderTotal && (
                          <div className="flex items-center justify-end rtl:justify-start gap-2 mb-1">
                            <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">
                              {isArabic ? `وفرت ${formatPrice(totalSavings)}` : `You saved ${formatPrice(totalSavings)}`}
                            </span>
                            <span className="text-xs font-mono text-black/40 line-through">
                              {formatPrice(preDiscountTotal)}
                            </span>
                          </div>
                        )}
                        <span className="text-xl font-bold font-mono text-black leading-none">
                          {formatPrice(finalOrderTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      form="checkout-form"
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className="w-full h-12 bg-black text-[#f6f5f2] text-xs font-bold uppercase tracking-widest hover:bg-black/85 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait shadow-sm flex items-center justify-center active:scale-[0.99]"
                    >
                      {isSubmitting
                        ? isArabic ? "جاري تسجيل طلبك..." : "Placing Order..."
                        : isArabic ? `تأكيد وإرسال الطلب — ${formatPrice(finalOrderTotal)}` : `Place Order — ${formatPrice(finalOrderTotal)}`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}