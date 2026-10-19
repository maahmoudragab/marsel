"use client";

import React, { useRef } from "react";
import { Printer, X, Download, ExternalLink } from "lucide-react";
import { FactoryOrder } from "./types";

interface InvoiceModalProps {
  order: FactoryOrder | null;
  onClose: () => void;
}

function formatEnglishDate(isoString: string) {
  if (!isoString) return { date: "—", time: "—", relative: "" };
  try {
    const d = new Date(isoString);
    const date = d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-US", {
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
    if (diffMinutes < 1) relative = "Ordered just now";
    else if (diffMinutes < 60) relative = `Ordered ${diffMinutes}m ago`;
    else if (diffHours < 24) relative = `Ordered ${diffHours}h ago`;
    else relative = `Ordered ${diffDays}d ago`;

    return { date, time, relative };
  } catch {
    return { date: isoString, time: "", relative: "" };
  }
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  if (!order) return null;

  const { date, time, relative } = formatEnglishDate(order.created_at);
  const totalQty = order.items.reduce((acc, it) => acc + it.quantity, 0);

  const subtotal =
    order.subtotal_amount ||
    order.items.reduce(
      (acc, it) => acc + (it.price || it.unit_price || it.total_price || 0) * it.quantity,
      0
    ) ||
    order.total_amount ||
    0;

  const discount = order.discount_amount || 0;
  const coupon = order.coupon_code || null;
  const shipping = order.shipping_fee || 0;
  const grandTotal = order.total_amount || subtotal - discount + shipping;

  // Generate self-contained standalone HTML for perfect printing
  const generatePrintableHtml = () => {
    return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <title>Invoice #INV-${order.order_number} - MARSEL</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111111;
      background: #ffffff;
      padding: 32px;
      font-size: 12px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111111;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-wrap { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
    .brand-subtitle { font-size: 10px; font-weight: bold; color: #555555; text-transform: uppercase; }
    .invoice-meta { text-align: right; font-family: monospace; }
    .invoice-title { font-size: 10px; font-weight: bold; color: #777777; text-transform: uppercase; }
    .invoice-number { font-size: 18px; font-weight: 900; }
    .meta-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f7f7f7;
      border: 1px solid #e0e0e0;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-family: monospace;
      font-size: 11px;
    }
    .meta-bar span { display: block; }
    .meta-label { font-size: 9px; color: #666666; font-weight: bold; text-transform: uppercase; }
    .meta-value { font-weight: 900; color: #111111; }
    .dossier-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .dossier-title { font-size: 10px; font-weight: 900; color: #666666; text-transform: uppercase; font-family: monospace; margin-bottom: 6px; }
    .customer-name { font-size: 15px; font-weight: 900; text-transform: uppercase; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .table th {
      border-bottom: 2px solid #111111;
      padding: 8px 6px;
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      font-family: monospace;
      color: #555555;
    }
    .table td { border-bottom: 1px solid #eeeeee; padding: 10px 6px; font-size: 12px; }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
    }
    .badge-dark { background: #111111; color: #ffffff; font-family: monospace; }
    .badge-light { background: #f0f0f0; border: 1px solid #cccccc; }
    .badge-printed { background: #111111; color: #ffffff; }
    .badge-plain { background: #eeeeee; color: #333333; }
    .totals-wrap {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      border-top: 1px solid #e0e0e0;
      padding-top: 16px;
      margin-bottom: 24px;
    }
    .totals-table { width: 100%; font-family: monospace; font-size: 12px; }
    .totals-table td { padding: 4px 0; }
    .grand-total {
      border-top: 2px solid #111111;
      font-size: 15px;
      font-weight: 900;
      padding-top: 8px !important;
    }
    .notes-box {
      background: #fafafa;
      border: 1px solid #e0e0e0;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 11px;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      border-top: 1px solid #e0e0e0;
      padding-top: 20px;
      font-size: 10px;
      font-family: monospace;
      color: #666666;
    }
    .sig-line { border-bottom: 1px solid #111111; height: 32px; margin-bottom: 6px; }
    @media print {
      body { padding: 10px; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-wrap">
      <img src="/logo/Black-without-bg.png" alt="MARSEL" style="height: 34px; width: auto; object-fit: contain; margin-bottom: 3px;" />
      <div class="brand-subtitle">ATELIER & PRODUCTION HOUSE • CAIRO, EGYPT</div>
      <div style="font-size: 9px; color: #777; font-family: monospace;">COMMERCIAL INVOICE & OFFICIAL PACKING DOCKET</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">INVOICE NUMBER</div>
      <div class="invoice-number">#INV-${order.order_number}</div>
      <div style="font-size: 11px; color: #444; margin-top: 4px;">${date} • ${time}</div>
      <div style="font-size: 10px; color: #888;">${relative}</div>
    </div>
  </div>

  <div class="meta-bar">
    <div>
      <span class="meta-label">ORDER REFERENCE</span>
      <span class="meta-value">#${order.order_number}</span>
    </div>
    <div>
      <span class="meta-label">PAYMENT TERMS</span>
      <span class="meta-value">${order.payment_method === "cod" ? "CASH ON DELIVERY (COD)" : order.payment_method || "CASH"}</span>
    </div>
    <div>
      <span class="meta-label">TOTAL ARTICLES</span>
      <span class="meta-value">${totalQty} PIECES</span>
    </div>
    <div>
      <span class="meta-label">DISPATCH STATUS</span>
      <span class="meta-value">${order.status === "out_for_delivery" ? "READY FOR DISPATCH" : order.status === "delivered" ? "DELIVERED" : order.status.toUpperCase()}</span>
    </div>
  </div>

  <div class="dossier-grid">
    <div>
      <div class="dossier-title">BILLED & DELIVER TO (CUSTOMER)</div>
      <div class="customer-name">${order.customer_name || "VALUED CLIENT"} ${order.customer_age ? `(${order.customer_age} YRS)` : ""}</div>
      <div style="font-family: monospace; font-size: 12px; margin-top: 4px;">
        <div><strong>Primary Tel (Call):</strong> ${order.phone || "—"}</div>
        ${order.secondary_phone ? `<div><strong>WhatsApp Tel:</strong> ${order.secondary_phone}</div>` : ""}
      </div>
    </div>
    <div>
      <div class="dossier-title">DELIVERY DESTINATION ADDRESS</div>
      <div style="font-weight: 900; font-size: 13px;">${order.governorate} — ${order.area}</div>
      <div style="color: #444; margin-top: 2px;">${order.address || "Address as recorded on file"}</div>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th style="width: 36%;">Item Description & Type</th>
        <th>Process</th>
        <th>Size</th>
        <th>Colorway</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: right;">Total Amount</th>
      </tr>
    </thead>
    <tbody>
      ${order.items
        .map((it, idx) => {
          const itemPrice = it.price || it.unit_price || 0;
          const lineTotal = itemPrice > 0 ? itemPrice * it.quantity : 0;
          const isPrinted = Boolean(it.print_file_url);

          return `
          <tr>
            <td>
              <div style="font-weight: 900; text-transform: uppercase;">${it.title}</div>
              ${it.category ? `<div style="font-size: 10px; color: #777; font-family: monospace;">Category: ${it.category}</div>` : ""}
            </td>
            <td>
              <span class="badge ${isPrinted ? "badge-printed" : "badge-plain"}">
                ${isPrinted ? "PRINTED" : "PLAIN"}
              </span>
            </td>
            <td><span class="badge badge-dark">${it.size}</span></td>
            <td>
              <span style="font-weight: bold;">${it.color}</span>
              <span style="font-family: monospace; color: #777; font-size: 10px;">(${it.color_hex})</span>
            </td>
            <td style="text-align: center; font-weight: 900; font-family: monospace;">× ${it.quantity}</td>
            <td style="text-align: right; font-family: monospace;">${itemPrice > 0 ? `${itemPrice.toLocaleString()} EGP` : "—"}</td>
            <td style="text-align: right; font-weight: 900; font-family: monospace;">${lineTotal > 0 ? `${lineTotal.toLocaleString()} EGP` : "—"}</td>
          </tr>
        `;
        })
        .join("")}
    </tbody>
  </table>

  <div class="totals-wrap">
    <div>
      ${
        order.notes
          ? `<div class="notes-box">
              <strong style="text-transform: uppercase; font-family: monospace; font-size: 10px; color: #555; display: block; margin-bottom: 4px;">CUSTOMER INSTRUCTIONS:</strong>
              <div>"${order.notes}"</div>
            </div>`
          : `<div style="font-size: 11px; color: #777; font-family: monospace;">
              All MARSEL pieces are handcrafted in Egypt with heavyweight luxury cotton. Please inspect items upon courier delivery.
            </div>`
      }
    </div>

    <div>
      <table class="totals-table">
        <tr>
          <td style="color: #666;">SUBTOTAL (PRE-DISCOUNT):</td>
          <td style="text-align: right; font-weight: bold;">${subtotal.toLocaleString()} EGP</td>
        </tr>
        ${
          coupon || discount > 0
            ? `<tr>
                <td style="color: #111;">DISCOUNT ${coupon ? `(${coupon})` : ""}:</td>
                <td style="text-align: right; font-weight: bold; color: #000;">-${discount.toLocaleString()} EGP</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="color: #666;">DELIVERY & COURIER:</td>
          <td style="text-align: right; font-weight: bold;">${shipping > 0 ? `+${shipping.toLocaleString()} EGP` : "FREE DELIVERY"}</td>
        </tr>
        <tr class="grand-total">
          <td>TOTAL AMOUNT PAYABLE:</td>
          <td style="text-align: right; font-size: 17px; font-weight: 900;">${grandTotal.toLocaleString()} EGP</td>
        </tr>
      </table>
    </div>
  </div>

  <div class="signatures">
    <div>
      <div class="sig-line"></div>
      <div>MARSEL ATELIER QUALITY INSPECTION (PASSED)</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div>CUSTOMER RECEIPT CONFIRMATION</div>
    </div>
  </div>
</body>
</html>`;
  };

  // Bulletproof print handler using a dedicated hidden iframe
  const handlePrint = () => {
    const htmlContent = generatePrintableHtml();

    let iframe = iframeRef.current;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
      iframeRef.current = iframe;
    }

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        iframe?.contentWindow?.focus();
        iframe?.contentWindow?.print();
      }, 300);
    }
  };

  return (
    <div
      dir="ltr"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 sm:p-9 space-y-6 text-neutral-900 max-h-[92vh] overflow-y-auto font-sans border border-neutral-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* INVOICE BRAND HEADER */}
        <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-5">
          <div className="space-y-1.5">
            <img
              src="/logo/Black-without-bg.png"
              alt="MARSEL"
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <p className="text-[11px] font-bold text-neutral-500 tracking-wider uppercase font-mono">
              HAUTE STREETWEAR ATELIER • CAIRO, EGYPT
            </p>
            <p className="text-[10px] text-neutral-400 font-mono">
              OFFICIAL PRODUCTION & COMMERCIAL DELIVERY INVOICE
            </p>
          </div>

          <div className="text-right font-mono space-y-0.5">
            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
              INVOICE NO.
            </div>
            <div className="text-xl font-black text-neutral-950 tracking-tight">
              #INV-{order.order_number}
            </div>
            <div className="text-[11px] font-bold text-neutral-600">
              {date} • {time}
            </div>
            {relative && (
              <div className="text-[10px] text-neutral-400 font-bold">{relative}</div>
            )}
          </div>
        </div>

        {/* METADATA BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-xs font-mono">
          <div>
            <span className="text-[10px] text-neutral-400 block uppercase font-bold">ORDER REF</span>
            <span className="font-black text-neutral-900">#{order.order_number}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 block uppercase font-bold">
              PAYMENT METHOD
            </span>
            <span className="font-black text-neutral-900">
              {order.payment_method === "cod" ? "CASH ON DELIVERY (COD)" : order.payment_method || "CASH"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 block uppercase font-bold">
              TOTAL ARTICLES
            </span>
            <span className="font-black text-neutral-900">{totalQty} PIECES</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 block uppercase font-bold">STATUS</span>
            <span className="font-black uppercase text-neutral-900">
              {order.status === "out_for_delivery"
                ? "READY FOR DISPATCH"
                : order.status === "delivered"
                ? "DELIVERED"
                : order.status}
            </span>
          </div>
        </div>

        {/* CUSTOMER & SHIPPING DESTINATION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs border-b border-neutral-200 pb-5">
          {/* Recipient */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block font-mono">
              BILLED & DELIVER TO (CUSTOMER)
            </span>
            <p className="font-black text-base text-neutral-950 uppercase tracking-tight">
              {order.customer_name || "VALUED CLIENT"}
              {order.customer_age && (
                <span className="text-xs font-normal text-neutral-500 font-mono ml-2">
                  ({order.customer_age} YRS)
                </span>
              )}
            </p>
            <div className="font-mono text-neutral-800 font-bold space-y-0.5 text-xs">
              <p>Primary Tel (Call): {order.phone || "—"}</p>
              {order.secondary_phone && (
                <p className="text-neutral-600">WhatsApp Tel: {order.secondary_phone}</p>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block font-mono">
              DELIVERY DESTINATION ADDRESS
            </span>
            <p className="font-black text-neutral-900 text-sm">
              {order.governorate} — {order.area}
            </p>
            <p className="text-neutral-600 font-medium leading-relaxed">
              {order.address || "Standard delivery address on file"}
            </p>
          </div>
        </div>

        {/* ORDER ITEMS TABLE */}
        <div className="space-y-2">
          <div className="text-[10px] font-black text-neutral-400 uppercase tracking-wider font-mono">
            MANUFACTURED ARTICLES & SPECIFICATIONS
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b-2 border-neutral-900 text-neutral-500 text-[10px] uppercase font-mono font-bold tracking-wider">
                <th className="py-2">Item Description</th>
                <th className="py-2">Process</th>
                <th className="py-2">Size</th>
                <th className="py-2">Colorway</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-medium text-neutral-800">
              {order.items.map((it, idx) => {
                const itemPrice = it.price || it.unit_price || 0;
                const lineTotal = itemPrice > 0 ? itemPrice * it.quantity : 0;
                const isPrinted = Boolean(it.print_file_url);

                return (
                  <tr key={idx} className="hover:bg-neutral-50/50">
                    <td className="py-3 pr-2">
                      <div className="font-black uppercase text-neutral-950 text-xs">
                        {it.title}
                      </div>
                      {it.category && (
                        <div className="text-[10px] text-neutral-400 font-mono">
                          Type: {it.category}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                          isPrinted
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-800 border border-neutral-300"
                        }`}
                      >
                        {isPrinted ? "PRINTED" : "PLAIN"}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-black text-xs text-neutral-900">
                      [{it.size}]
                    </td>
                    <td className="py-3">
                      <div className="inline-flex items-center gap-1.5 font-bold text-[11px]">
                        <span
                          className="w-3 h-3 rounded-full border border-neutral-300 shadow-2xs shrink-0"
                          style={{ backgroundColor: it.color_hex }}
                        />
                        <span>{it.color}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center font-mono font-black text-neutral-950 text-xs">
                      × {it.quantity}
                    </td>
                    <td className="py-3 text-right font-mono text-neutral-600 text-xs">
                      {itemPrice > 0 ? `${itemPrice.toLocaleString()} EGP` : "—"}
                    </td>
                    <td className="py-3 text-right font-mono font-black text-neutral-950 text-xs">
                      {lineTotal > 0 ? `${lineTotal.toLocaleString()} EGP` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CUSTOMER NOTES & FINANCIAL BREAKDOWN */}
        <div className="border-t border-neutral-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          {/* Customer Note if exists */}
          <div>
            {order.notes ? (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-1">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block font-mono">
                  CUSTOMER SPECIAL INSTRUCTIONS:
                </span>
                <p className="font-bold text-neutral-900 text-[11px] leading-relaxed">
                  "{order.notes}"
                </p>
              </div>
            ) : (
              <p className="text-[10px] text-neutral-400 font-mono leading-relaxed">
                Thank you for choosing MARSEL. All garments are custom-crafted with premium
                heavyweight materials in Egypt.
              </p>
            )}
          </div>

          {/* Totals Table */}
          <div className="space-y-1.5 text-xs font-mono text-right sm:border-l sm:border-neutral-200 sm:pl-4">
            <div className="flex justify-between text-neutral-500">
              <span>SUBTOTAL (PRE-DISCOUNT):</span>
              <span className="font-bold">{subtotal.toLocaleString()} EGP</span>
            </div>

            {(coupon || discount > 0) && (
              <div className="flex justify-between text-neutral-900 font-bold">
                <span>DISCOUNT {coupon ? `(${coupon})` : ""}:</span>
                <span>-{discount.toLocaleString()} EGP</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-500">
              <span>DELIVERY / SHIPPING FEE:</span>
              <span className="font-bold">
                {shipping > 0 ? `+${shipping.toLocaleString()} EGP` : "FREE DELIVERY"}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm font-black text-neutral-950 pt-2 border-t-2 border-neutral-900">
              <span className="tracking-wider">TOTAL AMOUNT DUE:</span>
              <span className="text-lg tracking-tight">{grandTotal.toLocaleString()} EGP</span>
            </div>
            <div className="text-[10px] text-neutral-400 font-bold">
              PAYABLE UPON COURIER DELIVERY (C.O.D)
            </div>
          </div>
        </div>

        {/* INSPECTION & SIGNATURE BLOCK */}
        <div className="border-t border-neutral-200 pt-4 grid grid-cols-2 gap-6 text-[10px] font-mono text-neutral-500">
          <div>
            <span className="block font-bold uppercase text-neutral-400 mb-6">
              COURIER / ATELIER INSPECTION
            </span>
            <div className="border-b border-neutral-400 pb-1 font-bold text-neutral-800">
              VERIFIED & PACKAGED BY: MARSEL PRODUCTION
            </div>
          </div>
          <div>
            <span className="block font-bold uppercase text-neutral-400 mb-6">
              CUSTOMER RECIPIENT SIGNATURE
            </span>
            <div className="border-b border-neutral-400 pb-1 font-bold text-neutral-400">
              SIGNATURE: ____________________________
            </div>
          </div>
        </div>

        {/* MODAL ACTION BAR */}
        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-black transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Invoice / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
