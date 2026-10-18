"use client";

import React, { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { parseOffer, type ParsedOffer, type RawOffer } from "@/lib/offers";

export default function AnnouncementBanner() {
  const [activeOffer, setActiveOffer] = useState<ParsedOffer | null>(null);
  const [isDismissed, setIsDismissed] = useState(true); // default true until client check
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchLiveBanner = async () => {
      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        const { data, error } = await supabase
          .from("offers")
          .select("*")
          .eq("is_active", true)
          .lte("starts_at", now)
          .gte("ends_at", now)
          .order("priority", { ascending: false });

        if (error || !data || data.length === 0) return;

        const parsedOffers = (data as RawOffer[]).map(parseOffer);
        const bannerOffer = parsedOffers.find((o) => o.showBanner && o.bannerText.trim());

        if (bannerOffer) {
          const storageKey = `marsel_dismissed_offer_${bannerOffer.id}`;
          const alreadyDismissed = sessionStorage.getItem(storageKey);
          if (!alreadyDismissed) {
            setActiveOffer(bannerOffer);
            setIsDismissed(false);
          }
        }
      } catch (err) {
        console.error("Announcement banner fetch error:", err);
      }
    };

    fetchLiveBanner();
  }, []);

  const handleDismiss = () => {
    if (activeOffer) {
      sessionStorage.setItem(`marsel_dismissed_offer_${activeOffer.id}`, "true");
    }
    setIsDismissed(true);
  };

  if (!mounted || isDismissed || !activeOffer) {
    return null;
  }

  return (
    <aside
      aria-label="Store Announcement"
      className="bg-[#121313] text-[#e7ecea] border-b border-white/10 text-xs py-2 px-3 sm:px-6 relative z-50 transition-all duration-300"
    >
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3">
        {/* Left balance spacer */}
        <div className="w-6 hidden sm:block" />

        {/* Banner Content */}
        <div className="flex-1 text-center flex items-center justify-center gap-2 overflow-hidden">
          <Sparkles className="w-3.5 h-3.5 text-[#e7ecea]/70 shrink-0" />
          <span className="font-semibold tracking-wider uppercase text-[11px] sm:text-xs truncate">
            {activeOffer.bannerText || activeOffer.title}
          </span>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          className="text-[#e7ecea]/60 hover:text-white p-1 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
