"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { FactoryOrder } from "./types";
import InvoiceModal from "./InvoiceModal";
import GalleryViewerModal from "./GalleryViewerModal";

interface FactoryContextValue {
  orders: FactoryOrder[];
  loading: boolean;
  refreshing: boolean;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (
    orderIds: string[],
    newStatus: FactoryOrder["status"]
  ) => Promise<boolean>;
  updatingIds: string[];
  queueOrders: FactoryOrder[];
  processingOrders: FactoryOrder[];
  readyOrders: FactoryOrder[];
  deliveredOrders: FactoryOrder[];
  openInvoice: (order: FactoryOrder) => void;
  openGallery: (images: string[], initialIndex: number, title: string) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  showCuttingModal: boolean;
  setShowCuttingModal: (show: boolean) => void;
}

const FactoryContext = createContext<FactoryContextValue | null>(null);

export function FactoryProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<FactoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);
  const [invoiceOrder, setInvoiceOrder] = useState<FactoryOrder | null>(null);
  const [galleryState, setGalleryState] = useState<{
    images: string[];
    initialIndex: number;
    title: string;
  } | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCuttingModal, setShowCuttingModal] = useState(false);

  const fetchOrders = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/factory/orders");
      if (res.status === 401) {
        setOrders([]);
        return;
      }
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Error loading factory orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (
    orderIds: string[],
    newStatus: FactoryOrder["status"]
  ): Promise<boolean> => {
    setUpdatingIds(orderIds);
    try {
      const res = await fetch("/api/factory/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds, newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (orderIds.includes(o.id) ? { ...o, status: newStatus } : o))
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating order status:", err);
      return false;
    } finally {
      setUpdatingIds([]);
    }
  };

  const queueOrders = useMemo(() => orders.filter((o) => o.status === "confirmed"), [orders]);
  const processingOrders = useMemo(() => orders.filter((o) => o.status === "processing"), [orders]);
  const readyOrders = useMemo(() => orders.filter((o) => o.status === "out_for_delivery"), [orders]);
  const deliveredOrders = useMemo(() => orders.filter((o) => o.status === "delivered"), [orders]);

  const value: FactoryContextValue = {
    orders,
    loading,
    refreshing,
    refreshOrders: () => fetchOrders(true),
    updateOrderStatus,
    updatingIds,
    queueOrders,
    processingOrders,
    readyOrders,
    deliveredOrders,
    openInvoice: (order: FactoryOrder) => setInvoiceOrder(order),
    openGallery: (images: string[], initialIndex: number, title: string) =>
      setGalleryState({ images, initialIndex, title }),
    mobileSidebarOpen,
    setMobileSidebarOpen,
    showCuttingModal,
    setShowCuttingModal,
  };

  return (
    <FactoryContext.Provider value={value}>
      {children}

      {/* CHIC ENGLISH INVOICE MODAL */}
      {invoiceOrder && (
        <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}

      {/* KEYBOARD-NAVIGABLE GALLERY VIEWER MODAL */}
      {galleryState && (
        <GalleryViewerModal
          images={galleryState.images}
          initialIndex={galleryState.initialIndex}
          title={galleryState.title}
          onClose={() => setGalleryState(null)}
        />
      )}
    </FactoryContext.Provider>
  );
}

export function useFactory() {
  const ctx = useContext(FactoryContext);
  if (!ctx) {
    throw new Error("useFactory must be used within a FactoryProvider");
  }
  return ctx;
}
