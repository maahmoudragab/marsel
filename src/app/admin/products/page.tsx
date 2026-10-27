"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  RotateCw,
  CheckCircle2,
  Package,
  Layers,
  EyeOff,
  Copy,
  Search,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { useProducts } from "@/context/ProductContext";
import { getCoverImage, type Product } from "@/lib/product";

export default function ProductsAdminPage() {
  const { products, loading, deleteProduct, toggleProductActive, reorderProducts, refetch } = useProducts();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "hidden">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Drag and drop ordering states
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const canReorder = !search.trim() && filterStatus === "all" && selectedCategory === "all";

  // Auto-dismiss toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3200);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      setSuccessToast("Products catalog refreshed");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!canReorder) return;
    setDraggedId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (!canReorder || !draggedId || draggedId === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    // Keep subtle hover
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!canReorder || !draggedId || draggedId === targetId) {
      handleDragEnd();
      return;
    }

    const currentOrder = [...products];
    const fromIndex = currentOrder.findIndex((p) => p.id === draggedId);
    const toIndex = currentOrder.findIndex((p) => p.id === targetId);

    if (fromIndex === -1 || toIndex === -1) {
      handleDragEnd();
      return;
    }

    const updated = [...currentOrder];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    handleDragEnd();

    try {
      setIsSavingOrder(true);
      await reorderProducts(updated.map((p) => p.id));
      setSuccessToast(`Product order updated: "${moved.title}" is now #${toIndex + 1}`);
    } catch (err: any) {
      alert("Failed to update product order: " + err.message);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleMoveStep = async (id: string, direction: "up" | "down") => {
    if (!canReorder) return;
    const fromIndex = products.findIndex((p) => p.id === id);
    if (fromIndex === -1) return;
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= products.length) return;

    const updated = [...products];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    try {
      setIsSavingOrder(true);
      await reorderProducts(updated.map((p) => p.id));
      setSuccessToast(`Moved "${moved.title}" ${direction === "up" ? "up" : "down"} to #${toIndex + 1}`);
    } catch (err: any) {
      alert("Failed to update product order: " + err.message);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      setSuccessToast(`Deleted "${productToDelete.title}"`);
      setProductToDelete(null);
    } catch (err: any) {
      alert("Failed to delete product: " + err.message);
    }
  };

  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  const stats = useMemo(() => {
    const total = products.length;
    const live = products.filter((p) => p.is_active !== false).length;
    const hidden = total - live;
    const categories = categoriesList.length;
    return { total, live, hidden, categories };
  }, [products, categoriesList]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesSearch =
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q) ||
          (p.color_name && p.color_name.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }
      if (filterStatus === "active") return p.is_active !== false;
      if (filterStatus === "hidden") return p.is_active === false;
      if (selectedCategory !== "all") return p.category?.toLowerCase() === selectedCategory.toLowerCase();
      return true;
    });
  }, [products, search, filterStatus, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-black text-[#e7ecea] text-xs font-semibold shadow-2xl border border-black/30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
          <button
            onClick={() => setSuccessToast(null)}
            className="ml-2 text-white/50 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Products Studio
            </h1>
            <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 bg-black text-[#e7ecea]">
              Catalog
            </span>
          </div>
          <p className="text-xs text-black/60 uppercase tracking-widest mt-1">
            Manage catalog, pricing, drop availability & size guides
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {isSavingOrder && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-[#e7ecea] text-xs font-mono font-bold animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving Order...
            </span>
          )}

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-black/25 bg-white hover:bg-black/5 text-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh catalog"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-[#e7ecea] text-xs font-semibold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Products */}
        <div className="border border-black/20 bg-black/[0.02] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-black/60 flex items-center justify-between">
            <span>Total Catalog</span>
            <Package className="w-3.5 h-3.5 text-black/50" />
          </span>
          <div className="my-2">
            <div className="text-2xl font-black font-mono">{stats.total}</div>
            <span className="text-[10px] font-semibold text-black/60 uppercase">Pieces Created</span>
          </div>
          <span className="text-[10px] text-black/50 uppercase">Across all drops</span>
        </div>

        {/* Live in Store */}
        <div className="border border-emerald-900/30 bg-emerald-500/[0.05] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-950 flex items-center justify-between">
            <span>Live in Store</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          </span>
          <div className="my-2">
            <div className="text-2xl font-black text-emerald-950 font-mono">{stats.live}</div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase">Visible to Customers</span>
          </div>
          <span className="text-[10px] text-emerald-800/80 uppercase">
            {stats.hidden} hidden / draft
          </span>
        </div>

        {/* Hidden Products */}
        <div className="border border-black/20 bg-black/[0.02] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-black/60 flex items-center justify-between">
            <span>Draft & Hidden</span>
            <EyeOff className="w-3.5 h-3.5 text-black/50" />
          </span>
          <div className="my-2">
            <div className="text-2xl font-black font-mono">{stats.hidden}</div>
            <span className="text-[10px] font-semibold text-black/60 uppercase">Unpublished</span>
          </div>
          <span className="text-[10px] text-black/50 uppercase">Hidden from storefront</span>
        </div>

        {/* Categories */}
        <div className="border border-blue-900/20 bg-blue-500/[0.04] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-950 flex items-center justify-between">
            <span>Categories</span>
            <Layers className="w-3.5 h-3.5 text-blue-700" />
          </span>
          <div className="my-2">
            <div className="text-2xl font-black text-blue-950 font-mono">{stats.categories}</div>
            <span className="text-[10px] font-bold text-blue-800 uppercase">Product Lines</span>
          </div>
          <span className="text-[10px] text-blue-800/80 uppercase">Active categories</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="border border-black/20 bg-white/70 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, category, color, or collection..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-black/20 bg-white focus:outline-none focus:border-black font-supreme"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter status buttons & category selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex border border-black/20 bg-white p-0.5 text-xs">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  filterStatus === "all" ? "bg-black text-[#e7ecea]" : "text-black/70 hover:text-black"
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  filterStatus === "active" ? "bg-black text-[#e7ecea]" : "text-black/70 hover:text-black"
                }`}
              >
                Live ({stats.live})
              </button>
              <button
                onClick={() => setFilterStatus("hidden")}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  filterStatus === "hidden" ? "bg-black text-[#e7ecea]" : "text-black/70 hover:text-black"
                }`}
              >
                Hidden ({stats.hidden})
              </button>
            </div>

            {categoriesList.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs border border-black/20 bg-white px-3 py-1.5 font-bold uppercase tracking-wider focus:outline-none focus:border-black"
              >
                <option value="all">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="border border-black/20 bg-white overflow-hidden shadow-xs">
        {!canReorder && (
          <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/25 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-800 shrink-0" />
              <span>
                <strong>Drag & Drop Ordering:</strong> Reordering applies to the full catalog. Reset filters or clear search to drag and rearrange products.
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterStatus("all");
                setSelectedCategory("all");
              }}
              className="text-xs font-bold underline cursor-pointer text-amber-900 hover:text-black"
            >
              Reset Filters
            </button>
          </div>
        )}

        {loading && products.length === 0 ? (
          <div className="p-12 text-center text-xs text-black/50 uppercase tracking-widest font-mono">
            Loading products catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-8 h-8 text-black/30 mx-auto" />
            <div className="text-sm font-bold uppercase tracking-wider">No products found</div>
            <p className="text-xs text-black/60 max-w-sm mx-auto">
              {search || filterStatus !== "all" || selectedCategory !== "all"
                ? "Try adjusting your search query or filters to find what you are looking for."
                : "Your store catalog is empty. Click below to add your first studio piece."}
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-[#e7ecea] text-xs font-semibold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Piece</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/20 bg-black/[0.03] uppercase font-bold text-[10px] tracking-wider text-black/70">
                  <th className="py-3 px-3 text-center w-24">
                    <span className="inline-flex items-center gap-1 justify-center">
                      <ArrowUpDown className="w-3 h-3" />
                      <span>Order</span>
                    </span>
                  </th>
                  <th className="py-3 px-4">Piece</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Sizes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filteredProducts.map((p, index) => {
                  const isActive = p.is_active !== false;
                  const isBeingDragged = draggedId === p.id;
                  const isDropTarget = dragOverId === p.id;

                  return (
                    <tr
                      key={p.id}
                      draggable={canReorder}
                      onDragStart={(e) => handleDragStart(e, p.id)}
                      onDragOver={(e) => handleDragOver(e, p.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, p.id)}
                      onDragEnd={handleDragEnd}
                      className={`transition-colors group ${
                        isBeingDragged
                          ? "opacity-30 bg-black/10"
                          : isDropTarget
                          ? "bg-black/10 border-y-2 border-black"
                          : "hover:bg-black/[0.02]"
                      }`}
                    >
                      {/* Drag Handle & Order Controls */}
                      <td className="py-3 px-3 text-center select-none">
                        <div className="flex items-center justify-center gap-1">
                          {canReorder ? (
                            <div
                              title="انقر واسحب لإعادة ترتيب المنتج"
                              className="cursor-grab active:cursor-grabbing p-1 text-black/40 hover:text-black hover:bg-black/10 rounded transition-colors"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                          ) : (
                            <span className="w-4" />
                          )}

                          <span className="font-mono font-bold text-xs px-1.5 py-0.5 bg-black/[0.06] border border-black/15 text-black rounded-xs">
                            #{index + 1}
                          </span>

                          {canReorder && (
                            <div className="flex flex-col ml-0.5">
                              <button
                                type="button"
                                disabled={index === 0 || isSavingOrder}
                                onClick={() => handleMoveStep(p.id, "up")}
                                title="تحريك لأعلى"
                                className="p-0.5 text-black/40 hover:text-black disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={index === filteredProducts.length - 1 || isSavingOrder}
                                onClick={() => handleMoveStep(p.id, "down")}
                                title="تحريك لأسفل"
                                className="p-0.5 text-black/40 hover:text-black disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 bg-black/5 shrink-0 border border-black/20 overflow-hidden relative">
                            <img
                              src={getCoverImage(p)}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-xs uppercase tracking-wider text-black">
                              {p.title}
                            </div>
                            <div className="text-[10px] text-black/50 font-mono mt-0.5">
                              {p.color_name || "Standard color"} • {p.images?.length || 1}{" "}
                              {p.images?.length === 1 ? "photo" : "photos"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-black">{Number(p.price).toLocaleString()} EGP</div>
                        {p.compare_at_price && p.compare_at_price > p.price && (
                          <div className="text-[10px] text-black/40 line-through">
                            {Number(p.compare_at_price).toLocaleString()} EGP
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold uppercase text-[11px] text-black">
                          {p.category || "Uncategorized"}
                        </div>
                        <div className="text-[10px] text-black/50 uppercase">{p.collection || "Drop 01"}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.sizes?.map((s) => (
                            <span
                              key={s}
                              className="text-[9px] border border-black/20 px-1.5 py-0.5 font-mono text-black font-semibold bg-black/[0.02]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 1-Click Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={async () => {
                            await toggleProductActive(p.id, isActive);
                            setSuccessToast(`"${p.title}" is now ${!isActive ? "Live in store" : "Hidden"}`);
                          }}
                          title={isActive ? "Click to hide from store" : "Click to publish live"}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                            isActive
                              ? "bg-emerald-500/15 text-emerald-950 border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-black/10 text-black/50 border-black/15 hover:bg-black/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-600" : "bg-black/40"
                            }`}
                          />
                          <span>{isActive ? "Live" : "Hidden"}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/new?duplicateFrom=${p.id}`}
                            className="p-1.5 text-black/60 hover:text-black hover:bg-black/5 border border-transparent hover:border-black/20 transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Duplicate Product (Clone as New)"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 text-black/60 hover:text-black hover:bg-black/5 border border-transparent hover:border-black/20 transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-red-600/70 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info bar */}
        <div className="p-3 bg-black/[0.02] border-t border-black/10 text-[11px] text-black/60 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Showing <strong className="font-mono text-black">{filteredProducts.length}</strong> of{" "}
            <strong className="font-mono text-black">{products.length}</strong> total products
          </span>
          <span className="text-[10px] uppercase tracking-wider text-black/50">
            {canReorder
              ? "Drag handle (⋮⋮) or arrows (▲▼) to rearrange store display order • Auto-saves"
              : "Clear search & filters to reorder pieces"}
          </span>
        </div>
      </div>

      {/* CONFIRMATION POPUP: PERMANENT PRODUCT DELETION */}
      {productToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setProductToDelete(null)}
          />
          <div className="relative bg-[#e7ecea] border-2 border-black p-6 max-w-md w-full text-black shadow-2xl z-10 space-y-4">
            <div className="flex items-center gap-2 text-black">
              <Trash2 className="w-5 h-5 text-red-700 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Delete Product Permanently?</h3>
            </div>
            <div className="text-xs text-black/70 leading-relaxed space-y-2">
              <p>
                Are you sure you want to delete <span className="font-bold text-black">&quot;{productToDelete.title}&quot;</span>?
              </p>
              <p className="text-[11px] text-red-700 font-semibold">
                This action cannot be undone. The piece and its images will be removed from your store catalog.
              </p>
            </div>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-black/10">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 border border-red-700 bg-red-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-800 cursor-pointer shadow-sm"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
