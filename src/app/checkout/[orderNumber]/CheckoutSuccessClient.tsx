"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import InstagramStoryShare from "@/components/InstagramStoryShare";

interface OrderItem {
  id?: string;
  title: string;
  size?: string;
  color?: string | null;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
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
  status: string;
  created_at: string;
  order_items?: OrderItem[];
}

export default function CheckoutSuccessClient({ order }: { order: OrderData }) {
  const { isArabic } = useLanguage();
  const items = order.order_items || [];

  return (
    <div className="max-w-2xl mx-auto py-10 sm:py-14 space-y-6 text-left rtl:text-right font-sans">
      
      {/* 1. شكراً باسم العميل وتأكيد تسجيل طلبه */}
      <div className="text-center space-y-1 pb-1">
        <span className="text-[11px] font-mono uppercase tracking-widest text-black/50 block">
          {isArabic ? `طلب رقم #${order.order_number}` : `ORDER #${order.order_number}`}
        </span>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
          {isArabic
            ? `شكراً لك يا ${order.customer_name}، تم تسجيل طلبك بنجاح`
            : `Thank You, ${order.customer_name}. Order Confirmed.`}
        </h1>
      </div>

      {/* 2. تفاصيل الأوردر المدمجة (القطع، الحسابات، العنوان، والمعلومات الهامة بلون مميز هادئ) */}
      <div className="border border-black/20 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-black">
            {isArabic ? "تفاصيل الطلب" : "Order Details"}
          </span>
          <span className="text-[11px] font-mono text-black/50">
            {items.length} {items.length === 1 ? (isArabic ? "قطعة" : "piece") : (isArabic ? "قطع" : "pieces")}
          </span>
        </div>

        {/* قائمة القطع */}
        <div className="divide-y divide-black/10">
          {items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-13 bg-black/5 shrink-0 border border-black/10 overflow-hidden">
                  <Image
                    src={item.image || "/logo/Black-without-bg.png"}
                    alt={item.title}
                    fill
                    sizes="48px"
                    quality={70}
                    className="object-contain p-0.5"
                  />
                </div>
                <div>
                  <div className="font-bold text-xs uppercase tracking-wide text-black">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-black/50 font-mono mt-0.5">
                    {item.size || "OS"} {item.color ? `• ${item.color}` : ""} • {item.quantity}x
                  </div>
                </div>
              </div>

              <div className="text-right rtl:text-left font-mono font-bold text-xs text-black">
                {Number(item.price * item.quantity).toLocaleString()} {isArabic ? "ج.م" : "EGP"}
              </div>
            </div>
          ))}
        </div>

        {/* الحسابات والإجمالي */}
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
              <span>{isArabic ? "الخصم:" : "Discount:"}</span>
              <span className="font-mono">−{Number(order.discount_amount).toLocaleString()} {isArabic ? "ج.م" : "EGP"}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline font-bold text-sm border-t border-black/15 pt-2.5">
            <span className="uppercase text-xs">{isArabic ? "الإجمالي (الدفع عند الاستلام):" : "Total (Cash on Delivery):"}</span>
            <span className="text-base font-mono text-black">
              {Number(order.total_amount).toLocaleString()} {isArabic ? "ج.م" : "EGP"}
            </span>
          </div>
        </div>

        {/* عنوان المستلم */}
        <div className="border-t border-black/10 pt-3 text-[11px] text-black/70 space-y-1">
          <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-black">
            <MapPin className="w-3.5 h-3.5" />
            <span>{isArabic ? "عنوان التوصيل" : "Delivery Address"}</span>
          </div>
          <p>{order.customer_name} • {order.phone}</p>
          <p>{order.governorate} — {order.area}{order.address ? ` — ${order.address}` : ""}</p>
        </div>

        {/* الصندوق المدمج: قائمة التوصيل وتأكيد الطلب والتنبيه */}
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

      </div>

      {/* 3. جزء استوري إنستجرام (بسيط جداً بعنوان شاركنا قطعتك على إنستجرام وكاروسيل) */}
      <div className="border border-black/20 bg-white p-6 shadow-xs">
        <InstagramStoryShare
          orderNumber={order.order_number}
          customerName={order.customer_name}
          items={items.map((it) => ({
            title: it.title,
            image: it.image,
            size: it.size,
            color: it.color,
            price: it.price,
          }))}
          orderDate={order.created_at}
        />
      </div>

      {/* 4. في الآخر خالص: زر التتبع فقط */}
      <div className="pt-1">
        <Link
          href={`/track?order=${order.order_number}`}
          className="w-full h-12 bg-black text-[#f6f5f2] text-xs font-bold uppercase tracking-widest hover:bg-black/85 transition-colors flex items-center justify-center gap-2"
        >
          <span>{isArabic ? "تتبع طلبك مباشرة ←" : "Track Your Order Live →"}</span>
        </Link>
      </div>

    </div>
  );
}
