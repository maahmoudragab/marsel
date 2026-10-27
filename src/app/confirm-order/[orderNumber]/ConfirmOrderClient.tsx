"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  Calendar,
  Clock,
  CreditCard,
  Eye,
  FileText,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface OrderItem {
  id: string;
  product_id?: string;
  title: string;
  size: string;
  color?: string | null;
  price: number;
  compare_at_price?: number | null;
  quantity: number;
  total_price?: number;
  image?: string;
}

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_age?: number | null;
  phone: string;
  secondary_phone?: string | null;
  governorate: string;
  area: string;
  address: string;
  notes?: string | null;
  subtotal_amount: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  coupon_code?: string | null;
  payment_method?: string | null;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
}

export default function ConfirmOrderClient({ initialOrder }: { initialOrder: OrderData }) {
  const { isArabic } = useLanguage();
  const [order, setOrder] = useState<OrderData>(initialOrder);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const items = order.order_items || [];

  const formattedDate = new Date(order.created_at).toLocaleDateString(
    isArabic ? "ar-EG" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const formattedTime = new Date(order.created_at).toLocaleTimeString(
    isArabic ? "ar-EG" : "en-US",
    { hour: "2-digit", minute: "2-digit" }
  );

  const handleCancelOrder = async () => {
    const confirmPrompt = isArabic
      ? `هل أنت متأكد من رغبتك في إلغاء الطلب #${order.order_number}؟`
      : `Are you sure you want to cancel order #${order.order_number}?`;

    if (!window.confirm(confirmPrompt)) {
      return;
    }

    setIsCancelling(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: order.order_number,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(
          data.error ||
            (isArabic
              ? "تعذر إلغاء الطلب حالياً. برجاء المحاولة لاحقاً."
              : "Unable to cancel order right now. Please try again.")
        );
      }

      setOrder((prev) => ({ ...prev, status: "cancelled" }));
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : isArabic
          ? "فشل في إلغاء الطلب."
          : "Failed to cancel order.";
      setErrorMsg(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmOrder = async () => {
    setIsConfirming(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: order.order_number,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(
          data.error ||
            (isArabic
              ? "تعذر تأكيد الطلب حالياً. برجاء المحاولة لاحقاً."
              : "Unable to confirm order right now. Please try again.")
        );
      }

      // Redirect directly to the live tracking page
      window.location.href = `/track?order=${encodeURIComponent(order.order_number)}`;
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : isArabic
          ? "حدث خطأ غير متوقع."
          : "An unexpected error occurred.";
      setErrorMsg(msg);
      setIsConfirming(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 sm:py-14 space-y-6 text-left rtl:text-right font-sans">
      
      {/* 1. رأس الصفحة: رقم الطلب واسم العميل */}
      <div className="text-center space-y-1 pb-1">
        <span className="text-[11px] font-mono uppercase tracking-widest text-black/50 block">
          {isArabic ? `طلب رقم #${order.order_number}` : `ORDER #${order.order_number}`}
        </span>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
          {order.status === "cancelled"
            ? isArabic ? "تم إلغاء الطلب" : "Order Cancelled"
            : isArabic ? `تأكيد طلبك، ${order.customer_name}` : `Confirm Your Order, ${order.customer_name}`}
        </h1>
        <p className="text-xs text-black/60 max-w-md mx-auto">
          {order.status === "cancelled"
            ? isArabic
              ? `تم إلغاء الطلب #${order.order_number}. لن يتم شحن أي طرد.`
              : `Order #${order.order_number} has been cancelled.`
            : isArabic
            ? "راجع تفاصيل طلبك وبيانات الشحن أدناه لتأكيد التجهيز الفوري للقطعة."
            : "Review your order details and delivery info below to authorize immediate fulfillment."}
        </p>
      </div>

      {/* 2. بطاقات المؤشرات اللوجستية السريعة (Quick Order Indicators) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="border border-black/15 bg-white p-2.5 sm:p-3 text-center space-y-1 rounded-xs shadow-2xs">
          <Calendar className="w-3.5 h-3.5 mx-auto text-black/50" />
          <span className="text-[10px] uppercase tracking-wider text-black/50 block font-mono">
            {isArabic ? "تاريخ الطلب" : "Date"}
          </span>
          <p className="text-[11px] font-bold text-black leading-tight truncate">
            {formattedDate}
          </p>
        </div>

        <div className="border border-black/15 bg-white p-2.5 sm:p-3 text-center space-y-1 rounded-xs shadow-2xs">
          <Clock className="w-3.5 h-3.5 mx-auto text-black/50" />
          <span className="text-[10px] uppercase tracking-wider text-black/50 block font-mono">
            {isArabic ? "مدة التوصيل" : "Delivery"}
          </span>
          <p className="text-[11px] font-bold text-black leading-tight">
            {isArabic ? "٢ إلى ٤ أيام عمل" : "2-4 Work Days"}
          </p>
        </div>

        <div className="border border-black/15 bg-white p-2.5 sm:p-3 text-center space-y-1 rounded-xs shadow-2xs">
          <CreditCard className="w-3.5 h-3.5 mx-auto text-black/50" />
          <span className="text-[10px] uppercase tracking-wider text-black/50 block font-mono">
            {isArabic ? "طريقة الدفع" : "Payment"}
          </span>
          <p className="text-[11px] font-bold text-black leading-tight">
            {isArabic ? "عند الاستلام (COD)" : "Cash on Delivery"}
          </p>
        </div>

        <div className="border border-black/15 bg-white p-2.5 sm:p-3 text-center space-y-1 rounded-xs shadow-2xs">
          <Eye className="w-3.5 h-3.5 mx-auto text-emerald-700" />
          <span className="text-[10px] uppercase tracking-wider text-black/50 block font-mono">
            {isArabic ? "المعاينة" : "Inspection"}
          </span>
          <p className="text-[11px] font-bold text-emerald-800 leading-tight">
            {isArabic ? "متاحة قبل الدفع" : "Inspect Before Pay"}
          </p>
        </div>
      </div>

      {/* 3. كارد تفاصيل الأوردر والمنتجات مع الحسابات */}
      <div className="border border-black/20 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-black/70" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-black">
              {isArabic ? "القطع المطلوبة" : "Ordered Pieces"}
            </h2>
          </div>
          <span className="text-[11px] font-mono text-black/50">
            {items.length} {isArabic ? (items.length > 1 ? "قطع" : "قطعة") : items.length > 1 ? "pieces" : "piece"}
          </span>
        </div>

        {/* قائمة المنتجات المفصلة */}
        <div className="divide-y divide-black/10">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="py-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-14 h-18 shrink-0 border border-black/15 bg-black/[0.03] flex items-center justify-center p-1 overflow-hidden rounded-xs">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="140px"
                      quality={85}
                      className="object-contain p-0.5"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-black/30" />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="font-bold uppercase text-xs truncate">{item.title}</p>
                  
                  {/* Badges for Size, Color, Qty */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                    {item.size && (
                      <span className="px-1.5 py-0.5 bg-black/5 border border-black/10 rounded-2xs text-black/80">
                        {isArabic ? `المقاس: ${item.size}` : `Size: ${item.size}`}
                      </span>
                    )}
                    {item.color && (
                      <span className="px-1.5 py-0.5 bg-black/5 border border-black/10 rounded-2xs text-black/80">
                        {item.color}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 bg-black/5 border border-black/10 rounded-2xs text-black/80">
                      {isArabic ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}
                    </span>
                  </div>

                  <p className="text-[10px] text-black/50 font-mono">
                    {isArabic ? "سعر القطعة:" : "Unit Price:"} {Number(item.price).toLocaleString()} {isArabic ? "ج.م" : "EGP"}
                  </p>
                </div>
              </div>

              {/* Price calculation with compare_at strike if on sale */}
              <div className="text-right font-mono shrink-0 pl-1">
                {item.compare_at_price && item.compare_at_price > item.price && (
                  <span className="text-[10px] text-black/40 line-through block">
                    {(item.compare_at_price * item.quantity).toLocaleString()} {isArabic ? "ج.م" : "EGP"}
                  </span>
                )}
                <span className="font-bold text-xs text-black block">
                  {(item.price * item.quantity).toLocaleString()} {isArabic ? "ج.م" : "EGP"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ملخص الحسابات */}
        <div className="border-t border-black/10 pt-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-black/60">
            <span>{isArabic ? "المجموع الفرعي:" : "Subtotal:"}</span>
            <span className="font-mono">{Number(order.subtotal_amount).toLocaleString()} {isArabic ? "ج.م" : "EGP"}</span>
          </div>
          <div className="flex justify-between text-black/60">
            <span>{isArabic ? "الشحن والتوصيل:" : "Delivery:"}</span>
            <span className="font-mono">
              {Number(order.shipping_fee) === 0
                ? isArabic ? "مجاني" : "FREE"
                : `${Number(order.shipping_fee).toLocaleString()} ${isArabic ? "ج.م" : "EGP"}`}
            </span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span className="flex items-center gap-1">
                <span>{isArabic ? "الخصم" : "Discount"}</span>
                {order.coupon_code && (
                  <span className="text-[10px] font-mono px-1 py-0.2 bg-emerald-50 border border-emerald-200">
                    ({order.coupon_code})
                  </span>
                )}
                :
              </span>
              <span className="font-mono">−{Number(order.discount_amount).toLocaleString()} {isArabic ? "ج.م" : "EGP"}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline font-bold text-sm border-t border-black/15 pt-2.5">
            <span className="uppercase text-xs">{isArabic ? "الإجمالي المستحق عند الاستلام:" : "Total (Due on Delivery):"}</span>
            <span className="text-base font-mono text-black">
              {Number(order.total_amount).toLocaleString()} {isArabic ? "ج.م" : "EGP"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. كارد بيانات العميل والتوصيل المفصلة (Customer & Delivery Dossier) */}
      <div className="border border-black/20 bg-white p-5 sm:p-6 space-y-3.5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-black/10 pb-3">
          <MapPin className="w-4 h-4 text-black/70" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-black">
            {isArabic ? "بيانات العميل وعنوان الشحن" : "Recipient & Shipping Address"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* الاسم */}
          <div className="p-2.5 bg-black/[0.02] border border-black/10 rounded-xs space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-black/50 flex items-center gap-1">
              <User className="w-3 h-3 text-black/40" />
              {isArabic ? "اسم المستلم" : "Recipient Name"}
            </span>
            <p className="font-bold text-black text-xs">{order.customer_name}</p>
          </div>

          {/* الهاتف الأساسي */}
          <div className="p-2.5 bg-black/[0.02] border border-black/10 rounded-xs space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-black/50 flex items-center gap-1">
              <Phone className="w-3 h-3 text-black/40" />
              {isArabic ? "رقم الهاتف الأساسي" : "Primary Phone"}
            </span>
            <p className="font-mono font-bold text-black text-xs" dir="ltr">{order.phone}</p>
          </div>

          {/* هاتف الواتساب الإضافي إن وجد */}
          {order.secondary_phone && (
            <div className="p-2.5 bg-black/[0.02] border border-black/10 rounded-xs space-y-0.5 sm:col-span-2">
              <span className="text-[10px] font-mono uppercase text-black/50 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600" />
                {isArabic ? "رقم الواتساب للتأكيد" : "WhatsApp Number"}
              </span>
              <p className="font-mono font-bold text-black text-xs" dir="ltr">{order.secondary_phone}</p>
            </div>
          )}

          {/* المحافظة والمنطقة */}
          <div className="p-2.5 bg-black/[0.02] border border-black/10 rounded-xs space-y-0.5 sm:col-span-2">
            <span className="text-[10px] font-mono uppercase text-black/50 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-black/40" />
              {isArabic ? "الوجهة والتفاصيل" : "Destination"}
            </span>
            <p className="font-semibold text-black text-xs">
              {order.governorate} — {order.area}
              {order.address ? ` — ${order.address}` : ""}
            </p>
          </div>

          {/* ملاحظات التوصيل إن وجدت */}
          {order.notes && (
            <div className="p-2.5 bg-amber-500/[0.05] border border-amber-900/15 rounded-xs space-y-0.5 sm:col-span-2 text-amber-950">
              <span className="text-[10px] font-mono uppercase text-amber-900/70 flex items-center gap-1">
                <FileText className="w-3 h-3 text-amber-800" />
                {isArabic ? "ملاحظاتك لشركة الشحن" : "Shipping Notes"}
              </span>
              <p className="text-xs italic">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. الصندوق المدمج: قائمة التوصيل وتأكيد الطلب والتنبيه */}
      <div className="border border-amber-900/20 bg-amber-500/[0.06] p-4 text-xs rounded-xs">
        <ul className="space-y-3 text-[11px] text-amber-950/90 leading-relaxed font-sans">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-800/80 shrink-0 mt-1.5" />
            <div>
              {isArabic ? (
                <>
                  <strong>التوصيل:</strong> طلبك بيوصلك خلال <strong>٢ إلى ٤ أيام عمل</strong>.
                </>
              ) : (
                <>
                  <strong>Delivery:</strong> Your order arrives within <strong>2 to 4 business days</strong>.
                </>
              )}
            </div>
          </li>

          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-800/80 shrink-0 mt-1.5" />
            <div>
              {isArabic ? (
                <>
                  <strong>تأكيد الطلب:</strong> بعد تسجيل طلبك، هيوصلك على واتساب صفحة تأكيد الطلب لمراجعة تفاصيل طلبك وتأكيده. ولو حبيت تلغي، تقدر تعمل ده بسهولة من نفس الصفحة قبل بدء التجهيز.
                </>
              ) : (
                <>
                  <strong>Order Confirmation:</strong> After placing your order, you will receive a confirmation page on WhatsApp to review and confirm your details. If you wish to cancel, you can easily do so from the same page before preparation begins.
                </>
              )}
            </div>
          </li>

          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-800/80 shrink-0 mt-1.5" />
            <div>
              {isArabic ? (
                <>
                  <strong>فضلاً وتكرماً:</strong> نرجو التأكد من جديتك في الشراء وعدم تسجيل أوردرات غير حقيقية؛ لأن كل قطعة تُجهز وتُحجز في المصنع خصيصاً لك، والأوردرات غير الجادة تضر بالجميع دون استفادة لأحد.
                </>
              ) : (
                <>
                  <strong>Mutual Respect:</strong> Please ensure genuine intent and avoid placing uncommitted orders; each piece is reserved and prepared at the atelier specifically for you, and insincere orders harm everyone without benefit.
                </>
              )}
            </div>
          </li>
        </ul>
      </div>

      {/* رسالة الخطأ إن وُجدت */}
      {errorMsg && (
        <div className="border border-red-300 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 6. جزء الأزرار: تصميم بسيط وهادئ تماماً وبدون دوشة */}
      {order.status === "cancelled" ? (
        <div className="border border-black/20 bg-white p-6 text-center space-y-3 shadow-xs">
          <div className="flex items-center justify-center gap-2 text-red-700 font-bold uppercase text-xs tracking-wider">
            <XCircle className="w-4 h-4 text-red-600" />
            <span>
              {isArabic
                ? `تم إلغاء الطلب #${order.order_number}`
                : `Order #${order.order_number} Cancelled`}
            </span>
          </div>
          <p className="text-xs text-black/60">
            {isArabic
              ? "تم إلغاء هذا الطلب بنجاح. لن يتم تجهيز أو شحن أي شحنة."
              : "This order has been cancelled. No package will be dispatched."}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-black text-[#f6f5f2] text-xs font-bold uppercase tracking-widest hover:bg-black/85 transition-colors"
            >
              {isArabic ? "العودة للمتجر" : "Return to Store"}
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          {/* زر التأكيد الأساسي: أسود كلاسيكي هادئ */}
          <button
            type="button"
            onClick={handleConfirmOrder}
            disabled={isConfirming || isCancelling}
            className="w-full sm:flex-[2] h-12 bg-black text-[#f6f5f2] text-xs font-bold uppercase tracking-widest hover:bg-black/85 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isConfirming ? (
              <span>{isArabic ? "جاري تأكيد الطلب..." : "Authorizing Dispatch..."}</span>
            ) : (
              <span>{isArabic ? "تأكيد الطلب" : "Confirm Order"}</span>
            )}
          </button>

          {/* زر الإلغاء الثانوي: هادئ وغير مزعج */}
          <button
            type="button"
            onClick={handleCancelOrder}
            disabled={isConfirming || isCancelling}
            className="w-full sm:flex-1 h-12 border border-black/20 bg-white text-black/70 hover:text-black hover:bg-black/5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isCancelling ? (
              <span>{isArabic ? "جاري الإلغاء..." : "Cancelling..."}</span>
            ) : (
              <span>{isArabic ? "إلغاء الطلب" : "Cancel Order"}</span>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
