import { cache } from "react";
import { getPublicSupabase } from "@/lib/serverProducts";
import { parseOffer, type ParsedOffer, type RawOffer } from "@/lib/offers";

let _cachedBanner: ParsedOffer | null | undefined = undefined;
let _lastBannerFetch = 0;
const BANNER_TTL_MS = 30 * 1000; // 30s in-memory cache

/**
 * Fetch the highest-priority active banner offer directly on the Server (SSR/ISR)
 * Uses in-memory cache and React request-deduplication for instant response.
 */
export const getActiveBannerServer = cache(async function getActiveBannerServer(): Promise<ParsedOffer | null> {
  const now = Date.now();
  if (_cachedBanner !== undefined && now - _lastBannerFetch < BANNER_TTL_MS) {
    return _cachedBanner;
  }

  try {
    const supabase = getPublicSupabase();
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .eq("is_active", true)
      .lte("starts_at", nowIso)
      .gte("ends_at", nowIso)
      .order("priority", { ascending: false });

    if (error || !data || data.length === 0) {
      _cachedBanner = null;
      _lastBannerFetch = now;
      return null;
    }

    const parsedOffers = (data as RawOffer[]).map(parseOffer);
    const bannerOffer = parsedOffers.find((o) => o.showBanner && o.bannerText.trim());

    _cachedBanner = bannerOffer || null;
    _lastBannerFetch = now;
    return _cachedBanner;
  } catch (err) {
    console.error("getActiveBannerServer error:", err);
    return _cachedBanner ?? null;
  }
});
