"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  CheckSquare,
  Square,
  Package,
  RotateCw,
} from "lucide-react";
import { FactoryOrder } from "./types";
import { useFactory } from "./FactoryContext";
import OrderCard from "./OrderCard";

interface StageOrdersViewProps {
  stage: FactoryOrder["status"];
  title: string;
  subtitle: string;
}

export default function StageOrdersView({ stage, title, subtitle }: StageOrdersViewProps) {
  const {
    loading,
    queueOrders,
    processingOrders,
    readyOrders,
    deliveredOrders,
    updateOrderStatus,
  } = useFactory();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleToggleExpand = (orderId: string) => {
    setActiveOrderId(orderId);
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // Get orders list for this stage
  const stageOrders = useMemo(() => {
    if (stage === "confirmed") return queueOrders;
    if (stage === "processing") return processingOrders;
    if (stage === "out_for_delivery") return readyOrders;
    return deliveredOrders;
  }, [stage, queueOrders, processingOrders, readyOrders, deliveredOrders]);

  // Filter with search
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return stageOrders;
    const q = searchQuery.toLowerCase().trim();
    return stageOrders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.phone && o.phone.includes(q)) ||
        (o.governorate && o.governorate.toLowerCase().includes(q)) ||
        o.items.some(
          (it) =>
            it.title.toLowerCase().includes(q) ||
            it.size.toLowerCase().includes(q) ||
            it.color.toLowerCase().includes(q)
        )
    );
  }, [stageOrders, searchQuery]);

  // Select all logic
  const isAllSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedOrderIds.includes(o.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchStatus = async (newStatus: FactoryOrder["status"]) => {
    if (selectedOrderIds.length === 0) return;
    const success = await updateOrderStatus(selectedOrderIds, newStatus);
    if (success) {
      setSelectedOrderIds([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* STAGE HEADER & CONTROLS */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-neutral-950 tracking-tight">{title}</h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-neutral-100 text-neutral-900 rounded-md">
                {stageOrders.length} أوردر
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">{subtitle}</p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الأوردر، اسم العميل، التليفون..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-lg border border-neutral-200 bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>

        {/* BATCH SELECTION BAR (FULL CONTROL) */}
        {filteredOrders.length > 0 && (
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={toggleSelectAll}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer text-neutral-700 transition-colors"
            >
              {isAllSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-neutral-900" />
              ) : (
                <Square className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span>تحديد الكل ({filteredOrders.length})</span>
            </button>

            {selectedOrderIds.length > 0 && (
              <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-lg">
                <span className="text-[11px] font-bold text-neutral-600 px-1">
                  نقل المحددين ({selectedOrderIds.length}) إلى:
                </span>
                <button
                  onClick={() => handleBatchStatus("confirmed")}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-neutral-200 text-neutral-900 rounded shadow-2xs cursor-pointer"
                >
                  1. انتظار
                </button>
                <button
                  onClick={() => handleBatchStatus("processing")}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-neutral-200 text-neutral-900 rounded shadow-2xs cursor-pointer"
                >
                  2. قيد التجهيز
                </button>
                <button
                  onClick={() => handleBatchStatus("out_for_delivery")}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-neutral-200 text-neutral-900 rounded shadow-2xs cursor-pointer"
                >
                  3. جاهز للتسليم
                </button>
                <button
                  onClick={() => handleBatchStatus("delivered")}
                  className="px-2.5 py-1 text-[11px] font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded shadow-2xs cursor-pointer"
                >
                  4. تم التسليم
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <div className="text-center py-24 bg-white rounded-xl border border-neutral-200">
          <RotateCw className="w-7 h-7 animate-spin mx-auto text-neutral-400 mb-2" />
          <p className="text-xs font-bold text-neutral-500">جاري تحميل بيانات الأوردرات...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-neutral-200 space-y-2">
          <Package className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="text-sm font-black text-neutral-800">لا توجد أوردرات في هذه المرحلة</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {stage === "confirmed"
              ? "لا توجد أوردرات جديدة بانتظار سحبها للتشغيل."
              : stage === "processing"
              ? "لا توجد أوردرات قيد التجهيز حالياً."
              : stage === "out_for_delivery"
              ? "لا توجد أوردرات جاهزة للتسليم حالياً."
              : "سجل الأوردرات المسلّمة فارغ."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isSelected={selectedOrderIds.includes(order.id)}
              isActive={activeOrderId === order.id}
              isExpanded={expandedOrderId === order.id}
              onToggleSelect={() => toggleSelectOrder(order.id)}
              onSelectActive={() => setActiveOrderId(order.id)}
              onToggleExpand={() => handleToggleExpand(order.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
