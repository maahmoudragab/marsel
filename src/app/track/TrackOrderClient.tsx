"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, CheckCircle, Package, Truck, Home, AlertCircle, MessageCircle } from "lucide-react";

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

const STEPS = [
  { key: "pending", label: "Registered", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "processing", label: "Preparing", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

function SpecRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between border-b border-black/10 py-2.5 text-xs">
      <span className="text-black/50 uppercase tracking-wider text-[11px]">{label}</span>
      <span className="uppercase font-semibold text-black tracking-wide text-right">{value}</span>
    </div>
  );
}

export default function TrackOrderClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("order") || "";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (searchTerm: string) => {
    const clean = searchTerm.trim();
    if (!clean) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (!res.ok || !data.order) {
        setError(data.error || "No order found with this code or phone number.");
        setOrder(null);
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("Connection error. Please try again.");
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
          <Link href="/" className="hover:text-black transition-colors font-mono">marsel</Link>
          <span>/</span>
          <span className="text-black font-semibold">track order</span>
          {order && (
            <>
              <span>/</span>
              <span className="text-black font-semibold">#{order.order_number}</span>
            </>
          )}
        </nav>
      </div>

      {/* Header Area: Simple Title + Simple Paragraph + Input */}
      <div className="pt-1 pb-6 space-y-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black">
            Track Order
          </h1>
          <p className="text-xs text-black/60 uppercase tracking-widest mt-1">
            Real-time parcel status & delivery tracking
          </p>
        </div>

        {/* Search Input directly below */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex gap-2 w-full pt-1"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Order code (MRS-XXXX) or mobile..."
              required
              className="w-full pl-9 pr-3 h-11 text-xs border border-black/20 bg-black/[0.01] focus:outline-none focus:border-black uppercase placeholder:normal-case font-mono rounded-none placeholder:text-black/35 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 h-11 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-widest hover:bg-black/85 transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
          >
            {loading ? "..." : "Track"}
          </button>
        </form>

        {error && (
          <div className="border border-red-300 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2.5 w-full">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{error}</p>
              <p className="text-[11px] text-red-600/80 mt-0.5">
                Double check the code from your WhatsApp message, or reach out to our concierge below.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Wide Full-Width Box (When Order is Entered / Found) */}
      {order ? (
        <div className="border border-black/15 bg-black/[0.02] p-5 sm:p-8 space-y-6 sm:space-y-8 w-full mb-12">
          {/* Top Section: Progress & Order Status */}
          <div className="space-y-4">
            <div className="border-b border-black/10 pb-4">
              <span className="text-[10px] uppercase tracking-widest text-black/50 font-semibold block">
                MARSEL LOGISTICS — LIVE DISPATCH
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-black mt-1">
                ORDER #{order.order_number}
              </h2>
            </div>

            {/* Stepper progress (or Cancelled banner) */}
            {isCancelled ? (
              <div className="border border-red-300 bg-red-50 p-4 text-xs text-red-700 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <span className="font-bold uppercase tracking-wider block">Order Cancelled</span>
                  <span className="text-[11px] text-red-600/80">
                    This order was cancelled by the customer or customer care.
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
                              ? "bg-black text-[#e7ecea] border-black"
                              : isDone
                              ? "bg-black/10 border-black text-black"
                              : "border-black/20 text-black/25 bg-transparent"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <span
                          className={`text-[9px] sm:text-[11px] uppercase tracking-wider mt-2 line-clamp-2 ${
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
                <SpecRow label="Full Name" value={order.customer_name} />
                <SpecRow label="Primary Phone" value={order.phone} />
                {order.secondary_phone && (
                  <SpecRow label="Secondary Phone" value={order.secondary_phone} />
                )}
                <SpecRow label="Governorate" value={order.governorate} />
                <SpecRow label="Area / City" value={order.area} />
                <SpecRow label="Street / Address" value={order.address} />
                {order.notes && <SpecRow label="Delivery Notes" value={order.notes} />}
                <SpecRow
                  label="Registered On"
                  value={new Date(order.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
                <SpecRow label="Payment Method" value="Cash on Delivery (COD)" />
              </div>

              {/* Concierge Contact pill */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/20109542463?text=${encodeURIComponent(
                    `Hello MARSEL! I'm tracking Order #${order.order_number} and have a delivery inquiry.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-black hover:opacity-70 transition-opacity"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Contact Delivery Concierge →</span>
                </a>
              </div>
            </div>

            {/* Right Half: Parcel Contents & Totals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                  Parcel Contents ({order.items?.length || 0})
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">
                  Verified Pieces
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-black/10">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3.5 first:pt-0 last:pb-0">
                    <div className="w-14 h-16 shrink-0 border border-black/15 bg-white flex items-center justify-center p-1">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold uppercase tracking-tight truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] font-mono text-black/60 uppercase mt-0.5">
                        Size: <span className="text-black font-semibold">{item.size}</span>
                        {item.color && <span> • {item.color}</span>}
                        <span> • Qty: {item.quantity}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold">
                        {(item.price * item.quantity).toLocaleString()} EGP
                      </span>
                      {item.compare_at_price && item.compare_at_price > item.price && (
                        <p className="text-[10px] font-mono text-black/40 line-through">
                          {(item.compare_at_price * item.quantity).toLocaleString()} EGP
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="border-t border-black/15 pt-4 space-y-1.5 text-xs">
                {order.subtotal_amount !== undefined && (
                  <div className="flex justify-between text-black/60">
                    <span className="uppercase text-[11px]">Subtotal</span>
                    <span className="font-mono font-semibold">{Number(order.subtotal_amount).toLocaleString()} EGP</span>
                  </div>
                )}
                {order.shipping_fee !== undefined && (
                  <div className="flex justify-between text-black/60">
                    <span className="uppercase text-[11px]">Delivery</span>
                    <span className="font-mono">{Number(order.shipping_fee) === 0 ? "FREE" : `${Number(order.shipping_fee).toLocaleString()} EGP`}</span>
                  </div>
                )}
                {order.discount_amount && Number(order.discount_amount) > 0 ? (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="uppercase text-[11px]">Discount</span>
                    <span className="font-mono">−{Number(order.discount_amount).toLocaleString()} EGP</span>
                  </div>
                ) : null}
                <div className="border-t border-black/15 pt-2.5 flex justify-between items-baseline font-bold">
                  <span className="text-xs uppercase tracking-wide">Total (Cash on Delivery)</span>
                  <span className="text-xl font-mono">{Number(order.total_amount).toLocaleString()} EGP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : !loading && !error ? (
        <div className="py-20 text-center max-w-md mx-auto space-y-3 border border-black/10 bg-black/[0.01] p-8 mb-12">
          <Package className="w-8 h-8 text-black/30 mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-black">
            Enter Your Order Reference
          </p>
          <p className="text-[11px] text-black/50 leading-relaxed">
            Provide your order code (e.g. MRS-XXXX) or registered phone number above to inspect live shipment progress, parcel contents, and delivery details.
          </p>
        </div>
      ) : null}
    </>
  );
}
