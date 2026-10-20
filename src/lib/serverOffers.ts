import { getPublicSupabase } from "@/lib/serverProducts";
import { parseOffer, type ParsedOffer, type RawOffer } from "@/lib/offers";

/**
 * Fetch the highest-priority active banner offer directly on the Server (SSR/ISR)
 * Eliminates client-side layout shifts and network flashes.
 */
export async function getActiveBannerServer(): Promise<ParsedOffer | null> {
  try {
    const supabase = getPublicSupabase();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .eq("is_active", true)
      .lte("starts_at", now)
      .gte("ends_at", now)
      .order("priority", { ascending: false });

    if (error || !data || data.length === 0) return null;

    const parsedOffers = (data as RawOffer[]).map(parseOffer);
    const bannerOffer = parsedOffers.find((o) => o.showBanner && o.bannerText.trim());

    return bannerOffer || null;
  } catch (err) {
    console.error("getActiveBannerServer error:", err);
    return null;
  }
}
