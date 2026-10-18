"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  normalizeProduct,
  createProductSlug,
  type Product,
  type ProductInput,
} from "@/lib/product";

export type { Product, ProductInput } from "@/lib/product";

const PRODUCT_CACHE_KEY = "marsel_products_cache";
const PRODUCT_CACHE_TTL = 5 * 60 * 1000;

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: ProductInput) => Promise<void>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductActive: (id: string, currentStatus: boolean) => Promise<void>;
  refetch: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async (options?: { force?: boolean }) => {
    if (!options?.force) {
      try {
        const cached = localStorage.getItem(PRODUCT_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as { savedAt: number; products: Product[] };
          if (Date.now() - parsed.savedAt < PRODUCT_CACHE_TTL) {
            setProducts(parsed.products);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error("Could not read product cache:", error);
      }
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("index", { ascending: true });

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }
      const nextProducts = (data ?? []).map((row) => normalizeProduct(row as Record<string, unknown>));
      setProducts(nextProducts);
      try {
        localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), products: nextProducts }));
      } catch (cacheError) {
        console.error("Could not cache products:", cacheError);
      }
    } catch (err) {
      console.error("Unexpected error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (productData: ProductInput) => {
    const supabase = createClient();
    const nextIndex = products.length
      ? Math.max(...products.map((product) => product.index)) + 1
      : 1;
    const images = (productData.images ?? []).filter(Boolean).slice(0, 5);
    const cover = images[0] || productData.image || "/hoodie-cropped.png";
    const { data: createdProduct, error } = await supabase.from("products").insert({
      ...productData,
      title: productData.title.toUpperCase(),
      image: cover,
      images,
      index: nextIndex,
      is_active: productData.is_active !== false,
    }).select("id").single();
    if (error || !createdProduct) {
      throw new Error(`Could not create product: ${error?.message ?? "The product was not created"} (${error?.code ?? "unknown"})`);
    }
    const { error: slugError } = await supabase
      .from("products")
      .update({ slug: createProductSlug(productData.title, createdProduct.id) })
      .eq("id", createdProduct.id);
    if (slugError) {
      throw new Error(`Could not create product slug: ${slugError.message} (${slugError.code ?? "unknown"})`);
    }
    await fetchProducts({ force: true });
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    const supabase = createClient();
    const payload: Partial<Product> = { ...updated };
    if (payload.title) payload.title = payload.title.toUpperCase();
    if (payload.images) {
      payload.images = payload.images.filter(Boolean).slice(0, 5);
      payload.image = payload.images[0] || payload.image;
    }
    if (payload.title) {
      payload.slug = createProductSlug(payload.title, id);
    }
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) {
      throw new Error(`Could not update product: ${error.message} (${error.code ?? "unknown"})`);
    }
    await fetchProducts({ force: true });
  };

  const toggleProductActive = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    const { error } = await supabase.from("products").update({ is_active: !currentStatus }).eq("id", id);
    if (error) {
      throw new Error(`Could not update product status: ${error.message}`);
    }
    await fetchProducts({ force: true });
  };

  const deleteProduct = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      throw new Error(`Could not delete product: ${error.message} (${error.code ?? "unknown"})`);
    }
    await fetchProducts({ force: true });
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductActive,
        refetch: fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
