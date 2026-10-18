import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { normalizeProduct, type Product } from "@/lib/product";

// Public Supabase client for Server Components (singleton, no cookie overhead, maximum SSR performance)
let _publicSupabase: ReturnType<typeof createSupabaseClient> | null = null;

export function getPublicSupabase() {
  if (!_publicSupabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Supabase credentials missing");
    }
    _publicSupabase = createSupabaseClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _publicSupabase;
}

export async function getProductsServer(): Promise<Product[]> {
  try {
    const supabase = getPublicSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("index", { ascending: true });

    if (error) {
      console.error("SSR getProducts error:", error.message);
      return [];
    }

    return (data ?? []).map(normalizeProduct);
  } catch (err) {
    console.error("SSR getProducts unexpected error:", err);
    return [];
  }
}

export async function getProductBySlugServer(slugOrId: string): Promise<Product | null> {
  try {
    const supabase = getPublicSupabase();
    // Try matching slug first
    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("slug", slugOrId)
      .maybeSingle();

    let { data, error } = await query;

    // If not found by slug, fallback to matching UUID id
    if (!data && !error && slugOrId.length >= 30) {
      const res = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("id", slugOrId)
        .maybeSingle();
      data = res.data;
      error = res.error;
    }

    if (error || !data) return null;
    return normalizeProduct(data);
  } catch (err) {
    console.error("SSR getProductBySlug error:", err);
    return null;
  }
}

export async function getRecommendationsServer(
  currentProduct: Product,
  limit = 4
): Promise<Product[]> {
  try {
    const all = await getProductsServer();
    return all
      .filter((item) => item.id !== currentProduct.id)
      .map((item) => ({
        item,
        sharedTags: item.tags.filter((tag) => currentProduct.tags.includes(tag)).length,
        sameCategory: item.category === currentProduct.category ? 1 : 0,
      }))
      .sort(
        (a, b) =>
          b.sharedTags - a.sharedTags ||
          b.sameCategory - a.sameCategory ||
          a.item.index - b.item.index
      )
      .slice(0, limit)
      .map(({ item }) => item);
  } catch {
    return [];
  }
}