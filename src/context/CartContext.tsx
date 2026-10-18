"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, getCoverImage } from "@/lib/product";

export interface CartItem {
  id: string; // unique item id (productId-size)
  productId: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  slug?: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isDrawerOpen: boolean;
  hydrated: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("marsel_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Could not restore cart:", error);
    }
    setHydrated(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "marsel_cart") {
        try {
          setItems(e.newValue ? JSON.parse(e.newValue) : []);
        } catch (error) {
          console.error("Could not sync cart from storage event:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("marsel_cart", JSON.stringify(items));
    } catch (error) {
      console.error("Could not save cart:", error);
    }
  }, [items, hydrated]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addToCart = (product: Product, size: string) => {
    const itemId = `${product.id}-${size}`;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.min(10, item.quantity + 1) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          compareAtPrice: product.compare_at_price,
          image: getCoverImage(product),
          size,
          color: product.color_name,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = Math.max(1, Math.min(10, item.quantity + delta));
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem("marsel_cart");
    } catch (error) {
      console.error("Could not clear cart storage:", error);
    }
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isDrawerOpen,
        hydrated,
        openDrawer,
        closeDrawer,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}