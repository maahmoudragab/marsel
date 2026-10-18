"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, CheckCircle, ArrowLeft, ShieldCheck, Truck, Tag, X, XCircle } from "lucide-react";
import { CartItem, useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { isEgyptianMobile } from "@/lib/validation";
import { getWhatsAppUrl } from "@/config/brand";
import { parseOffer, evaluateOffers, type RawOffer } from "@/lib/offers";
import { getStandardGovernorateName } from "@/lib/egyptianLocations";

interface ShippingZone {
  governorate: string;
  area: string;
  shipping_fee: number;
}

type ActiveOffer = RawOffer;

const CHECKOUT_CACHE_KEY = "marsel_checkout_options";
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
  const { items, removeFromCart, updateQuantity, totalPrice, totalCount, clearCart, hydrated } = useCart();
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
  const [orderNumber, setOrderNumber] = useState("");
  const [orderStatus, setOrderStatus] = useState<"pending" | "cancelled">("pending");
  const [confirmedOrderTotal, setConfirmedOrderTotal] = useState(0);
  const [confirmedOrder, setConfirmedOrder] = useState<typeof formData | null>(null);
  const [confirmedItems, setConfirmedItems] = useState<CartItem[]>([]);
  const [confirmedFinancials, setConfirmedFinancials] = useState<{
    subtotal: number;
    shippingFee: number;
    autoOfferDiscount: number;
    couponDiscount: number;
    appliedOfferTitle?: string;
    appliedCouponCode?: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState("");
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
            governorate: parsed.governorate || prev.governorate,
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
    const list = ["Cairo", "Giza", "Alexandria"];
    shippingZones.forEach((z) => {
      const std = getStandardGovernorateName(z.governorate);
      if (std && !list.includes(std)) {
        list.push(std);
      }
    });
    return list;
  }, [shippingZones]);

  const availableAreas = useMemo(
    () => shippingZones.filter((zone) => isGovernorateMatch(zone.governorate, formData.governorate)),
    [shippingZones, formData.governorate]
  );

  const selectedZone = availableAreas.find((zone) => zone.area === formData.area);
  const parsedOffers = useMemo(() => offers.map((o) => parseOffer(o)), [offers]);
  const baseShippingFee = selectedZone?.shipping_fee ?? 0;

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
    if (!isFormValid) {
      setSubmitError("Please fill in all required fields (Name, Phone, WhatsApp, Area, Address).");
      return;
    }
    if (!selectedZone) {
      setSubmitError("Please select an area for delivery.");
      return;
    }
    if (!isEgyptianMobile(formData.phone) || !isEgyptianMobile(formData.whatsapp)) {
      setSubmitError("Enter valid Egyptian mobile & WhatsApp numbers starting with 010, 011, 012, or 015.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const supabase = createClient();
      const generatedOrderNumber = `MRS-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const productIds = [...new Set(items.map((item) => item.productId))];

      const { data: existingProducts, error: productsError } = await supabase
        .from("products")
        .select("id")
        .in("id", productIds);

      if (productsError) throw productsError;
      const existingProductIds = new Set((existingProducts ?? []).map((p) => p.id));

      // 1. Insert order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: generatedOrderNumber,
          customer_name: formData.name.trim(),
          customer_age: formData.age ? parseInt(formData.age) : null,
          phone: formData.phone.trim(),
          secondary_phone: formData.whatsapp.trim(),
          governorate: formData.governorate,
          area: formData.area,
          address: formData.address.trim(),
          notes: formData.notes.trim() || null,
          subtotal_amount: totalPrice,
          discount_amount: totalOrderDiscount,
          shipping_fee: shippingFee,
          total_amount: finalOrderTotal,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          payment_method: "cash_on_delivery",
          status: "pending",
        })
        .select("id")
        .single();

      if (orderError || !orderData) {
        throw orderError ?? new Error("Order creation failed");
      }

      // 2. Insert order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: existingProductIds.has(item.productId) ? item.productId : null,
        title: item.title,
        size: item.size,
        color: item.color,
        price: item.price,
        unit_price: item.price,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        image: item.image,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Increment coupon used_count if a coupon was used
      if (appliedCoupon?.code) {
        try {
          const { data: cData } = await supabase
            .from("coupons")
            .select("used_count")
            .eq("code", appliedCoupon.code)
            .maybeSingle();

          if (cData) {
            await supabase
              .from("coupons")
              .update({ used_count: (Number(cData.used_count) || 0) + 1 })
              .eq("code", appliedCoupon.code);
          }
        } catch (err: unknown) {
          console.warn("Failed to increment coupon usage:", err);
        }
      }

      // 3. Fire Telegram Alert in background
      fetch("/api/orders/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_number: generatedOrderNumber,
          customer_name: formData.name.trim(),
          customer_age: formData.age ? parseInt(formData.age) : null,
          phone: formData.phone.trim(),
          secondary_phone: formData.whatsapp.trim(),
          governorate: formData.governorate,
          area: formData.area,
          address: formData.address.trim(),
          notes: formData.notes.trim() || null,
          subtotal_amount: totalPrice,
          discount_amount: totalOrderDiscount,
          shipping_fee: shippingFee,
          total_amount: finalOrderTotal,
          coupon_code: appliedCoupon?.code || null,
          items: items.map((it) => ({
            product_id: it.productId,
            slug: it.slug,
            title: it.title,
            size: it.size,
            color: it.color,
            quantity: it.quantity,
            price: it.price,
            image: it.image,
          })),
        }),
      }).catch((e) => console.error("Notification trigger error:", e));

      // 4. Keep confirmed state and clear cart
      setConfirmedOrderTotal(finalOrderTotal);
      setConfirmedOrder({ ...formData });
      setConfirmedItems([...items]);
      setConfirmedFinancials({
        subtotal: totalPrice,
        shippingFee,
        autoOfferDiscount,
        couponDiscount,
        appliedOfferTitle: evaluatedOffer.isFreeShipping
          ? (evaluatedOffer.appliedOffer?.title || "Free Delivery")
          : evaluatedOffer.appliedOffer?.title,
        appliedCouponCode: appliedCoupon?.code,
      });
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

      setOrderNumber(generatedOrderNumber);
      clearCart();
      setIsConfirmed(true);
    } catch (err: unknown) {
      console.error("Order submit error:", err);
      const message = err instanceof Error ? err.message : "Failed to place order.";
      setSubmitError(`Could not place order: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp link generator for order confirmation
  const getWhatsAppConfirmationUrl = () => {
    if (!confirmedOrder) return "#";
    const itemsList = confirmedItems
      .map((it) => `- ${it.title} (${it.size}) x${it.quantity}`)
      .join("\n");
    const msg = `Hello MARSEL!\n\nI just placed Order: ${orderNumber}\n${itemsList}\n\nTotal: ${confirmedOrderTotal.toLocaleString()} EGP (Cash on Delivery)\nName: ${confirmedOrder.name}\nPhone: ${confirmedOrder.phone}\nAddress: ${confirmedOrder.governorate} — ${confirmedOrder.area}\n\nPlease confirm my order!`;
    return getWhatsAppUrl(msg);
  };


  return (
    <div className="w-full">
        {/* URL Breadcrumb */}
        <div className="pt-2 pb-2">
          <nav className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-black/55 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-black transition-colors">marsel</Link>
            <span>/</span>
            <span className="text-black font-semibold">checkout</span>
          </nav>
        </div>

        {/* VIEW 1: ORDER CONFIRMED */}
        {isConfirmed ? (
          <div className="max-w-2xl mx-auto border border-black p-6 sm:p-12 text-center space-y-6">
            <div className="flex justify-center">
              {orderStatus === "cancelled" ? (
                <XCircle className="w-12 h-12 text-red-600" />
              ) : (
                <CheckCircle className="w-12 h-12 text-black" />
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-black/60 block">
                ORDER #{orderNumber}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
                {orderStatus === "cancelled" ? "Order Cancelled" : "Order Received"}
              </h1>
              <p className="text-xs text-black/70 max-w-md mx-auto leading-relaxed">
                {orderStatus === "cancelled" ? (
                  <>Order <strong>#{orderNumber}</strong> has been cancelled. No package will be dispatched.</>
                ) : (
                  <>Thank you, <strong>{confirmedOrder?.name}</strong>. Your order is registered. We will contact you via WhatsApp before dispatching your piece.</>
                )}
              </p>
            </div>

            {/* Order Details Receipt Box */}
            <div className="border border-black/20 p-5 text-left text-xs space-y-2.5 bg-black/[0.02]">
              <div className="flex justify-between border-b border-black/10 pb-2 font-semibold">
                <span>Status:</span>
                <span className={`font-mono uppercase font-bold ${orderStatus === "cancelled" ? "text-red-600" : "text-black"}`}>
                  {orderStatus === "cancelled" ? "Cancelled" : "Registered"}
                </span>
              </div>
              <div className="flex justify-between border-b border-black/10 pb-2 font-semibold">
                <span>Destination:</span>
                <span>{confirmedOrder?.governorate} — {confirmedOrder?.area}</span>
              </div>
              <div className="flex justify-between border-b border-black/10 pb-2">
                <span>Address:</span>
                <span className="text-right truncate max-w-xs">{confirmedOrder?.address}</span>
              </div>
              <div className="flex justify-between border-b border-black/10 pb-2">
                <span>Subtotal:</span>
                <span className="font-mono">{confirmedFinancials?.subtotal.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between border-b border-black/10 pb-2">
                <span>Delivery:</span>
                <span className="font-mono">
                  {confirmedFinancials?.shippingFee === 0 ? (
                    <strong className="text-emerald-700">FREE ({confirmedFinancials.appliedOfferTitle || "Offer"})</strong>
                  ) : (
                    `${confirmedFinancials?.shippingFee.toLocaleString()} EGP`
                  )}
                </span>
              </div>
              {confirmedFinancials?.autoOfferDiscount ? (
                <div className="flex justify-between border-b border-black/10 pb-2 text-emerald-700 font-semibold">
                  <span>Offer Discount ({confirmedFinancials.appliedOfferTitle || "Promo"}):</span>
                  <span className="font-mono">−{confirmedFinancials.autoOfferDiscount.toLocaleString()} EGP</span>
                </div>
              ) : null}
              {confirmedFinancials?.couponDiscount ? (
                <div className="flex justify-between border-b border-black/10 pb-2 text-emerald-700 font-semibold">
                  <span>Coupon Code ({confirmedFinancials.appliedCouponCode}):</span>
                  <span className="font-mono">−{confirmedFinancials.couponDiscount.toLocaleString()} EGP</span>
                </div>
              ) : null}
              <div className="flex justify-between border-b border-black/10 pb-2">
                <span>Payment Method:</span>
                <span>Cash on Delivery</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1">
                <span>Total to Pay:</span>
                <span className="font-mono">{confirmedOrderTotal.toLocaleString()} EGP</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Link
                href={`/track?order=${orderNumber}`}
                className="w-full h-12 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-widest hover:bg-black/85 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Track Your Order Live →</span>
              </Link>

              {orderStatus !== "cancelled" && (
                <a
                  href={getWhatsAppConfirmationUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 border border-black text-xs font-bold uppercase tracking-widest hover:bg-black/10 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Confirm on WhatsApp</span>
                </a>
              )}

              <Link
                href="/"
                className="block w-full py-2.5 text-xs text-black/60 uppercase tracking-widest hover:text-black transition-colors"
              >
                Back to Store
              </Link>
            </div>
          </div>
        ) : !hydrated ? (
          /* Initializing state to prevent flashing "Your bag is empty" */
          <div className="py-24 text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 block">
              Loading Checkout...
            </span>
          </div>
        ) : items.length === 0 ? (
          /* VIEW 2: EMPTY CART */
          <div className="max-w-md mx-auto text-center py-20 space-y-4">
            <h1 className="text-sm font-bold uppercase tracking-widest text-black/60">
              Your bag is empty
            </h1>
            <p className="text-xs text-black/50">
              Add pieces from the collection to proceed with checkout.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-12 px-8 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-widest hover:bg-black/85 transition-colors shadow-sm mt-2"
            >
              Explore Drops
            </Link>
          </div>
        ) : (
          /* VIEW 3: CHECKOUT TWO-COLUMN LAYOUT */
          <div>
            <div className="border-b border-black/20 pb-3 mb-5">
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">
                Checkout
              </h1>
              <p className="text-xs text-black/60 uppercase tracking-widest mt-1">
                Independent Clothing Label — Complete Your Order
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
              {/* Left Column: Customer Form (7 cols) - Box 1: Contact Details & Box 2: Delivery Address */}
              <form id="checkout-form" onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6">
                {submitError && (
                  <div className="border border-red-400 bg-red-50/60 p-3 text-xs text-red-700">
                    {submitError}
                  </div>
                )}

                {/* Box 1: Contact Details */}
                <div className="border border-black/15 bg-black/[0.02] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-black/10 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                      <span>1. Contact Details</span>
                    </h2>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">Required</span>
                  </div>

                  {autoFillNotice && (
                    <div className="border border-emerald-600/30 bg-emerald-50/50 p-3 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        <span className="text-black/85 text-[11px] truncate">
                          Welcome back, <strong>{autoFillNotice.name}</strong>! Details auto-filled.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearAutoFill}
                        className="text-[10px] font-mono uppercase tracking-wider text-black/50 hover:text-black underline cursor-pointer shrink-0 ml-3"
                      >
                        Clear info
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Omar Ahmed"
                        className="w-full h-11 text-xs text-black border border-black/20 bg-black/[0.01] px-3 focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-black/35"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60 mb-1.5">
                        Age (Optional)
                      </label>
                      <input
                        type="number"
                        name="age"
                        min="14"
                        max="80"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="e.g. 21"
                        className="w-full h-11 text-xs text-black border border-black/20 bg-black/[0.01] px-3 focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-black/35"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60">
                          Phone Number *
                        </label>
                        {isLookingUpPhone && (
                          <span className="text-[10px] font-mono text-black/50 animate-pulse">
                            Recognizing phone...
                          </span>
                        )}
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={() => {
                          if (isEgyptianMobile(formData.phone) && !formData.name.trim()) {
                            lookupCustomerByPhone(formData.phone);
                          }
                        }}
                        placeholder="01XXXXXXXXX"
                        className="w-full h-11 text-xs text-black border border-black/20 bg-black/[0.01] px-3 focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-black/35"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60">
                          WhatsApp Number *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.phone) {
                              setFormData((prev) => ({ ...prev, whatsapp: prev.phone }));
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
                            ? "✓ Same as phone"
                            : "Same as phone"}
                        </button>
                      </div>
                      <input
                        type="tel"
                        name="whatsapp"
                        required
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="01XXXXXXXXX"
                        className="w-full h-11 text-xs text-black border border-black/20 bg-black/[0.01] px-3 focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-black/35"
                      />
                    </div>
                  </div>
                </div>

                {/* Box 2: Delivery Address */}
                <div className="border border-black/15 bg-black/[0.02] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-black/10 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                      <span>2. Delivery Address</span>
                    </h2>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">Egypt</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60 mb-1.5">
                        Governorate *
                      </label>
                      <select
                        name="governorate"
                        value={formData.governorate}
                        onChange={handleInputChange}
                        className="w-full h-11 text-xs text-black border border-black/20 bg-black/[0.01] px-3 focus:outline-none focus:border-black transition-colors rounded-none cursor-pointer"
                      >
                        {distinctGovernorates.map((gov) => (
                          <option key={gov} value={gov}>
                            {gov}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60 mb-1.5">
                        Area / District *
                      </label>
                      <select
                        name="area"
                        required
                        value={formData.area}
                        onChange={handleInputChange}
                        className="w-full h-11 text-xs text-black border border-black/20 bg-black/[0.01] px-3 focus:outline-none focus:border-black transition-colors rounded-none cursor-pointer"
                      >
                        <option value="">Select your area...</option>
                        {availableAreas.map((zone) => (
                          <option key={zone.area} value={zone.area}>
                            {zone.area}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60 mb-1.5">
                      Street Address & Building Details *
                    </label>
                    <textarea
                      name="address"
                      required
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street name, Building number, Apartment, Landmark..."
                      className="w-full text-xs text-black border border-black/20 bg-black/[0.01] p-3 focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-black/35 resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/60 mb-1.5">
                      Order Notes (Optional)
                    </label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Special delivery instructions, preferred delivery time..."
                      className="w-full h-11 text-xs text-black border border-black/20 bg-black/[0.01] px-3 focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-black/35"
                    />
                  </div>
                </div>
              </form>

              {/* Right Column: Single Extended Box (5 cols) */}
              <div className="lg:col-span-5">
                <div className="border border-black/15 bg-black/[0.02] p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-black/10 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Order Summary
                    </h3>
                    <span className="text-[11px] font-mono text-black/60">
                      {totalCount} {totalCount === 1 ? "piece" : "pieces"}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-black/10 max-h-72 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="py-3 flex items-center gap-3">
                        <div className="w-12 h-14 shrink-0 border border-black/15 bg-black/[0.03] flex items-center justify-center p-1">
                          <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold uppercase truncate">{item.title}</p>
                          <p className="text-[11px] text-black/60">
                            Size: {item.size} {item.color && `· ${item.color}`} · Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right text-xs font-mono">
                          {item.compareAtPrice && item.compareAtPrice > item.price ? (
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-black/40 line-through">
                                {(item.compareAtPrice * item.quantity).toLocaleString()} EGP
                              </span>
                              <span className="font-bold text-black">
                                {(item.price * item.quantity).toLocaleString()} EGP
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-black">
                              {(item.price * item.quantity).toLocaleString()} EGP
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Code Section */}
                  <div className="border-t border-black/10 pt-4 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-black/60 block">
                      Promotional Code:
                    </span>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between border border-emerald-600 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-800">
                        <div className="flex items-center gap-1.5 font-mono font-bold">
                          <Tag className="w-3.5 h-3.5" />
                          <span>{appliedCoupon.code}</span>
                          <span className="font-normal text-[11px]">
                            ({appliedCoupon.discount_type === "percentage" ? `-${appliedCoupon.discount_value}%` : `-${appliedCoupon.discount_value} EGP`})
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
                          placeholder="e.g. MARSEL10"
                          className="flex-1 h-11 text-xs text-black border border-black/20 bg-black/[0.01] px-3 focus:outline-none focus:border-black transition-colors uppercase font-mono tracking-wider placeholder:normal-case placeholder:font-sans placeholder:text-black/35 rounded-none"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={checkingCoupon || !couponCodeInput.trim()}
                          className="h-11 px-5 border border-black bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer disabled:opacity-40 rounded-none flex items-center justify-center shrink-0"
                        >
                          {checkingCoupon ? "..." : "Apply"}
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-[10px] text-red-600">{couponError}</p>
                    )}
                  </div>

                  {/* Payment Notice (COD) - Inside Right Box */}
                  <div className="border border-black/15 bg-black/[0.03] p-4 flex items-start gap-3 text-xs text-black/80">
                    <ShieldCheck className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold uppercase tracking-wide text-xs">
                        Cash on Delivery (COD) Only
                      </p>
                      <p className="text-[11px] text-black/60 mt-0.5 leading-relaxed">
                        Pay upon delivery after inspecting your order. You can also pay via InstaPay / Vodafone Cash to the courier.
                      </p>
                    </div>
                  </div>

                  {/* Calculations / Summary */}
                  <div className="border-t border-black/10 pt-4 space-y-2.5 text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="text-black/60 uppercase text-[11px]">Subtotal</span>
                      <div className="text-right font-mono">
                        {productSavings > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-black/40 line-through">
                              {originalSubtotal.toLocaleString()} EGP
                            </span>
                            <span className="font-semibold text-black">
                              {totalPrice.toLocaleString()} EGP
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-black">{totalPrice.toLocaleString()} EGP</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-black/60 uppercase text-[11px]">Delivery</span>
                      <span className="font-mono">
                        {eligibleOffer ? (
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-emerald-700 font-bold uppercase tracking-wider">FREE</span>
                            <span className="text-[10px] text-emerald-800/80 font-sans font-normal">
                              ({eligibleOffer.title})
                            </span>
                          </div>
                        ) : formData.area ? (
                          `${shippingFee} EGP`
                        ) : (
                          <span className="text-black/40 text-[11px]">Select area</span>
                        )}
                      </span>
                    </div>

                    {productSavings > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span className="uppercase text-[11px]">Item Discount</span>
                        <span className="font-mono">−{productSavings.toLocaleString()} EGP</span>
                      </div>
                    )}

                    {autoOfferDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span className="uppercase text-[11px]">
                          Offer: {evaluatedOffer.appliedOffer?.title || "Promotion"}
                        </span>
                        <span className="font-mono">−{autoOfferDiscount.toLocaleString()} EGP</span>
                      </div>
                    )}

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span className="uppercase text-[11px]">Coupon ({appliedCoupon?.code})</span>
                        <span className="font-mono">−{couponDiscount.toLocaleString()} EGP</span>
                      </div>
                    )}

                    <div className="border-t border-black/15 pt-3 flex justify-between items-end">
                      <div>
                        <span className="text-xl font-bold uppercase tracking-wide text-black leading-none block">
                          Total
                        </span>
                      </div>
                      <div className="text-right">
                        {totalSavings > 0 && preDiscountTotal > finalOrderTotal && (
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">
                              You saved {totalSavings.toLocaleString()} EGP
                            </span>
                            <span className="text-xs font-mono text-black/40 line-through">
                              {preDiscountTotal.toLocaleString()} EGP
                            </span>
                          </div>
                        )}
                        <span className="text-xl font-bold font-mono text-black leading-none">
                          {finalOrderTotal.toLocaleString()} EGP
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
                      disabled={isSubmitting || !isFormValid}
                      className="w-full h-12 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-widest hover:bg-black/85 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
                    >
                      {isSubmitting ? "Placing Order..." : `Place Order — ${finalOrderTotal.toLocaleString()} EGP`}
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