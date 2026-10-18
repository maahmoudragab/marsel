"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Truck,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  RotateCw,
  MapPin,
  ChevronsUpDown,
  Sparkles,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import AutocompleteCombobox from "@/components/admin/AutocompleteCombobox";
import {
  EGYPTIAN_GOVERNORATES,
  getStandardGovernorateName,
  searchDistricts,
} from "@/lib/egyptianLocations";

export interface ShippingZoneRecord {
  id: string;
  governorate: string;
  area: string;
  shipping_fee: number;
  is_active: boolean;
}

export default function DeliveriesPage() {
  const [zones, setZones] = useState<ShippingZoneRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Search & Collapsible states
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());
  const hasInitializedExpand = useRef(false);

  // Inline Quick Add state per city (cityKey -> { area: string, fee: number | "" })
  const [quickAddInputs, setQuickAddInputs] = useState<
    Record<string, { area: string; fee: number | "" }>
  >({});
  const [addingAreaForCity, setAddingAreaForCity] = useState<string | null>(null);

  // Modal: Add New City
  const [isAddCityModalOpen, setIsAddCityModalOpen] = useState(false);
  const [newCityName, setNewCityName] = useState("");
  const [initialAreaName, setInitialAreaName] = useState("");
  const [initialFee, setInitialFee] = useState<number | "">(60);
  const [isCreatingCity, setIsCreatingCity] = useState(false);
  const [addCityError, setAddCityError] = useState("");

  // Modal: Edit District
  const [editingZone, setEditingZone] = useState<ShippingZoneRecord | null>(null);
  const [editAreaName, setEditAreaName] = useState("");
  const [editFee, setEditFee] = useState<number | "">("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [isUpdatingZone, setIsUpdatingZone] = useState(false);
  const [editError, setEditError] = useState("");

  // Modal: Set All Rates for City
  const [bulkCity, setBulkCity] = useState<string | null>(null);
  const [bulkFeeValue, setBulkFeeValue] = useState<number | "">(60);
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  // Modal: Delete District confirmation
  const [deletingZone, setDeletingZone] = useState<ShippingZoneRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Inline Fee Quick Edit (click fee pill -> edit directly)
  const [inlineFeeId, setInlineFeeId] = useState<string | null>(null);
  const [inlineFeeVal, setInlineFeeVal] = useState<number | "">("");
  const [savingInlineFee, setSavingInlineFee] = useState(false);

  // Auto dismiss toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3200);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Fetch zones from Supabase
  const fetchZones = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("shipping_zones")
        .select("id, governorate, area, shipping_fee, is_active")
        .order("governorate", { ascending: true })
        .order("area", { ascending: true });

      if (error) throw error;
      const rows = data || [];
      setZones(rows);

      // Expand all cities ONLY on first initial load
      if (rows.length > 0 && !hasInitializedExpand.current) {
        hasInitializedExpand.current = true;
        const initialSet = new Set<string>();
        rows.forEach((r) => initialSet.add(getStandardGovernorateName(r.governorate)));
        setExpandedCities(initialSet);
      }

      if (isManualRefresh) setSuccessToast("Delivery zones refreshed successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load zones";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // Group zones by Governorate (City)
  const groupedCities = useMemo(() => {
    const map = new Map<string, ShippingZoneRecord[]>();

    zones.forEach((zone) => {
      const stdGov = getStandardGovernorateName(zone.governorate);
      if (!map.has(stdGov)) {
        map.set(stdGov, []);
      }
      map.get(stdGov)!.push(zone);
    });

    const list: {
      governorate: string;
      displayName: string;
      zones: ShippingZoneRecord[];
      activeCount: number;
      minFee: number;
      maxFee: number;
      avgFee: number;
    }[] = [];

    map.forEach((cityZones, govKey) => {
      const activeCount = cityZones.filter((z) => z.is_active).length;
      const fees = cityZones.map((z) => z.shipping_fee || 0);
      const minFee = fees.length ? Math.min(...fees) : 0;
      const maxFee = fees.length ? Math.max(...fees) : 0;
      const avgFee = fees.length ? Math.round(fees.reduce((a, b) => a + b, 0) / fees.length) : 0;

      list.push({
        governorate: govKey,
        displayName: govKey,
        zones: cityZones,
        activeCount,
        minFee,
        maxFee,
        avgFee,
      });
    });

    return list.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [zones]);

  // Search filtering
  const filteredCities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groupedCities;

    return groupedCities
      .map((city) => {
        const cityMatch = city.displayName.toLowerCase().includes(q);
        const matchingZones = city.zones.filter(
          (z) =>
            z.area.toLowerCase().includes(q) ||
            z.shipping_fee.toString().includes(q)
        );

        if (cityMatch) return city;
        if (matchingZones.length > 0) {
          return {
            ...city,
            zones: matchingZones,
          };
        }
        return null;
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [groupedCities, searchQuery]);

  // Auto-expand on search
  useEffect(() => {
    if (searchQuery.trim()) {
      setExpandedCities(new Set(groupedCities.map((c) => c.governorate)));
    }
  }, [searchQuery, groupedCities]);

  // Toggle Collapse
  const toggleCityExpand = (cityKey: string) => {
    setExpandedCities((prev) => {
      const next = new Set(prev);
      if (next.has(cityKey)) {
        next.delete(cityKey);
      } else {
        next.add(cityKey);
      }
      return next;
    });
  };

  // Expand / Collapse All
  const isAnyExpanded = expandedCities.size > 0;
  const handleToggleExpandAll = () => {
    if (isAnyExpanded) {
      setExpandedCities(new Set());
    } else {
      setExpandedCities(new Set(groupedCities.map((c) => c.governorate)));
    }
  };

  // Quick Add Area for a City
  const handleQuickAddArea = async (cityGov: string) => {
    const input = quickAddInputs[cityGov] || { area: "", fee: 60 };
    const cleanArea = input.area.trim();
    const feeNum = typeof input.fee === "number" ? input.fee : parseFloat(input.fee as string);

    if (!cleanArea) return;
    if (isNaN(feeNum) || feeNum < 0) {
      setErrorMessage("Please enter a valid shipping fee.");
      return;
    }

    const exists = zones.some(
      (z) =>
        z.governorate.toLowerCase() === cityGov.toLowerCase() &&
        z.area.toLowerCase() === cleanArea.toLowerCase()
    );
    if (exists) {
      setErrorMessage(`"${cleanArea}" already exists in ${cityGov}.`);
      return;
    }

    setAddingAreaForCity(cityGov);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("shipping_zones")
        .insert([
          {
            governorate: cityGov,
            area: cleanArea,
            shipping_fee: feeNum,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setZones((prev) => [...prev, data as ShippingZoneRecord]);
      }

      setSuccessToast(`Added "${cleanArea}" (${feeNum} EGP)`);
      setQuickAddInputs((prev) => ({
        ...prev,
        [cityGov]: { area: "", fee: feeNum },
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add district";
      setErrorMessage(msg);
    } finally {
      setAddingAreaForCity(null);
    }
  };

  // Toggle Zone Active
  const handleToggleActive = async (zone: ShippingZoneRecord) => {
    const nextVal = !zone.is_active;

    setZones((prev) =>
      prev.map((z) => (z.id === zone.id ? { ...z, is_active: nextVal } : z))
    );

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("shipping_zones")
        .update({ is_active: nextVal })
        .eq("id", zone.id);

      if (error) throw error;
      setSuccessToast(`${zone.area} is now ${nextVal ? "Active" : "Hidden"}`);
    } catch (err: unknown) {
      setZones((prev) =>
        prev.map((z) => (z.id === zone.id ? { ...z, is_active: zone.is_active } : z))
      );
      const msg = err instanceof Error ? err.message : "Failed to update status";
      setErrorMessage(msg);
    }
  };

  // Inline Quick Fee Save
  const handleSaveInlineFee = async (zone: ShippingZoneRecord) => {
    if (inlineFeeVal === "" || isNaN(Number(inlineFeeVal)) || Number(inlineFeeVal) < 0) {
      setInlineFeeId(null);
      return;
    }

    const feeNum = Number(inlineFeeVal);
    if (feeNum === zone.shipping_fee) {
      setInlineFeeId(null);
      return;
    }

    setSavingInlineFee(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("shipping_zones")
        .update({ shipping_fee: feeNum })
        .eq("id", zone.id);

      if (error) throw error;

      setZones((prev) =>
        prev.map((z) => (z.id === zone.id ? { ...z, shipping_fee: feeNum } : z))
      );
      setSuccessToast(`Updated fee for ${zone.area} to ${feeNum} EGP`);
      setInlineFeeId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update fee";
      setErrorMessage(msg);
    } finally {
      setSavingInlineFee(false);
    }
  };

  // Bulk set fee for all districts in a city
  const handleSaveBulkCityFee = async () => {
    if (!bulkCity) return;
    const feeNum = typeof bulkFeeValue === "number" ? bulkFeeValue : parseFloat(bulkFeeValue as string);
    if (isNaN(feeNum) || feeNum < 0) return;

    setIsSavingBulk(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("shipping_zones")
        .update({ shipping_fee: feeNum })
        .eq("governorate", bulkCity);

      if (error) throw error;

      setZones((prev) =>
        prev.map((z) => (z.governorate === bulkCity ? { ...z, shipping_fee: feeNum } : z))
      );
      setSuccessToast(`All districts in ${bulkCity} updated to ${feeNum} EGP`);
      setBulkCity(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update rates";
      setErrorMessage(msg);
    } finally {
      setIsSavingBulk(false);
    }
  };

  // Edit district
  const handleSaveEditZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;

    const cleanArea = editAreaName.trim();
    const feeNum = typeof editFee === "number" ? editFee : parseFloat(editFee as string);

    if (!cleanArea) {
      setEditError("District name is required");
      return;
    }
    if (isNaN(feeNum) || feeNum < 0) {
      setEditError("Fee must be a valid number");
      return;
    }

    setIsUpdatingZone(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("shipping_zones")
        .update({
          area: cleanArea,
          shipping_fee: feeNum,
          is_active: editIsActive,
        })
        .eq("id", editingZone.id);

      if (error) throw error;

      setZones((prev) =>
        prev.map((z) =>
          z.id === editingZone.id
            ? { ...z, area: cleanArea, shipping_fee: feeNum, is_active: editIsActive }
            : z
        )
      );

      setSuccessToast(`Updated ${cleanArea}`);
      setEditingZone(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update";
      setEditError(msg);
    } finally {
      setIsUpdatingZone(false);
    }
  };

  // Delete district
  const handleConfirmDelete = async () => {
    if (!deletingZone) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("shipping_zones")
        .delete()
        .eq("id", deletingZone.id);

      if (error) throw error;

      setZones((prev) => prev.filter((z) => z.id !== deletingZone.id));
      setSuccessToast(`Deleted "${deletingZone.area}"`);
      setDeletingZone(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Create new city
  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddCityError("");

    const cleanCity = newCityName.trim();
    const cleanArea = initialAreaName.trim() || "Central";
    const feeNum = typeof initialFee === "number" ? initialFee : parseFloat(initialFee as string);

    if (!cleanCity) {
      setAddCityError("City name is required");
      return;
    }
    if (isNaN(feeNum) || feeNum < 0) {
      setAddCityError("Fee must be a valid positive number");
      return;
    }

    const cityExists = groupedCities.some(
      (c) => c.displayName.toLowerCase() === cleanCity.toLowerCase()
    );
    if (cityExists) {
      setAddCityError(`"${cleanCity}" is already in your city list.`);
      return;
    }

    setIsCreatingCity(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("shipping_zones")
        .insert([
          {
            governorate: cleanCity,
            area: cleanArea,
            shipping_fee: feeNum,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setZones((prev) => [...prev, data as ShippingZoneRecord]);
        setExpandedCities((prev) => new Set([...prev, cleanCity]));
      }

      setSuccessToast(`Added ${cleanCity} with district "${cleanArea}"`);
      setIsAddCityModalOpen(false);
      setNewCityName("");
      setInitialAreaName("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create city";
      setAddCityError(msg);
    } finally {
      setIsCreatingCity(false);
    }
  };

  // Summary counts
  const totalStats = useMemo(() => {
    const totalAreas = zones.length;
    const activeAreas = zones.filter((z) => z.is_active).length;
    const citiesCount = groupedCities.length;
    return { totalAreas, activeAreas, citiesCount };
  }, [zones, groupedCities]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
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

      {/* MARSEL Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Delivery Zones
            </h1>
            <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 bg-black text-[#e7ecea]">
              Logistics
            </span>
          </div>
          <p className="text-xs text-black/60 uppercase tracking-widest mt-1">
            Grouped by city • Expand any city to view & manage its districts and delivery rates
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => fetchZones(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-black/25 bg-white hover:bg-black/5 text-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleToggleExpandAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-black/25 bg-white hover:bg-black/5 text-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
            <span>
              {isAnyExpanded ? "Collapse All" : "Expand All"}
            </span>
          </button>

          <button
            onClick={() => {
              setNewCityName("");
              setInitialAreaName("");
              setInitialFee(60);
              setAddCityError("");
              setIsAddCityModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-[#e7ecea] text-xs font-semibold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New City</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center justify-between p-3.5 bg-red-500/10 border border-red-500/30 text-red-950 text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage("")}
            className="text-red-700 hover:text-red-950 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="border border-black/20 bg-white p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city or district name..."
            className="w-full text-xs pl-9 pr-8 py-2 border border-black/20 bg-black/[0.01] focus:outline-none focus:border-black font-sans transition-colors placeholder:text-black/35"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black p-0.5 cursor-pointer text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono shrink-0 px-2">
          <div className="flex items-center gap-1.5 text-black font-bold">
            <MapPin className="w-3.5 h-3.5 text-black/50" />
            <span>{totalStats.citiesCount} CITIES</span>
          </div>
          <span className="text-black/30">•</span>
          <div className="flex items-center gap-1.5 text-black font-bold">
            <Truck className="w-3.5 h-3.5 text-black/50" />
            <span>{totalStats.totalAreas} DISTRICTS</span>
          </div>
          <span className="text-black/30">•</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-950 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5">
            {totalStats.activeAreas} ACTIVE
          </span>
        </div>
      </div>

      {/* Cities Collapsible Accordions */}
      {loading ? (
        <div className="p-16 text-center text-black/50 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2">
          <RotateCw className="w-4 h-4 animate-spin" />
          <span>Loading delivery zones...</span>
        </div>
      ) : filteredCities.length === 0 ? (
        <div className="p-12 text-center bg-white border border-black/20 space-y-3">
          <MapPin className="w-8 h-8 text-black/30 mx-auto" />
          <p className="text-sm font-bold uppercase tracking-wider">No matching locations found</p>
          <p className="text-xs text-black/50 max-w-sm mx-auto">
            {searchQuery
              ? `No cities or districts matched "${searchQuery}".`
              : "No delivery zones configured yet."}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold uppercase tracking-wider underline cursor-pointer"
            >
              Clear search filter
            </button>
          ) : (
            <button
              onClick={() => setIsAddCityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First City</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCities.map((city) => {
            const isExpanded = expandedCities.has(city.governorate);
            const quickInput = quickAddInputs[city.governorate] || {
              area: "",
              fee: city.avgFee || 60,
            };

            const suggestions = searchDistricts(city.displayName, "")
              .filter(
                (suggested) =>
                  !city.zones.some(
                    (z) => z.area.toLowerCase() === suggested.toLowerCase()
                  )
              )
              .slice(0, 8);

            return (
              <div
                key={city.governorate}
                className="bg-white border border-black/25 shadow-xs overflow-hidden transition-all"
              >
                {/* Accordion Bar Header */}
                <div
                  onClick={() => toggleCityExpand(city.governorate)}
                  className={`p-4 flex items-center justify-between cursor-pointer select-none transition-colors ${
                    isExpanded ? "bg-black/[0.04]" : "hover:bg-black/[0.02]"
                  }`}
                >
                  {/* Left: City Title & Count */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 flex items-center justify-center border border-black transition-transform duration-150 ${
                        isExpanded ? "bg-black text-white" : "bg-white text-black"
                      }`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-black uppercase tracking-tight">
                          {city.displayName}
                        </span>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-black/10 text-black">
                          {city.zones.length} {city.zones.length === 1 ? "district" : "districts"}
                        </span>
                      </div>
                      <span className="text-[10px] text-black/50 uppercase tracking-wider">
                        {city.activeCount} active at checkout
                      </span>
                    </div>
                  </div>

                  {/* Right: Rates & Action Buttons */}
                  <div
                    className="flex items-center gap-2 sm:gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Rate pill */}
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-mono font-bold text-black block">
                        {city.minFee === city.maxFee
                          ? `${city.minFee} EGP`
                          : `${city.minFee} - ${city.maxFee} EGP`}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-black/40">
                        Delivery Rate
                      </span>
                    </div>

                    {/* Set All Rates Button */}
                    <button
                      onClick={() => {
                        setBulkCity(city.governorate);
                        setBulkFeeValue(city.avgFee || 60);
                      }}
                      title="Set unified fee for all districts in this city"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-black/25 text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors cursor-pointer bg-white"
                    >
                      <Sliders className="w-3 h-3" />
                      <span className="hidden md:inline">Set All</span>
                    </button>

                    {/* Manage Toggle */}
                    {!isExpanded && (
                      <button
                        onClick={() => toggleCityExpand(city.governorate)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-black text-[#e7ecea] text-[10px] font-bold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Manage</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Body */}
                {isExpanded && (
                  <div className="border-t border-black/20 bg-black/[0.01] p-4 sm:p-5 space-y-4">
                    {/* Inline Quick Add Row */}
                    <div className="bg-white border border-black/25 p-3 sm:p-4 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Quick Add District to {city.displayName}</span>
                        </span>
                        <span className="text-[10px] text-black/40 uppercase font-mono">
                          Press Enter to Save
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {/* District Name Input */}
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={quickInput.area}
                            onChange={(e) =>
                              setQuickAddInputs((prev) => ({
                                ...prev,
                                [city.governorate]: {
                                  area: e.target.value,
                                  fee: quickInput.fee,
                                },
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleQuickAddArea(city.governorate);
                            }}
                            placeholder={`Type district name (e.g. ${
                              suggestions[0] || "Downtown, Maadi, etc."
                            })`}
                            className="w-full text-xs px-3 py-2 border border-black/25 bg-white focus:outline-none focus:border-black font-sans transition-colors placeholder:text-black/35"
                          />
                        </div>

                        {/* Fee Input */}
                        <div className="relative w-full sm:w-28">
                          <input
                            type="number"
                            min="0"
                            step="5"
                            value={quickInput.fee}
                            onChange={(e) =>
                              setQuickAddInputs((prev) => ({
                                ...prev,
                                [city.governorate]: {
                                  area: quickInput.area,
                                  fee: e.target.value === "" ? "" : Number(e.target.value),
                                },
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleQuickAddArea(city.governorate);
                            }}
                            placeholder="Fee"
                            className="w-full text-xs pl-3 pr-8 py-2 border border-black/25 bg-white focus:outline-none focus:border-black font-mono font-bold transition-colors"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-black/50">
                            EGP
                          </span>
                        </div>

                        {/* Add Button */}
                        <button
                          type="button"
                          onClick={() => handleQuickAddArea(city.governorate)}
                          disabled={!quickInput.area.trim() || addingAreaForCity === city.governorate}
                          className="px-4 py-2 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                        >
                          {addingAreaForCity === city.governorate ? (
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          <span>Add District</span>
                        </button>
                      </div>

                      {/* Clickable Quick Suggestions */}
                      {suggestions.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pt-2 border-t border-black/10">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-black/40 mr-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-black/50" />
                            <span>Quick Suggestions:</span>
                          </span>
                          {suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                setQuickAddInputs((prev) => ({
                                  ...prev,
                                  [city.governorate]: {
                                    area: suggestion,
                                    fee: quickInput.fee || 60,
                                  },
                                }));
                              }}
                              className="px-2 py-0.5 bg-black/[0.04] hover:bg-black hover:text-white border border-black/15 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              + {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Districts List / Table */}
                    <div className="border border-black/20 bg-white overflow-hidden shadow-xs">
                      <div className="p-2.5 bg-black/[0.03] border-b border-black/15 text-[10px] font-bold uppercase tracking-wider text-black/70 flex items-center justify-between">
                        <span>Districts in {city.displayName} ({city.zones.length})</span>
                        <span className="text-black/40">Click fee to quick-edit • Click status to toggle</span>
                      </div>

                      <div className="divide-y divide-black/10">
                        {city.zones.map((zone) => {
                          const isInlineFee = inlineFeeId === zone.id;

                          return (
                            <div
                              key={zone.id}
                              className={`p-3 flex items-center justify-between gap-3 hover:bg-black/[0.02] transition-colors ${
                                !zone.is_active ? "bg-black/[0.02] opacity-65" : ""
                              }`}
                            >
                              {/* District Name */}
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-bold text-black uppercase tracking-wider block truncate">
                                  {zone.area}
                                </span>
                                <span className="text-[9px] uppercase tracking-widest text-black/40">
                                  {zone.is_active ? "Live at checkout" : "Hidden from checkout"}
                                </span>
                              </div>

                              {/* Price + Controls */}
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Inline Fee Editor */}
                                {isInlineFee ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      step="5"
                                      value={inlineFeeVal}
                                      onChange={(e) =>
                                        setInlineFeeVal(
                                          e.target.value === "" ? "" : Number(e.target.value)
                                        )
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveInlineFee(zone);
                                        if (e.key === "Escape") setInlineFeeId(null);
                                      }}
                                      autoFocus
                                      className="w-16 px-1.5 py-0.5 border border-black text-xs font-mono font-bold bg-white focus:outline-none"
                                    />
                                    <button
                                      onClick={() => handleSaveInlineFee(zone)}
                                      disabled={savingInlineFee}
                                      className="p-1 bg-black text-white hover:bg-black/80 cursor-pointer"
                                      title="Save"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => setInlineFeeId(null)}
                                      className="p-1 text-black/50 hover:text-black cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setInlineFeeId(zone.id);
                                      setInlineFeeVal(zone.shipping_fee);
                                    }}
                                    className="px-2.5 py-1 bg-black/5 hover:bg-black hover:text-white border border-black/15 text-xs font-mono font-bold transition-colors cursor-pointer"
                                    title="Click to edit delivery fee"
                                  >
                                    {zone.shipping_fee} EGP
                                  </button>
                                )}

                                {/* Status Switch */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(zone)}
                                  className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                                    zone.is_active
                                      ? "bg-emerald-500/15 text-emerald-950 border-emerald-500/30 hover:bg-emerald-500/25"
                                      : "bg-black/10 text-black/50 border-black/15 hover:bg-black/20"
                                  }`}
                                  title={zone.is_active ? "Active (Click to hide)" : "Hidden (Click to show)"}
                                >
                                  {zone.is_active ? "Active" : "Hidden"}
                                </button>

                                {/* Edit Button */}
                                <button
                                  onClick={() => {
                                    setEditingZone(zone);
                                    setEditAreaName(zone.area);
                                    setEditFee(zone.shipping_fee);
                                    setEditIsActive(zone.is_active);
                                    setEditError("");
                                  }}
                                  className="p-1.5 text-black/50 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
                                  title="Edit details"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => setDeletingZone(zone)}
                                  className="p-1.5 text-red-600/60 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete district"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD NEW CITY */}
      {isAddCityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#e7ecea] border-2 border-black p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/20 mb-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight">Add New City</h3>
                <p className="text-[11px] text-black/60 uppercase">
                  Select an Egyptian governorate or type any city name
                </p>
              </div>
              <button
                onClick={() => setIsAddCityModalOpen(false)}
                className="p-1 text-black/50 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addCityError && (
              <div className="p-3 mb-4 bg-red-500/15 border border-red-500/40 text-red-950 text-xs font-medium">
                {addCityError}
              </div>
            )}

            <form onSubmit={handleCreateCity} className="space-y-4">
              <AutocompleteCombobox
                label="City Name"
                required
                value={newCityName}
                onChange={(val) => setNewCityName(val)}
                options={EGYPTIAN_GOVERNORATES.map((g) => ({
                  value: g.en,
                  label: g.en,
                  badge: "City",
                }))}
                placeholder="Type to search (e.g. Cairo, Giza, Alexandria, Sharqia...)"
                hint="Type any letter to search 27 Egyptian governorates or enter custom city"
              />

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-black/80">
                  First District / Area Name
                </label>
                <input
                  type="text"
                  value={initialAreaName}
                  onChange={(e) => setInitialAreaName(e.target.value)}
                  placeholder="e.g. Central, Downtown, or Main Area"
                  className="w-full text-xs border border-black/25 bg-white px-3 py-2.5 focus:outline-none focus:border-black font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-black/80">
                  Delivery Fee (EGP) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    required
                    value={initialFee}
                    onChange={(e) =>
                      setInitialFee(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="e.g. 60"
                    className="w-full text-xs border border-black/25 bg-white px-3 py-2.5 focus:outline-none focus:border-black font-mono font-bold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-black/50">
                    EGP
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-black/20 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddCityModalOpen(false)}
                  className="px-4 py-2 border border-black/25 text-xs font-bold uppercase tracking-wider text-black/70 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCity || !newCityName.trim()}
                  className="px-5 py-2 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                >
                  {isCreatingCity && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create City</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK UPDATE CITY FEE */}
      {bulkCity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#e7ecea] border-2 border-black p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/20">
              <h3 className="text-base font-black uppercase tracking-tight">Set Rate for {bulkCity}</h3>
              <button
                onClick={() => setBulkCity(null)}
                className="p-1 text-black/50 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-black/70 leading-relaxed">
              Set the delivery tariff for all districts in <strong>{bulkCity}</strong> simultaneously:
            </p>

            <div className="relative">
              <input
                type="number"
                min="0"
                step="5"
                value={bulkFeeValue}
                onChange={(e) =>
                  setBulkFeeValue(e.target.value === "" ? "" : Number(e.target.value))
                }
                autoFocus
                className="w-full text-base border border-black bg-white px-3 py-2.5 focus:outline-none font-mono font-bold"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-black/50">
                EGP
              </span>
            </div>

            <div className="pt-3 border-t border-black/20 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBulkCity(null)}
                className="px-4 py-2 border border-black/25 text-xs font-bold uppercase tracking-wider text-black/70 hover:text-black cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBulkCityFee}
                disabled={isSavingBulk || bulkFeeValue === "" || Number(bulkFeeValue) < 0}
                className="px-5 py-2 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                {isSavingBulk && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Apply to All</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT DISTRICT */}
      {editingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#e7ecea] border-2 border-black p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/20">
              <h3 className="text-base font-black uppercase tracking-tight">Edit District</h3>
              <button
                onClick={() => setEditingZone(null)}
                className="p-1 text-black/50 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-2.5 bg-red-500/15 border border-red-500/40 text-red-950 text-xs font-medium">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEditZone} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-black/70">
                  City
                </label>
                <input
                  type="text"
                  disabled
                  value={editingZone.governorate}
                  className="w-full text-xs border border-black/20 bg-black/5 px-3 py-2 text-black/60 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-black/70">
                  District Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editAreaName}
                  onChange={(e) => setEditAreaName(e.target.value)}
                  className="w-full text-xs border border-black/25 bg-white px-3 py-2 focus:outline-none focus:border-black font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-black/70">
                  Delivery Fee (EGP) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    required
                    value={editFee}
                    onChange={(e) =>
                      setEditFee(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full text-xs border border-black/25 bg-white px-3 py-2 focus:outline-none focus:border-black font-mono font-bold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-black/50">
                    EGP
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-black/15">
                <span className="text-xs font-bold uppercase tracking-wider">Active at checkout</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              <div className="pt-3 border-t border-black/20 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
                  className="px-3.5 py-1.5 border border-black/25 text-xs font-bold uppercase tracking-wider text-black/70 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingZone}
                  className="px-4 py-1.5 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                >
                  {isUpdatingZone && <RotateCw className="w-3 h-3 animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deletingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#e7ecea] border-2 border-red-600 p-5 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-black uppercase tracking-tight">Delete District?</h3>
            </div>

            <p className="text-xs text-black/80 leading-relaxed">
              Are you sure you want to delete <strong>"{deletingZone.area}"</strong> from{" "}
              <strong>{deletingZone.governorate}</strong>?
            </p>

            <div className="pt-3 border-t border-black/20 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingZone(null)}
                className="px-3.5 py-1.5 border border-black/25 text-xs font-bold uppercase tracking-wider text-black/70 hover:text-black cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                {isDeleting && <RotateCw className="w-3 h-3 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
