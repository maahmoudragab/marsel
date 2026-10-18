"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Package, AlertCircle, XCircle } from "lucide-react";

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

function SpecRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between border-b border-black/10 py-2.5 text-xs">
      <span className="text-black/50 uppercase tracking-wider text-[11px]">{label}</span>
      <span className="uppercase font-semibold text-black tracking-wide text-right">{value}</span>
    </div>
  );
}

export default function ConfirmOrderClient({ initialOrder }: { initialOrder: OrderData }) {
  const [order, setOrder] = useState<OrderData>(initialOrder);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCancelOrder = async () => {
    if (!window.confirm(`Are you sure you want to cancel order #${order.order_number}?`)) {
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
        throw new Error(data.error || "Unable to cancel order right now. Please try again.");
      }

      setOrder((prev) => ({ ...prev, status: "cancelled" }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel order.";
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
        throw new Error(data.error || "Unable to confirm order right now. Please try again.");
      }

      // Immediately redirect to track page without showing a redirect button
      window.location.href = `/track?order=${encodeURIComponent(order.order_number)}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(msg);
      setIsConfirming(false);
    }
  };

  return (
    <>
      {/* URL Breadcrumb */}
      <div className="pt-2 pb-2">
        <nav className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-black/55 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-black transition-colors">
            marsel
          </Link>
          <span>/</span>
          <span className="text-black font-semibold">confirm order</span>
        </nav>
      </div>

      {/* Page Header (Matching Track Order Header) */}
      <div className="border-b border-black/20 pb-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">
          Order Confirmation
        </h1>
        <p className="text-xs text-black/60 uppercase tracking-widest mt-1">
          Independent Clothing Label — Review & Confirm Your Delivery
        </p>
      </div>

      {/* Wide Full-Width Box (Exact Track Page Box Design) */}
      <div className="border border-black/15 bg-black/[0.02] p-5 sm:p-8 space-y-6 sm:space-y-8 w-full mb-12">
        {/* Top Section: Header */}
        <div className="border-b border-black/10 pb-4">
          <span className="text-[10px] uppercase tracking-widest text-black/50 font-semibold block">
            MARSEL LOGISTICS — ORDER CONFIRMATION
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-black mt-1">
            ORDER #{order.order_number}
          </h2>
        </div>

        {/* Underneath: Split into Two Halves */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          {/* Left Half: Customer & Delivery Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                Customer & Delivery Details
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">
                Recipient
              </span>
            </div>

            <div className="space-y-0">
              <SpecRow label="Recipient Name" value={order.customer_name} />
              <SpecRow label="Phone Number" value={order.phone} />
              {order.secondary_phone && (
                <SpecRow label="WhatsApp Number" value={order.secondary_phone} />
              )}
              <SpecRow label="Governorate" value={order.governorate} />
              <SpecRow label="Area / District" value={order.area} />
              {order.address && (
                <SpecRow label="Street Address" value={order.address} />
              )}
              <SpecRow label="Order Notes" value={order.notes || "None"} />
              <SpecRow
                label="Order Date"
                value={`${new Date(order.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })} · ${new Date(order.created_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}`}
              />
              <SpecRow label="Payment Method" value="Cash on Delivery (COD)" />
              <SpecRow
                label="Order Status"
                value={
                  order.status === "cancelled"
                    ? "Cancelled"
                    : order.status === "confirmed"
                    ? "Confirmed"
                    : "Awaiting Confirmation"
                }
              />
            </div>
          </div>

          {/* Right Half: ORDERED PIECES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                ORDERED PIECES ({order.order_items?.length || 0})
              </h3>
              <span className="text-[11px] font-mono text-black/60 font-semibold">
                Drop Items
              </span>
            </div>

            {/* Pieces list */}
            <div className="divide-y divide-black/10 max-h-80 overflow-y-auto pr-1">
              {order.order_items?.map((it) => (
                <div key={it.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 shrink-0 border border-black/15 bg-black/[0.03] flex items-center justify-center p-1">
                      {it.image ? (
                        <img
                          src={it.image}
                          alt={it.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Package className="w-4 h-4 text-black/40" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold uppercase text-xs truncate max-w-[180px] sm:max-w-xs">
                        {it.title}
                      </p>
                      <p className="text-[11px] text-black/60 font-mono mt-0.5">
                        Size: {it.size}
                        {it.color ? ` · ${it.color}` : ""} · Qty: {it.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs font-mono shrink-0 pl-2">
                    {it.compare_at_price && it.compare_at_price > it.price ? (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-black/40 line-through">
                          {(it.compare_at_price * it.quantity).toLocaleString()} EGP
                        </span>
                        <span className="font-bold text-black">
                          {(it.price * it.quantity).toLocaleString()} EGP
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-black">
                        {(it.price * it.quantity).toLocaleString()} EGP
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="border-t border-black/10 pt-3 space-y-2 text-xs">
              {order.subtotal_amount !== undefined && (
                <div className="flex justify-between text-black/60">
                  <span className="uppercase text-[11px]">Subtotal</span>
                  <span className="font-mono font-semibold">
                    {Number(order.subtotal_amount).toLocaleString()} EGP
                  </span>
                </div>
              )}
              {order.shipping_fee !== undefined && (
                <div className="flex justify-between text-black/60">
                  <span className="uppercase text-[11px]">Delivery</span>
                  <span className="font-mono">
                    {Number(order.shipping_fee) === 0
                      ? "FREE"
                      : `${Number(order.shipping_fee).toLocaleString()} EGP`}
                  </span>
                </div>
              )}
              {order.discount_amount && Number(order.discount_amount) > 0 ? (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="uppercase text-[11px]">Discount</span>
                  <span className="font-mono">
                    −{Number(order.discount_amount).toLocaleString()} EGP
                  </span>
                </div>
              ) : null}
              <div className="border-t border-black/15 pt-2.5 flex justify-between items-baseline font-bold">
                <span className="text-xs uppercase tracking-wide">
                  Total (Cash on Delivery)
                </span>
                <span className="text-xl font-mono">
                  {Number(order.total_amount).toLocaleString()} EGP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Confirmation Action */}
        <div className="border-t border-black/10 pt-6 space-y-3">
          {errorMsg && (
            <div className="border border-red-300 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {order.status === "cancelled" ? (
            <div className="border border-red-300 bg-red-50/50 p-4 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-red-700 font-bold uppercase text-xs tracking-wider">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Order #{order.order_number} Cancelled</span>
              </div>
              <p className="text-xs text-black/60">
                This order has been cancelled. No package will be dispatched.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-block px-5 py-2.5 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-widest hover:bg-black/85 transition-colors"
                >
                  Return to Store
                </Link>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={isConfirming || isCancelling}
                className="w-full h-12 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-widest hover:bg-black/85 cursor-pointer shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isConfirming ? (
                  <span>Confirming Order...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Confirm Order For Instant Dispatch →</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isConfirming || isCancelling}
                className="w-full h-11 border border-red-300 text-xs font-bold uppercase tracking-widest text-red-700 hover:bg-red-50 hover:border-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>{isCancelling ? "Cancelling Order..." : "Cancel This Order"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
