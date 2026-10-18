"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  Phone,
  MapPin,
  ExternalLink,
  MessageCircle,
  RotateCw,
  ShoppingBag,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  title: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  unit_price: number;
  total_price: number;
  image: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_age: number | null;
  phone: string;
  governorate: string;
  area: string;
  address: string;
  secondary_phone: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  location_url: string | null;
  notes: string | null;
  total_amount: number;
  subtotal_amount: number;
  discount_amount: number;
  shipping_fee: number;
  payment_method: string;
  status: OrderStatus;
  created_at: string;
  order_items: OrderItem[];
}

function formatOrderDateTime(isoString: string) {
  if (!isoString) return { date: "—", time: "—", relative: "—", full: "—" };
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let relative = "";
  if (diffMinutes < 1) relative = "Just now";
  else if (diffMinutes < 60) relative = `${diffMinutes}m ago`;
  else if (diffHours < 24 && d.getDate() === now.getDate()) relative = `${diffHours}h ago`;
  else if (diffDays === 1) relative = "Yesterday";
  else if (diffDays < 7) relative = `${diffDays}d ago`;
  else relative = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const full = `${date} at ${time}`;

  return { date, time, relative, full };
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-500/10",
    text: "text-amber-900",
    border: "border-amber-400/40",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-blue-500/10",
    text: "text-blue-900",
    border: "border-blue-400/40",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    bg: "bg-blue-500/10",
    text: "text-blue-900",
    border: "border-blue-400/40",
    icon: Package,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    bg: "bg-purple-500/10",
    text: "text-purple-900",
    border: "border-purple-400/40",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    bg: "bg-emerald-500/15",
    text: "text-emerald-950",
    border: "border-emerald-500/40",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-500/10",
    text: "text-red-900",
    border: "border-red-400/40",
    icon: XCircle,
  },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");

  const fetchOrders = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    const supabase = createClient();
    const { data: orderData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Orders fetch error:", ordersError);
      setLoadError(`Failed to load orders: ${ordersError.message}`);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const ordersList = orderData ?? [];
    let ordersWithItems: Order[] = ordersList.map((order) => ({
      ...order,
      order_items: [],
    })) as Order[];

    if (ordersList.length > 0) {
      const orderIds = ordersList.map((order) => order.id);
      const { data: itemData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (itemsError) {
        console.error("Order items fetch error:", itemsError);
      } else {
        const itemsByOrder = new Map<string, OrderItem[]>();
        for (const item of (itemData ?? []) as OrderItem[]) {
          const orderItems = itemsByOrder.get(item.order_id) ?? [];
          orderItems.push(item);
          itemsByOrder.set(item.order_id, orderItems);
        }
        ordersWithItems = ordersList.map((order) => ({
          ...order,
          order_items: itemsByOrder.get(order.id) ?? [],
        })) as Order[];
      }
    }

    setLoadError("");
    setOrders(ordersWithItems);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    // No automatic background realtime listener per user request (loads on page open & manual refresh)
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatusId(orderId);
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Order status update error:", error);
      setLoadError(`Failed to update status: ${error.message}`);
      fetchOrders();
    }
    setUpdatingStatusId(null);
  };

  // 1-Click Copy Delivery Info for courier/whatsapp
  const handleCopyDeliveryInfo = (order: Order) => {
    const itemsSummary = order.order_items
      .map(
        (it) =>
          `• ${it.title} (Size: ${it.size}${it.color ? `, Color: ${it.color}` : ""}) x${it.quantity}`
      )
      .join("\n");

    const text = `Order: #${order.order_number}
Customer: ${order.customer_name}
Phone: ${order.phone}${order.secondary_phone ? ` / ${order.secondary_phone}` : ""}
Location: ${order.governorate} — ${order.area}
Address: ${order.address}${order.notes ? `\nNotes: ${order.notes}` : ""}${order.location_url ? `\nMap Pin: ${order.location_url}` : ""}

Items:
${itemsSummary}

Total to Collect (COD): ${Number(order.total_amount).toLocaleString()} EGP`.trim();

    navigator.clipboard.writeText(text);
    setCopiedOrderId(order.id);
    setTimeout(() => {
      setCopiedOrderId(null);
    }, 2500);
  };

  // Status Counts for Tabs
  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing" || o.status === "confirmed").length,
      out_for_delivery: orders.filter((o) => o.status === "out_for_delivery").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      let matchesFilter = true;
      if (activeFilter === "processing") {
        matchesFilter = order.status === "processing" || order.status === "confirmed";
      } else if (activeFilter !== "all") {
        matchesFilter = order.status === activeFilter;
      }

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesFilter;

      const matchesSearch =
        (order.customer_name || "").toLowerCase().includes(q) ||
        (order.phone || "").includes(q) ||
        (order.secondary_phone || "").includes(q) ||
        (order.order_number || "").toLowerCase().includes(q) ||
        (order.governorate || "").toLowerCase().includes(q) ||
        (order.area || "").toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <RotateCw className="w-5 h-5 animate-spin text-black/50" />
        <p className="text-xs uppercase tracking-widest text-black/60 font-mono">
          Loading studio orders...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {loadError && (
        <div className="border border-red-300 bg-red-50 p-3 text-xs text-red-800 flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={() => fetchOrders(true)} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/15 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-black">Orders Management</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-black text-[#e7ecea]">
              {orders.length} TOTAL
            </span>
          </div>
          <p className="text-xs text-black/60 uppercase tracking-widest mt-1">
            Dispatch pipeline, order timing, status controls & 1-click shipping manifests
          </p>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black/25 bg-white hover:bg-black/5 text-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs with Live Badges */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs uppercase tracking-wider">
          {[
            { id: "all", label: "All", count: statusCounts.all },
            { id: "pending", label: "Pending", count: statusCounts.pending },
            { id: "processing", label: "Processing", count: statusCounts.processing },
            { id: "out_for_delivery", label: "Out for Delivery", count: statusCounts.out_for_delivery },
            { id: "delivered", label: "Delivered", count: statusCounts.delivered },
            { id: "cancelled", label: "Cancelled", count: statusCounts.cancelled },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold border cursor-pointer transition-colors shrink-0 ${
                  isActive
                    ? "bg-black text-[#e7ecea] border-black shadow-xs"
                    : "bg-white/80 border-black/20 text-black/80 hover:border-black hover:text-black"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-black/10 text-black/70"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, phone, #order..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-black/25 bg-white focus:outline-none focus:border-black placeholder:text-black/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Orders Table with Single-Action Collapse */}
      <div className="border border-black/20 bg-white/70 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-black/15 bg-black/5 text-black font-semibold text-[11px] uppercase tracking-wider">
            <tr>
              <th className="p-4 w-32">Order #</th>
              <th className="p-4 w-44">Date & Time</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Location</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center w-28">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-16 text-center text-black/40 text-xs uppercase tracking-widest">
                  No orders found matching the filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const dt = formatOrderDateTime(order.created_at);
                const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const totalUnits = order.order_items.reduce((acc, it) => acc + (it.quantity || 1), 0);

                return (
                  <React.Fragment key={order.id}>
                    {/* Main Row */}
                    <tr
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className={`hover:bg-black/5 transition-colors cursor-pointer select-none ${
                        isExpanded ? "bg-black/[0.04]" : ""
                      }`}
                    >
                      {/* Order # */}
                      <td className="p-4 font-mono font-bold text-black text-sm">
                        #{order.order_number}
                      </td>

                      {/* Date & Time */}
                      <td className="p-4">
                        <div className="font-semibold text-black" title={dt.full}>
                          {dt.relative}
                        </div>
                        <div className="text-[10px] text-black/55 font-mono mt-0.5">
                          {dt.date} • {dt.time}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-semibold text-black">{order.customer_name}</div>
                        <div className="text-[11px] text-black/60 font-mono mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-black/40" />
                          <span>{order.phone}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="p-4 text-black/80">
                        <div className="font-medium">{order.governorate}</div>
                        <div className="text-[11px] text-black/55 mt-0.5">{order.area}</div>
                      </td>

                      {/* Items Count */}
                      <td className="p-4 font-mono text-[11px]">
                        <span className="font-bold text-black">{totalUnits}</span>{" "}
                        {totalUnits === 1 ? "piece" : "pieces"}
                      </td>

                      {/* Total */}
                      <td className="p-4 font-mono font-bold text-sm text-black">
                        {Number(order.total_amount).toLocaleString()} EGP
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          <statusInfo.icon className="w-3 h-3" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Single Action Collapse Button */}
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                            isExpanded
                              ? "bg-black text-[#e7ecea] border-black"
                              : "bg-white hover:bg-black hover:text-[#e7ecea] border-black/30 text-black"
                          }`}
                        >
                          <span>{isExpanded ? "Close" : "Details"}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* COLLAPSIBLE DETAILS */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="p-0 bg-black/[0.02]">
                          <div className="p-5 sm:p-6 border-t border-b border-black/15 space-y-6">
                            {/* Top Bar inside collapse: 1-Click Copy Delivery Info + Optional WhatsApp Link */}
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 border border-black/15">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-black">
                                  Order Actions:
                                </span>
                                <span className="text-[11px] text-black/50 font-mono">
                                  #{order.order_number}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {/* 1-Click Copy Delivery Info */}
                                <button
                                  onClick={() => handleCopyDeliveryInfo(order)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                                    copiedOrderId === order.id
                                      ? "bg-emerald-600 text-white border-emerald-600"
                                      : "bg-black text-[#e7ecea] border-black hover:bg-black/85"
                                  }`}
                                >
                                  {copiedOrderId === order.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Copied to Clipboard!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy Shipping Info</span>
                                    </>
                                  )}
                                </button>

                                {/* Optional direct WhatsApp Chat (pure link, no forced prompts) */}
                                <a
                                  href={`https://wa.me/2${(order.secondary_phone || order.phone).replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-emerald-600/30 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>WhatsApp Customer</span>
                                </a>
                              </div>
                            </div>

                            {/* 1. Fast Status Switcher Buttons */}
                            <div className="bg-white p-4 border border-black/15 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-black">
                                  Update Order Status:
                                </span>
                                {updatingStatusId === order.id && (
                                  <span className="text-[11px] text-black/50 font-mono animate-pulse">
                                    Updating...
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {(
                                  [
                                    "pending",
                                    "processing",
                                    "out_for_delivery",
                                    "delivered",
                                    "cancelled",
                                  ] as OrderStatus[]
                                ).map((st) => {
                                  const conf = STATUS_CONFIG[st];
                                  const isCurrent = order.status === st;
                                  return (
                                    <button
                                      key={st}
                                      disabled={updatingStatusId === order.id}
                                      onClick={() => handleUpdateStatus(order.id, st)}
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                                        isCurrent
                                          ? `${conf.bg} ${conf.text} ${conf.border} ring-1 ring-black/20`
                                          : "bg-white text-black/70 border-black/20 hover:border-black hover:text-black"
                                      }`}
                                    >
                                      <conf.icon className="w-3.5 h-3.5" />
                                      <span>{conf.label}</span>
                                      {isCurrent && <span className="text-[10px]">✓</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* 2. Customer & Address Details + Products Details Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                              {/* Customer and Shipping Details */}
                              <div className="bg-white p-5 border border-black/15 space-y-3 text-xs">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-black border-b border-black/10 pb-2 flex items-center justify-between">
                                  <span>Customer & Delivery Details</span>
                                  <MapPin className="w-3.5 h-3.5 text-black/40" />
                                </h4>
                                <div className="space-y-2 text-black/80">
                                  <p>
                                    <span className="text-black/50 block text-[10px] uppercase tracking-wider">Customer:</span>
                                    <strong className="text-black text-sm">{order.customer_name}</strong>
                                    {order.customer_age ? ` (${order.customer_age} yrs)` : ""}
                                  </p>
                                  <p>
                                    <span className="text-black/50 block text-[10px] uppercase tracking-wider">Primary Phone:</span>
                                    <strong className="font-mono text-black">{order.phone}</strong>
                                  </p>
                                  {order.secondary_phone && (
                                    <p>
                                      <span className="text-black/50 block text-[10px] uppercase tracking-wider">Secondary / WhatsApp:</span>
                                      <strong className="font-mono text-black">{order.secondary_phone}</strong>
                                    </p>
                                  )}
                                  <p>
                                    <span className="text-black/50 block text-[10px] uppercase tracking-wider">Region:</span>
                                    <strong className="text-black">{order.governorate} — {order.area}</strong>
                                  </p>
                                  <p>
                                    <span className="text-black/50 block text-[10px] uppercase tracking-wider">Full Address:</span>
                                    <span className="font-medium text-black">{order.address}</span>
                                  </p>
                                  {order.location_url && (
                                    <p className="pt-1">
                                      <a
                                        href={order.location_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-black font-bold underline text-[11px]"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Open Delivery Pin on Google Maps</span>
                                      </a>
                                    </p>
                                  )}
                                  {order.notes && (
                                    <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-950 mt-2">
                                      <span className="font-bold block text-[10px] uppercase tracking-wider">Customer Notes:</span>
                                      <span>{order.notes}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Products List & Financial Breakdown */}
                              <div className="lg:col-span-2 bg-white p-5 border border-black/15 space-y-4">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-black border-b border-black/10 pb-2 flex items-center justify-between">
                                  <span>Ordered Pieces ({order.order_items.length} styles)</span>
                                  <Package className="w-3.5 h-3.5 text-black/40" />
                                </h4>

                                <div className="space-y-3">
                                  {order.order_items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex gap-4 p-2.5 border border-black/10 bg-black/[0.01] items-center"
                                    >
                                      <img
                                        src={item.image || "/hoodie-cropped.png"}
                                        alt={item.title}
                                        className="w-16 h-16 object-contain bg-black/5 border border-black/10 shrink-0"
                                      />
                                      <div className="flex-1 min-w-0 text-xs">
                                        <p className="font-bold text-sm text-black uppercase truncate">
                                          {item.title}
                                        </p>
                                        <div className="flex items-center gap-3 text-black/60 mt-1 font-mono text-[11px]">
                                          <span>Size: <strong>{item.size}</strong></span>
                                          {item.color && <span>Color: <strong>{item.color}</strong></span>}
                                          <span>Qty: <strong>{item.quantity}</strong></span>
                                        </div>
                                      </div>
                                      <div className="text-right font-mono shrink-0">
                                        <div className="font-bold text-sm text-black">
                                          {Number(item.total_price || item.price * item.quantity).toLocaleString()} EGP
                                        </div>
                                        <div className="text-[10px] text-black/50">
                                          ({Number(item.price).toLocaleString()} EGP / unit)
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Financial Summary Footer */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-black/15 pt-4 text-xs">
                                  <div className="p-2.5 bg-black/5 border border-black/10">
                                    <span className="text-[10px] text-black/50 block uppercase tracking-wider">Subtotal</span>
                                    <strong className="font-mono text-sm text-black">
                                      {Number(order.subtotal_amount || 0).toLocaleString()} EGP
                                    </strong>
                                  </div>
                                  <div className="p-2.5 bg-black/5 border border-black/10">
                                    <span className="text-[10px] text-black/50 block uppercase tracking-wider">Discount</span>
                                    <strong className="font-mono text-sm text-emerald-900">
                                      -{Number(order.discount_amount || 0).toLocaleString()} EGP
                                    </strong>
                                  </div>
                                  <div className="p-2.5 bg-black/5 border border-black/10">
                                    <span className="text-[10px] text-black/50 block uppercase tracking-wider">Shipping</span>
                                    <strong className="font-mono text-sm text-black">
                                      {Number(order.shipping_fee || 0).toLocaleString()} EGP
                                    </strong>
                                  </div>
                                  <div className="p-2.5 bg-black text-[#e7ecea] border border-black">
                                    <span className="text-[10px] text-white/70 block uppercase tracking-wider">Total (COD)</span>
                                    <strong className="font-mono text-base font-black text-white">
                                      {Number(order.total_amount).toLocaleString()} EGP
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}