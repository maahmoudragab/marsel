"use client";

import React, { useState } from "react";
import {
  Square,
  CheckSquare,
  Phone,
  MessageCircle,
  Copy,
  Check,
  MapPin,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  AlertCircle,
} from "lucide-react";
import { FactoryOrder } from "./types";
import { useFactory } from "./FactoryContext";

interface OrderCardProps {
  order: FactoryOrder;
  isSelected: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onToggleSelect: () => void;
  onSelectActive: () => void;
  onToggleExpand: () => void;
}

function formatOrderDateTime(isoString: string) {
  if (!isoString) return { date: "—", time: "—", relative: "" };
  try {
    const d = new Date(isoString);
    const date = d.toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let relative = "";
    if (diffMinutes < 1) relative = "الآن";
    else if (diffMinutes < 60) relative = `منذ ${diffMinutes} د`;
    else if (diffHours === 1) relative = "منذ ساعة";
    else if (diffHours === 2) relative = "منذ ساعتين";
    else if (diffHours < 24) relative = `منذ ${diffHours} س`;
    else if (diffDays === 1) relative = "منذ يوم";
    else if (diffDays === 2) relative = "منذ يومين";
    else if (diffDays < 10) relative = `منذ ${diffDays} أيام`;
    else relative = `منذ ${diffDays} يوم`;

    return { date, time, relative };
  } catch {
    return { date: isoString, time: "", relative: "" };
  }
}

export default function OrderCard({
  order,
  isSelected,
  isActive,
  isExpanded,
  onToggleSelect,
  onSelectActive,
  onToggleExpand,
}: OrderCardProps) {
  const { updateOrderStatus, updatingIds, openInvoice, openGallery } = useFactory();
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  const isUpdating = updatingIds.includes(order.id);
  const { date, time, relative } = formatOrderDateTime(order.created_at);

  const primaryPhone = order.phone || "";
  const whatsappPhone = order.secondary_phone || order.phone || "";

  const cleanPrimaryPhone = primaryPhone.replace(/\D/g, "");
  const cleanWhatsappPhone = whatsappPhone.replace(/\D/g, "");

  const handleCopyPhone = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  return (
    <article
      onClick={onSelectActive}
      className={`rounded-xl border transition-all overflow-hidden ${
        isActive
          ? "bg-neutral-100/90 border-neutral-950 border-r-6 border-r-neutral-950 shadow-md ring-2 ring-neutral-950/20"
          : isSelected
          ? "bg-white border-neutral-900 ring-1 ring-neutral-900 shadow-sm"
          : "bg-white border-neutral-200 hover:border-neutral-300 shadow-2xs"
      }`}
    >
      {/* 1. COMPACT TOP HEADER: ORDER #, TIME, INVOICE & STATUS */}
      <div
        className={`px-3.5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2.5 ${
          isActive ? "bg-neutral-200/60 border-neutral-300" : "bg-neutral-50/70 border-neutral-200"
        }`}
      >
        {/* Left: Checkbox + Order # + Time + Age */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className="cursor-pointer text-neutral-400 hover:text-neutral-900"
            title="تحديد الأوردر"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-neutral-950" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-mono font-black text-neutral-950 tracking-tight">
              #{order.order_number}
            </span>
            <span className="text-xs font-bold text-neutral-500">
              ({date} • {time})
            </span>
            {relative && (
              <span className="text-[11px] font-bold px-1.5 py-0.2 bg-neutral-200 text-neutral-800 rounded">
                ⏳ {relative}
              </span>
            )}
          </div>
        </div>

        {/* Right: Invoice Button + Status Selector */}
        <div className="flex items-center gap-2">
          {/* Chic Invoice Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openInvoice(order);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer bg-neutral-900 hover:bg-neutral-800 text-white shadow-2xs"
            title="عرض وطباعة الفاتورة الرسمية"
          >
            <FileText className="w-3 h-3 text-neutral-300" />
            <span>فاتورة (Invoice)</span>
          </button>

          {/* Full Control Status Selector */}
          <div className="relative inline-block text-xs font-bold">
            <select
              disabled={isUpdating}
              value={order.status}
              onChange={(e) => {
                e.stopPropagation();
                updateOrderStatus([order.id], e.target.value as FactoryOrder["status"]);
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded-lg px-2 py-1 pr-6 text-xs font-black focus:outline-none focus:border-neutral-900 cursor-pointer disabled:opacity-50 appearance-none shadow-2xs"
              title="تغيير حالة الطلب"
            >
              <option value="confirmed">1. انتظار</option>
              <option value="processing">2. قيد التجهيز</option>
              <option value="out_for_delivery">3. جاهز للتسليم</option>
              <option value="delivered">4. تم التسليم</option>
            </select>
            <ChevronDown className="w-3 h-3 text-neutral-400 absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. COMPACT CUSTOMER & DELIVERY ROW (Clean 2-Column Split) */}
      <div className="px-3.5 py-2.5 border-b border-neutral-200 bg-white grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Col 1: Customer Identity & Phones */}
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-bold text-neutral-400">العميل:</span>
            <span className="text-sm font-black text-neutral-950">
              {order.customer_name || "بدون اسم"}
            </span>
            <span className="text-[11px] font-bold text-neutral-600 bg-neutral-100 px-1.5 py-0.2 rounded">
              {order.customer_age ? `${order.customer_age} سنة` : "السن غير محدد"}
            </span>
          </div>

          {/* Dedicated Phones Inline */}
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            {primaryPhone && (
              <div className="inline-flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded text-neutral-950 font-bold">
                <Phone className="w-3 h-3 text-neutral-500" />
                <a href={`tel:${primaryPhone}`} className="hover:underline">
                  {primaryPhone}
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyPhone("primary", primaryPhone);
                  }}
                  className="text-neutral-400 hover:text-neutral-950 p-0.5 cursor-pointer"
                  title="نسخ الرقم الأساسي"
                >
                  {copiedPhoneId === "primary" ? (
                    <Check className="w-3 h-3 text-neutral-900" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            )}

            {whatsappPhone && (
              <div className="inline-flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded text-neutral-950 font-bold">
                <MessageCircle className="w-3 h-3 text-emerald-600" />
                <span>{whatsappPhone}</span>
                {cleanWhatsappPhone && (
                  <a
                    href={`https://wa.me/20${cleanWhatsappPhone.startsWith("0") ? cleanWhatsappPhone.slice(1) : cleanWhatsappPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 font-sans text-[10px] font-bold border-r border-neutral-200 pr-1 mr-0.5"
                    title="واتساب"
                  >
                    واتساب
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Col 2: Destination & Financials */}
        <div className="space-y-1.5 md:border-r md:border-neutral-200 md:pr-3">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
            <div className="leading-tight">
              <span className="font-black text-neutral-900">
                {order.governorate} — {order.area}:{" "}
              </span>
              <span className="text-neutral-600 font-medium">
                {order.address || "العنوان غير محدد بالتفصيل"}
              </span>
              {order.location_url && (
                <a
                  href={order.location_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-950 hover:underline mr-1.5"
                >
                  <span>[خريطة]</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-neutral-400">المطلوب:</span>
            <span className="font-black text-neutral-950 font-mono">
              {order.total_amount?.toLocaleString() || 0} ج.م
            </span>
            <span className="text-neutral-500 font-bold text-[11px]">
              ({order.payment_method === "cod" ? "عند الاستلام COD" : order.payment_method || "كاش"})
            </span>
          </div>
        </div>
      </div>

      {/* Customer Notes (if any) */}
      {order.notes && (
        <div className="mx-3.5 my-2 p-2 bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs font-bold rounded-lg flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
          <span>ملاحظة: {order.notes}</span>
        </div>
      )}

      {/* 3. ITEMS ROW (2 ITEMS PER ROW IN GRID) & COLLAPSIBLE BUTTON */}
      <div className="px-3.5 py-2.5 bg-white space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* ITEMS GRID: 2 ITEMS PER ROW (SM:GRID-COLS-2) TO SAVE HEIGHT! */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {order.items.map((it, idx) => {
              const isPrinted = Boolean(it.print_file_url);

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-900 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full border border-neutral-300 shadow-2xs shrink-0"
                      style={{ backgroundColor: it.color_hex }}
                    />
                    <span className="font-black truncate uppercase text-[11px]">{it.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                    <span className="bg-neutral-900 text-white px-1.5 py-0.2 rounded font-bold">
                      {it.size}
                    </span>
                    <span className="font-black text-neutral-950">×{it.quantity}</span>

                    {/* PRINTED / PLAIN BADGE */}
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-black font-sans ${
                        isPrinted
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-200 text-neutral-800"
                      }`}
                    >
                      {isPrinted ? "مطبوع" : "سادة"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Collapsible Button (Compact & Sleek) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 self-end sm:self-center ${
              isExpanded
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200"
            }`}
            title="عرض أو إخفاء التفاصيل الكاملة"
          >
            <span>{isExpanded ? "إخفاء التفاصيل" : "التفاصيل والصور"}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* 4. COLLAPSIBLE ACCORDION BODY (2 ITEMS PER ROW GRID) */}
        {isExpanded && (
          <div className="mt-2.5 pt-3 border-t border-neutral-200 space-y-3 animate-fadeIn">
            {/* 2 ITEMS PER ROW (MD:GRID-COLS-2) IN EXPANDED VIEW! */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {order.items.map((item, itIdx) => {
                const allMockups =
                  item.gallery_images && item.gallery_images.length > 0
                    ? item.gallery_images
                    : [item.image || "/hoodie-cropped.png"];

                const isPrinted = Boolean(item.print_file_url);

                return (
                  <div
                    key={itIdx}
                    className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5 text-xs flex flex-col justify-between"
                  >
                    {/* Item Header */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="font-black text-neutral-950 text-xs uppercase truncate max-w-[200px]">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <span className="px-1.5 py-0.2 bg-neutral-900 text-white rounded font-bold">
                            {item.size}
                          </span>
                          <span className="px-1.5 py-0.2 bg-neutral-200 text-neutral-900 rounded font-bold">
                            ×{item.quantity}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-black font-sans ${
                              isPrinted
                                ? "bg-neutral-900 text-white"
                                : "bg-neutral-200 text-neutral-800"
                            }`}
                          >
                            {isPrinted ? "مطبوع" : "سادة"}
                          </span>
                        </div>
                      </div>

                      {/* Color */}
                      <div className="inline-flex items-center gap-1.5 text-neutral-700 font-bold text-[11px]">
                        <span
                          className="w-3 h-3 rounded-full border border-neutral-300 shadow-2xs shrink-0"
                          style={{ backgroundColor: item.color_hex }}
                        />
                        <span>اللون: {item.color}</span>
                        <span className="text-neutral-400 font-mono text-[10px]">
                          ({item.color_hex})
                        </span>
                      </div>
                    </div>

                    {/* Specs Compact Grid */}
                    <div className="grid grid-cols-2 gap-1.5 bg-white p-2 rounded-lg border border-neutral-200 text-[10px]">
                      <div>
                        <span className="text-neutral-400 block font-bold">التصنيف:</span>
                        <span className="font-bold text-neutral-900 font-mono truncate block">
                          {item.category || "Streetwear"}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block font-bold">الخامة:</span>
                        <span className="font-bold text-neutral-900 truncate block">
                          {item.composition || "100% Cotton"}
                        </span>
                      </div>
                    </div>

                    {/* Thumbnails & Print Download Button */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-200">
                      {/* Mockup Thumbnails */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {allMockups.slice(0, 4).map((imgUrl, imgIdx) => (
                          <button
                            key={imgIdx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openGallery(allMockups, imgIdx, item.title);
                            }}
                            className="group relative w-11 h-11 rounded-lg bg-white border border-neutral-300 overflow-hidden cursor-pointer hover:border-neutral-900 transition-all shadow-2xs"
                            title="تكبير ومعاينة"
                          >
                            <img
                              src={imgUrl}
                              alt={`صورة ${imgIdx + 1}`}
                              className="w-full h-full object-contain p-0.5"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-neutral-950/80 text-[7px] text-white text-center font-bold">
                              {imgIdx === 0 ? "وش" : imgIdx === 1 ? "ضهر" : imgIdx + 1}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Print PNG Download */}
                      {item.print_file_url ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={item.print_file_url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-[11px] font-bold transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Download className="w-3 h-3 text-emerald-400" />
                            <span>PNG</span>
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openGallery([item.print_file_url], 0, `ديزاين طباعة ${item.title}`);
                            }}
                            className="p-1 border border-neutral-300 hover:bg-white rounded-md text-neutral-700 cursor-pointer"
                            title="معاينة الديزاين"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-neutral-400 font-bold bg-neutral-100 px-2 py-0.5 rounded">
                          سادة
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
