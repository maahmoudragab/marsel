"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  X,
  Tag,
  Truck,
  Copy,
  Check,
  Percent,
  Clock,
  Sparkles,
  Edit2,
  AlertCircle,
  Eye,
  EyeOff,
  ShoppingBag,
  RotateCw,
  Gift,
  DollarSign,
  Layers,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  type Coupon,
  type ParsedOffer,
  type RawOffer,
  type OfferType,
  parseOffer,
  encodeOfferPayload,
  isCouponLive,
  isOfferLive,
  toDateTimeLocalString,
} from "@/lib/offers";

const fieldClass =
  "w-full text-xs border border-black/25 bg-white p-2.5 focus:outline-none focus:border-black font-sans transition-colors";
const labelClass =
  "block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-black/80";

const GOVERNORATES = [
  { value: "all", label: "All Egypt (All Governorates)" },
  { value: "Cairo", label: "Cairo" },
  { value: "Giza", label: "Giza" },
  { value: "Alexandria", label: "Alexandria" },
];

export default function OffersAndCouponsPage() {
  const [activeTab, setActiveTab] = useState<"coupons" | "offers">("coupons");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [offers, setOffers] = useState<ParsedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Coupon Modals (Create & Edit)
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 10,
    minimum_order_amount: 0,
    max_uses: "",
    starts_at: toDateTimeLocalString(),
    expires_at: toDateTimeLocalString(new Date(Date.now() + 30 * 86400000).toISOString()),
    is_active: true,
  });

  // Offer Modals (Create & Edit)
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [savingOffer, setSavingOffer] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    offerType: "order_discount" as OfferType,
    discountValue: 100,
    discountType: "fixed" as "fixed" | "percentage",
    minimumOrderAmount: 1000,
    minimumQuantity: 2,
    freeQuantity: 1,
    governorate: "all",
    showBanner: true,
    bannerText: "⚡ SPECIAL OFFER: Spend 1,000 EGP and get 100 EGP off at checkout!",
    startsAt: toDateTimeLocalString(),
    endsAt: toDateTimeLocalString(new Date(Date.now() + 14 * 86400000).toISOString()),
    priority: 10,
    isActive: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const [{ data: couponData, error: couponErr }, { data: offerData, error: offerErr }] =
        await Promise.all([
          supabase.from("coupons").select("*").order("created_at", { ascending: false }),
          supabase.from("offers").select("*").order("priority", { ascending: false }).order("starts_at"),
        ]);

      if (couponErr) console.warn("Coupons load note:", couponErr.message);
      if (offerErr) console.warn("Offers load note:", offerErr.message);

      setCoupons((couponData ?? []) as Coupon[]);
      const parsed = (offerData ?? []).map((row) => parseOffer(row as RawOffer));
      setOffers(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error loading data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ================= COUPON HANDLERS =================
  const openNewCouponModal = () => {
    setEditingCouponId(null);
    setCouponForm({
      code: "",
      discount_type: "percentage",
      discount_value: 10,
      minimum_order_amount: 0,
      max_uses: "",
      starts_at: toDateTimeLocalString(),
      expires_at: toDateTimeLocalString(new Date(Date.now() + 30 * 86400000).toISOString()),
      is_active: true,
    });
    setIsCouponModalOpen(true);
  };

  const openEditCouponModal = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setCouponForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      minimum_order_amount: Number(coupon.minimum_order_amount) || 0,
      max_uses: coupon.max_uses ? String(coupon.max_uses) : "",
      starts_at: toDateTimeLocalString(coupon.starts_at),
      expires_at: toDateTimeLocalString(coupon.expires_at),
      is_active: coupon.is_active,
    });
    setIsCouponModalOpen(true);
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    const supabase = createClient();
    const newStatus = !coupon.is_active;
    const { error: err } = await supabase
      .from("coupons")
      .update({ is_active: newStatus })
      .eq("id", coupon.id);
    if (err) {
      alert("Could not update coupon: " + err.message);
      return;
    }
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, is_active: newStatus } : c))
    );
  };

  const deleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) return;
    const supabase = createClient();
    const { error: err } = await supabase.from("coupons").delete().eq("id", id);
    if (err) {
      alert("Could not delete coupon: " + err.message);
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      alert("Coupon code is required");
      return;
    }
    setSavingCoupon(true);
    const supabase = createClient();

    const payload: Record<string, unknown> = {
      code: couponForm.code.trim().toUpperCase(),
      discount_type: couponForm.discount_type,
      discount_value: Number(couponForm.discount_value),
      minimum_order_amount: Number(couponForm.minimum_order_amount) || 0,
      max_uses: couponForm.max_uses ? Number(couponForm.max_uses) : null,
      expires_at: couponForm.expires_at ? new Date(couponForm.expires_at).toISOString() : null,
      is_active: couponForm.is_active,
    };

    if (couponForm.starts_at) {
      payload.starts_at = new Date(couponForm.starts_at).toISOString();
    }

    let saveError = null;
    if (editingCouponId) {
      // Update
      const { error: err } = await supabase
        .from("coupons")
        .update(payload)
        .eq("id", editingCouponId);
      saveError = err;
    } else {
      // Insert
      const { error: err } = await supabase.from("coupons").insert([payload]);
      saveError = err;
    }

    setSavingCoupon(false);
    if (saveError) {
      // If starts_at column error, retry without starts_at
      if (saveError.message?.includes("starts_at")) {
        delete payload.starts_at;
        if (editingCouponId) {
          await supabase.from("coupons").update(payload).eq("id", editingCouponId);
        } else {
          await supabase.from("coupons").insert([payload]);
        }
      } else {
        alert("Could not save coupon: " + saveError.message);
        return;
      }
    }

    setIsCouponModalOpen(false);
    loadData();
  };

  // ================= OFFER HANDLERS =================
  const openNewOfferModal = (defaultType: OfferType = "free_shipping") => {
    setEditingOfferId(null);
    setOfferForm({
      title: defaultType === "free_shipping" ? "Free Delivery in Cairo" : "",
      description: "",
      offerType: defaultType,
      discountValue: defaultType === "order_discount" ? 100 : 0,
      discountType: "fixed",
      minimumOrderAmount: defaultType === "order_discount" ? 1000 : 0,
      minimumQuantity: defaultType === "free_shipping" ? 1 : 2,
      freeQuantity: 1,
      governorate: "Cairo",
      showBanner: true,
      bannerText: "⚡ Free Delivery in Cairo for all orders!",
      startsAt: toDateTimeLocalString(),
      endsAt: toDateTimeLocalString(new Date(Date.now() + 14 * 86400000).toISOString()),
      priority: 10,
      isActive: true,
    });
    setIsOfferModalOpen(true);
  };

  const openEditOfferModal = (offer: ParsedOffer) => {
    setEditingOfferId(offer.id);
    setOfferForm({
      title: offer.title,
      description: offer.description,
      offerType: offer.offerType,
      discountValue: offer.discountValue,
      discountType: offer.discountType,
      minimumOrderAmount: offer.minimumOrderAmount,
      minimumQuantity: offer.minimumQuantity,
      freeQuantity: offer.freeQuantity,
      governorate: offer.governorate,
      showBanner: offer.showBanner,
      bannerText: offer.bannerText,
      startsAt: toDateTimeLocalString(offer.startsAt),
      endsAt: toDateTimeLocalString(offer.endsAt),
      priority: offer.priority,
      isActive: offer.isActive,
    });
    setIsOfferModalOpen(true);
  };

  const toggleOfferStatus = async (offer: ParsedOffer) => {
    const supabase = createClient();
    const newStatus = !offer.isActive;

    if (newStatus) {
      // Deactivate all other offers first to enforce the single-active-offer rule
      await supabase.from("offers").update({ is_active: false }).neq("id", offer.id);
    }

    const { error: err } = await supabase
      .from("offers")
      .update({ is_active: newStatus })
      .eq("id", offer.id);

    if (err) {
      alert("Could not update offer: " + err.message);
      return;
    }

    setOffers((prev) =>
      prev.map((o) => ({
        ...o,
        isActive: o.id === offer.id ? newStatus : newStatus ? false : o.isActive,
      }))
    );
  };

  const deleteOffer = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete offer "${title}"?`)) return;
    const supabase = createClient();
    const { error: err } = await supabase.from("offers").delete().eq("id", id);
    if (err) {
      alert("Could not delete offer: " + err.message);
      return;
    }
    setOffers((prev) => prev.filter((o) => o.id !== id));
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.title.trim()) {
      alert("Offer title is required");
      return;
    }
    setSavingOffer(true);
    const supabase = createClient();

    // If this offer is active, deactivate all other offers
    if (offerForm.isActive) {
      if (editingOfferId) {
        await supabase.from("offers").update({ is_active: false }).neq("id", editingOfferId);
      } else {
        await supabase.from("offers").update({ is_active: false });
      }
    }

    const payload = encodeOfferPayload(offerForm);

    let saveError = null;
    if (editingOfferId) {
      const { error: err } = await supabase
        .from("offers")
        .update(payload)
        .eq("id", editingOfferId);
      saveError = err;
    } else {
      const { error: err } = await supabase.from("offers").insert([payload]);
      saveError = err;
    }

    setSavingOffer(false);
    if (saveError) {
      alert("Could not save offer: " + saveError.message);
      return;
    }
    setIsOfferModalOpen(false);
    loadData();
  };

  const filteredCoupons = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return coupons;
    return coupons.filter((c) => c.code.toLowerCase().includes(q));
  }, [coupons, searchQuery]);

  const filteredOffers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return offers;
    return offers.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.bannerText.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
    );
  }, [offers, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <RotateCw className="w-5 h-5 animate-spin text-black/50" />
        <p className="text-xs uppercase tracking-widest text-black/60 font-mono">
          Loading coupons and active promotions...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {error && (
        <div className="border border-red-300 bg-red-50 p-3 text-xs text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/15 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-black">
              Offers & Coupons Studio
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-black text-[#e7ecea]">
              PROMOTIONS
            </span>
          </div>
          <p className="text-xs text-black/60 uppercase tracking-widest mt-1">
            Manage checkout discount codes, auto-applied promos, and storefront announcement banners
          </p>
        </div>

        <button
          onClick={() => (activeTab === "coupons" ? openNewCouponModal() : openNewOfferModal())}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-[#e7ecea] hover:bg-black/85 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === "coupons" ? "Create Coupon" : "Create Auto Offer"}</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex border border-black/20 p-0.5 bg-black/5 self-start">
          <button
            onClick={() => setActiveTab("coupons")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === "coupons"
                ? "bg-black text-[#e7ecea] shadow-xs"
                : "text-black/60 hover:text-black"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Promo Coupons ({coupons.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === "offers"
                ? "bg-black text-[#e7ecea] shadow-xs"
                : "text-black/60 hover:text-black"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automatic Offers & Banners ({offers.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "coupons" ? "Search coupon code..." : "Search offers..."}
            className="w-full px-3 py-1.5 text-xs border border-black/25 bg-white focus:outline-none focus:border-black placeholder:text-black/40"
          />
        </div>
      </div>

      {/* ================= TAB 1: COUPONS ================= */}
      {activeTab === "coupons" && (
        <div className="border border-black/20 bg-white/70 overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-black/15 bg-black/5 text-black font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min Spend</th>
                <th className="p-4">Times Used</th>
                <th className="p-4">Schedule (Start / End)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-black/40 text-xs uppercase tracking-widest">
                    No coupons found. Click &quot;Create Coupon&quot; to launch your first code.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const live = isCouponLive(coupon);
                  const isCopied = copiedCode === coupon.code;
                  const formatDt = (dStr?: string | null) => {
                    if (!dStr) return "Open";
                    const d = new Date(dStr);
                    return d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    });
                  };

                  return (
                    <tr key={coupon.id} className="hover:bg-black/5 transition-colors">
                      {/* Code */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-sm text-black tracking-wider bg-black/5 px-2 py-1 border border-black/15">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopy(coupon.code)}
                            title="Copy Code"
                            className="text-black/40 hover:text-black p-1 transition-colors cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="p-4 font-mono font-bold text-black text-xs">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}% OFF`
                          : `${Number(coupon.discount_value).toLocaleString()} EGP OFF`}
                      </td>

                      {/* Min Spend */}
                      <td className="p-4 font-mono text-black/70">
                        {coupon.minimum_order_amount > 0
                          ? `${Number(coupon.minimum_order_amount).toLocaleString()} EGP`
                          : "No minimum"}
                      </td>

                      {/* Usage */}
                      <td className="p-4">
                        <div className="font-mono font-semibold text-black">
                          {coupon.used_count}{" "}
                          <span className="text-[10px] text-black/50 font-normal">
                            {coupon.max_uses ? `/ ${coupon.max_uses} limit` : "uses"}
                          </span>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="p-4 text-black/70 font-mono text-[11px]">
                        <div>Start: {formatDt(coupon.starts_at)}</div>
                        <div className="text-black/50 mt-0.5">End: {formatDt(coupon.expires_at)}</div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${live.color}`}
                        >
                          {live.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Active */}
                          <button
                            onClick={() => toggleCouponStatus(coupon)}
                            title={coupon.is_active ? "Disable coupon" : "Enable coupon"}
                            className={`p-1.5 border transition-colors cursor-pointer ${
                              coupon.is_active
                                ? "border-emerald-600/40 text-emerald-800 hover:bg-emerald-50"
                                : "border-black/20 text-black/40 hover:text-black"
                            }`}
                          >
                            {coupon.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditCouponModal(coupon)}
                            title="Edit coupon details and schedule"
                            className="p-1.5 border border-black/20 text-black hover:bg-black/5 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteCoupon(coupon.id, coupon.code)}
                            title="Delete coupon"
                            className="p-1.5 border border-red-200 text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= TAB 2: AUTOMATIC OFFERS ================= */}
      {activeTab === "offers" && (
        <div className="space-y-4">
          {/* Single Offer Policy Banner */}
          <div className="p-3 border border-black/20 bg-black/[0.03] flex items-center justify-between text-xs text-black/75">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              <span>
                <strong>Single Active Offer Policy:</strong> Only 1 automatic promotion runs at a time to prevent overlapping discounts. Activating an offer automatically pauses any other promo.
              </span>
            </div>
            <span className="text-[10px] uppercase font-mono font-bold text-black/50 hidden sm:inline-block">Exclusive Mode</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOffers.length === 0 ? (
              <div className="col-span-full border border-black/20 p-16 text-center text-black/40 text-xs uppercase tracking-widest bg-white/70">
                No automatic offers created yet. Click &quot;Create Auto Offer&quot; to configure your first campaign.
              </div>
            ) : (
              filteredOffers.map((offer) => {
                const live = isOfferLive(offer);
                const formatDt = (dStr: string) => {
                  const d = new Date(dStr);
                  return d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });
                };

                return (
                  <div
                    key={offer.id}
                    className="border border-black/20 bg-white p-5 space-y-4 flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      {/* Header with Type & Status */}
                      <div className="flex items-start justify-between gap-2 border-b border-black/10 pb-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-black/50 block font-mono">
                            {offer.offerType === "order_discount"
                              ? "Order Spend Threshold"
                              : offer.offerType === "free_shipping"
                              ? "Free Shipping"
                              : offer.offerType === "buy_x_get_y"
                              ? "Buy X Get Y Free"
                              : "Bundle Quantity Discount"}
                          </span>
                          <h3 className="font-bold text-base text-black mt-0.5">{offer.title}</h3>
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${live.color}`}
                        >
                          {live.label}
                        </span>
                      </div>

                      {/* Rule Description */}
                      <div className="py-3 space-y-2 text-xs">
                        <div className="p-2.5 bg-black/[0.03] border border-black/10 font-medium text-black">
                          {offer.offerType === "order_discount" && (
                            <span>
                              Spend <strong>{offer.minimumOrderAmount.toLocaleString()} EGP</strong> or more → Get{" "}
                              <strong className="text-emerald-950">
                                {offer.discountType === "percentage"
                                  ? `${offer.discountValue}% OFF`
                                  : `${offer.discountValue} EGP OFF`}
                              </strong>
                            </span>
                          )}
                          {offer.offerType === "free_shipping" && (
                            <span>
                              Free Delivery for{" "}
                              <strong>
                                {offer.governorate === "all" ? "All Governorates" : offer.governorate}
                              </strong>
                              {offer.minimumQuantity > 1 && ` (Min ${offer.minimumQuantity} pieces)`}
                              {offer.minimumOrderAmount > 0 &&
                                ` (Min ${offer.minimumOrderAmount.toLocaleString()} EGP)`}
                            </span>
                          )}
                          {offer.offerType === "buy_x_get_y" && (
                            <span>
                              Buy <strong>{offer.minimumQuantity} pieces</strong> → Get{" "}
                              <strong>{offer.freeQuantity} piece FREE</strong>
                            </span>
                          )}
                          {offer.offerType === "bundle_discount" && (
                            <span>
                              Buy <strong>{offer.minimumQuantity}+ pieces</strong> → Get{" "}
                              <strong className="text-emerald-950">
                                {offer.discountType === "percentage"
                                  ? `${offer.discountValue}% OFF`
                                  : `${offer.discountValue} EGP OFF`}
                              </strong>
                            </span>
                          )}
                        </div>

                        {/* Banner Broadcast Preview */}
                        <div className="border border-black/10 p-2.5 text-[11px] bg-black/[0.01]">
                          <span className="text-[10px] uppercase font-bold text-black/50 block">
                            Website Top Banner:
                          </span>
                          {offer.showBanner && offer.bannerText ? (
                            <p className="font-mono text-black mt-0.5 line-clamp-2 text-xs">
                              &ldquo;{offer.bannerText}&rdquo;
                            </p>
                          ) : (
                            <span className="text-black/40 italic">Disabled on website header</span>
                          )}
                        </div>

                        {/* Timing */}
                        <div className="text-[11px] font-mono text-black/60 pt-1">
                          <div>Starts: {formatDt(offer.startsAt)}</div>
                          <div>Ends: {formatDt(offer.endsAt)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="border-t border-black/10 pt-3 flex items-center justify-between">
                      <button
                        onClick={() => toggleOfferStatus(offer)}
                        className={`text-xs font-bold uppercase tracking-wider cursor-pointer ${
                          offer.isActive ? "text-emerald-900 hover:underline" : "text-black/40 hover:text-black"
                        }`}
                      >
                        {offer.isActive ? "● Active" : "○ Disabled"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditOfferModal(offer)}
                          className="px-2.5 py-1 border border-black/25 hover:border-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteOffer(offer.id, offer.title)}
                          className="px-2 py-1 text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 1: CREATE / EDIT COUPON ================= */}
      {isCouponModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setIsCouponModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#e7ecea] border border-black p-6 sm:p-8 shadow-2xl text-black flex flex-col max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-black/20 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/60">
                  {editingCouponId ? "EDIT COUPON" : "NEW COUPON"}
                </span>
                <h3 className="text-lg font-bold uppercase tracking-tight">
                  {editingCouponId ? `Edit ${couponForm.code}` : "Create Promo Code"}
                </h3>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="text-2xl leading-none font-light text-black/60 hover:text-black cursor-pointer p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              {/* Code */}
              <div>
                <label className={labelClass}>Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MARSEL20, BLACKFRIDAY"
                  className={fieldClass + " font-mono font-bold text-sm tracking-wider uppercase"}
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Discount Type</label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discount_type: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className={fieldClass}
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="fixed">Fixed Cash (EGP OFF)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    {couponForm.discount_type === "percentage" ? "Value (%)" : "Value (EGP)"} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={couponForm.discount_type === "percentage" ? 100 : 10000}
                    value={couponForm.discount_value}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })
                    }
                    className={fieldClass + " font-mono"}
                  />
                </div>
              </div>

              {/* Minimum Order Spend & Max Uses Limit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Min Spend (EGP)</label>
                  <input
                    type="number"
                    min={0}
                    value={couponForm.minimum_order_amount}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, minimum_order_amount: Number(e.target.value) })
                    }
                    placeholder="0 = No minimum"
                    className={fieldClass + " font-mono"}
                  />
                </div>
                <div>
                  <label className={labelClass}>Usage Limit (Max Uses)</label>
                  <input
                    type="number"
                    min={1}
                    value={couponForm.max_uses}
                    onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    className={fieldClass + " font-mono"}
                  />
                </div>
              </div>

              {/* Start Date & End Date Down to the Minute */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className={labelClass}>Start Date & Time (Minute)</label>
                  <input
                    type="datetime-local"
                    value={couponForm.starts_at}
                    onChange={(e) => setCouponForm({ ...couponForm, starts_at: e.target.value })}
                    className={fieldClass + " font-mono text-xs"}
                  />
                </div>
                <div>
                  <label className={labelClass}>End Date & Time (Minute)</label>
                  <input
                    type="datetime-local"
                    value={couponForm.expires_at}
                    onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                    className={fieldClass + " font-mono text-xs"}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="coupon_active"
                  checked={couponForm.is_active}
                  onChange={(e) => setCouponForm({ ...couponForm, is_active: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="coupon_active" className="text-xs font-semibold cursor-pointer select-none">
                  Active (Ready to be redeemed at checkout)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-black/15 pt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 border border-black/25 text-xs font-semibold uppercase tracking-wider hover:border-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCoupon}
                  className="px-6 py-2 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingCoupon ? "Saving..." : editingCouponId ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CREATE / EDIT AUTOMATIC OFFER ================= */}
      {isOfferModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setIsOfferModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-[#e7ecea] border border-black p-6 sm:p-8 shadow-2xl text-black flex flex-col max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-black/20 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/60">
                  {editingOfferId ? "EDIT AUTOMATIC PROMOTION" : "NEW PROMOTION CAMPAIGN"}
                </span>
                <h3 className="text-lg font-bold uppercase tracking-tight">
                  {editingOfferId ? `Edit ${offerForm.title}` : "Configure Auto Offer & Banner"}
                </h3>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="text-2xl leading-none font-light text-black/60 hover:text-black cursor-pointer p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              {/* Campaign Title */}
              <div>
                <label className={labelClass}>Offer Title *</label>
                <input
                  type="text"
                  required
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  placeholder="e.g. Flash Drop Discount, Cairo Free Shipping"
                  className={fieldClass + " font-bold"}
                />
              </div>

              {/* Offer Type Selection (4 Core Options) */}
              <div>
                <label className={labelClass}>Promotion Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "order_discount", label: "Spend Threshold Discount", icon: DollarSign },
                    { id: "free_shipping", label: "Free Delivery / Shipping", icon: Truck },
                    { id: "buy_x_get_y", label: "Buy X Get Y Free", icon: Gift },
                    { id: "bundle_discount", label: "Quantity / Bundle Discount", icon: Layers },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setOfferForm((prev) => ({
                          ...prev,
                          offerType: t.id as OfferType,
                          minimumOrderAmount:
                            t.id === "order_discount"
                              ? prev.minimumOrderAmount || 1000
                              : t.id === "free_shipping"
                              ? (prev.offerType === "free_shipping" ? prev.minimumOrderAmount : 0)
                              : 0,
                          minimumQuantity:
                            t.id === "free_shipping" ? Math.max(1, prev.minimumQuantity || 1) : prev.minimumQuantity,
                        }))
                      }
                      className={`p-2.5 border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                        offerForm.offerType === t.id
                          ? "bg-black text-[#e7ecea] border-black font-bold"
                          : "bg-white text-black/80 border-black/20 hover:border-black"
                      }`}
                    >
                      <t.icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Settings based on Type */}
              <div className="p-4 bg-white border border-black/20 space-y-3">
                <span className="text-[10px] uppercase font-bold text-black/50 tracking-wider block">
                  Rule Parameters:
                </span>

                {/* 1. Order Spend Threshold */}
                {offerForm.offerType === "order_discount" && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Spend Over (EGP)</label>
                      <input
                        type="number"
                        min={100}
                        value={offerForm.minimumOrderAmount}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, minimumOrderAmount: Number(e.target.value) })
                        }
                        className={fieldClass + " font-mono"}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Discount Type</label>
                      <select
                        value={offerForm.discountType}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            discountType: e.target.value as "fixed" | "percentage",
                          })
                        }
                        className={fieldClass}
                      >
                        <option value="fixed">Fixed EGP OFF</option>
                        <option value="percentage">% Percentage OFF</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Discount Amount</label>
                      <input
                        type="number"
                        min={1}
                        value={offerForm.discountValue}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, discountValue: Number(e.target.value) })
                        }
                        className={fieldClass + " font-mono"}
                      />
                    </div>
                  </div>
                )}

                {/* 2. Free Shipping */}
                {offerForm.offerType === "free_shipping" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>Eligible Region *</label>
                        <select
                          value={offerForm.governorate}
                          onChange={(e) => setOfferForm({ ...offerForm, governorate: e.target.value })}
                          className={fieldClass}
                        >
                          {GOVERNORATES.map((g) => (
                            <option key={g.value} value={g.value}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Min Pieces (Optional)</label>
                        <input
                          type="number"
                          min={1}
                          value={offerForm.minimumQuantity}
                          onChange={(e) =>
                            setOfferForm({ ...offerForm, minimumQuantity: Number(e.target.value) })
                          }
                          placeholder="1 = Any order"
                          className={fieldClass + " font-mono"}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Min Spend (Optional)</label>
                        <input
                          type="number"
                          min={0}
                          value={offerForm.minimumOrderAmount}
                          onChange={(e) =>
                            setOfferForm({ ...offerForm, minimumOrderAmount: Number(e.target.value) })
                          }
                          placeholder="0 = No minimum"
                          className={fieldClass + " font-mono"}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-black/50">
                      💡 Leave Min Spend at 0 and Min Pieces at 1 for unconditional free delivery on all orders in the selected region.
                    </p>
                  </div>
                )}

                {/* 3. Buy X Get Y Free */}
                {offerForm.offerType === "buy_x_get_y" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Customer Buys (Quantity)</label>
                      <input
                        type="number"
                        min={1}
                        value={offerForm.minimumQuantity}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, minimumQuantity: Number(e.target.value) })
                        }
                        placeholder="e.g. 2"
                        className={fieldClass + " font-mono"}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Customer Gets Free (Qty)</label>
                      <input
                        type="number"
                        min={1}
                        value={offerForm.freeQuantity}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, freeQuantity: Number(e.target.value) })
                        }
                        placeholder="e.g. 1"
                        className={fieldClass + " font-mono"}
                      />
                    </div>
                  </div>
                )}

                {/* 4. Bundle / Quantity Discount */}
                {offerForm.offerType === "bundle_discount" && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Min Pieces Count</label>
                      <input
                        type="number"
                        min={2}
                        value={offerForm.minimumQuantity}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, minimumQuantity: Number(e.target.value) })
                        }
                        className={fieldClass + " font-mono"}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Discount Type</label>
                      <select
                        value={offerForm.discountType}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            discountType: e.target.value as "fixed" | "percentage",
                          })
                        }
                        className={fieldClass}
                      >
                        <option value="fixed">Fixed EGP OFF</option>
                        <option value="percentage">% Percentage OFF</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Discount Amount</label>
                      <input
                        type="number"
                        min={1}
                        value={offerForm.discountValue}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, discountValue: Number(e.target.value) })
                        }
                        className={fieldClass + " font-mono"}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Storefront Announcement Banner Settings */}
              <div className="p-4 bg-white border border-black/20 space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show_banner_check"
                    checked={offerForm.showBanner}
                    onChange={(e) => setOfferForm({ ...offerForm, showBanner: e.target.checked })}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="show_banner_check" className="text-xs font-bold uppercase tracking-wider cursor-pointer select-none">
                    Display Announcement Banner on Website Header
                  </label>
                </div>

                {offerForm.showBanner && (
                  <div>
                    <label className={labelClass}>Banner Text to Display to Shoppers</label>
                    <input
                      type="text"
                      value={offerForm.bannerText}
                      onChange={(e) => setOfferForm({ ...offerForm, bannerText: e.target.value })}
                      placeholder="e.g. ⚡ SPECIAL PROMO: Buy 2 pieces & get 100 EGP off!"
                      className={fieldClass}
                    />
                    <span className="text-[10px] text-black/50 mt-1 block">
                      Visitors will see this bar at the very top of all store pages with an &apos;×&apos; dismiss button.
                    </span>
                  </div>
                )}
              </div>

              {/* Start Date & End Date Down to the Minute */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className={labelClass}>Start Date & Time (Minute)</label>
                  <input
                    type="datetime-local"
                    required
                    value={offerForm.startsAt}
                    onChange={(e) => setOfferForm({ ...offerForm, startsAt: e.target.value })}
                    className={fieldClass + " font-mono text-xs"}
                  />
                </div>
                <div>
                  <label className={labelClass}>End Date & Time (Minute)</label>
                  <input
                    type="datetime-local"
                    required
                    value={offerForm.endsAt}
                    onChange={(e) => setOfferForm({ ...offerForm, endsAt: e.target.value })}
                    className={fieldClass + " font-mono text-xs"}
                  />
                </div>
              </div>

              {/* Priority & Active */}
              <div className="grid grid-cols-2 gap-3 pt-1 items-center">
                <div>
                  <label className={labelClass}>Priority (Higher wins)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={offerForm.priority}
                    onChange={(e) => setOfferForm({ ...offerForm, priority: Number(e.target.value) })}
                    className={fieldClass + " font-mono"}
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="offer_active_check"
                    checked={offerForm.isActive}
                    onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.checked })}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="offer_active_check" className="text-xs font-semibold cursor-pointer select-none">
                    Active Immediately
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-black/15 pt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 border border-black/25 text-xs font-semibold uppercase tracking-wider hover:border-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingOffer}
                  className="px-6 py-2 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingOffer ? "Saving..." : editingOfferId ? "Update Offer" : "Save & Launch Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
