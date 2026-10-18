"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCw,
  ShoppingBag,
  Sparkles,
  MapPin,
  Tag,
  CircleDot,
  Calendar,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface OrderItem {
  id: string;
  title: string;
  size: string;
  quantity: number;
  price: number;
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
  notes: string | null;
  subtotal_amount?: number;
  discount_amount?: number;
  shipping_fee?: number;
  total_amount: number;
  coupon_code?: string | null;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
}

type Timeframe = "all" | "30d" | "7d" | "today";

function formatEnglishDateTime(isoString: string) {
  if (!isoString) return { date: "—", time: "—", relative: "—" };
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

  return { date, time, relative };
}

export default function AdminOverviewDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [activeCouponsCount, setActiveCouponsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>("all");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    setLastUpdated(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }));
  }, []);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    const supabase = createClient();
    try {
      const [
        { data: ordersData, error: ordersErr },
        { count: prodCount },
        { count: coupCount },
      ] = await Promise.all([
        supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("coupons").select("*", { count: "exact", head: true }).eq("is_active", true),
      ]);

      if (ordersErr) {
        setLoadError(`Failed to load orders: ${ordersErr.message}`);
      } else if (ordersData) {
        setOrders(ordersData as Order[]);
        setLoadError("");
      }

      if (prodCount != null) setProductsCount(prodCount);
      if (coupCount != null) setActiveCouponsCount(coupCount);
      setLastUpdated(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }));
    } catch (err: unknown) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // No automatic realtime listener per user request (data loads on initial open and on manual refresh)
  }, [fetchData]);

  // Filter orders by selected timeframe
  const filteredOrders = useMemo(() => {
    if (timeframe === "all") return orders;
    const now = new Date();
    const threshold = new Date();

    if (timeframe === "30d") threshold.setDate(now.getDate() - 30);
    else if (timeframe === "7d") threshold.setDate(now.getDate() - 7);
    else if (timeframe === "today") threshold.setHours(0, 0, 0, 0);

    return orders.filter((o) => new Date(o.created_at) >= threshold);
  }, [orders, timeframe]);

  // Financial & Operational Metrics
  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const validOrders = filteredOrders.filter((o) => o.status !== "cancelled");
    const cancelledOrders = filteredOrders.filter((o) => o.status === "cancelled");

    const grossRevenue = validOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const deliveredOrders = filteredOrders.filter((o) => o.status === "delivered");
    const netDeliveredRevenue = deliveredOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    const inTransitOrders = filteredOrders.filter(
      (o) => o.status === "processing" || o.status === "out_for_delivery"
    );
    const pipelineRevenue = inTransitOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    const pendingOrders = filteredOrders.filter((o) => o.status === "pending");
    const pendingRevenue = pendingOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    const averageOrderValue = validOrders.length ? Math.round(grossRevenue / validOrders.length) : 0;

    const decidedOrdersCount = deliveredOrders.length + cancelledOrders.length;
    const deliveryRate = decidedOrdersCount > 0
      ? Math.round((deliveredOrders.length / decidedOrdersCount) * 100)
      : (totalOrders > 0 ? 100 : 0);

    let totalPiecesSold = 0;
    validOrders.forEach((o) => {
      o.order_items?.forEach((item) => {
        totalPiecesSold += Number(item.quantity || 1);
      });
    });

    const totalDiscountsGiven = validOrders.reduce(
      (sum, o) => sum + Number(o.discount_amount || 0),
      0
    );

    return {
      totalOrders,
      grossRevenue,
      netDeliveredRevenue,
      pipelineRevenue,
      pendingOrders: pendingOrders.length,
      pendingRevenue,
      deliveredCount: deliveredOrders.length,
      inTransitCount: inTransitOrders.length,
      cancelledCount: cancelledOrders.length,
      averageOrderValue,
      deliveryRate,
      totalPiecesSold,
      totalDiscountsGiven,
    };
  }, [filteredOrders]);

  // Top Selling Products & Sizes Demand Breakdown
  const merchandiseInsights = useMemo(() => {
    const productMap: { [title: string]: { title: string; count: number; revenue: number } } = {};
    const sizeMap: { [size: string]: number } = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };

    filteredOrders.forEach((o) => {
      if (o.status === "cancelled") return;
      o.order_items?.forEach((item) => {
        const title = item.title || "Custom Piece";
        const qty = Number(item.quantity || 1);
        const price = Number(item.price || 0);

        if (!productMap[title]) {
          productMap[title] = { title, count: 0, revenue: 0 };
        }
        productMap[title].count += qty;
        productMap[title].revenue += price * qty;

        const size = (item.size || "").toUpperCase();
        if (sizeMap[size] !== undefined) {
          sizeMap[size] += qty;
        } else if (size) {
          sizeMap[size] = (sizeMap[size] || 0) + qty;
        }
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const totalSizesCount = Object.values(sizeMap).reduce((a, b) => a + b, 0);

    return { topProducts, sizeMap, totalSizesCount };
  }, [filteredOrders]);

  // Geographic Distribution
  const geoBreakdown = useMemo(() => {
    const total = filteredOrders.length || 1;
    const cairo = filteredOrders.filter(
      (o) => o.governorate?.includes("قاهرة") || o.governorate?.toLowerCase() === "cairo"
    ).length;
    const giza = filteredOrders.filter(
      (o) => o.governorate?.includes("جيزة") || o.governorate?.toLowerCase() === "giza"
    ).length;
    const alex = filteredOrders.filter(
      (o) => o.governorate?.includes("إسكندرية") || o.governorate?.includes("اسكندرية") || o.governorate?.toLowerCase() === "alexandria"
    ).length;
    const other = Math.max(0, filteredOrders.length - (cairo + giza + alex));

    return [
      { name: "Cairo", count: cairo, pct: Math.round((cairo / total) * 100) },
      { name: "Giza", count: giza, pct: Math.round((giza / total) * 100) },
      { name: "Alexandria", count: alex, pct: Math.round((alex / total) * 100) },
      { name: "Other Governorates", count: other, pct: Math.round((other / total) * 100) },
    ];
  }, [filteredOrders]);

  // Sales Curve Chart Data
  const salesChartData = useMemo(() => {
    const dateMap: { [key: string]: { label: string; revenue: number; orders: number } } = {};
    const keys: string[] = [];

    if (timeframe === "today") {
      const hours = [0, 4, 8, 12, 16, 20];
      hours.forEach((h) => {
        const key = `${h}:00`;
        const label = h === 0 ? "12 AM" : h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`;
        dateMap[key] = { label, revenue: 0, orders: 0 };
        keys.push(key);
      });

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      filteredOrders.forEach((o) => {
        if (o.status === "cancelled") return;
        const oDate = new Date(o.created_at);
        if (oDate >= startOfToday) {
          const hour = oDate.getHours();
          const slotHour = hours.slice().reverse().find((h) => hour >= h) ?? 0;
          const key = `${slotHour}:00`;
          if (dateMap[key]) {
            dateMap[key].revenue += Number(o.total_amount || 0);
            dateMap[key].orders += 1;
          }
        }
      });
    } else {
      const daysCount = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 14;
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const key = `${year}-${month}-${day}`;
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dateMap[key] = { label, revenue: 0, orders: 0 };
        keys.push(key);
      }

      filteredOrders.forEach((o) => {
        if (o.status === "cancelled") return;
        if (!o.created_at) return;
        const d = new Date(o.created_at);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const key = `${year}-${month}-${day}`;

        if (dateMap[key]) {
          dateMap[key].revenue += Number(o.total_amount || 0);
          dateMap[key].orders += 1;
        }
      });
    }

    return keys.map((k) => dateMap[k]);
  }, [filteredOrders, timeframe]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <RotateCw className="w-5 h-5 animate-spin text-black/50" />
        <p className="text-xs uppercase tracking-widest text-black/60 font-mono">
          Loading studio commercial analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {loadError && (
        <div className="border border-red-300 bg-red-50 p-3 text-xs text-red-800 flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={() => fetchData(true)} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* TOP HEADER & REFRESH CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/15 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-black">
              Studio Intelligence
            </h1>
            <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 bg-black text-[#e7ecea]">
              Overview
            </span>
          </div>
          <p className="text-xs text-black/60 uppercase tracking-widest mt-1">
            Real-time commercial volume, drop fulfillment & customer demand analytics
          </p>
        </div>

        {/* Controls: Timeframe & Manual Refresh Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Manual Refresh Button */}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            title="Refresh dashboard data"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black/25 bg-white hover:bg-black/5 text-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
            {lastUpdated && <span className="text-[10px] text-black/40 font-mono">({lastUpdated})</span>}
          </button>

          {/* Timeframe Selector */}
          <div className="border border-black/20 p-0.5 flex bg-black/5 text-xs font-bold uppercase">
            {(["all", "30d", "7d", "today"] as Timeframe[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  timeframe === t ? "bg-black text-[#e7ecea] shadow-xs" : "text-black/60 hover:text-black"
                }`}
              >
                {t === "all" ? "All Time" : t === "30d" ? "30 Days" : t === "7d" ? "7 Days" : "Today"}
              </button>
            ))}
          </div>

          <Link
            href="/admin/deliveries"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black/25 bg-white text-black hover:bg-black/5 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Deliveries</span>
          </Link>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-[#e7ecea] text-xs font-semibold uppercase tracking-wider hover:bg-black/85 transition-colors"
          >
            <span>Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5 EXECUTIVE METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Net Realized Cash */}
        <div className="border border-emerald-900/30 bg-emerald-500/[0.07] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-950 flex items-center justify-between">
            <span>Collected Cash</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          </span>
          <div className="my-2.5">
            <div className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
              {metrics.netDeliveredRevenue.toLocaleString()}
            </div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase">EGP Delivered</span>
          </div>
          <span className="text-[10px] text-emerald-800/80 uppercase">
            {metrics.deliveredCount} orders completed
          </span>
        </div>

        {/* 2. In Transit / Pipeline */}
        <div className="border border-blue-900/20 bg-blue-500/[0.05] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-950 flex items-center justify-between">
            <span>With Courier</span>
            <Truck className="w-3.5 h-3.5 text-blue-700" />
          </span>
          <div className="my-2.5">
            <div className="text-xl sm:text-2xl font-black text-blue-950 font-mono">
              {metrics.pipelineRevenue.toLocaleString()}
            </div>
            <span className="text-[10px] font-bold text-blue-800 uppercase">EGP in transit</span>
          </div>
          <span className="text-[10px] text-blue-800/80 uppercase">
            {metrics.inTransitCount} orders dispatched
          </span>
        </div>

        {/* 3. Total Orders Volume */}
        <div className="border border-black/20 bg-black/[0.03] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-black/60 flex items-center justify-between">
            <span>Total Orders</span>
            <ShoppingBag className="w-3.5 h-3.5 text-black/50" />
          </span>
          <div className="my-2.5">
            <div className="text-xl sm:text-2xl font-black text-black font-mono">
              {metrics.totalOrders}
            </div>
            <span className="text-[10px] font-semibold text-black/60 uppercase">Gross Volume</span>
          </div>
          <span className="text-[10px] text-black/50 uppercase">
            {metrics.pendingOrders} pending review
          </span>
        </div>

        {/* 4. Average Order Value (AOV) */}
        <div className="border border-black/20 bg-black/[0.03] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-black/60 flex items-center justify-between">
            <span>Avg Basket (AOV)</span>
            <Sparkles className="w-3.5 h-3.5 text-black/50" />
          </span>
          <div className="my-2.5">
            <div className="text-xl sm:text-2xl font-black text-black font-mono">
              {metrics.averageOrderValue.toLocaleString()}
            </div>
            <span className="text-[10px] font-semibold text-black/60 uppercase">EGP / Customer</span>
          </div>
          <span className="text-[10px] text-black/50 font-mono uppercase">
            {metrics.totalPiecesSold} pieces sold
          </span>
        </div>

        {/* 5. Delivery Success Rate */}
        <div className="col-span-2 lg:col-span-1 border border-black/20 bg-black/[0.03] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-black/60 flex items-center justify-between">
            <span>Fulfillment Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-black/50" />
          </span>
          <div className="my-2.5">
            <div className="text-xl sm:text-2xl font-black text-black font-mono">
              {metrics.deliveryRate}%
            </div>
            <span className="text-[10px] font-semibold text-black/60 uppercase">Delivery Ratio</span>
          </div>
          <span className="text-[10px] text-black/50 uppercase">
            {metrics.cancelledCount} cancelled
          </span>
        </div>
      </div>

      {/* SALES PERFORMANCE RECHARTS CHART */}
      <div className="border border-black/20 p-5 sm:p-6 bg-white/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black">
              Revenue & Order Flow Curve
            </h2>
            <p className="text-[11px] text-black/50 uppercase tracking-widest mt-0.5">
              Sales velocity and volume over selected timeframe
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-black inline-block" />
              <span className="text-black/70 uppercase text-[10px] tracking-wider">Revenue (EGP)</span>
            </div>
            <div className="text-xs text-black/70 font-semibold uppercase">
              Period Total:{" "}
              <span className="text-black font-bold font-mono">
                {salesChartData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()} EGP
              </span>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-3">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesOverviewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "rgba(0,0,0,0.6)", fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(0,0,0,0.2)" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "rgba(0,0,0,0.6)", fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black text-[#e7ecea] p-3 border border-black shadow-xl">
                          <p className="font-semibold uppercase tracking-wider text-[10px] text-white/60 mb-1">
                            {label}
                          </p>
                          <p className="font-mono font-bold text-base text-white">
                            {Number(payload[0].value).toLocaleString()} EGP
                          </p>
                          <p className="text-[10px] text-white/70 uppercase tracking-widest mt-1">
                            {payload[0].payload.orders}{" "}
                            {payload[0].payload.orders === 1 ? "order recorded" : "orders recorded"}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#000000"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesOverviewGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs uppercase text-black/30 font-mono">
              Loading chart...
            </div>
          )}
        </div>
      </div>

      {/* MERCHANDISE INSIGHTS & SIZES DEMAND (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="border border-black/20 p-6 space-y-4 bg-white/40">
          <div className="flex justify-between items-baseline border-b border-black/10 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-black">Top Selling Pieces</h2>
              <p className="text-[10px] text-black/50 uppercase tracking-widest mt-0.5">By unit volume and revenue generated</p>
            </div>
            <Link href="/admin/products" className="text-xs font-semibold uppercase tracking-wider hover:underline">
              View Catalog
            </Link>
          </div>

          {merchandiseInsights.topProducts.length === 0 ? (
            <div className="p-8 text-center text-black/40 text-xs uppercase tracking-wider">
              No sales recorded in this timeframe yet.
            </div>
          ) : (
            <div className="space-y-3.5 pt-1">
              {merchandiseInsights.topProducts.map((prod, idx) => (
                <div key={prod.title} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium uppercase">
                    <span className="font-bold flex items-center gap-2">
                      <span className="text-[10px] text-black/40 font-mono">#{idx + 1}</span>
                      <span>{prod.title}</span>
                    </span>
                    <span className="font-mono">
                      {prod.count} {prod.count === 1 ? "piece" : "pieces"} •{" "}
                      <strong>{prod.revenue.toLocaleString()} EGP</strong>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-black/10">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((prod.revenue / (metrics.grossRevenue || 1)) * 100)
                        )}%`,
                      }}
                      className="bg-black h-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Sizes Demand (Pure customer preference - open stock) */}
        <div className="border border-black/20 p-6 space-y-4 bg-white/40">
          <div className="flex justify-between items-baseline border-b border-black/10 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-black">Size Demand Breakdown</h2>
              <p className="text-[10px] text-black/50 uppercase tracking-widest mt-0.5">Customer size selection distribution</p>
            </div>
            <span className="text-xs font-mono text-black/50 uppercase">
              {merchandiseInsights.totalSizesCount} pieces sold
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {Object.entries(merchandiseInsights.sizeMap).map(([size, count]) => {
              const pct = merchandiseInsights.totalSizesCount
                ? Math.round((count / merchandiseInsights.totalSizesCount) * 100)
                : 0;
              return (
                <div key={size}>
                  <div className="flex justify-between text-xs font-mono uppercase mb-1">
                    <span className="font-bold">Size {size}:</span>
                    <span>
                      {count} pieces ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-black/10">
                    <div style={{ width: `${pct}%` }} className="bg-black h-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GEOGRAPHY & OFFERS SUMMARY (2 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Governorate Order Breakdown */}
        <div className="border border-black/20 p-6 space-y-4 bg-white/40">
          <div className="flex justify-between items-baseline border-b border-black/10 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-black">Delivery Density by Region</h2>
              <p className="text-[10px] text-black/50 uppercase tracking-widest mt-0.5">Egypt Regional Distribution</p>
            </div>
            <span className="text-xs text-black/50 font-mono uppercase">Egypt</span>
          </div>
          <div className="space-y-4 pt-1">
            {geoBreakdown.map((geo) => (
              <div key={geo.name}>
                <div className="flex justify-between text-xs font-medium uppercase mb-1.5">
                  <span>{geo.name}:</span>
                  <span className="font-mono">
                    {geo.count} orders ({geo.pct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-black/10">
                  <div style={{ width: `${geo.pct}%` }} className="bg-black h-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupons & Promo Performance */}
        <div className="border border-black/20 p-6 space-y-4 bg-white/40 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-baseline border-b border-black/10 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-black">Coupons & Campaigns</h2>
                <p className="text-[10px] text-black/50 uppercase tracking-widest mt-0.5">Active promo codes and discount volume</p>
              </div>
              <Link href="/admin/offers" className="text-xs font-semibold uppercase tracking-wider hover:underline">
                Manage Codes
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="border border-black/15 p-3.5 bg-black/5">
                <span className="text-[10px] uppercase font-bold text-black/50 block tracking-wider">
                  Active Coupons
                </span>
                <div className="text-2xl font-bold font-mono mt-1">{activeCouponsCount}</div>
                <span className="text-[10px] text-black/40 uppercase">Ready in checkout</span>
              </div>

              <div className="border border-black/15 p-3.5 bg-black/5">
                <span className="text-[10px] uppercase font-bold text-black/50 block tracking-wider">
                  Total Discounts
                </span>
                <div className="text-2xl font-bold font-mono mt-1 text-emerald-950">
                  {metrics.totalDiscountsGiven.toLocaleString()}
                </div>
                <span className="text-[10px] text-black/40 uppercase">EGP saved by customers</span>
              </div>
            </div>
          </div>

          <div className="border-t border-black/10 pt-4 flex items-center justify-between text-xs">
            <span className="text-black/60 uppercase">Want to launch a flash drop code?</span>
            <Link
              href="/admin/offers"
              className="font-bold uppercase tracking-wider underline underline-offset-4 hover:text-black/70"
            >
              + Create Coupon Code
            </Link>
          </div>
        </div>
      </div>

      {/* RECENT INCOMING STUDIO ORDERS */}
      <div className="border border-black/20 space-y-4 bg-white/30">
        <div className="p-5 sm:p-6 border-b border-black/20 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black">Latest Incoming Orders</h2>
            <p className="text-[10px] text-black/50 uppercase tracking-widest mt-0.5">
              Live customer requests & dispatch pipeline
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold uppercase tracking-wider underline underline-offset-4 hover:opacity-75 transition-opacity"
          >
            View all ({orders.length}) →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-black/40 text-xs uppercase tracking-widest">
            No orders found yet. They will appear here once placed by customers.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-black/10 bg-black/5 text-black font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {orders.slice(0, 6).map((order) => {
                  const dt = formatEnglishDateTime(order.created_at);
                  return (
                    <tr key={order.id} className="hover:bg-black/5 transition-colors">
                      <td className="p-4 font-mono font-bold">#{order.order_number}</td>
                      <td className="p-4">
                        <div className="font-semibold text-black">{dt.relative}</div>
                        <div className="text-[10px] text-black/50 font-mono mt-0.5">{dt.date} • {dt.time}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">{order.customer_name}</div>
                        <div className="text-[11px] text-black/60 font-mono mt-0.5">{order.phone}</div>
                      </td>
                      <td className="p-4 text-black/80">
                        {order.governorate} — {order.area}
                      </td>
                      <td className="p-4 font-mono text-[11px]">
                        {order.order_items?.length || 1} {order.order_items?.length === 1 ? "piece" : "pieces"}
                      </td>
                      <td className="p-4 font-mono font-bold">
                        {Number(order.total_amount).toLocaleString()} EGP
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                            order.status === "delivered"
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-900 border-red-300"
                              : order.status === "out_for_delivery" || order.status === "processing"
                              ? "bg-blue-100 text-blue-900 border-blue-300"
                              : "bg-black/10 text-black border-black/20"
                          }`}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/orders`}
                          className="px-2.5 py-1 bg-black text-[#e7ecea] hover:bg-black/80 text-[11px] font-semibold uppercase tracking-wider transition-colors"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}