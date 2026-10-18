import { getPublicSupabase } from "@/lib/serverProducts";
import type { RawOffer } from "@/lib/offers";

export interface ServerShippingZone {
  governorate: string;
  area: string;
  shipping_fee: number;
}

export type ServerActiveOffer = RawOffer;

export async function getCheckoutDataServer(): Promise<{
  shippingZones: ServerShippingZone[];
  offers: ServerActiveOffer[];
}> {
  try {
    const supabase = getPublicSupabase();
    const now = new Date().toISOString();

    const [{ data: zoneData }, { data: offerData }] = await Promise.all([
      supabase
        .from("shipping_zones")
        .select("governorate, area, shipping_fee")
        .eq("is_active", true)
        .order("governorate")
        .order("area"),
      supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .lte("starts_at", now)
        .gte("ends_at", now)
        .order("priority", { ascending: false }),
    ]);

    return {
      shippingZones: (zoneData ?? []) as ServerShippingZone[],
      offers: (offerData ?? []) as ServerActiveOffer[],
    };
  } catch (error) {
    console.error("Error preloading checkout data on server:", error);
    return {
      shippingZones: [],
      offers: [],
    };
  }
}
