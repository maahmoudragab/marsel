"use client";

import React, { useMemo } from "react";
import { Layers, X } from "lucide-react";
import { useFactory } from "./FactoryContext";

export default function CuttingSummaryModal() {
  const { showCuttingModal, setShowCuttingModal, queueOrders, processingOrders } = useFactory();

  const activeOrders = useMemo(
    () => [...queueOrders, ...processingOrders],
    [queueOrders, processingOrders]
  );

  const batchSummary = useMemo(() => {
    const summaryMap = new Map<
      string,
      { title: string; size: string; color: string; color_hex: string; count: number }
    >();

    for (const order of activeOrders) {
      for (const it of order.items) {
        const key = `${it.title}__${it.size}__${it.color}`;
        const existing = summaryMap.get(key);
        if (existing) {
          existing.count += it.quantity;
        } else {
          summaryMap.set(key, {
            title: it.title,
            size: it.size,
            color: it.color || "افتراضي",
            color_hex: it.color_hex || "#111111",
            count: it.quantity,
          });
        }
      }
    }

    return Array.from(summaryMap.values());
  }, [activeOrders]);

  const totalPieces = batchSummary.reduce((acc, curr) => acc + curr.count, 0);

  if (!showCuttingModal) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer no-print"
      onClick={() => setShowCuttingModal(false)}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4 text-neutral-900 max-h-[85vh] overflow-y-auto cursor-default font-[family-name:var(--font-cairo)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-neutral-700" />
            <h3 className="text-sm font-black text-neutral-950">
              كشف تقطيع وتجهيز القماش ({totalPieces} قطعة)
            </h3>
          </div>
          <button
            onClick={() => setShowCuttingModal(false)}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-500">
          إجمالي القطع والمقاسات والألوان المطلوب تفصيلها وتقطيعها للأوردرات الحالية (في الانتظار +
          قيد التجهيز):
        </p>

        {batchSummary.length === 0 ? (
          <p className="text-xs text-neutral-400 py-6 text-center">لا توجد قطع مطلوبة حالياً.</p>
        ) : (
          <div className="space-y-2">
            {batchSummary.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-neutral-300 shrink-0"
                    style={{ backgroundColor: item.color_hex }}
                  />
                  <span>{item.title}</span>
                  <span className="text-neutral-500 font-mono">[{item.size}]</span>
                </div>
                <span className="font-black text-neutral-950 font-mono text-sm">
                  × {item.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
