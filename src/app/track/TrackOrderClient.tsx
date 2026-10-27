"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Search, CheckCircle, Package, Truck, Home, AlertCircle, MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/config/brand";
import { useLanguage } from "@/context/LanguageContext";

interface TrackedOrderItem {
  id: string;
  title: string;
  size: string;
  color?: string;
  quantity: number;
  price: number;
  compare_at_price?: number | null;
  image: string;
}

interface TrackedOrder {
  order_number: string;
  customer_name: string;
  phone: string;
  secondary_phone?: string;
  governorate: string;
  area: string;
  address?: string;
  notes?: string;
  subtotal_amount?: number;
  shipping_fee?: number;
  discount_amount?: number;
  total_amount: number;
  payment_method?: string;
  status: "pending" | "confirmed" | "processing" | "out_for_delivery" | "delivered" | "cancelled";
  created_at: string;
  updated_at: string;
  items: TrackedOrderItem[];
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

export default function TrackOrderClient() {
  const { isArabic, translateTitle, translateColor, formatPrice } = useLanguage();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("order") || "";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");

  const STEPS = [
    { key: "pending", label: isArabic ? "تم التسجيل" : "Registered", icon: Package },
    { key: "confirmed", label: isArabic ? "تم التأكيد" : "Confirmed", icon: CheckCircle },
    { key: "processing", label: isArabic ? "جاري التجهيز" : "Preparing", icon: Package },
    { key: "out_for_delivery", label: isArabic ? "خرج مع المندوب" : "Out for Delivery", icon: Truck },
    { key: "delivered", label: isArabic ? "تم التوصيل" : "Delivered", icon: Home },
  ];

  const handleSearch = async (searchTerm: string) => {
    const clean = searchTerm.trim();
    if (!clean) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (!res.ok || !data.order) {
        setError(
          data.error ||
            (isArabic
              ? "لم يتم العثور على طلب بهذا الكود أو رقم الهاتف."
              : "No order found with this code or phone number.")
        );
        setOrder(null);
      } else {
        setOrder(data.order);
      }
    } catch {
      setError(isArabic ? "خطأ في الاتصال، يرجى المحاولة مرة أخرى." : "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const getStepIndex = (status: string) => {
    switch (status) {
      case "pending":
        return 0;
      case "confirmed":
        return 1;
      case "processing":
        return 2;
      case "out_for_delivery":
        return 3;
      case "delivered":
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;
  const isCancelled = order?.status === "cancelled";

  return (
    <>
      {/* URL Breadcrumb Trail */}
      <div className="pt-2 pb-2">
        <nav className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-black/55 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-black transition-colors font-mono">
            marsel
          </Link>
          <span>/</span>
          <span className="text-black font-semibold">
            {isArabic ? "تتبع الطلب" : "track order"}
          </span>
          {order && (
            <>
              <span>/</span>
              <span className="text-black font-semibold">#{order.order_number}</span>
            </>
          )}
        </nav>
      </div>

      {/* Header Area */}
      <div className="pt-1 pb-6 space-y-3 text-left rtl:text-right">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black">
            {isArabic ? "تتبع حالة الطلب" : "Track Order"}
          </h1>
          <p className="text-xs text-black/60 tracking-wider mt-1">
            {isArabic ? "تتبع مباشر لمراحل شحن وتوصيل شحنتك" : "Real-time parcel status & delivery tracking"}
          </p>
        </div>

        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex gap-2 w-full pt-1"
        >
          <div className="relative flex-1">
            <Search className={`w-4 h-4 text-black/40 absolute ${isArabic ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isArabic ? "كود الأوردر (MRS-XXXX) أو رقم هاتفك..." : "Order code (MRS-XXXX) or mobile..."}
              required
              className={`w-full ${isArabic ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"} h-11 text-xs border border-black/20 bg-black/[0.01] focus:outline-none focus:border-black uppercase placeholder:normal-case font-mono rounded-none placeholder:text-black/35 transition-colors`}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 h-11 bg-black text-[#f6f5f2] text-xs font-bold uppercase tracking-widest hover:bg-black/85 transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
          >
            {loading ? "..." : isArabic ? "تتبع الآن" : "Track"}
          </button>
        </form>

        {error && (
          <div className="border border-red-300 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2.5 w-full">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{error}</p>
              <p className="text-[11px] text-red-600/80 mt-0.5">
                {isArabic
                  ? "تأكد من كود الطلب المرفق في رسالة الواتساب، أو تواصل مع خدمة العملاء بالأسفل."
                  : "Double check the code from your WhatsApp message, or reach out to our concierge below."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Wide Full-Width Box */}
      {order ? (
        <div className="border border-black/15 bg-black/[0.02] p-5 sm:p-8 space-y-6 sm:space-y-8 w-full mb-12 text-left rtl:text-right">
          {/* Top Section: Progress & Order Status */}
          <div className="space-y-4">
            <div className="border-b border-black/10 pb-4">
              <span className="text-[10px] uppercase tracking-widest text-black/50 font-semibold block">
                {isArabic ? "شحن مارسيل اللوجستي — متابعة حية" : "MARSEL LOGISTICS — LIVE DISPATCH"}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-black mt-1 font-mono">
                {isArabic ? `طلب رقم #${order.order_number}` : `ORDER #${order.order_number}`}
              </h2>
            </div>

            {/* Stepper progress */}
            {isCancelled ? (
              <div className="border border-red-300 bg-red-50 p-4 text-xs text-red-700 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <span className="font-bold uppercase tracking-wider block">
                    {isArabic ? "تم إلغاء الطلب" : "Order Cancelled"}
                  </span>
                  <span className="text-[11px] text-red-600/80">
                    {isArabic
                      ? "تم إلغاء هذا الطلب بناءً على رغبة العميل أو خدمة العملاء."
                      : "This order was cancelled by the customer or customer care."}
                  </span>
                </div>
              </div>
            ) : (
              <div className="pt-2 pb-2">
                <div className="grid grid-cols-5 gap-1 sm:gap-2">
                  {STEPS.map((step, idx) => {
                    const isDone = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 border flex items-center justify-center transition-colors ${
                            isCurrent
                              ? "bg-black text-[#f6f5f2] border-black"
                              : isDone
                              ? "bg-black/10 border-black text-black"
                              : "border-black/20 text-black/25 bg-transparent"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <span
                          className={`text-[9px] sm:text-[11px] tracking-wider mt-2 line-clamp-2 ${
                            isCurrent
                              ? "font-bold text-black"
                              : isDone
                              ? "font-medium text-black/70"
                              : "text-black/30"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Progress track bar */}
                <div className="w-full h-1 bg-black/10 mt-3 relative overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-500"
                    style={{
                      width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Underneath Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
            {/* Left Half: Customer & Delivery Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                  {isArabic ? "بيانات المستلم والتوصيل" : "Customer & Delivery Details"}
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">
                  {isArabic ? "العميل" : "Recipient"}
                </span>
              </div>

              <div className="space-y-0">
                <SpecRow label={isArabic ? "الاسم" : "Full Name"} value={order.customer_name} />
                <SpecRow label={isArabic ? "رقم الهاتف" : "Primary Phone"} value={order.phone} />
                {order.secondary_phone && (
                  <SpecRow label={isArabic ? "الهاتف البديل" : "Secondary Phone"} value={order.secondary_phone} />
                )}
                <SpecRow label={isArabic ? "المحافظة" : "Governorate"} value={order.governorate} />
                <SpecRow label={isArabic ? "المنطقة / المدينة" : "Area / City"} value={order.area} />
                <SpecRow label={isArabic ? "العنوان بالتفصيل" : "Street / Address"} value={order.address} />
                {order.notes && <SpecRow label={isArabic ? "ملاحظات التوصيل" : "Delivery Notes"} value={order.notes} />}
                <SpecRow
                  label={isArabic ? "تاريخ التسجيل" : "Registered On"}
                  value={new Date(order.created_at).toLocaleDateString(isArabic ? "ar-EG" : "en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
                <SpecRow
                  label={isArabic ? "طريقة الدفع" : "Payment Method"}
                  value={isArabic ? "الدفع عند الاستلام (نقداً)" : "Cash on Delivery (COD)"}
                />
              </div>

              {/* Concierge Contact pill */}
              <div className="pt-2">
                <a
                  href={getWhatsAppUrl(
                    `Hello MARSEL! I'm tracking Order #${order.order_number} and have a delivery inquiry.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-black hover:opacity-70 transition-opacity"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{isArabic ? "تواصل مع خدمة توصيل مارسيل ←" : "Contact Delivery Concierge →"}</span>
                </a>
              </div>
            </div>

            {/* Right Half: Parcel Contents & Totals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                  {isArabic
                    ? `محتويات الشحنة (${order.items?.length || 0})`
                    : `Parcel Contents (${order.items?.length || 0})`}
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">
                  {isArabic ? "قطع مؤكدة" : "Verified Pieces"}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-black/10">
                {order.items?.map((item) => {
                  const localizedTitle = translateTitle(item.title);
                  const localizedColor = translateColor(item.color);

                  return (
                    <div key={item.id} className="py-3 flex items-center gap-3.5 first:pt-0 last:pb-0">
                      <div className="relative w-14 h-16 shrink-0 border border-black/15 bg-white flex items-center justify-center p-1 overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={localizedTitle}
                            fill
                            sizes="140px"
                            quality={85}
                            className="object-contain p-0.5"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-black/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold uppercase tracking-tight truncate">
                          {localizedTitle}
                        </h4>
                        <p className="text-[11px] font-mono text-black/60 uppercase mt-0.5">
                          {isArabic ? "المقاس: " : "Size: "}
                          <span className="text-black font-semibold">{item.size}</span>
                          {localizedColor && <span> • {localizedColor}</span>}
                          <span> • {isArabic ? "الكمية: " : "Qty: "}{item.quantity}</span>
                        </p>
                      </div>
                      <div className="text-right rtl:text-left shrink-0">
                        <span className="text-xs font-mono font-bold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        {item.compare_at_price && item.compare_at_price > item.price && (
                          <p className="text-[10px] font-mono text-black/40 line-through">
                            {formatPrice(item.compare_at_price * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals Breakdown */}
              <div className="border-t border-black/15 pt-4 space-y-1.5 text-xs">
                {order.subtotal_amount !== undefined && (
                  <div className="flex justify-between text-black/60">
                    <span className="uppercase text-[11px]">{isArabic ? "المجموع الفرعي" : "Subtotal"}</span>
                    <span className="font-mono font-semibold">{formatPrice(order.subtotal_amount)}</span>
                  </div>
                )}
                {order.shipping_fee !== undefined && (
                  <div className="flex justify-between text-black/60">
                    <span className="uppercase text-[11px]">{isArabic ? "التوصيل" : "Delivery"}</span>
                    <span className="font-mono">
                      {Number(order.shipping_fee) === 0 ? (isArabic ? "مجاناً" : "FREE") : formatPrice(order.shipping_fee)}
                    </span>
                  </div>
                )}
                {order.discount_amount && Number(order.discount_amount) > 0 ? (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="uppercase text-[11px]">{isArabic ? "الخصم" : "Discount"}</span>
                    <span className="font-mono">−{formatPrice(order.discount_amount)}</span>
                  </div>
                ) : null}
                <div className="border-t border-black/15 pt-2.5 flex justify-between items-baseline font-bold">
                  <span className="text-xs uppercase tracking-wide">
                    {isArabic ? "الإجمالي (الدفع عند الاستلام)" : "Total (Cash on Delivery)"}
                  </span>
                  <span className="text-xl font-mono">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : !loading && !error ? (
        <div className="py-20 text-center max-w-md mx-auto space-y-3 border border-black/10 bg-black/[0.01] p-8 mb-12">
          <Package className="w-8 h-8 text-black/30 mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-black">
            {isArabic ? "أدخل بيانات رقم طلبك" : "Enter Your Order Reference"}
          </p>
          <p className="text-[11px] text-black/50 leading-relaxed">
            {isArabic
              ? "أدخل كود طلبك (مثل MRS-XXXX) أو رقم هاتفك المسجل بالأعلى لمتابعة مراحل الشحن الحية وتفاصيل محتويات الشحنة."
              : "Provide your order code (e.g. MRS-XXXX) or registered phone number above to inspect live shipment progress, parcel contents, and delivery details."}
          </p>
        </div>
      ) : null}
    </>
  );
}
